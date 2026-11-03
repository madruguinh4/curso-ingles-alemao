import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../src/lib/db'
import { exportBackup, importBackup } from '../src/lib/backup'

beforeEach(async () => { await db.delete(); await db.open() })

async function seed() {
  await db.profile.put({ id: 'me', name: 'Ana', theme: 'dark', textScale: 1, micAllowed: true, createdAt: 'x' })
  const id = (await db.enrollments.add({ language: 'en', level: 'zero', goal: 'pessoal', startDate: '2026-10-01', createdAt: 'x' })) as number
  await db.completions.add({ enrollmentId: id, lessonId: 'en-w01-l1', blocksDone: ['s0', 's1'], completedAt: null })
  await db.attempts.add({ enrollmentId: id, lessonId: 'en-w01-l1', exerciseId: 'en-w01-l1-g1', skill: 'reading', correct: false, answer: 'I Ana.', at: 'x' })
  await db.studyDays.add({ enrollmentId: id, date: '2026-10-01' })
  return id
}

describe('backup', () => {
  it('round-trips everything the student did', async () => {
    const id = await seed()
    const copy = JSON.parse(JSON.stringify(await exportBackup()))
    await db.delete(); await db.open()
    await importBackup(copy)
    expect((await db.profile.get('me'))?.name).toBe('Ana')
    expect((await db.enrollments.get(id))?.language).toBe('en')
    expect((await db.completions.toArray())[0].blocksDone).toEqual(['s0', 's1'])
    expect(await db.attempts.count()).toBe(1)
    expect(await db.studyDays.count()).toBe(1)
  })
  it('replaces the current progress instead of mixing it', async () => {
    await seed()
    const copy = await exportBackup()
    await db.studyDays.add({ enrollmentId: 99, date: '2026-10-02' })
    await importBackup(copy)
    expect(await db.studyDays.count()).toBe(1)
  })
  it('rejects files that are not a copy and leaves data untouched', async () => {
    await seed()
    await expect(importBackup({ hello: 'world' })).rejects.toThrow(/não é uma cópia/)
    const broken = { ...(await exportBackup()), tables: { profile: [] } }
    await expect(importBackup(broken)).rejects.toThrow(/incompleta/)
    expect(await db.enrollments.count()).toBe(1)
  })
})
