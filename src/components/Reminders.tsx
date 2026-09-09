import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BellRing, BellOff } from 'lucide-react'
import { db } from '../lib/db'
import { pushState, enableReminders, disableReminders, type PushState } from '../lib/push'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { useProfile } from '../state/useTheme'
import { Button, Card, Notice } from '../components/ui'

// Lembretes diários (push). Opt-in, reversível, e honesto sobre onde não funciona.

const DISMISS_KEY = 'remindersDismissed'

export function useReminders(enrollmentId: number, lang: Language) {
  const p = useProfile()
  const [state, setState] = useState<PushState>('unsupported')
  const [busy, setBusy] = useState(false)
  const days = useLiveQuery(() => db.studyDays.where('enrollmentId').equals(enrollmentId).toArray(), [enrollmentId])
  const refresh = () => { pushState().then(setState) }
  useEffect(refresh, [])
  const lastStudy = days?.length ? [...days].map((d) => d.date).sort().at(-1) ?? null : null

  async function enable() {
    setBusy(true)
    const r = await enableReminders({ name: p.name, lang, lastStudy })
    setBusy(false)
    if (r === 'denied') setState('denied')
    else refresh()
    return r
  }
  async function disable() { setBusy(true); await disableReminders(); setBusy(false); refresh() }
  return { state, busy, enable, disable }
}

/** Cartão completo (Configurações). */
export function RemindersCard({ enrollmentId, lang }: { enrollmentId: number; lang: Language }) {
  const { state, busy, enable, disable } = useReminders(enrollmentId, lang)
  return (
    <Card>
      <h2 className="font-semibold mb-1 flex items-center gap-2"><BellRing size={18} /> Lembretes diários</h2>
      <p className="text-sm muted mb-3">Se você não estudar {LANGUAGE_NAMES[lang]} num dia, o app te cutuca até 3 vezes à noite (18h, 20h30 e 22h). Quem estudou não recebe nada.</p>
      {state === 'not-configured' && <Notice kind="warn">Esta versão foi publicada sem o serviço de lembretes configurado.</Notice>}
      {state === 'unsupported' && <Notice kind="warn">Este navegador não suporta notificações push.</Notice>}
      {state === 'needs-install' && <Notice>No iPhone, os lembretes só funcionam com o app instalado: Safari → Compartilhar → <b>Adicionar à Tela de Início</b>. Depois volte aqui.</Notice>}
      {state === 'denied' && <Notice kind="warn">Você bloqueou notificações para este site. Para reativar, libere nas configurações do navegador e volte aqui.</Notice>}
      {state === 'off' && <Button block icon={<BellRing size={18} />} disabled={busy} onClick={enable}>Ativar lembretes</Button>}
      {state === 'on' && (
        <div className="flex items-center justify-between gap-3">
          <span className="chip chip-ok"><BellRing size={14} /> ativados neste aparelho</span>
          <Button variant="secondary" size="sm" icon={<BellOff size={16} />} disabled={busy} onClick={disable}>Desativar</Button>
        </div>
      )}
    </Card>
  )
}

/** Convite compacto (Início). Some depois de ativar ou dispensar. */
export function RemindersInvite({ enrollmentId, lang }: { enrollmentId: number; lang: Language }) {
  const { state, busy, enable } = useReminders(enrollmentId, lang)
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false } })
  if (dismissed || state !== 'off') return null
  const dismiss = () => { try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ } setDismissed(true) }
  return (
    <Card>
      <p className="font-semibold flex items-center gap-2"><BellRing size={18} /> Quer um empurrão nos dias em que esquecer?</p>
      <p className="text-sm muted mt-1">Lembretes à noite, só nos dias sem estudo. Dá para desligar quando quiser.</p>
      <div className="flex gap-2 mt-3">
        <Button size="sm" disabled={busy} onClick={enable}>Ativar</Button>
        <Button size="sm" variant="ghost" onClick={dismiss}>Agora não</Button>
      </div>
    </Card>
  )
}
