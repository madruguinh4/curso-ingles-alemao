import { describe, it, expect } from 'vitest'
import { CURRICULUM, weeksFor, MONTH_TITLES, TOTAL_WEEKS, TOTAL_MONTHS } from '../src/content/curriculum'
import { WeekSchema } from '../src/lib/schema'

describe('curriculum', () => {
  it('has 52 valid weeks per language, numbered 1..52, 12 months each with >=4 weeks', () => {
    expect(TOTAL_WEEKS).toBe(52)
    expect(TOTAL_MONTHS).toBe(12)
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      expect(ws.map((w) => w.number)).toEqual(Array.from({ length: 52 }, (_, i) => i + 1))
      for (const w of ws) {
        const r = WeekSchema.safeParse(w)
        expect(r.success, `${w.id}: ${r.success ? '' : JSON.stringify(r.error.issues)}`).toBe(true)
      }
      for (let m = 1; m <= 12; m++) expect(ws.filter((w) => w.month === m).length, `${lang} month ${m}`).toBeGreaterThanOrEqual(4)
      expect(ws.every((w) => w.id === `${lang}-w${String(w.number).padStart(2, '0')}`)).toBe(true)
      expect(ws.every((w) => w.language === lang)).toBe(true)
    }
    expect(CURRICULUM.length).toBe(104)
    expect(Object.keys(MONTH_TITLES).length).toBe(12)
  })
  it('months are monotonic and levels progress A1 (1-13) -> A2 (14-35) -> B1 (36-52)', () => {
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      for (let i = 1; i < ws.length; i++) expect(ws[i].month).toBeGreaterThanOrEqual(ws[i - 1].month)
      expect(ws.filter((w) => w.level === 'A1').map((w) => w.number)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1))
      expect(ws.filter((w) => w.level === 'A2').map((w) => w.number)).toEqual(Array.from({ length: 22 }, (_, i) => i + 14))
      expect(ws.filter((w) => w.level === 'B1').map((w) => w.number)).toEqual(Array.from({ length: 17 }, (_, i) => i + 36))
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
  it('has stage checks at weeks 13, 26, 35 and 51', () => {
    for (const lang of ['en', 'de'] as const) {
      const ws = weeksFor(lang)
      for (const n of [13, 26, 35, 51]) expect(ws[n - 1].grammar.join(' ') + ws[n - 1].title, `${lang} w${n}`).toMatch(/verificação|Avaliação final/i)
    }
  })
})
