import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Award, Headphones, BookOpenText, PencilLine, Mic } from 'lucide-react'
import { db } from '../lib/db'
import { skillScores, demonstratedObjectives, needsReview, completedCount } from '../lib/progress'
import { lessonsFor, lessonsForWeek, contentStats } from '../lib/content'
import { weeksFor, TOTAL_WEEKS } from '../content/curriculum'
import { studyStats } from '../lib/study'
import { todayISO } from '../lib/dates'
import { LANGUAGE_NAMES, SKILL_NAMES, type Skill } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Notice, ProgressBar, Screen, Spinner } from '../components/ui'
import { StudyCalendar } from '../components/StudyCalendar'

const ICON: Record<Skill, typeof Headphones> = { listening: Headphones, reading: BookOpenText, writing: PencilLine, speaking: Mic }

export function Progress() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const errors = useLiveQuery(() => db.errors.where('enrollmentId').equals(eid).toArray(), [eid])
  const days = useLiveQuery(() => db.studyDays.where('enrollmentId').equals(eid).toArray(), [eid])
  if (loading || !e || !attempts || !completions || !errors || !days) return <Spinner />

  const lang = e.language
  const lessons = lessonsFor(lang)
  const stats = contentStats(lang)
  const scores = skillScores(attempts)
  const objectives = demonstratedObjectives(weeksFor(lang), completions, attempts, lessonsForWeek)
  const review = needsReview(lessons, attempts, errors, todayISO())
  const done = completedCount(completions)

  return (
    <Screen title="Progresso" subtitle={LANGUAGE_NAMES[lang]}>
      <div className="grid gap-4">
        <Card>
          <h2 className="font-bold mb-2">Conteúdo concluído</h2>
          <ProgressBar value={stats.lessons ? done / stats.lessons : 0} label={`${done} de ${stats.lessons} aulas existentes`} />
          <p className="text-sm muted">{stats.weeksWithLessons} de {TOTAL_WEEKS} semanas têm aulas prontas.</p>
        </Card>

        <StudyCalendar stats={studyStats(days.map((d) => d.date), todayISO())} />

        <Card>
          <h2 className="font-bold mb-2">Desempenho por habilidade</h2>
          {scores.map((s) => {
            const Icon = ICON[s.skill]
            return (
              <div key={s.skill} className="flex items-center gap-3 my-2">
                <span className="grid place-items-center rounded-xl shrink-0" style={{ width: 36, height: 36, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon size={18} /></span>
                <div className="grow">
                  {s.accuracy === null ? (
                    <div className="flex justify-between text-sm"><span>{SKILL_NAMES[s.skill]}</span><span className="muted">sem evidência ainda</span></div>
                  ) : (
                    <ProgressBar value={s.accuracy} label={`${SKILL_NAMES[s.skill]} · ${s.attempts} tentativa(s)`} />
                  )}
                </div>
              </div>
            )
          })}
          <p className="text-xs muted mt-2">Ouvir e ler vêm de exercícios corrigidos pelo app. Falar e escrever livremente vêm da sua própria lista de verificação.</p>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Precisa de revisão</h2>
          {review.length ? (
            <ul className="grid gap-2">
              {review.map(({ lesson, reason }) => (
                <li key={lesson.id} className="card-flat py-2">
                  <Link to={`/lesson/${eid}/${lesson.id}`} className="font-semibold" style={{ color: 'var(--accent)' }}>{lesson.title}</Link>
                  <span className="block text-sm muted">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted text-sm">Nada por enquanto. Aulas com erros recentes ou acerto abaixo de 60% aparecem aqui.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-2 flex items-center gap-2"><Award size={18} /> Objetivos demonstrados</h2>
          {objectives.length ? (
            <ul className="grid gap-1">{objectives.map((w) => <li key={w.id}>✔ <b>Semana {w.number}:</b> {w.canDo}</li>)}</ul>
          ) : (
            <p className="muted text-sm">Um objetivo conta como demonstrado quando todas as aulas da semana estão concluídas, com a produção feita e pelo menos 70% de acerto.</p>
          )}
        </Card>

        <Notice kind="warn">Estes números orientam o seu estudo. Não são um nível do Quadro Europeu nem uma certificação.</Notice>
      </div>
    </Screen>
  )
}
