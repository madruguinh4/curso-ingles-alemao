import type { Language } from './types'
import { SUPABASE_URL, SUPABASE_ANON_KEY, VAPID_PUBLIC_KEY } from '../config'

// Lembretes diários por push. Opt-in (o navegador exige toque do usuário).
// O app só guarda a inscrição e a data do último estudo numa tabela do
// Supabase; quem envia é o job em scripts/send-nudges.mjs.

const URL: string | undefined = SUPABASE_URL
const KEY: string | undefined = SUPABASE_ANON_KEY
const VAPID: string | undefined = VAPID_PUBLIC_KEY

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

const headers = () => ({ apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' })
const rpc = (fn: string) => `${URL}/rest/v1/rpc/${fn}`

/** Grava/atualiza a inscrição por uma função do banco (o app anônimo não enxerga a tabela). */
async function saveRow(sub: PushSubscription, fields: { lang?: Language; name?: string; last_study?: string | null }) {
  const res = await fetch(rpc('save_push_subscription'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      p_endpoint: sub.endpoint,
      p_subscription: sub.toJSON(),
      p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      p_lang: fields.lang ?? null,
      p_name: fields.name ?? null,
      p_last_study: fields.last_study ?? null,
    }),
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
}

async function deleteRow(endpoint: string) {
  await fetch(rpc('delete_push_subscription'), { method: 'POST', headers: headers(), body: JSON.stringify({ p_endpoint: endpoint }) })
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
  try { await deleteRow(sub.endpoint) } catch { /* offline: a linha some no próximo 410 */ }
  await sub.unsubscribe()
}

/** Avisa o servidor que o aluno estudou hoje (para não mandar lembrete). Silencioso se offline. */
export async function syncStudy(date: string, info?: { name?: string; lang?: Language }): Promise<void> {
  if (!pushSupported() || !pushConfigured()) return
  const sub = await currentSubscription()
  if (!sub) return
  await saveRow(sub, { last_study: date, ...(info ?? {}) })
}
