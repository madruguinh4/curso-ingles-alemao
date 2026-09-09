import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Enrollment, type ScheduleItem } from '../lib/db'
import { reschedule } from '../lib/plan'
import { dueCards } from '../lib/srs'
import { formatBR, todayISO } from '../lib/dates'
import { getLesson, lessonsForWeek, getWeek } from '../lib/content'
import { MONTH_TITLES } from '../content/curriculum'
import { LANGUAGE_NAMES } from '../lib/types'
import { useEnrollments } from '../state/useEnrollments'
import { useProfile } from '../state/useTheme'
import { Button, Card, Notice, Screen, Spinner } from '../components/ui'

export function Home() {
  const all = useEnrollments()
  const p = useProfile()
  if (!all) return <Spinner />
  if (!all.length) return <Navigate to="/welcome" replace />
  return (
    <Screen title={p.name ? `Olá, ${p.name}` : 'Hoje'}>
      <div className="grid gap-6">
        {all.map((e) => <EnrollmentToday key={e.id} e={e} />)}
      </div>
    </Screen>
  )
}

/** Reorganiza atrasos numa transação: com StrictMode ou duas abas, a segunda execução não vê atraso e não duplica. */
async function catchUp(e: Enrollment, today: string) {
  return db.transaction('rw', db.schedule, async () => {
    const items = await db.schedule.where('enrollmentId').equals(e.id!).toArray()
    const r = reschedule(items, today, e.weekdays)
    if (r.missed) await db.schedule.bulkPut(r.items)
    return r
  })
}

function EnrollmentToday({ e }: { e: Enrollment }) {
  const today = todayISO()
  const eid = e.id!
  const items = useLiveQuery(() => db.schedule.where('enrollmentId').equals(eid).toArray(), [eid])
  const due = useLiveQuery(() => dueCards(eid), [eid])
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const [notice, setNotice] = useState<string>()

  const late = items?.some((i) => i.status === 'pending' && i.date < today)
  useEffect(() => {
    if (!late) return
    catchUp(e, today).then((r) => {
      if (r.missed) setNotice(`Você ficou ${r.missed} dia${r.missed > 1 ? 's' : ''} de estudo sem ${LANGUAGE_NAMES[e.language]}. Reorganizei o plano: o término previsto passou de ${formatBR(r.oldEnd)} para ${formatBR(r.newEnd)}. Nada foi perdido — as atividades só mudaram de data.`)
    })
  }, [late, e, today])

  if (!items || !due || !completions) return <Spinner />

  const todays = items.filter((i) => i.date === today && i.status !== 'missed')
  const pending = items.filter((i) => i.status === 'pending').sort((a, b) => a.date.localeCompare(b.date))
  const currentWeek = pending[0]?.weekNumber ?? 26
  const week = getWeek(`${e.language}-w${String(currentWeek).padStart(2, '0')}`)
  const nextDate = pending.find((i) => i.date > today)?.date
  const isDone = (l: string) => completions.some((c) => c.lessonId === l && c.completedAt)
  const inProgress = (l: string) => completions.some((c) => c.lessonId === l && !c.completedAt && c.blocksDone.length)

  return (
    <section aria-labelledby={`h-${eid}`}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 id={`h-${eid}`} className="text-xl font-bold">{LANGUAGE_NAMES[e.language]}</h2>
        {week && <span className="text-sm muted">Semana {week.number} de 26 · {MONTH_TITLES[week.month]}</span>}
      </div>
      {week && <p className="text-sm mb-3"><b>Objetivo da semana:</b> {week.canDo}</p>}
      {notice && <div className="mb-3"><Notice>{notice}</Notice></div>}

      <div className="grid gap-3">
        {todays.length === 0 && (
          <Card>
            <p>Hoje não é um dia de estudo de {LANGUAGE_NAMES[e.language]} no seu plano.</p>
            {nextDate && <p className="text-sm muted mt-1">Próxima atividade: {formatBR(nextDate)}.</p>}
            {due.length > 0 && <Button variant="secondary" className="mt-3" to={`/review/${eid}`}>Revisar {due.length} cartão(ões) mesmo assim</Button>}
          </Card>
        )}
        {todays.map((i) => <TodayItem key={i.id} i={i} e={e} due={due.length} done={isDone} inProgress={inProgress} />)}
        {todays.length > 0 && !todays.some((i) => i.kind === 'review') && due.length > 0 && (
          <Card>
            <p><b>{due.length}</b> cartão(ões) de vocabulário vencido(s).</p>
            <Button variant="secondary" className="mt-2" to={`/review/${eid}`}>Revisar</Button>
          </Card>
        )}
      </div>
    </section>
  )
}

function TodayItem({ i, e, due, done, inProgress }: { i: ScheduleItem; e: Enrollment; due: number; done: (l: string) => boolean; inProgress: (l: string) => boolean }) {
  const eid = e.id!
  const mark = i.status === 'done' ? '✓ ' : ''
  if (i.kind === 'review') {
    return (
      <Card>
        <p><b>{mark}Revisão</b> · {due ? `${due} cartão(ões) vencido(s)` : 'nada vencido por enquanto'}</p>
        <Button variant={i.status === 'done' ? 'secondary' : 'primary'} className="mt-2" to={`/review/${eid}`}>{i.status === 'done' ? 'Revisar de novo' : 'Revisar'}</Button>
      </Card>
    )
  }
  if (i.kind === 'assessment') {
    const has = lessonsForWeek(`${e.language}-w${String(i.weekNumber).padStart(2, '0')}`).length > 0
    return (
      <Card>
        <p><b>{mark}Verificação da semana {i.weekNumber}</b></p>
        {has ? (
          <Button variant={i.status === 'done' ? 'secondary' : 'primary'} className="mt-2" to={`/assessment/${eid}/${i.weekNumber}`}>{i.status === 'done' ? 'Ver de novo' : 'Fazer verificação'}</Button>
        ) : (
          <p className="text-sm muted mt-1">Esta semana ainda não tem aulas, então não há o que verificar.</p>
        )}
      </Card>
    )
  }
  const lesson = i.lessonId ? getLesson(i.lessonId) : undefined
  if (!lesson) {
    return (
      <Card>
        <p><b>Aula da semana {i.weekNumber}</b> — conteúdo em produção</p>
        <p className="text-sm muted mt-1">As aulas desta semana ainda não foram escritas. O objetivo e a gramática já estão definidos no mapa. Enquanto isso, revise os cartões ou refaça uma aula anterior.</p>
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" to={`/map/${eid}`}>Ver mapa</Button>
          {due > 0 && <Button variant="secondary" to={`/review/${eid}`}>Revisar cartões</Button>}
        </div>
      </Card>
    )
  }
  const part = i.kind === 'lesson-a' ? 'a' : i.kind === 'lesson-b' ? 'b' : null
  const label = i.status === 'done' ? 'Rever aula' : inProgress(lesson.id) ? 'Continuar aula' : done(lesson.id) ? 'Rever aula' : 'Começar aula'
  return (
    <Card>
      <p className="text-sm muted">{mark}Aula{part ? ` (parte ${part.toUpperCase()})` : ''} · {e.minutesPerDay} min</p>
      <h3 className="font-bold text-lg">{lesson.title}</h3>
      <p className="text-sm">{lesson.objective}</p>
      <Button className="mt-3" variant={i.status === 'done' ? 'secondary' : 'primary'} to={`/lesson/${eid}/${lesson.id}${part ? `?part=${part}` : ''}`}>{label}</Button>
    </Card>
  )
}
