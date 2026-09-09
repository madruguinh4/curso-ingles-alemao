import { describe, it, expect, beforeEach } from 'vitest'
import { db, storageAvailable, recordStudyDay } from '../src/lib/db'

beforeEach(async () => { await db.delete(); await db.open() })

describe('db', () => {
  it('creates one enrollment per language and lists them', async () => {
    await db.enrollments.add({ language: 'en', level: 'zero', goal: 'viagem', startDate: '2026-09-14', createdAt: 'x' })
    await db.enrollments.add({ language: 'de', level: 'zero', goal: 'trabalho', startDate: '2026-09-14', createdAt: 'x' })
    expect((await db.enrollments.toArray()).map((e) => e.language)).toEqual(['en', 'de'])
  })
  it('records study days once per enrollment and date', async () => {
    await recordStudyDay(1, '2026-09-14')
    await recordStudyDay(1, '2026-09-14')
    await recordStudyDay(1, '2026-09-15')
    await recordStudyDay(2, '2026-09-14')
    expect((await db.studyDays.where('enrollmentId').equals(1).toArray()).map((d) => d.date)).toEqual(['2026-09-14', '2026-09-15'])
    expect(await db.studyDays.where('enrollmentId').equals(2).count()).toBe(1)
  })
  it('reports storage availability', async () => {
    expect(await storageAvailable()).toBe(true)
  })
})
