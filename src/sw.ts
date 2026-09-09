/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'

// Service worker: cache offline (Workbox) + notificações push.
// O push só existe porque um job externo (GitHub Actions) envia; o app em si
// não consegue se acordar. Ver scripts/send-nudges.mjs.

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

const BASE = import.meta.env.BASE_URL
registerRoute(new NavigationRoute(createHandlerBoundToURL(BASE + 'index.html')))

interface NudgePayload { title?: string; body?: string; url?: string; tag?: string }

self.addEventListener('push', (event) => {
  let data: NudgePayload = {}
  try { data = event.data?.json() ?? {} } catch { data = { body: event.data?.text() } }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Sua lição de hoje te espera', {
      body: data.body ?? 'Entra aqui — é rapidinho.',
      icon: BASE + 'icons/icon-192.png',
      badge: BASE + 'icons/icon-192.png',
      tag: data.tag ?? 'nudge',
      data: { url: data.url ?? BASE },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? BASE
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { void c.navigate(url); return c.focus() }
      }
      return self.clients.openWindow(url)
    }),
  )
})
