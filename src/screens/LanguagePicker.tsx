import { Navigate, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { useEnrollments, setActiveEnrollment, markLanguageChosen } from '../state/useEnrollments'
import { Screen, Spinner } from '../components/ui'

// Um idioma por vez. Esta tela é a única em que os dois aparecem juntos —
// e só para escolher qual estudar agora. Nada de conteúdo misturado.

const CODE: Record<Language, string> = { en: 'EN', de: 'DE' }
const Badge = ({ l }: { l: Language }) => <span className="chip font-mono font-bold mr-2 align-middle" aria-hidden="true">{CODE[l]}</span>

export function LanguagePicker() {
  const all = useEnrollments()
  const nav = useNavigate()
  const pending = useLiveQuery(() => db.schedule.filter((i) => i.status === 'pending').toArray(), [])
  if (!all || !pending) return <Spinner />
  if (!all.length) return <Navigate to="/welcome" replace />

  const weekOf = (id: number) => pending.filter((i) => i.enrollmentId === id).reduce((m, i) => Math.min(m, i.weekNumber), 27)
  const missing = (['en', 'de'] as Language[]).filter((l) => !all.some((e) => e.language === l))

  return (
    <Screen title="O que você vai estudar agora?">
      <div className="grid gap-3">
        {all.map((e) => {
          const w = weekOf(e.id!)
          return (
            <button key={e.id} type="button" className="choice text-left" data-lang={e.language}
              onClick={() => { setActiveEnrollment(e.id!); markLanguageChosen(); nav('/', { replace: true }) }}>
              <Badge l={e.language} />
              <span className="text-xl font-bold">{LANGUAGE_NAMES[e.language]}</span>
              <span className="block text-sm muted mt-1">{w <= 26 ? `Semana ${w} de 26 · ${e.minutesPerDay} min por dia` : 'Plano concluído'}</span>
            </button>
          )
        })}
        {missing.map((l) => (
          <button key={l} type="button" className="choice text-left" style={{ borderStyle: 'dashed' }} onClick={() => nav(`/onboarding?add=${l}`)}>
            <Badge l={l} />
            <span className="text-xl font-bold">Adicionar {LANGUAGE_NAMES[l]}</span>
            <span className="block text-sm muted mt-1">Plano, tempo e progresso próprios — separados do outro idioma.</span>
          </button>
        ))}
      </div>
      <p className="text-sm muted mt-4">Cada idioma tem seu próprio plano, revisão e progresso. O app nunca mistura os dois na mesma tela: você escolhe um agora e pode trocar quando quiser.</p>
    </Screen>
  )
}
