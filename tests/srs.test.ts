import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../src/lib/db'
import { newCard, review, ensureCards, dueCards, gradeCard } from '../src/lib/srs'

beforeEach(async () => { await db.delete(); await db.open() })
const t0 = new Date('2026-09-14T09:00:00Z')

describe('srs', () => {
  it('good increases the interval; again resets and counts a lapse', () => {
    const c = newCard(1, 'v1', t0)
    const g1 = review(c, 'good', t0)
    expect(g1.due.getTime()).toBeGreaterThan(t0.getTime())
    const g2 = review(g1, 'good', g1.due)
    const i1 = g1.due.getTime() - t0.getTime()
    const i2 = g2.due.getTime() - g1.due.getTime()
    expect(i2).toBeGreaterThan(i1)
    const a = review(g2, 'again', g2.due)
    expect(a.lapses).toBe(g2.lapses + 1)
    expect(a.due.getTime() - g2.due.getTime()).toBeLessThan(i2)
  })
  it('review is pure (does not mutate the input)', () => {
    const c = newCard(1, 'v1', t0)
    const before = JSON.stringify(c)
    review(c, 'good', t0)
    expect(JSON.stringify(c)).toBe(before)
  })
  it('ensureCards is idempotent and scoped by enrollment', async () => {
    await ensureCards(1, ['v1', 'v2'])
    await ensureCards(1, ['v1', 'v2', 'v3'])
    await ensureCards(2, ['v1'])
    expect(await db.cards.where('enrollmentId').equals(1).count()).toBe(3)
    expect(await db.cards.where('enrollmentId').equals(2).count()).toBe(1)
  })
  it('dueCards returns only due cards for the enrollment; grading removes it from due', async () => {
    await ensureCards(1, ['v1', 'v2', 'v3'])
    await ensureCards(2, ['v9'])
    const far = new Date('2030-01-01')
    const due = await dueCards(1, far)
    expect(due.map((c) => c.vocabId).sort()).toEqual(['v1', 'v2', 'v3'])
    const g = await gradeCard(due[0], 'easy', far)
    expect(g.due.getTime()).toBeGreaterThan(far.getTime())
    expect((await dueCards(1, far)).map((c) => c.id)).not.toContain(g.id)
    expect((await dueCards(1, new Date('2026-01-01'))).length).toBe(0)
  })
})
