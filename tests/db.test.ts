import { describe, it, expect, beforeEach } from 'vitest'
import { db, storageAvailable } from '../src/lib/db'

beforeEach(async () => { await db.delete(); await db.open() })

describe('db', () => {
  it('creates one enrollment per language and lists them', async () => {
    await db.enrollments.add({ language: 'en', level: 'zero', goal: 'viagem', minutesPerDay: 40, weekdays: [1, 3, 5], startDate: '2026-09-14', createdAt: 'x' })
    await db.enrollments.add({ language: 'de', level: 'zero', goal: 'trabalho', minutesPerDay: 40, weekdays: [2, 4], startDate: '2026-09-14', createdAt: 'x' })
    expect((await db.enrollments.toArray()).map((e) => e.language)).toEqual(['en', 'de'])
  })
  it('indexes schedule by enrollment+date', async () => {
    await db.schedule.bulkAdd([
      { enrollmentId: 1, date: '2026-09-14', weekNumber: 1, lessonId: 'en-w01-l1', kind: 'lesson', status: 'pending' },
      { enrollmentId: 1, date: '2026-09-16', weekNumber: 1, lessonId: 'en-w01-l2', kind: 'lesson', status: 'pending' },
      { enrollmentId: 2, date: '2026-09-16', weekNumber: 1, lessonId: 'de-w01-l1', kind: 'lesson', status: 'pending' },
    ])
    const rows = await db.schedule.where('[enrollmentId+date]').equals([1, '2026-09-16']).toArray()
    expect(rows.map((r) => r.lessonId)).toEqual(['en-w01-l2'])
  })
  it('reports storage availability', async () => {
    expect(await storageAvailable()).toBe(true)
  })
})
