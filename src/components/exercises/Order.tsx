import { useMemo, useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { orderMatches } from '../../lib/answers'
import type { SubmitInfo } from './ExerciseRunner'
import { Button, Card } from '../ui'

type Ex = Extract<Exercise, { type: 'order' }>

/** Embaralha de forma determinística (pelo id) para a ordem não entregar a resposta nem mudar a cada render. */
function shuffled(tokens: string[], seed: string): number[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const idx = tokens.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i
    const j = Math.abs(h) % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  // Garante que a ordem inicial não seja a correta.
  if (idx.every((v, i) => v === i) && idx.length > 1) [idx[0], idx[1]] = [idx[1], idx[0]]
  return idx
}

export function OrderEx({ ex, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const pool = useMemo(() => shuffled(ex.tokens, ex.id), [ex])
  const [picked, setPicked] = useState<number[]>([])
  const remaining = pool.filter((i) => !picked.includes(i))
  const sentence = picked.map((i) => ex.tokens[i])
  return (
    <Card>
      <p className="mb-3">{ex.prompt}</p>
      <div className="min-h-12 p-2 rounded-lg flex flex-wrap gap-2 mb-3" style={{ border: '1px dashed var(--border)' }} aria-label="Sua frase">
        {sentence.length === 0 && <span className="muted text-sm">Toque nas palavras na ordem certa.</span>}
        {picked.map((i, pos) => (
          <button key={`${i}-${pos}`} type="button" className="chip text-base" disabled={disabled} onClick={() => setPicked(picked.filter((_, p) => p !== pos))} aria-label={`Remover ${ex.tokens[i]}`}>
            {ex.tokens[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {remaining.map((i) => (
          <button key={i} type="button" className="btn btn-secondary py-1" disabled={disabled} onClick={() => setPicked([...picked, i])}>{ex.tokens[i]}</button>
        ))}
      </div>
      <Button disabled={disabled || remaining.length > 0} onClick={() => onSubmit({ given: sentence.join(' '), correct: orderMatches(sentence, ex.answer), expected: ex.answer })}>Responder</Button>
    </Card>
  )
}
