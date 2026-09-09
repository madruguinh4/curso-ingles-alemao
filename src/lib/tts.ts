import type { Language } from './types'

// Síntese de fala com a Web Speech API do navegador. Grátis, offline no
// Android; no iPhone funciona com vozes mais limitadas. Sem voz para o idioma,
// a UI esconde o botão e explica — nunca fala alemão com voz inglesa.

const PREFERRED: Record<Language, string[]> = {
  en: ['en-US', 'en-GB', 'en-AU', 'en-CA'],
  de: ['de-DE', 'de-AT', 'de-CH'],
}

export type SpeakResult = 'ok' | 'no-voice' | 'unsupported' | 'error'

export function ttsSupported(): boolean {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined'
}

let cache: SpeechSynthesisVoice[] = []

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = globalThis.speechSynthesis
  const now = synth.getVoices()
  if (now.length) return Promise.resolve((cache = now))
  // Chrome carrega as vozes de forma assíncrona: espera o evento ou 700 ms.
  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      synth.removeEventListener?.('voiceschanged', done)
      resolve((cache = synth.getVoices()))
    }
    synth.addEventListener?.('voiceschanged', done)
    setTimeout(done, 700)
  })
}

export async function voiceFor(lang: Language): Promise<SpeechSynthesisVoice | null> {
  if (!ttsSupported()) return null
  const voices = await loadVoices()
  const norm = (s: string) => s.replace('_', '-').toLowerCase()
  for (const p of PREFERRED[lang]) {
    const v = voices.find((x) => norm(x.lang) === p.toLowerCase())
    if (v) return v
  }
  return voices.find((x) => norm(x.lang).startsWith(lang)) ?? null
}

export async function speak(text: string, lang: Language, rate = 1): Promise<SpeakResult> {
  if (!ttsSupported()) return 'unsupported'
  const voice = await voiceFor(lang)
  if (!voice) return 'no-voice'
  const synth = globalThis.speechSynthesis
  synth.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = rate
    u.onend = () => resolve('ok')
    u.onerror = () => resolve('error')
    synth.speak(u)
  })
}

export function stop(): void {
  if (ttsSupported()) globalThis.speechSynthesis.cancel()
}

export const cachedVoices = () => cache
