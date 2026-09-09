import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { matches } from '../../lib/answers'
import { speak } from '../../lib/tts'
import type { SubmitInfo } from './ExerciseRunner'
import { useVoice } from '../Say'
import { Button, Card, Notice } from '../ui'

type Ex = Extract<Exercise, { type: 'dictation' }>

export function DictationEx({ ex, lang, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [text, setText] = useState('')
  const has = useVoice(lang)
  const send = () => onSubmit({ given: text, correct: matches(text, ex.answers), expected: ex.answers[0], skill: has ? 'listening' : 'reading' })
  return (
    <Card>
      <p className="mb-3 muted text-sm">Ditado: ouça e escreva o que ouviu.</p>
      {has === false ? (
        <Notice kind="warn">
          Sem voz para este idioma no seu navegador. Leia e copie a frase abaixo — vai contar como <b>leitura</b>, não como compreensão oral: <b>{ex.text}</b>
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
