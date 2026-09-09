import { describe, it, expect } from 'vitest'
import { normalize, matches, orderMatches } from '../src/lib/answers'

describe('normalize', () => {
  it('trims, lowercases, collapses spaces and strips punctuation but keeps apostrophes', () => {
    expect(normalize("  I'm   Ana. ")).toBe("i'm ana")
    expect(normalize('Hi! I’m Ana, ok?')).toBe("hi i'm ana ok")
  })
  it('treats ß and ss as equivalent but keeps umlauts', () => {
    expect(normalize('heißt')).toBe('heisst')
    expect(normalize('schön')).not.toBe(normalize('schon'))
  })
})

describe('matches', () => {
  it('accepts any of the expected answers after normalization', () => {
    expect(matches("i'm ana", ["I'm Ana."])).toBe(true)
    expect(matches('I am not Ana', ['I am not Ana.', "I'm not Ana."])).toBe(true)
    expect(matches("Hi, I'm Ana. Nice to meet you", ["Hi! I'm Ana. Nice to meet you."])).toBe(true)
    expect(matches('heisst', ['heißt'])).toBe(true)
  })
  it('rejects wrong answers', () => {
    expect(matches('I no am Ana', ['I am not Ana.'])).toBe(false)
    expect(matches('', ['am'])).toBe(false)
    expect(matches('schon', ['schön'])).toBe(false)
  })
})

describe('orderMatches', () => {
  it('compares token sequences ignoring case and punctuation', () => {
    expect(orderMatches(['Nice', 'to', 'meet', 'you'], 'Nice to meet you')).toBe(true)
    expect(orderMatches(['to', 'Nice', 'meet', 'you'], 'Nice to meet you')).toBe(false)
  })
})
