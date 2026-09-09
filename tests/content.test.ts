import { describe, it, expect } from 'vitest'
import { LESSONS, lessonsForWeek, contentStats, getWeek, getLesson } from '../src/lib/content'

describe('content', () => {
  it('every lesson validates and points to an existing week', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(6)
    for (const l of LESSONS) expect(getWeek(l.weekId), l.id).toBeDefined()
  })
  it('week 1 has 3 lessons in both languages, with the 8 blocks', () => {
    for (const lang of ['en', 'de'] as const) {
      const ls = lessonsForWeek(`${lang}-w01`)
      expect(ls.map((l) => l.id)).toEqual([`${lang}-w01-l1`, `${lang}-w01-l2`, `${lang}-w01-l3`])
      for (const l of ls) {
        expect(l.guided.length).toBeGreaterThanOrEqual(5)
        expect(l.production.type).toBe('free')
        expect(l.feedback.commonErrors.length).toBeGreaterThanOrEqual(3)
        expect(l.vocabulary.length).toBeGreaterThanOrEqual(8)
        expect(l.task.length).toBeGreaterThan(10)
      }
    }
  })
  it('each lesson has a dictation and at least 3 exercise types and 2 skills in guided', () => {
    for (const l of LESSONS) {
      expect(l.guided.some((e) => e.type === 'dictation'), `${l.id} dictation`).toBe(true)
      expect(new Set(l.guided.map((e) => e.type)).size, `${l.id} types`).toBeGreaterThanOrEqual(3)
      expect(new Set(l.guided.map((e) => e.skill)).size, `${l.id} skills`).toBeGreaterThanOrEqual(2)
    }
  })
  it('German nouns always carry article and plural', () => {
    for (const l of LESSONS.filter((l) => l.language === 'de'))
      for (const v of l.vocabulary.filter((v) => v.noun)) expect(v.article && v.plural, v.id).toBeTruthy()
  })
  it('exercise and vocabulary ids are globally unique', () => {
    const ex = LESSONS.flatMap((l) => [...l.guided, l.production].map((e) => e.id))
    expect(new Set(ex).size).toBe(ex.length)
    const vs = LESSONS.flatMap((l) => l.vocabulary.map((v) => v.id))
    expect(new Set(vs).size).toBe(vs.length)
  })
  it('stats report real counts', () => {
    expect(contentStats('en')).toEqual({ lessons: 3, weeksWithLessons: 1 })
    expect(contentStats('de')).toEqual({ lessons: 3, weeksWithLessons: 1 })
    expect(getLesson('en-w01-l1')?.language).toBe('en')
    expect(getLesson('nope')).toBeUndefined()
  })
})
