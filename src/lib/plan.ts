import type { Enrollment, ScheduleItem, ScheduleKind } from './db'
import type { Lesson, Minutes, Week } from './types'
import { addDays, weekdayOf } from './dates'

// Gera e reorganiza o cronograma de 26 semanas. Puro: não toca no banco.
//
// Regras de volume por tempo diário (a spec proíbe comprimir o mesmo conteúdo):
//   20 min → cada aula ocupa 2 dias (a: blocos 1–5; b: blocos 6–8 + revisão)
//   40 min → uma aula por dia
//   60/90 → aula + revisão de cartões (90 ganha tempo extra para a produção)
// Cada semana curricular consome `weekdays.length` dias de estudo.
// O último dia da semana recebe a verificação semanal (assessment).

export function dailyAgenda(minutes: Minutes, twoLanguages: boolean): { kinds: ScheduleKind[]; note: string } {
  const per = twoLanguages ? minutes / 2 : minutes
  const notes: Record<number, string> = {
    10: 'Menos de 20 min por idioma não rende: escolha 40 min ou mais para estudar os dois.',
    20: 'Com 20 min por dia, cada aula leva 2 dias — o curso dura cerca de 52 semanas em vez de 26.',
    30: 'Com 30 min por idioma, cada aula leva 2 dias — cerca de 52 semanas por idioma.',
    40: 'Uma aula por dia de estudo.',
    45: 'Uma aula por dia de estudo, com alguns minutos para a revisão de cartões.',
    60: 'Aula + revisão de vocabulário todos os dias.',
    90: 'Aula + revisão + tempo extra para a produção (repita a gravação ou o texto com mais calma).',
  }
  const kinds: ScheduleKind[] = per < 40 ? ['lesson-a'] : per >= 60 ? ['lesson', 'review'] : ['lesson']
  const split = twoLanguages ? `Seu tempo será dividido: ${per} min por idioma. ` : ''
  return { kinds, note: split + (notes[per] ?? notes[40]) }
}

/** Minutos efetivos por idioma → como cada aula ocupa o cronograma. */
function mode(minutes: Minutes) {
  return { split: minutes < 40, withReview: minutes >= 60 }
}

function studyDateIterator(startDate: string, weekdays: number[]) {
  const set = new Set(weekdays)
  let cursor = startDate
  return () => {
    while (!set.has(weekdayOf(cursor))) cursor = addDays(cursor, 1)
    const d = cursor
    cursor = addDays(cursor, 1)
    return d
  }
}

export function buildSchedule(
  e: Enrollment & { id: number },
  weeks: Week[],
  lessonsOf: (weekId: string) => Lesson[],
): ScheduleItem[] {
  const { split, withReview } = mode(e.minutesPerDay)
  const next = studyDateIterator(e.startDate, e.weekdays)
  const slots = e.weekdays.length
  const items: ScheduleItem[] = []
  const base = { enrollmentId: e.id, status: 'pending' as const }

  for (const week of [...weeks].sort((a, b) => a.number - b.number)) {
    const lessons = lessonsOf(week.id)
    let last = ''
    for (let i = 0; i < slots; i++) {
      const lessonId = lessons[i]?.id ?? null
      if (split) {
        const a = next()
        items.push({ ...base, date: a, weekNumber: week.number, lessonId, kind: 'lesson-a' })
        const b = next()
        items.push({ ...base, date: b, weekNumber: week.number, lessonId, kind: 'lesson-b' })
        items.push({ ...base, date: b, weekNumber: week.number, lessonId: null, kind: 'review' })
        last = b
      } else {
        const d = next()
        items.push({ ...base, date: d, weekNumber: week.number, lessonId, kind: 'lesson' })
        if (withReview) items.push({ ...base, date: d, weekNumber: week.number, lessonId: null, kind: 'review' })
        last = d
      }
    }
    items.push({ ...base, date: last, weekNumber: week.number, lessonId: null, kind: 'assessment' })
  }
  return items
}

export function planSummary(items: ScheduleItem[]) {
  const dates = items.map((i) => i.date).sort()
  return {
    start: dates[0] ?? '',
    end: dates[dates.length - 1] ?? '',
    studyDays: new Set(dates).size,
    weeks: items.reduce((m, i) => Math.max(m, i.weekNumber), 0),
  }
}

/**
 * Itens pendentes com data anterior a `today` viram `missed` (ficam no histórico)
 * e são recriados a partir de hoje; os pendentes futuros deslizam junto,
 * mantendo os dias da semana. Itens `done` não mudam.
 */
export function reschedule(items: ScheduleItem[], today: string, weekdays: number[]) {
  const oldEnd = planSummary(items).end
  const late = items.filter((i) => i.status === 'pending' && i.date < today)
  if (!late.length) return { items, missed: 0, oldEnd, newEnd: oldEnd }

  const pending = items.filter((i) => i.status === 'pending')
  const dates = [...new Set(pending.map((i) => i.date))].sort()
  const next = studyDateIterator(today, weekdays)
  const remap = new Map(dates.map((d) => [d, next()]))

  const result: ScheduleItem[] = []
  for (const i of items) {
    if (i.status !== 'pending') {
      result.push(i)
    } else if (i.date < today) {
      result.push({ ...i, status: 'missed' })
      const { id: _id, ...rest } = i
      result.push({ ...rest, date: remap.get(i.date)! })
    } else {
      result.push({ ...i, date: remap.get(i.date)! })
    }
  }
  return {
    items: result,
    missed: new Set(late.map((i) => i.date)).size,
    oldEnd,
    newEnd: planSummary(result).end,
  }
}
