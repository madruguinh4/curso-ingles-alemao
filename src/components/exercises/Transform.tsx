import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { matches } from '../../lib/answers'
import type { SubmitInfo } from './ExerciseRunner'
import { Button, Card } from '../ui'

type Ex = Extract<Exercise, { type: 'transform' }>

export function TransformEx({ ex, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [text, setText] = useState('')
  return (
    <Card>
      <p className="text-lg mb-1"><b>{ex.prompt}</b></p>
      <p className="mb-3 muted text-sm">{ex.instruction}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit({ given: text, correct: matches(text, ex.answers), expected: ex.answers[0] }) }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} aria-label="Sua frase" autoCapitalize="sentences" autoCorrect="off" autoFocus />
        <div className="mt-3"><Button type="submit" disabled={disabled || !text.trim()}>Responder</Button></div>
      </form>
    </Card>
  )
}
