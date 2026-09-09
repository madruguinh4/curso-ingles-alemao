import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { matches } from '../../lib/answers'
import type { SubmitInfo } from './ExerciseRunner'
import { Button, Card } from '../ui'

type Ex = Extract<Exercise, { type: 'gap' }>

export function GapEx({ ex, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [text, setText] = useState('')
  const [before, after] = ex.prompt.split('___')
  const send = () => onSubmit({ given: text, correct: matches(text, ex.answers), expected: ex.answers[0] })
  return (
    <Card>
      <p className="mb-3 muted text-sm">Complete a lacuna.</p>
      <form className="text-lg leading-loose" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send() }}>
        <span>{before}</span>
        <input className="input inline-block w-32 mx-1 py-1 text-center" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} aria-label="Lacuna" autoCapitalize="none" autoCorrect="off" autoFocus />
        <span>{after}</span>
        <div className="mt-3"><Button type="submit" disabled={disabled || !text.trim()}>Responder</Button></div>
      </form>
    </Card>
  )
}
