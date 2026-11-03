import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
// @ts-expect-error módulo .mjs sem tipos (roda no GitHub Actions)
import { NUDGES, pickNudge } from '../scripts/nudge-messages.mjs'
import { MASCOT_ORDER } from '../src/components/mascots/Mascots'

type Nudge = { mascot: string; title: string; body: (n?: string, l?: string) => string }
const all = (NUDGES as Nudge[][]).flat()

describe('lembretes com mascote', () => {
  it('tem pelo menos 20 chamadas diferentes, em 3 grupos', () => {
    expect(NUDGES).toHaveLength(3)
    expect(all.length).toBeGreaterThanOrEqual(20)
    expect(new Set(all.map((m) => m.title)).size).toBe(all.length)
  })

  it('cada chamada vem de um mascote que tem ícone', () => {
    for (const m of all) {
      expect(MASCOT_ORDER).toContain(m.mascot)
      expect(existsSync(`public/mascots/${m.mascot}.png`)).toBe(true)
    }
    expect(new Set(all.map((m) => m.mascot)).size).toBe(MASCOT_ORDER.length)
  })

  it('funciona com e sem nome', () => {
    for (const m of all) {
      expect(m.body('Ana', 'inglês')).not.toMatch(/undefined/)
      expect(m.body(undefined, 'alemão')).not.toMatch(/undefined|, \./)
    }
  })

  it('não repete a mesma chamada em dias seguidos', () => {
    const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']
    for (const stage of [0, 1, 2]) {
      const titles = days.map((d) => pickNudge(stage, d, 'https://push/abc', 'Ana', 'inglês').title)
      expect(new Set(titles).size).toBe(days.length)
    }
  })
})
