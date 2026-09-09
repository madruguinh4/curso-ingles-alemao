import { describe, it, expect } from 'vitest'
import { LESSONS } from '../src/lib/content'
import { GLOSSARY, termsIn, getTerm } from '../src/content/glossary'

describe('glossary', () => {
  it('has unique keys and complete entries', () => {
    const keys = GLOSSARY.map((t) => t.key.toLowerCase())
    expect(new Set(keys).size).toBe(keys.length)
    for (const t of GLOSSARY) {
      expect(t.definition.length, t.key).toBeGreaterThan(30)
      expect(t.example.length, t.key).toBeGreaterThan(3)
    }
    expect(getTerm('Contração')?.title).toBe('Contração')
  })
  it('every [[term]] used in content exists in the glossary', () => {
    const known = new Set(GLOSSARY.map((t) => t.key.toLowerCase()))
    const texts = LESSONS.flatMap((l) => [
      l.explanation.body, l.task, ...l.warmup.items, ...l.feedback.commonErrors.map((c) => c.why),
      ...[...l.guided, l.production].flatMap((e) => [
        'explanation' in e ? e.explanation : '',
        'instruction' in e ? e.instruction : '',
        'prompt' in e ? e.prompt : '',
        ...('checklist' in e ? e.checklist : []),
      ]),
    ])
    const used = new Set(texts.flatMap(termsIn).map((t) => t.toLowerCase()))
    for (const t of used) expect(known.has(t), `[[${t}]] não está no glossário`).toBe(true)
    expect(used.size).toBeGreaterThanOrEqual(8)
  })
  it('week 1 explanations state explicit rules and define contraction', () => {
    for (const l of LESSONS) expect(l.explanation.body, l.id).toMatch(/Regra/)
    expect(LESSONS.find((l) => l.id === 'en-w01-l1')!.explanation.body).toContain('[[contração]]')
  })
  it('termsIn parses [[term]] and [[term|text]]', () => {
    expect(termsIn('a [[contração]] e o [[verbo|verbos]]')).toEqual(['contração', 'verbo'])
  })
})
