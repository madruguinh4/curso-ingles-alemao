import Dexie from 'dexie'
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade as FsrsGrade } from 'ts-fsrs'
import { db, type CardRow } from './db'

// Revisão espaçada com FSRS (mesmo algoritmo do Anki moderno).
// `review` é pura; as demais funções falam com o banco.

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }))

export type Grade = 'again' | 'hard' | 'good' | 'easy'
const RATING: Record<Grade, FsrsGrade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy }

export const GRADE_LABELS: Record<Grade, string> = { again: 'Errei', hard: 'Difícil', good: 'Bom', easy: 'Fácil' }

export function newCard(enrollmentId: number, vocabId: string, now = new Date()): CardRow {
  return { ...createEmptyCard(now), enrollmentId, vocabId }
}

export function review(card: CardRow, grade: Grade, now = new Date()): CardRow {
  const { id, enrollmentId, vocabId, ...fsrsCard } = card
  const { card: next } = scheduler.next({ ...fsrsCard } as Card, now, RATING[grade])
  return { ...next, id, enrollmentId, vocabId }
}

export async function ensureCards(enrollmentId: number, vocabIds: string[]): Promise<void> {
  const existing = new Set((await db.cards.where('enrollmentId').equals(enrollmentId).toArray()).map((c) => c.vocabId))
  const missing = vocabIds.filter((v) => !existing.has(v)).map((v) => newCard(enrollmentId, v))
  if (missing.length) await db.cards.bulkAdd(missing)
}

export async function dueCards(enrollmentId: number, now = new Date()): Promise<CardRow[]> {
  return db.cards
    .where('[enrollmentId+due]')
    .between([enrollmentId, Dexie.minKey], [enrollmentId, now], true, true)
    .toArray()
}

export async function nextDue(enrollmentId: number): Promise<Date | null> {
  const first = await db.cards.where('[enrollmentId+due]').between([enrollmentId, Dexie.minKey], [enrollmentId, Dexie.maxKey]).first()
  return first ? first.due : null
}

export async function gradeCard(card: CardRow, grade: Grade, now = new Date()): Promise<CardRow> {
  const next = review(card, grade, now)
  await db.cards.put(next)
  return next
}
