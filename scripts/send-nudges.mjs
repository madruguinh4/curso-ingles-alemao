// Envia os lembretes diários. Roda de hora em hora no GitHub Actions.
// Regra: quem não estudou hoje (no fuso dele) recebe até 3 avisos:
//   1º a partir das 18h · 2º a partir das 20h30 · 3º a partir das 22h.
// Quem estudou não recebe nada. Inscrições mortas (404/410) são apagadas.

import webpush from 'web-push'

const { SUPABASE_URL, SUPABASE_SERVICE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, APP_URL = '/' } = process.env
for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT']) {
  if (!process.env[k]) { console.error(`faltou ${k}`); process.exit(1) }
}
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const THRESHOLDS = [18, 20.5, 22]
const LANG = { en: 'inglês', de: 'alemão' }

const MESSAGES = [
  (n, l) => ({ title: `Sua lição de ${l} não vai se fazer sozinha`, body: `Ei${n ? `, ${n}` : ''}! Cinco minutos agora e pronto. Entra aqui — é rapidinho.` }),
  (n, l) => ({ title: `Ainda nada de ${l} hoje…`, body: `${n ? `${n}, u` : 'U'}ma aula hoje vale mais que duas amanhã. Vem terminar o que você começou.` }),
  (n, l) => ({ title: 'Última chamada de hoje', body: `O dia acaba e a sua sequência de ${l} acaba junto${n ? `, ${n}` : ''}. Uma aula e você dorme em paz.` }),
]

const headers = { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' }
const table = `${SUPABASE_URL}/rest/v1/push_subscriptions`

function localParts(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date())
    const g = (t) => parts.find((p) => p.type === t)?.value
    return { date: `${g('year')}-${g('month')}-${g('day')}`, hour: Number(g('hour')) % 24 + Number(g('minute')) / 60 }
  } catch {
    return localParts('America/Sao_Paulo')
  }
}

const rows = await (await fetch(`${table}?select=*`, { headers })).json()
if (!Array.isArray(rows)) { console.error('resposta inesperada', rows); process.exit(1) }

let sent = 0, skipped = 0, removed = 0
for (const row of rows) {
  const { date, hour } = localParts(row.tz)
  if (row.last_study === date) { skipped++; continue }
  const stage = row.nudge_date === date ? row.nudges ?? 0 : 0
  if (stage >= THRESHOLDS.length || hour < THRESHOLDS[stage]) { skipped++; continue }
  const msg = MESSAGES[stage](row.name?.trim(), LANG[row.lang] ?? 'idiomas')
  const payload = JSON.stringify({ ...msg, url: APP_URL, tag: `nudge-${date}-${stage}` })
  const patch = (body) => fetch(`${table}?endpoint=eq.${encodeURIComponent(row.endpoint)}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(body) })
  try {
    await webpush.sendNotification(row.subscription, payload, { TTL: 3 * 3600 })
    await patch({ nudge_date: date, nudges: stage + 1 })
    sent++
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await fetch(`${table}?endpoint=eq.${encodeURIComponent(row.endpoint)}`, { method: 'DELETE', headers })
      removed++
    } else {
      console.error('falha ao enviar', row.endpoint.slice(0, 40), err.statusCode ?? err.message)
    }
  }
}
console.log(`inscrições: ${rows.length} · enviados: ${sent} · sem envio: ${skipped} · removidos: ${removed}`)
