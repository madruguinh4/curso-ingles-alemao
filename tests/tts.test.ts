import { describe, it, expect, vi, afterEach } from 'vitest'
import { ttsSupported, voiceFor, speak } from '../src/lib/tts'

const voice = (lang: string, name: string) => ({ lang, name, default: false, localService: true, voiceURI: name }) as SpeechSynthesisVoice

class FakeUtterance {
  text: string; lang = ''; rate = 1; voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null; onerror: (() => void) | null = null
  constructor(t: string) { this.text = t }
}

function stub(voices: SpeechSynthesisVoice[]) {
  const synth = { getVoices: () => voices, speak: vi.fn((u: FakeUtterance) => u.onend?.()), cancel: vi.fn(), speaking: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return synth
}

afterEach(() => vi.unstubAllGlobals())

describe('tts', () => {
  it('is unsupported in jsdom and speak resolves unsupported', async () => {
    expect(ttsSupported()).toBe(false)
    expect(await speak('hi', 'en')).toBe('unsupported')
  })
  it('finds a voice by language prefix', async () => {
    stub([voice('de-DE', 'Anna'), voice('pt-BR', 'Luciana')])
    expect(ttsSupported()).toBe(true)
    expect((await voiceFor('de'))?.name).toBe('Anna')
    expect(await voiceFor('en')).toBeNull()
  })
  it('prefers a voice whose lang matches the region exactly', async () => {
    stub([voice('en-GB', 'Kate'), voice('en-US', 'Sam')])
    expect((await voiceFor('en'))?.name).toBe('Sam')
  })
  it('speak resolves ok with a voice and no-voice without one', async () => {
    const synth = stub([voice('de-DE', 'Anna')])
    expect(await speak('Hallo', 'de', 0.8)).toBe('ok')
    const u = synth.speak.mock.calls[0][0] as FakeUtterance
    expect(u.rate).toBe(0.8)
    expect(u.voice?.name).toBe('Anna')
    expect(await speak('Hello', 'en')).toBe('no-voice')
  })
})
