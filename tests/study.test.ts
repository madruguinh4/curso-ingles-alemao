import { describe, it, expect } from 'vitest'
import { studyStats, studyMessage } from '../src/lib/study'

describe('studyStats', () => {
  it('handles no study days', () => {
    const s = studyStats([], '2026-09-16')
    expect(s.totalDays).toBe(0)
    expect(s.currentStreak).toBe(0)
    expect(s.studiedToday).toBe(false)
    expect(s.grid.length).toBe(84)
    expect(s.grid[s.grid.length - 1].future).toBe(true) // domingo depois da quarta
  })
  it('counts streak ending today or yesterday, and longest streak', () => {
    const days = ['2026-09-10', '2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16']
    const s = studyStats(days, '2026-09-16')
    expect(s.totalDays).toBe(5)
    expect(s.currentStreak).toBe(3)
    expect(s.longestStreak).toBe(3)
    expect(s.studiedToday).toBe(true)
    expect(studyStats(days, '2026-09-17').currentStreak).toBe(3) // ontem ainda conta
    expect(studyStats(days, '2026-09-18').currentStreak).toBe(0)
  })
  it('grid starts on a Monday and ends on a Sunday, marking studied days', () => {
    const s = studyStats(['2026-09-14'], '2026-09-16')
    expect(s.grid[0].date).toBe('2026-06-29') // segunda, 12 semanas antes
    expect(s.grid[s.grid.length - 1].date).toBe('2026-09-20') // domingo
    expect(s.grid.find((g) => g.date === '2026-09-14')?.studied).toBe(true)
    expect(s.thisWeek).toBe(1)
  })
})

describe('studyMessage', () => {
  const at = (days: string[]) => studyMessage(studyStats(days, '2026-11-03'))
  it('celebrates today and counts the streak', () => {
    expect(at(['2026-11-02', '2026-11-03'])).toBe('Hoje já contou! São 2 dias seguidos.')
    expect(at(['2026-11-03'])).toBe('Hoje já contou! Amanhã tem mais.')
  })
  it('invites without guilt', () => {
    expect(at(['2026-11-01', '2026-11-02'])).toBe('Uma aula hoje e são 3 dias seguidos.')
    expect(at(['2026-10-01'])).toMatch(/de volta/)
    expect(at([])).toMatch(/aparece aqui/)
  })
})
