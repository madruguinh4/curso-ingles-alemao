import Dexie, { type EntityTable } from 'dexie'
import type { Card } from 'ts-fsrs'
import type { Language, Skill, Minutes, Goal, StartLevel } from './types'

// Progresso do aluno. Conteúdo NÃO fica aqui — é somente-leitura no bundle.
// Uma matrícula (enrollment) por idioma: planos e históricos independentes.

export interface Profile {
  id: 'me'
  name: string
  theme: 'system' | 'light' | 'dark'
  textScale: 1 | 1.15 | 1.3
  micAllowed: boolean
  createdAt: string
}

export interface Enrollment {
  id?: number
  language: Language
  level: StartLevel
  goal: Goal
  /** Minutos por dia dedicados a ESTE idioma (já divididos se houver dois). */
  minutesPerDay: Minutes
  /** 0 = domingo … 6 = sábado */
  weekdays: number[]
  startDate: string
  createdAt: string
}

export type ScheduleKind = 'lesson' | 'lesson-a' | 'lesson-b' | 'review' | 'assessment'
export type ScheduleStatus = 'pending' | 'done' | 'missed'

export interface ScheduleItem {
  id?: number
  enrollmentId: number
  date: string
  weekNumber: number
  lessonId: string | null
  kind: ScheduleKind
  status: ScheduleStatus
}

export interface Attempt {
  id?: number
  enrollmentId: number
  lessonId: string
  exerciseId: string
  skill: Skill
  correct: boolean
  answer: string
  at: string
}

export interface ErrorLog {
  id?: number
  enrollmentId: number
  lessonId: string
  exerciseId: string
  prompt: string
  given: string
  expected: string
  explanation: string
  at: string
}

export interface CardRow extends Card {
  id?: number
  enrollmentId: number
  vocabId: string
}

export interface Completion {
  id?: number
  enrollmentId: number
  lessonId: string
  blocksDone: string[]
  completedAt: string | null
}

export class AppDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>
  enrollments!: EntityTable<Enrollment, 'id'>
  schedule!: EntityTable<ScheduleItem, 'id'>
  attempts!: EntityTable<Attempt, 'id'>
  errors!: EntityTable<ErrorLog, 'id'>
  cards!: EntityTable<CardRow, 'id'>
  completions!: EntityTable<Completion, 'id'>

  constructor() {
    super('curso-idiomas')
    this.version(1).stores({
      profile: 'id',
      enrollments: '++id, language',
      schedule: '++id, enrollmentId, date, [enrollmentId+date], [enrollmentId+status]',
      attempts: '++id, enrollmentId, lessonId, [enrollmentId+skill], at',
      errors: '++id, enrollmentId, lessonId, at',
      cards: '++id, enrollmentId, vocabId, [enrollmentId+vocabId], [enrollmentId+due]',
      completions: '++id, enrollmentId, lessonId, [enrollmentId+lessonId]',
    })
  }
}

export const db = new AppDB()

/** false em navegadores sem IndexedDB (modo privado antigo, storage bloqueado). */
export async function storageAvailable(): Promise<boolean> {
  try {
    await db.open()
    return true
  } catch {
    return false
  }
}
