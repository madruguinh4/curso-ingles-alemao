import type { Completion, AssessmentResult } from './db'
import type { Language, Lesson, Week } from './types'
import { lessonsFor, lessonsForWeek } from './content'
import { weeksFor } from '../content/curriculum'

// Progressão sem agenda: a próxima aula é a primeira não concluída; a
// verificação da semana aparece quando as aulas da semana estão concluídas.

export type LessonStatus = 'done' | 'progress' | 'todo'

export function lessonStatus(lessonId: string, completions: Completion[]): LessonStatus {
  const c = completions.find((c) => c.lessonId === lessonId)
  return c?.completedAt ? 'done' : c?.blocksDone.length ? 'progress' : 'todo'
}

/** Aula em andamento primeiro; senão a primeira ainda não concluída. */
export function nextLesson(lessons: Lesson[], completions: Completion[]): Lesson | undefined {
  return lessons.find((l) => lessonStatus(l.id, completions) === 'progress') ?? lessons.find((l) => lessonStatus(l.id, completions) !== 'done')
}

export function upcomingLessons(lessons: Lesson[], completions: Completion[], n = 5): Lesson[] {
  return lessons.filter((l) => lessonStatus(l.id, completions) !== 'done').slice(0, n)
}

export function weekComplete(week: Week, completions: Completion[]): boolean {
  const ls = lessonsForWeek(week.id)
  return ls.length > 0 && ls.every((l) => lessonStatus(l.id, completions) === 'done')
}

/** Semana atual = a da próxima aula; se tudo concluído, a última com aulas. */
export function currentWeek(lang: Language, completions: Completion[]): Week | undefined {
  const weeks = weeksFor(lang)
  const next = nextLesson(lessonsFor(lang), completions)
  if (next) return weeks.find((w) => w.id === next.weekId)
  const withLessons = weeks.filter((w) => lessonsForWeek(w.id).length)
  return withLessons[withLessons.length - 1]
}

/** Semanas concluídas cuja verificação ainda não foi feita. */
export function pendingAssessments(lang: Language, completions: Completion[], done: AssessmentResult[]): Week[] {
  const assessed = new Set(done.map((a) => a.weekNumber))
  return weeksFor(lang).filter((w) => weekComplete(w, completions) && !assessed.has(w.number))
}
