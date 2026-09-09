import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, CircleDot, Circle, Construction, Award, FastForward, SkipForward, Undo2 } from 'lucide-react'
import { db } from '../lib/db'
import { MONTH_TITLES, TOTAL_MONTHS, TOTAL_WEEKS, weeksFor } from '../content/curriculum'
import { contentStats, lessonsForWeek } from '../lib/content'
import { demonstratedObjectives } from '../lib/progress'
import { currentWeek, lessonStatus, lessonsBefore } from '../lib/course'
import { skipLesson, unskipLesson, skipBefore } from '../lib/skip'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Button, Notice, Screen, Spinner } from '../components/ui'

export function CourseMap() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const [flash, setFlash] = useState<string>()
  if (loading || !e || !completions || !attempts) return <Spinner />

  const lang = e.language
  const weeks = weeksFor(lang)
  const stats = contentStats(lang)
  const demonstrated = new Set(demonstratedObjectives(weeks, completions, attempts, lessonsForWeek).map((w) => w.id))
  const cw = currentWeek(lang, completions)
  const currentMonth = cw?.month ?? 1
  const pendingBefore = (n: number) => lessonsBefore(lang, n).filter((l) => ['todo', 'progress'].includes(lessonStatus(l.id, completions))).length

  async function startHere(n: number) {
    const k = await skipBefore(eid, lang, n)
    setFlash(`${k} aula(s) anteriores marcadas como "já sei". Você pode refazer qualquer uma quando quiser.`)
  }

  return (
    <Screen title={`Trilha de ${LANGUAGE_NAMES[lang]}`} subtitle={`${TOTAL_WEEKS} semanas em ${TOTAL_MONTHS} meses · A1 → A2 → B1`}>
      <Notice>
        <b>{stats.lessons} aulas prontas</b> em {stats.weeksWithLessons} de {TOTAL_WEEKS} semanas. Nada fica bloqueado: abra qualquer aula, pule o que já sabe ou use <b>Começar daqui</b> em uma semana.
      </Notice>
      {flash && <div className="mt-2"><Notice kind="ok">{flash}</Notice></div>}
      <div className="grid gap-3 mt-4">
        {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map((m) => {
          const ws = weeks.filter((w) => w.month === m)
          return (
            <details key={m} open={m === currentMonth} className="card">
              <summary className="font-bold cursor-pointer flex items-center gap-2 list-none">
                <span className="chip chip-accent">{m}</span>
                <span className="grow">{MONTH_TITLES[m]}</span>
                <span className="chip">{ws[0]?.level}</span>
              </summary>
              <ol className="mt-3 grid gap-3">
                {ws.map((w) => {
                  const lessons = lessonsForWeek(w.id)
                  const before = pendingBefore(w.number)
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
                        <>
                          <ul className="mt-2 grid gap-1">
                            {lessons.map((l) => {
                              const s = lessonStatus(l.id, completions)
                              const Icon = s === 'done' ? CheckCircle2 : s === 'progress' ? CircleDot : s === 'skipped' ? FastForward : Circle
                              return (
                                <li key={l.id} className="flex items-center gap-2 py-1">
                                  <Link to={`/lesson/${eid}/${l.id}`} className="flex items-center gap-2 grow">
                                    <Icon size={18} style={{ color: s === 'todo' ? 'var(--muted)' : s === 'skipped' ? 'var(--warn)' : 'var(--accent)' }} aria-label={s === 'done' ? 'concluída' : s === 'progress' ? 'em andamento' : s === 'skipped' ? 'pulada' : 'pendente'} />
                                    <span className={s === 'skipped' ? 'muted' : ''}>{l.title}</span>
                                  </Link>
                                  {s === 'todo' && <Button variant="ghost" size="sm" icon={<SkipForward size={14} />} onClick={() => skipLesson(eid, l.id)} aria-label={`Pular ${l.title}`}>Já sei</Button>}
                                  {s === 'skipped' && <Button variant="ghost" size="sm" icon={<Undo2 size={14} />} onClick={() => unskipLesson(eid, l.id)} aria-label={`Refazer ${l.title}`}>Refazer</Button>}
                                </li>
                              )
                            })}
                          </ul>
                          {before > 0 && (
                            <Button variant="secondary" size="sm" className="mt-2" icon={<FastForward size={14} />} onClick={() => startHere(w.number)}>
                              Começar daqui (pular {before} aula{before > 1 ? 's' : ''} anteriores)
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm mt-2"><span className="chip chip-warn"><Construction size={12} /> aulas em produção</span></p>
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
