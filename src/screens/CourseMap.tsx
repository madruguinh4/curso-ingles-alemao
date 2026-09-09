import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { MONTH_TITLES, weeksFor } from '../content/curriculum'
import { contentStats, lessonsForWeek } from '../lib/content'
import { demonstratedObjectives } from '../lib/progress'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Notice, Screen, Spinner } from '../components/ui'

export function CourseMap() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const schedule = useLiveQuery(() => db.schedule.where('[enrollmentId+status]').equals([eid, 'pending']).toArray(), [eid])
  if (loading || !e || !completions || !attempts || !schedule) return <Spinner />

  const weeks = weeksFor(e.language)
  const stats = contentStats(e.language)
  const demonstrated = new Set(demonstratedObjectives(weeks, completions, attempts, lessonsForWeek).map((w) => w.id))
  const currentWeek = schedule.reduce((m, i) => Math.min(m, i.weekNumber), 27)
  const currentMonth = weeks.find((w) => w.number === currentWeek)?.month ?? 1
  const status = (lessonId: string) => {
    const c = completions.find((c) => c.lessonId === lessonId)
    return c?.completedAt ? 'done' : c?.blocksDone.length ? 'progress' : 'todo'
  }

  return (
    <Screen title={`Mapa — ${LANGUAGE_NAMES[e.language]}`}>
      <Notice>
        <b>{stats.lessons} aulas prontas</b> em {stats.weeksWithLessons} de 26 semanas. As semanas sem aulas mostram o que vai ser ensinado; as aulas ainda estão em produção. Nada aqui fica bloqueado — você pode abrir qualquer aula existente quando quiser.
      </Notice>
      <div className="grid gap-3 mt-4">
        {[1, 2, 3, 4, 5, 6].map((m) => (
          <details key={m} open={m === currentMonth} className="card">
            <summary className="font-bold cursor-pointer">Mês {m} — {MONTH_TITLES[m]}</summary>
            <ol className="mt-3 grid gap-3">
              {weeks.filter((w) => w.month === m).map((w) => {
                const lessons = lessonsForWeek(w.id)
                return (
                  <li key={w.id} className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="chip">S{w.number}</span>
                      <span className="chip">{w.level}</span>
                      <b>{w.title}</b>
                      {w.number === currentWeek && <span className="chip" style={{ borderColor: 'var(--accent)' }}>atual</span>}
                      {demonstrated.has(w.id) && <span className="chip" style={{ borderColor: 'var(--ok)', color: 'var(--ok)' }}>✔ objetivo demonstrado</span>}
                    </div>
                    <p className="text-sm mt-1"><i>{w.canDo}</i></p>
                    <p className="text-xs muted mt-1">{w.grammar.join(' · ')}</p>
                    {lessons.length ? (
                      <ul className="mt-2 grid gap-1">
                        {lessons.map((l) => {
                          const s = status(l.id)
                          return (
                            <li key={l.id}>
                              <Link to={`/lesson/${eid}/${l.id}`} className="flex items-center gap-2 py-1">
                                <span aria-label={s === 'done' ? 'concluída' : s === 'progress' ? 'em andamento' : 'pendente'} style={{ color: s === 'done' ? 'var(--ok)' : s === 'progress' ? 'var(--warn)' : 'var(--muted)' }}>
                                  {s === 'done' ? '●' : s === 'progress' ? '◐' : '○'}
                                </span>
                                <span>{l.title}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm mt-2"><span className="chip" style={{ borderColor: 'var(--warn)', color: 'var(--warn)' }}>aulas em produção</span></p>
                    )}
                  </li>
                )
              })}
            </ol>
          </details>
        ))}
      </div>
    </Screen>
  )
}
