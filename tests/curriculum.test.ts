import { describe, it, expect } from 'vitest'
import { CURRICULUM, weeksFor, MONTH_TITLES } from '../src/content/curriculum'
import { WeekSchema } from '../src/lib/schema'

describe('curriculum', () => {
  it('has 26 valid weeks per language, numbered 1..26, months 1..6 each with >=4 weeks', () => {
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      expect(ws.map((w) => w.number)).toEqual(Array.from({ length: 26 }, (_, i) => i + 1))
      for (const w of ws) {
        const r = WeekSchema.safeParse(w)
        expect(r.success, `${w.id}: ${r.success ? '' : JSON.stringify(r.error.issues)}`).toBe(true)
      }
      for (let m = 1; m <= 6; m++) expect(ws.filter((w) => w.month === m).length, `${lang} month ${m}`).toBeGreaterThanOrEqual(4)
      expect(ws.every((w) => w.id === `${lang}-w${String(w.number).padStart(2, '0')}`)).toBe(true)
      expect(ws.every((w) => w.language === lang)).toBe(true)
    }
    expect(CURRICULUM.length).toBe(52)
  })
  it('months are monotonic and levels progress A1 -> A2 -> B1', () => {
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      for (let i = 1; i < ws.length; i++) expect(ws[i].month).toBeGreaterThanOrEqual(ws[i - 1].month)
      expect(ws[0].level).toBe('A1')
      expect(ws[25].level).toBe('B1')
    }
  })
  it('German is not a translation of English (no week shares its grammar list)', () => {
    const en = weeksFor('en'), de = weeksFor('de')
    const same = en.filter((w, i) => w.grammar.join('|') === de[i].grammar.join('|')).length
    expect(same).toBe(0)
  })
  it('writing starts in week 3 for both languages', () => {
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      expect(ws[0].skills).not.toContain('writing')
      expect(ws[2].skills).toContain('writing')
    }
  })
  it('has 6 month titles', () => {
    expect(Object.keys(MONTH_TITLES).length).toBe(6)
  })
})
