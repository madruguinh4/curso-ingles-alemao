import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { matches } from '../../lib/answers'
import { speak } from '../../lib/tts'
import type { SubmitInfo } from './ExerciseRunner'
import { useVoice } from '../Say'
import { Button, Card, Notice } from '../ui'
import { Coach } from '../mascots/Coach'

type Ex = Extract<Exercise, { type: 'dictation' }>

export function DictationEx({ ex, lang, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [text, setText] = useState('')
  const has = useVoice(lang)
  const send = () => onSubmit({ given: text, correct: matches(text, ex.answers), expected: ex.answers[0], skill: has ? 'listening' : 'reading' })
  return (
    <Card>
      <div className="mb-3"><Coach who="lu" size={44}>Ouça e escreva.</Coach></div>
      {has === false ? (
        <Notice kind="warn">
          Sem voz neste navegador. Copie a frase (conta como leitura): <b>{ex.text}</b>
        </Notice>
      ) : (
        <div className="flex gap-2 mb-3">
          <Button variant="secondary" onClick={() => speak(ex.text, lang, 1)} disabled={has === null}>▶ Ouvir</Button>
          <Button variant="secondary" onClick={() => speak(ex.text, lang, 0.8)} disabled={has === null}>🐢 Devagar</Button>
        </div>
      )}
      <form className="mt-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send() }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} aria-label="O que você ouviu" autoCapitalize="sentences" autoCorrect="off" />
        <div className="mt-3"><Button type="submit" disabled={disabled || !text.trim()}>Responder</Button></div>
      </form>
    </Card>
  )
}
