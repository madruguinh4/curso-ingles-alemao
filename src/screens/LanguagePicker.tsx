import { Navigate, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Plus } from 'lucide-react'
import { db } from '../lib/db'
import { lessonsFor } from '../lib/content'
import { currentWeek } from '../lib/course'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { useEnrollments, setActiveEnrollment, markLanguageChosen } from '../state/useEnrollments'
import { Screen, Spinner } from '../components/ui'

// Um idioma por vez. Esta tela é a única em que os dois aparecem juntos —
// e só para escolher qual estudar agora.

export function LanguagePicker() {
  const all = useEnrollments()
  const nav = useNavigate()
  const completions = useLiveQuery(() => db.completions.toArray(), [])
  if (!all || !completions) return <Spinner />
  if (!all.length) return <Navigate to="/welcome" replace />
  const missing = (['en', 'de'] as Language[]).filter((l) => !all.some((e) => e.language === l))

  return (
    <Screen title="O que você vai estudar agora?">
      <div className="grid gap-3">
        {all.map((e) => {
          const mine = completions.filter((c) => c.enrollmentId === e.id)
          const w = currentWeek(e.language, mine)
          const done = mine.filter((c) => c.completedAt).length
          return (
            <button key={e.id} type="button" className="card flex items-center gap-3 text-left" data-lang={e.language}
              onClick={() => { setActiveEnrollment(e.id!); markLanguageChosen(); nav('/', { replace: true }) }}>
              <span className="chip chip-accent font-mono text-base px-3 py-1">{e.language.toUpperCase()}</span>
              <span className="grow">
                <span className="text-xl font-bold">{LANGUAGE_NAMES[e.language]}</span>
                <span className="block text-sm muted">{w ? `Semana ${w.number} · ${done} aula(s) concluída(s) · ${lessonsFor(e.language).length} disponíveis` : 'Tudo concluído'}</span>
              </span>
              <ChevronRight className="muted" />
            </button>
          )
        })}
        {missing.map((l) => (
          <button key={l} type="button" className="card-flat flex items-center gap-3 text-left" style={{ borderStyle: 'dashed' }} onClick={() => nav(`/onboarding?add=${l}`)}>
            <span className="grid place-items-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Plus size={20} /></span>
            <span className="grow"><span className="text-lg font-bold">Adicionar {LANGUAGE_NAMES[l]}</span><span className="block text-sm muted">Plano e progresso separados do outro idioma.</span></span>
          </button>
        ))}
      </div>
      <p className="text-sm muted mt-4">Cada idioma tem seu próprio plano, revisão e progresso. O app nunca mistura os dois na mesma tela.</p>
    </Screen>
  )
}
