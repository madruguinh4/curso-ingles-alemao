import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { skillScores, demonstratedObjectives, needsReview, completedCount } from '../lib/progress'
import { lessonsFor, lessonsForWeek, contentStats } from '../lib/content'
import { weeksFor } from '../content/curriculum'
import { todayISO } from '../lib/dates'
import { LANGUAGE_NAMES, SKILL_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Notice, ProgressBar, Screen, Spinner } from '../components/ui'

export function Progress() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const errors = useLiveQuery(() => db.errors.where('enrollmentId').equals(eid).toArray(), [eid])
  if (loading || !e || !attempts || !completions || !errors) return <Spinner />

  const lang = e.language
  const lessons = lessonsFor(lang)
  const stats = contentStats(lang)
  const scores = skillScores(attempts)
  const objectives = demonstratedObjectives(weeksFor(lang), completions, attempts, lessonsForWeek)
  const review = needsReview(lessons, attempts, errors, todayISO())
  const done = completedCount(completions)

  return (
    <Screen title={`Progresso — ${LANGUAGE_NAMES[lang]}`}>
      <div className="grid gap-4">
        <Card>
          <h2 className="font-bold mb-2">Conteúdo concluído</h2>
          <ProgressBar value={stats.lessons ? done / stats.lessons : 0} label={`${done} de ${stats.lessons} aulas existentes`} />
          <p className="text-sm muted">{stats.weeksWithLessons} de 26 semanas têm aulas prontas. O mapa mostra o que já está definido para as outras.</p>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Desempenho por habilidade</h2>
          {scores.map((s) => (
            <div key={s.skill}>
              {s.accuracy === null ? (
                <div className="flex justify-between text-sm my-2"><span>{SKILL_NAMES[s.skill]}</span><span className="muted">sem evidência ainda</span></div>
              ) : (
                <ProgressBar value={s.accuracy} label={`${SKILL_NAMES[s.skill]} · ${s.attempts} tentativa(s)`} />
              )}
            </div>
          ))}
          <p className="text-xs muted mt-2">Ouvir e ler vêm de exercícios corrigidos pelo app. Falar e escrever livremente vêm da sua própria lista de verificação — o app não tem reconhecimento de voz nem correção automática de texto.</p>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Precisa de revisão</h2>
          {review.length ? (
            <ul className="grid gap-2">
              {review.map(({ lesson, reason }) => (
                <li key={lesson.id}>
                  <Link to={`/lesson/${eid}/${lesson.id}`} className="font-semibold" style={{ color: 'var(--accent)' }}>{lesson.title}</Link>
                  <span className="text-sm muted"> — {reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted text-sm">Nada por enquanto. Aulas com erros recentes ou acerto abaixo de 60% aparecem aqui.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Objetivos comunicativos demonstrados</h2>
          {objectives.length ? (
            <ul className="grid gap-1">{objectives.map((w) => <li key={w.id}>✔ <b>Semana {w.number}:</b> {w.canDo}</li>)}</ul>
          ) : (
            <p className="muted text-sm">Um objetivo conta como demonstrado quando todas as aulas da semana estão concluídas, com a produção feita e pelo menos 70% de acerto nos exercícios.</p>
          )}
        </Card>

        <Notice kind="warn">
          Estes números são uma verificação interna para orientar o seu estudo. Não são um nível do Quadro Europeu nem uma certificação — para isso existem exames oficiais (Cambridge, IELTS, Goethe, telc).
        </Notice>
      </div>
    </Screen>
  )
}
