import { useParams } from 'react-router-dom'
import { MONTH_TITLES, TOTAL_MONTHS, TOTAL_WEEKS, weeksForMonth } from '../content/curriculum'
import { contentStats, lessonsForWeek } from '../lib/content'
import { GOAL_NAMES, LANGUAGE_NAMES } from '../lib/types'
import { LEVEL_NAMES } from '../content/diagnostic'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Notice, Screen, Spinner } from '../components/ui'

/** Visão geral do plano de um ano (sem datas: o ritmo é do aluno). */
export function Plan() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  if (loading) return <Spinner />
  if (!e) return <Screen title="Plano"><Notice kind="warn">Nenhuma matrícula encontrada.</Notice></Screen>
  const stats = contentStats(e.language)
  return (
    <Screen title={`Plano de ${LANGUAGE_NAMES[e.language]}`} back="/more" subtitle={`${TOTAL_WEEKS} semanas · ponto de partida: ${LEVEL_NAMES[e.level]} · objetivo: ${GOAL_NAMES[e.goal]}`}>
      <div className="grid gap-3">
        <Notice kind="warn"><b>Conteúdo disponível:</b> {stats.lessons} aula(s) em {stats.weeksWithLessons} de {TOTAL_WEEKS} semanas. O restante está planejado abaixo e chega em atualizações.</Notice>
        {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map((m) => {
          const ws = weeksForMonth(e.language, m)
          return (
            <Card key={m}>
              <h3 className="font-bold flex items-center gap-2"><span className="chip chip-accent">{m}</span> {MONTH_TITLES[m]} <span className="chip ml-auto">{ws[0]?.level}</span></h3>
              <ul className="mt-2 grid gap-1 text-sm">
                {ws.map((w) => (
                  <li key={w.id} className="flex gap-2"><span className="muted w-8 shrink-0">S{w.number}</span><span><b>{w.title}</b> — <i>{w.canDo}</i>{lessonsForWeek(w.id).length ? '' : <span className="muted"> (em produção)</span>}</span></li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </Screen>
  )
}
