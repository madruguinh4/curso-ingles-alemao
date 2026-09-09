import { useEffect, useState } from 'react'
import { speak, voiceFor } from '../lib/tts'
import type { Language } from '../lib/types'
import { LANGUAGE_NAMES } from '../lib/types'

/** true/false quando resolvido; null enquanto carrega as vozes. */
export function useVoice(lang: Language): boolean | null {
  const [has, setHas] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    voiceFor(lang).then((v) => alive && setHas(!!v))
    return () => { alive = false }
  }, [lang])
  return has
}

/** Botão de áudio. Some quando não há voz para o idioma (a tela explica por quê). */
export function Say({ text, lang, rate = 1, label, className = '' }: { text: string; lang: Language; rate?: number; label?: string; className?: string }) {
  const has = useVoice(lang)
  if (!has) return null
  return (
    <button type="button" className={`btn btn-ghost px-2 py-1 min-h-0 ${className}`} aria-label={label ?? `Ouvir: ${text}`} onClick={() => speak(text, lang, rate)}>
      {rate < 1 ? '🐢' : '🔊'}{label ? ` ${label}` : ''}
    </button>
  )
}

export function NoVoiceNotice({ lang }: { lang: Language }) {
  const has = useVoice(lang)
  if (has !== false) return null
  return (
    <p className="text-sm muted" role="status">
      Seu navegador não tem voz em {LANGUAGE_NAMES[lang]}, então os botões de áudio estão escondidos. No Android, instale as vozes em “Configurações → Idiomas → Conversão de texto em voz”; no iPhone, em “Ajustes → Acessibilidade → Conteúdo falado → Vozes”.
    </p>
  )
}
