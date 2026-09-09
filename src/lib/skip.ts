import { db } from './db'
import type { Language } from './types'
import { lessonsBefore } from './course'

// "Já sei isso": marca aulas como puladas. Reversível a qualquer momento.

async function setSkipped(enrollmentId: number, lessonId: string, skipped: boolean) {
  const existing = await db.completions.where('[enrollmentId+lessonId]').equals([enrollmentId, lessonId]).first()
  if (skipped) {
    const row = { enrollmentId, lessonId, blocksDone: [], completedAt: new Date().toISOString(), skipped: true }
    if (existing?.id) await db.completions.update(existing.id, row)
    else await db.completions.add(row)
  } else if (existing?.id) {
    await db.completions.update(existing.id, { blocksDone: [], completedAt: null, skipped: false })
  }
}

export const skipLesson = (enrollmentId: number, lessonId: string) => setSkipped(enrollmentId, lessonId, true)
export const unskipLesson = (enrollmentId: number, lessonId: string) => setSkipped(enrollmentId, lessonId, false)

/** Pula todas as aulas ainda pendentes anteriores à semana N. Concluídas ficam como estão. */
export async function skipBefore(enrollmentId: number, lang: Language, weekNumber: number): Promise<number> {
  const done = new Set((await db.completions.where('enrollmentId').equals(enrollmentId).toArray()).filter((c) => c.completedAt && !c.skipped).map((c) => c.lessonId))
  const targets = lessonsBefore(lang, weekNumber).filter((l) => !done.has(l.id))
  for (const l of targets) await setSkipped(enrollmentId, l.id, true)
  return targets.length
}
