import { describe, it, expect } from 'vitest'
import { MASCOTS, MASCOT_ORDER } from '../src/components/mascots/Mascots'

describe('mascots', () => {
  it('has 7 different characters, each with one job', () => {
    expect(MASCOT_ORDER).toHaveLength(7)
    expect(new Set(MASCOT_ORDER).size).toBe(7)
    expect(Object.keys(MASCOTS).sort()).toEqual([...MASCOT_ORDER].sort())
    expect(new Set(Object.values(MASCOTS).map((m) => m.name)).size).toBe(7)
    expect(new Set(Object.values(MASCOTS).map((m) => m.role)).size).toBe(7)
  })
})
