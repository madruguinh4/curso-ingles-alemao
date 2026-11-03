import { addDays, weekdayOf } from './dates'

// Dias de estudo: o app registra cada dia em que o aluno fez algo (exercício,
// bloco de aula, revisão). Sem punição por ausência — só informação.

export interface StudyStats {
  totalDays: number
  /** dias seguidos terminando hoje ou ontem */
  currentStreak: number
  longestStreak: number
  studiedToday: boolean
  /** últimos `weeks` × 7 dias, do mais antigo ao mais recente, alinhados por semana (começa numa segunda) */
  grid: { date: string; studied: boolean; future: boolean }[]
  thisWeek: number
}

export function studyStats(days: string[], today: string, weeks = 12): StudyStats {
  const set = new Set(days)
  let currentStreak = 0
  let cursor = set.has(today) ? today : addDays(today, -1)
  while (set.has(cursor)) { currentStreak++; cursor = addDays(cursor, -1) }

  let longestStreak = 0
  let run = 0
  let prev: string | null = null
  for (const d of [...set].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    prev = d
  }

  // grade alinhada: última coluna termina no domingo da semana atual
  const dow = weekdayOf(today) // 0 = domingo
  const daysToSunday = (7 - dow) % 7
  const end = addDays(today, daysToSunday)
  const start = addDays(end, -(weeks * 7 - 1))
  const grid: StudyStats['grid'] = []
  for (let d = start; d <= end; d = addDays(d, 1)) grid.push({ date: d, studied: set.has(d), future: d > today })

  const monday = addDays(today, -((dow + 6) % 7))
  const thisWeek = [...set].filter((d) => d >= monday && d <= today).length

  return { totalDays: set.size, currentStreak, longestStreak, studiedToday: set.has(today), grid, thisWeek }
}

/** O que o Dudu diz sobre os dias de estudo: incentivo, nunca cobrança. */
export function studyMessage(s: StudyStats): string {
  if (s.studiedToday) return s.currentStreak > 1 ? `Hoje já contou! São ${s.currentStreak} dias seguidos.` : 'Hoje já contou! Amanhã tem mais.'
  if (s.currentStreak > 0) return `Uma aula hoje e são ${s.currentStreak + 1} dias seguidos.`
  if (s.totalDays > 0) return 'Que bom te ver de volta. Uma aula curta já vale.'
  return 'Cada dia que você estudar aparece aqui.'
}
