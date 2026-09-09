import Dexie, { type EntityTable } from 'dexie'
import type { Card } from 'ts-fsrs'
import type { Language, Skill, Goal, StartLevel } from './types'

// Progresso do aluno. Conteúdo NÃO fica aqui — é somente-leitura no bundle.
// Uma matrícula (enrollment) por idioma: planos e históricos independentes.
// Sem agenda por tempo: o aluno avança no ritmo dele; o app registra os dias
// em que estudou (studyDays) e mostra isso sem punição.

export interface Profile {
  id: 'me'
  name: string
  theme: 'system' | 'light' | 'dark'
  textScale: 1 | 1.15 | 1.3
  micAllowed: boolean
  /** voz escolhida por idioma (voiceURI); vazio = automática */
  voices?: Partial<Record<Language, string>>
  createdAt: string
}

export interface Enrollment {
  id?: number
  language: Language
  level: StartLevel
  goal: Goal
  startDate: string
  createdAt: string
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
  /** marcada como "já sei": sai da fila sem contar como concluída */
  skipped?: boolean
}

export interface StudyDay {
  id?: number
  enrollmentId: number
  /** YYYY-MM-DD local */
  date: string
}

export interface AssessmentResult {
  id?: number
  enrollmentId: number
  weekNumber: number
  results: { skill: Skill; ok: number; total: number }[]
  doneAt: string
}

export class AppDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>
  enrollments!: EntityTable<Enrollment, 'id'>
  attempts!: EntityTable<Attempt, 'id'>
  errors!: EntityTable<ErrorLog, 'id'>
  cards!: EntityTable<CardRow, 'id'>
  completions!: EntityTable<Completion, 'id'>
  studyDays!: EntityTable<StudyDay, 'id'>
  assessments!: EntityTable<AssessmentResult, 'id'>

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
    this.version(2).stores({
      schedule: null,
      studyDays: '++id, enrollmentId, [enrollmentId+date]',
      assessments: '++id, enrollmentId, [enrollmentId+weekNumber]',
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

/** Registra que o aluno estudou este idioma hoje (idempotente). */
export async function recordStudyDay(enrollmentId: number, date: string): Promise<void> {
  const exists = await db.studyDays.where('[enrollmentId+date]').equals([enrollmentId, date]).count()
  if (!exists) await db.studyDays.add({ enrollmentId, date })
}
