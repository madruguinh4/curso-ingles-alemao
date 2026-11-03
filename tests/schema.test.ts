import { describe, it, expect } from 'vitest'
import { VocabItemSchema, ExerciseSchema, validateLesson } from '../src/lib/schema'

const vocabOk = { id: 'de-haus', term: 'Haus', translation: 'casa', example: 'Das Haus ist groß.', exampleTranslation: 'A casa é grande.', noun: true, article: 'das', plural: 'Häuser' }

describe('VocabItemSchema', () => {
  it('accepts a German noun with article and plural', () => {
    expect(VocabItemSchema.safeParse(vocabOk).success).toBe(true)
  })
  it('rejects a noun without article', () => {
    expect(VocabItemSchema.safeParse({ ...vocabOk, article: undefined }).success).toBe(false)
  })
  it('rejects a noun without plural', () => {
    expect(VocabItemSchema.safeParse({ ...vocabOk, plural: undefined }).success).toBe(false)
  })
  it('accepts a non-noun without article', () => {
    expect(VocabItemSchema.safeParse({ id: 'de-gehen', term: 'gehen', translation: 'ir', example: 'Ich gehe.', exampleTranslation: 'Eu vou.' }).success).toBe(true)
  })
})

describe('ExerciseSchema', () => {
  it('accepts choice with valid answer index', () => {
    expect(ExerciseSchema.safeParse({ id: 'x1', type: 'choice', skill: 'reading', prompt: 'Q?', options: ['a', 'b'], answer: 1, explanation: 'b' }).success).toBe(true)
  })
  it('rejects choice whose answer index is out of range', () => {
    expect(ExerciseSchema.safeParse({ id: 'x1', type: 'choice', skill: 'reading', prompt: 'Q?', options: ['a', 'b'], answer: 5, explanation: 'b' }).success).toBe(false)
  })
  it('accepts gap with several accepted answers', () => {
    expect(ExerciseSchema.safeParse({ id: 'x2', type: 'gap', skill: 'writing', prompt: 'I ___ Ana.', answers: ['am', "'m"], explanation: 'to be' }).success).toBe(true)
  })
  it('rejects gap whose prompt has no blank', () => {
    expect(ExerciseSchema.safeParse({ id: 'x2', type: 'gap', skill: 'writing', prompt: 'I am Ana.', answers: ['am'], explanation: 'to be' }).success).toBe(false)
  })
  it('accepts order, transform, dictation, free', () => {
    const ok = [
      { id: 'o', type: 'order', skill: 'writing', prompt: 'Ordene', tokens: ['I', 'am', 'Ana'], answer: 'I am Ana', explanation: 'S+V' },
      { id: 't', type: 'transform', skill: 'writing', prompt: 'I am Ana.', instruction: 'Negativa', answers: ['I am not Ana.', "I'm not Ana."], explanation: 'not' },
      { id: 'd', type: 'dictation', skill: 'listening', text: 'Hello, I am Ana.', answers: ['Hello, I am Ana.'], explanation: 'ditado', lang: 'en' },
      { id: 'f', type: 'free', skill: 'speaking', prompt: 'Apresente-se', model: 'Hi, I am...', checklist: ['nome', 'origem'] },
    ]
    for (const e of ok) expect(ExerciseSchema.safeParse(e).success, e.id).toBe(true)
  })
  it('rejects free with a non-productive skill', () => {
    expect(ExerciseSchema.safeParse({ id: 'f', type: 'free', skill: 'reading', prompt: 'x', model: 'y', checklist: ['z'] }).success).toBe(false)
  })
})

describe('validateLesson', () => {
  it('names the file and path on failure', () => {
    expect(() => validateLesson({ id: 'bad' }, 'en/w01-l1.json')).toThrow(/en\/w01-l1\.json/)
  })
  it('rejects a lesson whose weekId does not match its id', () => {
    const lesson = minimalLesson()
    expect(() => validateLesson({ ...lesson, weekId: 'en-w02' }, 'f')).toThrow(/weekId/)
  })
  it('accepts a minimal valid lesson', () => {
    expect(validateLesson(minimalLesson(), 'f').id).toBe('en-w01-l1')
  })
  it('rejects a lesson that starts with an exercise or has free production among the steps', () => {
    const lesson = minimalLesson()
    expect(() => validateLesson({ ...lesson, steps: lesson.steps.slice(1) }, 'f')).toThrow(/learn/)
    expect(() => validateLesson({ ...lesson, steps: [...lesson.steps, lesson.production] }, 'f')).toThrow(/production/)
  })
})

function minimalLesson() {
  const ex = (id: string) => ({ id, type: 'choice', skill: 'reading', prompt: 'Q?', options: ['a', 'b'], answer: 0, explanation: 'a' })
  return {
    id: 'en-w01-l1', weekId: 'en-w01', language: 'en', title: 'T', objective: 'O',
    steps: [
      { type: 'learn', text: "I'm Ana.", translation: 'Eu sou a Ana.', rule: "Eu sou = I'm", avoid: { wrong: 'I Ana.', right: "I'm Ana." } },
      ex('e1'),
      ex('e2'),
      { type: 'dialogue', lines: [{ speaker: 'A', text: 'Hi', translation: 'Oi' }, { speaker: 'B', text: 'Hello', translation: 'Olá' }] },
    ] as unknown[],
    production: { id: 'p1', type: 'free', skill: 'speaking', prompt: 'x', model: 'y', checklist: ['z'] },
    vocabulary: [
      { id: 'v1', term: 'hi', translation: 'oi', example: 'Hi!', exampleTranslation: 'Oi!' },
      { id: 'v2', term: 'bye', translation: 'tchau', example: 'Bye!', exampleTranslation: 'Tchau!' },
      { id: 'v3', term: 'thanks', translation: 'obrigado', example: 'Thanks!', exampleTranslation: 'Obrigado!' },
    ],
  }
}
