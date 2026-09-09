import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { planSummary, dailyAgenda } from '../lib/plan'
import { formatBR, WEEKDAY_SHORT } from '../lib/dates'
import { MONTH_TITLES, weeksForMonth } from '../content/curriculum'
import { contentStats } from '../lib/content'
import { GOAL_NAMES, LANGUAGE_NAMES, type Minutes } from '../lib/types'
import { LEVEL_NAMES } from '../content/diagnostic'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Button, Card, Notice, Screen, Spinner } from '../components/ui'

export function Plan() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const items = useLiveQuery(() => (e?.id ? db.schedule.where('enrollmentId').equals(e.id).toArray() : []), [e?.id])
  if (loading || !items) return <Spinner />
  if (!e) return <Screen title="Plano"><Notice kind="warn">Nenhuma matrícula encontrada.</Notice></Screen>

  const s = planSummary(items)
  const stats = contentStats(e.language)
  const agenda = dailyAgenda(e.minutesPerDay as Minutes, false)

  return (
    <Screen title={`Seu plano de ${LANGUAGE_NAMES[e.language]}`} back="/">
      <div className="grid gap-4">
        <Card>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="muted">Início</dt><dd>{formatBR(s.start)}</dd>
            <dt className="muted">Término previsto</dt><dd>{formatBR(s.end)}</dd>
            <dt className="muted">Dias de estudo</dt><dd>{s.studyDays} ({e.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')})</dd>
            <dt className="muted">Tempo por dia</dt><dd>{e.minutesPerDay} min</dd>
            <dt className="muted">Ponto de partida</dt><dd>{LEVEL_NAMES[e.level]}</dd>
            <dt className="muted">Objetivo</dt><dd>{GOAL_NAMES[e.goal]}</dd>
          </dl>
          <p className="text-sm mt-3">{agenda.note}</p>
        </Card>

        <Notice kind="warn">
          <b>Conteúdo disponível hoje:</b> {stats.lessons} aula(s) prontas em {stats.weeksWithLessons} de 26 semanas. As demais semanas já têm objetivos e gramática definidos (veja abaixo), mas as aulas ainda estão em produção. O app mostra isso no mapa em vez de fingir que existem.
        </Notice>

        <h2 className="text-xl font-bold mt-2">Objetivos por etapa</h2>
        {[1, 2, 3, 4, 5, 6].map((m) => (
          <Card key={m}>
            <h3 className="font-bold">Mês {m} — {MONTH_TITLES[m]}</h3>
            <ul className="mt-2 grid gap-1 text-sm">
              {weeksForMonth(e.language, m).map((w) => (
                <li key={w.id}><span className="muted">S{w.number}</span> {w.title}: <i>{w.canDo}</i></li>
              ))}
            </ul>
          </Card>
        ))}

        <Notice>
          Metas realistas: ao fim das 26 semanas, com o plano cumprido, o esperado é uma base sólida de A1–A2 com transição para B1 nas habilidades em que você mais praticar. Não é fluência, e as verificações do app não são um nível oficial.
        </Notice>
        <Button to="/" block>Ir para a atividade de hoje</Button>
      </div>
    </Screen>
  )
}
