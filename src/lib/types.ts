import type { z } from 'zod'
import type { LanguageSchema, SkillSchema, LevelSchema, VocabItemSchema, ExerciseSchema, LessonSchema, WeekSchema } from './schema'

export type Language = z.infer<typeof LanguageSchema>
export type Skill = z.infer<typeof SkillSchema>
export type Level = z.infer<typeof LevelSchema>
export type VocabItem = z.infer<typeof VocabItemSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type FreeExercise = Extract<Exercise, { type: 'free' }>
export type Lesson = z.infer<typeof LessonSchema>
export type Week = z.infer<typeof WeekSchema>

export type Minutes = 20 | 40 | 60 | 90
export type Goal = 'viagem' | 'trabalho' | 'estudos' | 'mudanca' | 'pessoal'
export type StartLevel = 'zero' | 'basico' | 'intermediario'

export const LANGUAGE_NAMES: Record<Language, string> = { en: 'Inglês', de: 'Alemão' }
export const SKILL_NAMES: Record<Skill, string> = { listening: 'Compreensão oral', reading: 'Leitura', writing: 'Escrita', speaking: 'Fala' }
export const GOAL_NAMES: Record<Goal, string> = { viagem: 'Viagens', trabalho: 'Trabalho', estudos: 'Estudos', mudanca: 'Mudança de país', pessoal: 'Desenvolvimento pessoal' }
