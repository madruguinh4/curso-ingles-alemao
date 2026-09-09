import { describe, it, expect } from 'vitest'
import { cardsCsv, csvCell, kitHtml } from '../src/lib/export'
import { lessonsFor } from '../src/lib/content'
import { weeksFor } from '../src/content/curriculum'
import { skillScores } from '../src/lib/progress'
import type { ErrorLog } from '../src/lib/db'

describe('csvCell', () => {
  it('quotes cells with commas, quotes or newlines and doubles inner quotes', () => {
    expect(csvCell('plain')).toBe('plain')
    expect(csvCell('a, b')).toBe('"a, b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('two\nlines')).toBe('"two\nlines"')
  })
})

describe('cardsCsv', () => {
  it('has a header and one row per vocabulary item', () => {
    const ls = lessonsFor('en')
    const lines = cardsCsv(ls, 'en').trim().split('\n')
    expect(lines[0]).toBe('front,back,example')
    expect(lines.length).toBe(1 + ls.reduce((n, l) => n + l.vocabulary.length, 0))
    expect(lines.join('\n')).toContain('"Thanks, Tom!"')
  })
  it('German fronts carry article and plural for nouns', () => {
    const csv = cardsCsv(lessonsFor('de'), 'de')
    expect(csv).toContain('"der Name, die Namen"')
    expect(csv).toContain('"die Stadt, die Städte"')
    expect(csv).toContain('\nwoher,')
  })
})

describe('kitHtml', () => {
  const base = { lang: 'en' as const, weeks: weeksFor('en'), lessons: lessonsFor('en'), errors: [] as ErrorLog[], scores: skillScores([]), objectives: [] as ReturnType<typeof weeksFor>, name: 'Ana', completedLessons: 3 }
  it('is a self-contained printable document with the 8 sections and the student name', () => {
    const html = kitHtml(base)
    for (const t of ['Resumo do que você estudou', 'Guia de gramática', 'Vocabulário e expressões', 'Erros e correções', 'Exercícios com respostas', 'Relatório por habilidade', 'Plano de 90 dias', 'Como continuar praticando'])
      expect(html, t).toContain(t)
    expect(html).toContain('Ana')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('@media print')
    expect(html.toLowerCase()).not.toContain('certificado')
    expect(html.toLowerCase()).not.toContain('fluência garantida')
  })
  it('lists logged errors with their corrections and explanations', () => {
    const err: ErrorLog = { enrollmentId: 1, lessonId: 'en-w01-l1', exerciseId: 'x', prompt: 'Hello! I ___ Tom.', given: 'is', expected: 'am', explanation: 'Com I o verbo é am.', at: '2026-09-14T12:00:00.000Z' }
    const html = kitHtml({ ...base, errors: [err] })
    expect(html).toContain('Hello! I ___ Tom.')
    expect(html).toContain('Com I o verbo é am.')
  })
  it('reports skills without evidence honestly', () => {
    expect(kitHtml(base)).toContain('sem evidência')
  })
  it('works for German with its own 90-day plan', () => {
    const html = kitHtml({ ...base, lang: 'de', weeks: weeksFor('de'), lessons: lessonsFor('de') })
    expect(html).toContain('Nachrichten')
  })
})
