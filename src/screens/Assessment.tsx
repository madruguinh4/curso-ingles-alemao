import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { getWeek, lessonsForWeek } from '../lib/content'
import type { Exercise, Skill } from '../lib/types'
import { LANGUAGE_NAMES, SKILL_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Button, Card, Notice, Screen, Spinner } from '../components/ui'
import { ExerciseRunner, type ExerciseResult } from '../components/exercises/ExerciseRunner'

// Verificação semanal: 6 exercícios da semana que o aluno ainda não viu
// (sorteio determinístico) + 1 produção. Sem "tentar de novo".

function seeded(seed: number) {
  let s = seed >>> 0 || 1
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const r = seeded(seed), a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function Assessment() {
  const { enrollmentId, weekNumber } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const wn = Number(weekNumber)
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const [results, setResults] = useState<ExerciseResult[] | null>(null)

  const week = e ? getWeek(`${e.language}-w${String(wn).padStart(2, '0')}`) : undefined
  const lessons = week ? lessonsForWeek(week.id) : []

  const set = useMemo(() => {
    if (!attempts || !lessons.length) return null
    const seen = new Set(attempts.map((a) => a.exerciseId))
    const all = lessons.flatMap((l) => l.guided.map((ex) => ({ ex, lessonId: l.id })))
    const unseen = all.filter((x) => !seen.has(x.ex.id))
    const pool = unseen.length >= 6 ? unseen : [...unseen, ...all.filter((x) => seen.has(x.ex.id))]
    const picked = shuffle(pool, wn * 7919 + eid).slice(0, 6)
    const prod = shuffle(lessons, wn * 31 + eid)[0]
    picked.push({ ex: prod.production, lessonId: prod.id })
    return picked
  }, [attempts, lessons, wn, eid])

  if (loading || !e || !attempts) return <Spinner />
  const lang = e.language

  if (!week || !lessons.length) {
    return (
      <Screen title={`Verificação da semana ${wn}`} back="/">
        <Notice kind="warn">Esta semana ainda não tem aulas escritas, então não há o que verificar. {week && <>O objetivo previsto é: <i>{week.canDo}</i>.</>}</Notice>
      </Screen>
    )
  }

  if (results) {
    const by = (['listening', 'reading', 'writing', 'speaking'] as Skill[]).map((s) => {
      const r = results.filter((x) => x.skill === s)
      return { skill: s, total: r.length, ok: r.filter((x) => x.correct).length }
    }).filter((x) => x.total)
    const weak = by.filter((x) => x.ok / x.total < 0.6)
    return (
      <Screen title={`Semana ${wn} — resultado`} back="/">
        <div className="grid gap-4">
          <Card>
            <h2 className="font-bold mb-2">{week.title}: <i>{week.canDo}</i></h2>
            <ul className="grid gap-1">{by.map((x) => <li key={x.skill}>{SKILL_NAMES[x.skill]}: <b>{x.ok}/{x.total}</b></li>)}</ul>
          </Card>
          {weak.length ? (
            <Notice kind="warn">
              <b>Antes de avançar, vale reforçar:</b> {weak.map((x) => SKILL_NAMES[x.skill]).join(', ')}. Refaça os exercícios das aulas desta semana e a revisão de cartões; os erros de hoje já entraram no seu histórico e voltam em outros contextos.
            </Notice>
          ) : (
            <Notice kind="ok">Bom resultado. O objetivo da semana conta como demonstrado quando as três aulas estiverem concluídas com a produção feita.</Notice>
          )}
          <p className="text-sm muted">Esta é uma verificação interna, com poucos itens, para orientar o estudo — não um nível oficial.</p>
          <Button to="/" block>Voltar ao início</Button>
        </div>
      </Screen>
    )
  }

  if (!set) return <Spinner />
  return (
    <Screen title={`Verificação da semana ${wn} — ${LANGUAGE_NAMES[lang]}`} back="/">
      <p className="text-sm muted mb-3">7 itens: 6 exercícios e 1 produção. Sem “tentar de novo” — aqui o objetivo é ver o que ficou.</p>
      <ExerciseRunner
        exercises={set.map((x) => x.ex)}
        lessonIdOf={(ex: Exercise) => set.find((x) => x.ex.id === ex.id)?.lessonId ?? lessons[0].id}
        lang={lang}
        enrollmentId={eid}
        lessonId={lessons[0].id}
        mode="assessment"
        onFinish={async (r) => {
          const item = await db.schedule.where('enrollmentId').equals(eid).filter((i) => i.kind === 'assessment' && i.weekNumber === wn && i.status === 'pending').first()
          if (item?.id) await db.schedule.update(item.id, { status: 'done' })
          setResults(r)
        }}
      />
    </Screen>
  )
}
