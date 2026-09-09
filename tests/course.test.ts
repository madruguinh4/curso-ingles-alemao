import { describe, it, expect } from 'vitest'
import { nextLesson, upcomingLessons, weekComplete, currentWeek, pendingAssessments, lessonStatus, lessonsBefore } from '../src/lib/course'
import { lessonsFor } from '../src/lib/content'
import { weeksFor } from '../src/content/curriculum'
import { completedCount, demonstratedObjectives } from '../src/lib/progress'
import type { Completion } from '../src/lib/db'

const ALL_BLOCKS = ['warmup', 'dialogue', 'explanation', 'guided', 'production', 'feedback', 'task']
const done = (lessonId: string): Completion => ({ enrollmentId: 1, lessonId, blocksDone: ALL_BLOCKS, completedAt: '2026-09-14T12:00:00Z' })
const started = (lessonId: string): Completion => ({ enrollmentId: 1, lessonId, blocksDone: ['warmup'], completedAt: null })
const skipped = (lessonId: string): Completion => ({ enrollmentId: 1, lessonId, blocksDone: [], completedAt: '2026-09-14T12:00:00Z', skipped: true })
const en = lessonsFor('en')

describe('course progression', () => {
  it('next lesson is the first not completed, preferring one in progress', () => {
    expect(nextLesson(en, [])?.id).toBe('en-w01-l1')
    expect(nextLesson(en, [done('en-w01-l1')])?.id).toBe('en-w01-l2')
    expect(nextLesson(en, [done('en-w01-l1'), started('en-w01-l3')])?.id).toBe('en-w01-l3')
    expect(nextLesson(en, en.map((l) => done(l.id)))).toBeUndefined()
  })
  it('skipped lessons are left behind, not counted as done, and can be told apart', () => {
    expect(lessonStatus('en-w01-l1', [skipped('en-w01-l1')])).toBe('skipped')
    expect(nextLesson(en, [skipped('en-w01-l1'), skipped('en-w01-l2')])?.id).toBe('en-w01-l3')
    expect(upcomingLessons(en, [skipped('en-w01-l1')], 5).map((l) => l.id)).toEqual(['en-w01-l2', 'en-w01-l3'])
    expect(completedCount([skipped('a'), done('b')])).toBe(1)
  })
  it('a week with skipped lessons is not complete and its objective is not demonstrated', () => {
    const w1 = weeksFor('en')[0]
    const comps = [skipped('en-w01-l1'), done('en-w01-l2'), done('en-w01-l3')]
    expect(weekComplete(w1, comps)).toBe(false)
    expect(demonstratedObjectives(weeksFor('en'), comps, [], (id) => en.filter((l) => l.weekId === id))).toEqual([])
  })
  it('lessonsBefore lists every existing lesson before a week', () => {
    expect(lessonsBefore('en', 2).map((l) => l.id)).toEqual(['en-w01-l1', 'en-w01-l2', 'en-w01-l3'])
    expect(lessonsBefore('en', 1)).toEqual([])
  })
  it('lists upcoming lessons and statuses', () => {
    expect(upcomingLessons(en, [done('en-w01-l1')], 5).map((l) => l.id)).toEqual(['en-w01-l2', 'en-w01-l3'])
    expect(lessonStatus('en-w01-l1', [started('en-w01-l1')])).toBe('progress')
  })
  it('week is complete only when all its lessons are done; weeks without lessons are never complete', () => {
    const w1 = weeksFor('en')[0], w2 = weeksFor('en')[1]
    expect(weekComplete(w1, [done('en-w01-l1'), done('en-w01-l2')])).toBe(false)
    expect(weekComplete(w1, en.map((l) => done(l.id)))).toBe(true)
    expect(weekComplete(w2, en.map((l) => done(l.id)))).toBe(false)
  })
  it('current week follows the next lesson, falling back to the last week with lessons', () => {
    expect(currentWeek('en', [])?.number).toBe(1)
    expect(currentWeek('en', en.map((l) => done(l.id)))?.number).toBe(1)
  })
  it('pending assessments are complete weeks not yet assessed', () => {
    const all = en.map((l) => done(l.id))
    expect(pendingAssessments('en', all, []).map((w) => w.number)).toEqual([1])
    expect(pendingAssessments('en', all, [{ enrollmentId: 1, weekNumber: 1, results: [], doneAt: 'x' }])).toEqual([])
  })
})
