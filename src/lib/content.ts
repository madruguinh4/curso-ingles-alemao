import { validateLesson } from './schema'
import { CURRICULUM } from '../content/curriculum'
import type { Language, Lesson, Week } from './types'

// Todo o conteúdo é validado na carga: JSON quebrado quebra o app (e a suíte
// de testes) cedo e com mensagem apontando arquivo e campo.
const raw = import.meta.glob('../content/{en,de}/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export const LESSONS: Lesson[] = Object.entries(raw)
  .map(([file, json]) => validateLesson(json, file.replace('../content/', '')))
  .sort((a, b) => a.id.localeCompare(b.id))

const lessonById = new Map(LESSONS.map((l) => [l.id, l]))
const weekById = new Map(CURRICULUM.map((w) => [w.id, w]))

export const getLesson = (id: string): Lesson | undefined => lessonById.get(id)
export const getWeek = (id: string): Week | undefined => weekById.get(id)
export const lessonsForWeek = (weekId: string): Lesson[] => LESSONS.filter((l) => l.weekId === weekId)
export const lessonsFor = (language: Language): Lesson[] => LESSONS.filter((l) => l.language === language)

export function contentStats(language: Language) {
  const ls = lessonsFor(language)
  return { lessons: ls.length, weeksWithLessons: new Set(ls.map((l) => l.weekId)).size }
}

const vocabById = new Map(LESSONS.flatMap((l) => l.vocabulary.map((v) => [v.id, { ...v, lessonId: l.id, language: l.language }] as const)))
export const getVocab = (id: string) => vocabById.get(id)
