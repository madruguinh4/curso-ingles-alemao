import type { Language } from './types'

// Lembretes diários por push. Opt-in (o navegador exige toque do usuário).
// O app só guarda a inscrição e a data do último estudo numa tabela do
// Supabase; quem envia é o job em scripts/send-nudges.mjs.

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export const pushConfigured = (): boolean => !!(URL && KEY && VAPID)

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** iPhone só recebe push com o app instalado na tela inicial (iOS 16.4+). */
export function iosNeedsInstall(): boolean {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  return ios && !standalone
}

export type PushState = 'unsupported' | 'not-configured' | 'needs-install' | 'denied' | 'off' | 'on'

export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  if (!pushConfigured()) return 'not-configured'
  if (iosNeedsInstall()) return 'needs-install'
  if (Notification.permission === 'denied') return 'denied'
  const sub = await currentSubscription()
  return sub ? 'on' : 'off'
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

function urlBase64ToUint8Array(b64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

const headers = () => ({ apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' })
const table = () => `${URL}/rest/v1/push_subscriptions`

/** Substitui a linha desta inscrição (delete + insert: dispensa política de SELECT para anônimos). */
async function saveRow(sub: PushSubscription, fields: Record<string, unknown>) {
  const endpoint = encodeURIComponent(sub.endpoint)
  await fetch(`${table()}?endpoint=eq.${endpoint}`, { method: 'DELETE', headers: headers() })
  const res = await fetch(table(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ endpoint: sub.endpoint, subscription: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ...fields }),
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
}

export async function enableReminders(info: { name: string; lang: Language; lastStudy: string | null }): Promise<'ok' | 'denied' | 'unsupported' | 'error'> {
  if (!pushSupported() || !pushConfigured()) return 'unsupported'
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 'denied'
    const reg = await navigator.serviceWorker.ready
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID!) }))
    await saveRow(sub, { name: info.name, lang: info.lang, last_study: info.lastStudy })
    return 'ok'
  } catch {
    return 'error'
  }
}

export async function disableReminders(): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) return
  try { await fetch(`${table()}?endpoint=eq.${encodeURIComponent(sub.endpoint)}`, { method: 'DELETE', headers: headers() }) } catch { /* offline: a linha some no próximo 410 */ }
  await sub.unsubscribe()
}

/** Avisa o servidor que o aluno estudou hoje (para não mandar lembrete). Silencioso se offline. */
export async function syncStudy(date: string, info?: { name?: string; lang?: Language }): Promise<void> {
  if (!pushSupported() || !pushConfigured()) return
  const sub = await currentSubscription()
  if (!sub) return
  await saveRow(sub, { last_study: date, ...(info ?? {}) })
}
