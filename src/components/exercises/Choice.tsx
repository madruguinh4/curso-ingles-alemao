import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import type { SubmitInfo } from './ExerciseRunner'
import { Card } from '../ui'

type Ex = Extract<Exercise, { type: 'choice' }>

export function ChoiceEx({ ex, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <Card>
      <p className="mb-3 text-lg">{ex.prompt}</p>
      <div className="grid gap-2">
        {ex.options.map((o, i) => {
          const cls = picked === null ? '' : i === ex.answer ? 'choice-ok' : i === picked ? 'choice-err' : ''
          return (
            <button key={o} type="button" className={`choice ${cls}`} disabled={disabled} aria-pressed={picked === i}
              onClick={() => { setPicked(i); onSubmit({ given: o, correct: i === ex.answer, expected: ex.options[ex.answer] }) }}>
              {o}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
