import { describe, it, expect } from 'vitest'
import { buildSchedule, reschedule, dailyAgenda, planSummary } from '../src/lib/plan'
import { toISO, addDays, weekdayOf } from '../src/lib/dates'
import { weeksFor } from '../src/content/curriculum'
import { lessonsForWeek } from '../src/lib/content'

const enr = { id: 1, language: 'en' as const, level: 'zero' as const, goal: 'viagem' as const, minutesPerDay: 40 as const, weekdays: [1, 3, 5], startDate: '2026-09-14', createdAt: 'x' }

describe('dates', () => {
  it('formats local dates and adds days', () => {
    expect(toISO(new Date(2026, 8, 14, 23, 30))).toBe('2026-09-14')
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-09-14', -1)).toBe('2026-09-13')
    expect(weekdayOf('2026-09-14')).toBe(1) // segunda
    expect(weekdayOf('2026-09-13')).toBe(0) // domingo
  })
})

describe('plan', () => {
  it('40 min: one lesson per study day, 26 weeks, assessment on the last day of each week', () => {
    const items = buildSchedule(enr, weeksFor('en'), lessonsForWeek)
    const lessons = items.filter((i) => i.kind === 'lesson')
    expect(lessons.length).toBe(26 * 3)
    expect(items.filter((i) => i.kind === 'assessment').length).toBe(26)
    expect(items.filter((i) => i.kind === 'review').length).toBe(0)
    expect(lessons[0]).toMatchObject({ date: '2026-09-14', weekNumber: 1, lessonId: 'en-w01-l1', status: 'pending' })
    expect(lessons[1]).toMatchObject({ date: '2026-09-16', lessonId: 'en-w01-l2' })
    expect(lessons[2]).toMatchObject({ date: '2026-09-18', lessonId: 'en-w01-l3' })
    expect(lessons[3]).toMatchObject({ date: '2026-09-21', weekNumber: 2, lessonId: null })
    expect(items.every((i) => enr.weekdays.includes(weekdayOf(i.date)))).toBe(true)
    const s = planSummary(items)
    expect(s.weeks).toBe(26)
    expect(s.start).toBe('2026-09-14')
    expect(s.studyDays).toBe(78)
  })
  it('starts on the first chosen weekday on or after startDate', () => {
    const items = buildSchedule({ ...enr, startDate: '2026-09-13', weekdays: [2, 4] }, weeksFor('en'), lessonsForWeek)
    expect(items[0].date).toBe('2026-09-15')
  })
  it('20 min splits each lesson across two days and roughly doubles the calendar', () => {
    const a = buildSchedule({ ...enr, minutesPerDay: 20 }, weeksFor('en'), lessonsForWeek)
    const b = buildSchedule(enr, weeksFor('en'), lessonsForWeek)
    expect(a.filter((i) => i.kind === 'lesson-a').length).toBe(26 * 3)
    expect(a.filter((i) => i.kind === 'lesson-b').length).toBe(26 * 3)
    expect(a.filter((i) => i.kind === 'lesson').length).toBe(0)
    const firstB = a.find((i) => i.kind === 'lesson-b')!
    expect(a.some((i) => i.kind === 'review' && i.date === firstB.date)).toBe(true)
    expect(planSummary(a).end > planSummary(b).end).toBe(true)
  })
  it('60 and 90 min add a review item every study day', () => {
    for (const m of [60, 90] as const) {
      const items = buildSchedule({ ...enr, minutesPerDay: m }, weeksFor('en'), lessonsForWeek)
      expect(items.filter((i) => i.kind === 'review').length).toBe(26 * 3)
    }
  })
  it('reschedule marks missed days, shifts pending ones forward and reports impact', () => {
    const items = buildSchedule(enr, weeksFor('en'), lessonsForWeek)
    const r = reschedule(items, '2026-09-21', enr.weekdays)
    expect(r.missed).toBe(3) // dias de estudo perdidos
    expect(r.items.filter((i) => i.status === 'missed').length).toBe(4) // 3 aulas + 1 avaliação
    const pending = r.items.filter((i) => i.status === 'pending')
    expect(pending[0]).toMatchObject({ date: '2026-09-21', lessonId: 'en-w01-l1', kind: 'lesson' })
    expect(pending.every((i) => i.date >= '2026-09-21')).toBe(true)
    expect(pending.every((i) => enr.weekdays.includes(weekdayOf(i.date)))).toBe(true)
    expect(r.newEnd > r.oldEnd).toBe(true)
    expect(r.items.length).toBe(items.length + 4)
  })
  it('reschedule is a no-op when nothing is late', () => {
    const items = buildSchedule(enr, weeksFor('en'), lessonsForWeek)
    const r = reschedule(items, '2026-09-14', enr.weekdays)
    expect(r.missed).toBe(0)
    expect(r.items).toEqual(items)
  })
  it('reschedule keeps done items untouched', () => {
    const items = buildSchedule(enr, weeksFor('en'), lessonsForWeek)
    items[0].status = 'done'
    const r = reschedule(items, '2026-09-21', enr.weekdays)
    expect(r.missed).toBe(2)
    expect(r.items.find((i) => i.lessonId === 'en-w01-l1' && i.status === 'done')).toBeDefined()
  })
  it('dailyAgenda explains the time split with two languages', () => {
    expect(dailyAgenda(40, true).note).toMatch(/20 min/)
    expect(dailyAgenda(40, false).kinds).toEqual(['lesson'])
    expect(dailyAgenda(60, false).kinds).toEqual(['lesson', 'review'])
    expect(dailyAgenda(20, false).note).toMatch(/2 dias/)
  })
})
