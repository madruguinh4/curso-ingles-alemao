import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, CircleDot, Circle, Lock, Award } from 'lucide-react'
import { db } from '../lib/db'
import { MONTH_TITLES, TOTAL_MONTHS, TOTAL_WEEKS, weeksFor } from '../content/curriculum'
import { contentStats, lessonsForWeek } from '../lib/content'
import { demonstratedObjectives } from '../lib/progress'
import { currentWeek, lessonStatus } from '../lib/course'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Notice, Screen, Spinner } from '../components/ui'

export function CourseMap() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  if (loading || !e || !completions || !attempts) return <Spinner />

  const weeks = weeksFor(e.language)
  const stats = contentStats(e.language)
  const demonstrated = new Set(demonstratedObjectives(weeks, completions, attempts, lessonsForWeek).map((w) => w.id))
  const cw = currentWeek(e.language, completions)
  const currentMonth = cw?.month ?? 1

  return (
    <Screen title={`Trilha de ${LANGUAGE_NAMES[e.language]}`} subtitle={`${TOTAL_WEEKS} semanas em ${TOTAL_MONTHS} meses · A1 → A2 → B1`}>
      <Notice>
        <b>{stats.lessons} aulas prontas</b> em {stats.weeksWithLessons} de {TOTAL_WEEKS} semanas. As demais já têm objetivo e gramática definidos; as aulas chegam em atualizações. Nada fica bloqueado: qualquer aula existente pode ser aberta.
      </Notice>
      <div className="grid gap-3 mt-4">
        {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map((m) => {
          const ws = weeks.filter((w) => w.month === m)
          const level = ws[0]?.level
          return (
            <details key={m} open={m === currentMonth} className="card">
              <summary className="font-bold cursor-pointer flex items-center gap-2 list-none">
                <span className="chip chip-accent">{m}</span>
                <span className="grow">{MONTH_TITLES[m]}</span>
                <span className="chip">{level}</span>
              </summary>
              <ol className="mt-3 grid gap-3">
                {ws.map((w) => {
                  const lessons = lessonsForWeek(w.id)
                  return (
                    <li key={w.id} className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="chip">S{w.number}</span>
                        <b>{w.title}</b>
                        {w.number === cw?.number && <span className="chip chip-accent">atual</span>}
                        {demonstrated.has(w.id) && <span className="chip chip-ok"><Award size={14} /> objetivo demonstrado</span>}
                      </div>
                      <p className="text-sm mt-1"><i>{w.canDo}</i></p>
                      <p className="text-xs muted mt-1">{w.grammar.join(' · ')}</p>
                      {lessons.length ? (
                        <ul className="mt-2 grid gap-1">
                          {lessons.map((l) => {
                            const s = lessonStatus(l.id, completions)
                            const Icon = s === 'done' ? CheckCircle2 : s === 'progress' ? CircleDot : Circle
                            return (
                              <li key={l.id}>
                                <Link to={`/lesson/${eid}/${l.id}`} className="flex items-center gap-2 py-1.5">
                                  <Icon size={18} style={{ color: s === 'todo' ? 'var(--muted)' : 'var(--accent)' }} aria-label={s === 'done' ? 'concluída' : s === 'progress' ? 'em andamento' : 'pendente'} />
                                  <span>{l.title}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm mt-2"><span className="chip chip-warn"><Lock size={12} /> aulas em produção</span></p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </details>
          )
        })}
      </div>
    </Screen>
  )
}
