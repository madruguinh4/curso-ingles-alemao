import { describe, it, expect } from 'vitest'
import { skillScores, demonstratedObjectives, needsReview, completedCount } from '../src/lib/progress'
import { lessonsForWeek, getLesson } from '../src/lib/content'
import { weeksFor } from '../src/content/curriculum'
import type { Attempt, Completion, ErrorLog } from '../src/lib/db'

const iso = (d: string) => new Date(d + 'T12:00:00').toISOString()
const attempt = (o: Partial<Attempt> = {}): Attempt => ({ enrollmentId: 1, lessonId: 'en-w01-l1', exerciseId: 'x', skill: 'reading', correct: true, answer: '', at: iso('2026-09-14'), ...o })
const ALL_BLOCKS = ['warmup', 'dialogue', 'explanation', 'guided', 'production', 'feedback', 'task']
const done = (lessonId: string, blocks = ALL_BLOCKS): Completion => ({ enrollmentId: 1, lessonId, blocksDone: blocks, completedAt: iso('2026-09-18') })
const err = (o: Partial<ErrorLog> = {}): ErrorLog => ({ enrollmentId: 1, lessonId: 'en-w01-l1', exerciseId: 'x', prompt: 'p', given: 'g', expected: 'e', explanation: 'x', at: iso('2026-09-14'), ...o })

describe('skillScores', () => {
  it('returns the 4 skills with null accuracy when there is no evidence', () => {
    const s = skillScores([])
    expect(s.map((x) => x.skill)).toEqual(['listening', 'reading', 'writing', 'speaking'])
    expect(s.every((x) => x.accuracy === null && x.attempts === 0)).toBe(true)
  })
  it('computes accuracy per skill', () => {
    const s = skillScores([attempt(), attempt(), attempt(), attempt({ correct: false }), attempt({ skill: 'listening', correct: false })])
    expect(s.find((x) => x.skill === 'reading')).toEqual({ skill: 'reading', attempts: 4, accuracy: 0.75 })
    expect(s.find((x) => x.skill === 'listening')).toEqual({ skill: 'listening', attempts: 1, accuracy: 0 })
    expect(s.find((x) => x.skill === 'writing')?.accuracy).toBeNull()
  })
  it('uses only the most recent 30 attempts per skill', () => {
    const old = Array.from({ length: 10 }, (_, i) => attempt({ correct: false, at: iso(`2026-08-${String(i + 1).padStart(2, '0')}`) }))
    const recent = Array.from({ length: 30 }, (_, i) => attempt({ correct: true, at: iso(`2026-09-${String((i % 28) + 1).padStart(2, '0')}`) }))
    const s = skillScores([...old, ...recent])
    expect(s.find((x) => x.skill === 'reading')).toEqual({ skill: 'reading', attempts: 30, accuracy: 1 })
  })
})

describe('demonstratedObjectives', () => {
  const weeks = weeksFor('en')
  const w1 = lessonsForWeek('en-w01')
  const goodAttempts = w1.flatMap((l) => l.guided.map((e, i) => attempt({ lessonId: l.id, exerciseId: e.id, correct: i !== 0 })))
  it('marks a week when all its lessons are complete with production and accuracy >= 0.7', () => {
    const comps = w1.map((l) => done(l.id))
    expect(demonstratedObjectives(weeks, comps, goodAttempts, lessonsForWeek).map((w) => w.id)).toEqual(['en-w01'])
  })
  it('does not mark a week whose production was skipped', () => {
    const comps = w1.map((l, i) => (i === 0 ? done(l.id, ALL_BLOCKS.filter((b) => b !== 'production')) : done(l.id)))
    expect(demonstratedObjectives(weeks, comps, goodAttempts, lessonsForWeek)).toEqual([])
  })
  it('does not mark a week with low accuracy or missing lessons', () => {
    const comps = w1.map((l) => done(l.id))
    const bad = goodAttempts.map((a) => ({ ...a, correct: false }))
    expect(demonstratedObjectives(weeks, comps, bad, lessonsForWeek)).toEqual([])
    expect(demonstratedObjectives(weeks, comps.slice(0, 2), goodAttempts, lessonsForWeek)).toEqual([])
  })
  it('never marks a week that has no lessons yet', () => {
    expect(demonstratedObjectives(weeks, [], [], lessonsForWeek)).toEqual([])
  })
})

describe('needsReview', () => {
  const l1 = getLesson('en-w01-l1')!
  const l2 = getLesson('en-w01-l2')!
  it('flags lessons with recent errors', () => {
    const r = needsReview([l1, l2], [], [err({ at: iso('2026-09-12') }), err({ at: iso('2026-09-13') })], '2026-09-15')
    expect(r.map((x) => x.lesson.id)).toEqual(['en-w01-l1'])
    expect(r[0].reason).toMatch(/2 erros recentes/)
  })
  it('flags lessons with low accuracy (>= 3 attempts)', () => {
    const atts = [attempt({ lessonId: 'en-w01-l2' }), attempt({ lessonId: 'en-w01-l2', correct: false }), attempt({ lessonId: 'en-w01-l2', correct: false }), attempt({ lessonId: 'en-w01-l2', correct: false })]
    const r = needsReview([l1, l2], atts, [], '2026-10-30')
    expect(r.map((x) => x.lesson.id)).toEqual(['en-w01-l2'])
    expect(r[0].reason).toMatch(/25%/)
  })
  it('ignores old errors, few attempts and healthy lessons', () => {
    const atts = [attempt({ correct: false }), attempt({ correct: false })]
    const r = needsReview([l1, l2], atts, [err({ at: iso('2026-08-01') })], '2026-09-15')
    expect(r).toEqual([])
  })
})

describe('completedCount', () => {
  it('counts only completed lessons', () => {
    expect(completedCount([done('a'), { ...done('b'), completedAt: null }])).toBe(1)
  })
})
