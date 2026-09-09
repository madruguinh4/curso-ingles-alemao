import type { Attempt, Completion, ErrorLog } from './db'
import type { Lesson, Skill, Week } from './types'
import { addDays } from './dates'

// Progresso por evidência: tentativas, erros e produção — nunca "aula aberta".

export interface SkillScore {
  skill: Skill
  attempts: number
  /** null = ainda sem evidência */
  accuracy: number | null
}

export const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking']
const WINDOW = 30
const REVIEW_DAYS = 14
const OBJECTIVE_MIN = 0.7
const REVIEW_MAX = 0.6
const REVIEW_MIN_ATTEMPTS = 3

const accuracyOf = (a: Attempt[]) => (a.length ? a.filter((x) => x.correct).length / a.length : null)

export function skillScores(attempts: Attempt[]): SkillScore[] {
  return SKILLS.map((skill) => {
    const recent = attempts
      .filter((a) => a.skill === skill)
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
      .slice(-WINDOW)
    return { skill, attempts: recent.length, accuracy: accuracyOf(recent) }
  })
}

/** Semanas cujo objetivo comunicativo foi demonstrado: todas as aulas concluídas com produção e ≥70% nos exercícios. */
export function demonstratedObjectives(
  weeks: Week[],
  completions: Completion[],
  attempts: Attempt[],
  lessonsOf: (weekId: string) => Lesson[],
): Week[] {
  return weeks.filter((w) => {
    const lessons = lessonsOf(w.id)
    if (!lessons.length) return false
    const allDone = lessons.every((l) => {
      const c = completions.find((c) => c.lessonId === l.id)
      return !!c?.completedAt && c.blocksDone.includes('production')
    })
    if (!allDone) return false
    const ids = new Set(lessons.map((l) => l.id))
    const acc = accuracyOf(attempts.filter((a) => ids.has(a.lessonId)))
    return acc !== null && acc >= OBJECTIVE_MIN
  })
}

export function needsReview(lessons: Lesson[], attempts: Attempt[], errors: ErrorLog[], today: string): { lesson: Lesson; reason: string }[] {
  const cutoff = addDays(today, -REVIEW_DAYS)
  const out: { lesson: Lesson; reason: string }[] = []
  for (const lesson of lessons) {
    const reasons: string[] = []
    const recent = errors.filter((e) => e.lessonId === lesson.id && e.at.slice(0, 10) >= cutoff).length
    if (recent) reasons.push(`${recent} erro${recent > 1 ? 's' : ''} recente${recent > 1 ? 's' : ''}`)
    const a = attempts.filter((x) => x.lessonId === lesson.id)
    const acc = accuracyOf(a)
    if (a.length >= REVIEW_MIN_ATTEMPTS && acc !== null && acc < REVIEW_MAX) reasons.push(`acerto de ${Math.round(acc * 100)}%`)
    if (reasons.length) out.push({ lesson, reason: reasons.join(' · ') })
  }
  return out
}

export const completedCount = (completions: Completion[]): number => completions.filter((c) => !!c.completedAt).length
