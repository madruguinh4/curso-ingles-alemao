import type { Language } from './types'

// Síntese de fala com a Web Speech API. A qualidade depende das vozes que o
// aparelho tem: preferimos as neurais ("Natural", "Neural", "Online", "Google",
// "Premium", "Enhanced") — no Edge do Windows e no Android elas soam humanas.
// Sem voz para o idioma, a UI esconde o botão e explica.

const LANG_TAGS: Record<Language, string[]> = {
  en: ['en-us', 'en-gb', 'en-au', 'en-ca', 'en-ie'],
  de: ['de-de', 'de-at', 'de-ch'],
}

export type SpeakResult = 'ok' | 'no-voice' | 'unsupported' | 'error'

export function ttsSupported(): boolean {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined'
}

let cache: SpeechSynthesisVoice[] = []
let chosen: Partial<Record<Language, string>> = {}

/** Define a voz escolhida pelo aluno (voiceURI) por idioma; '' = automática. */
export function setPreferredVoices(v: Partial<Record<Language, string>> | undefined): void {
  chosen = v ?? {}
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsSupported()) return Promise.resolve([])
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

const norm = (s: string) => s.replace('_', '-').toLowerCase()

/** Pontuação de qualidade: vozes neurais primeiro, locais/robóticas por último. */
export function voiceScore(v: SpeechSynthesisVoice, lang: Language): number {
  const l = norm(v.lang)
  if (!l.startsWith(lang)) return -1
  const n = v.name.toLowerCase()
  let s = 0
  if (/natural|neural/.test(n)) s += 100
  if (/online/.test(n)) s += 40
  if (/google/.test(n)) s += 60
  if (/premium|enhanced|siri/.test(n)) s += 50
  if (/multilingual/.test(n)) s += 10
  if (/compact|espeak|desktop|zira|david|hedda|stefan/.test(n)) s -= 30
  const tags = LANG_TAGS[lang]
  const idx = tags.indexOf(l)
  s += idx >= 0 ? (tags.length - idx) * 2 : 0
  return s
}

export async function voicesFor(lang: Language): Promise<SpeechSynthesisVoice[]> {
  const all = await loadVoices()
  return all.filter((v) => voiceScore(v, lang) >= 0).sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang))
}

export async function voiceFor(lang: Language): Promise<SpeechSynthesisVoice | null> {
  if (!ttsSupported()) return null
  const list = await voicesFor(lang)
  const wanted = chosen[lang]
  if (wanted) {
    const v = list.find((x) => x.voiceURI === wanted)
    if (v) return v
  }
  return list[0] ?? null
}

export function isNeural(v: SpeechSynthesisVoice | null): boolean {
  return !!v && /natural|neural|google|premium|enhanced|siri/i.test(v.name)
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
    u.pitch = 1
    u.onend = () => resolve('ok')
    u.onerror = () => resolve('error')
    synth.speak(u)
  })
}

export function stop(): void {
  if (ttsSupported()) globalThis.speechSynthesis.cancel()
}

export const cachedVoices = () => cache
