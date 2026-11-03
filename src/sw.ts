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

interface NudgePayload { title?: string; body?: string; url?: string; tag?: string; mascot?: string }

// O ícone da notificação é o mascote que "manda" a mensagem (public/mascots/<id>.png).
const MASCOT_IDS = ['tico', 'zeca', 'bia', 'lu', 'rafa', 'nina', 'dudu']

self.addEventListener('push', (event) => {
  let data: NudgePayload = {}
  try { data = event.data?.json() ?? {} } catch { data = { body: event.data?.text() } }
  const mascot = MASCOT_IDS.includes(data.mascot ?? '') ? data.mascot : 'zeca'
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Zeca: bora jogar?', {
      body: data.body ?? 'Uma aula curta e eu já começo a pular.',
      icon: `${BASE}mascots/${mascot}.png`,
      // Android pinta o ícone pequeno de uma cor só: precisa ser silhueta transparente.
      badge: BASE + 'icons/badge-96.png',
      tag: data.tag ?? 'nudge',
      data: { url: data.url ?? BASE },
      // Web não aceita som próprio: toca o som de notificação do celular, mais a vibração.
      silent: false,
      renotify: true,
      vibrate: [180, 80, 180, 80, 320],
    } as NotificationOptions),
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
