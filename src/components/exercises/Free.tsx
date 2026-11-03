import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import type { SubmitInfo } from './ExerciseRunner'
import { Say } from '../Say'
import { Button, Card } from '../ui'
import { Md } from '../Md'
import { Coach } from '../mascots/Coach'

type Ex = Extract<Exercise, { type: 'free' }>

// Produção própria (oral ou escrita), auto-avaliada com uma lista curta.
// O app não ouve a fala nem corrige o texto — e a tela diz isso em uma linha.

export function FreeEx({ ex, lang, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<boolean[]>(ex.checklist.map(() => false))
  const [showModel, setShowModel] = useState(false)
  const speaking = ex.skill === 'speaking'
  const n = checked.filter(Boolean).length
  const ratio = n / ex.checklist.length

  return (
    <Card>
      <div className="mb-3">
        <Coach who="rafa">
          <p className="text-sm muted">{speaking ? 'Sua vez de falar' : 'Sua vez de escrever'}</p>
          <Md block className="text-lg" text={ex.prompt} />
        </Coach>
      </div>

      {speaking ? (
        <p className="text-sm muted">O app não ouve: você mesmo confere.</p>
      ) : (
        <textarea className="input min-h-28" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} aria-label="Seu texto" placeholder="Escreva aqui…" />
      )}

      <div className="mt-3">
        {showModel ? (
          <div className="card-flat">
            <p className="whitespace-pre-line">{ex.model} <Say text={ex.model} lang={lang} /></p>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowModel(true)}>Ver exemplo</Button>
        )}
      </div>

      <fieldset className="mt-3">
        <legend className="font-semibold mb-2">Consegui:</legend>
        <div className="grid gap-2">
          {ex.checklist.map((c, i) => (
            <label key={c} className={`choice flex items-start gap-2 cursor-pointer ${checked[i] ? 'is-on' : ''}`}>
              <input type="checkbox" className="mt-1" checked={checked[i]} disabled={disabled} onChange={() => setChecked(checked.map((v, j) => (j === i ? !v : v)))} />
              <Md text={c} />
            </label>
          ))}
        </div>
      </fieldset>

      <Button className="mt-4" disabled={disabled || (!speaking && !text.trim())} onClick={() => onSubmit({ given: speaking ? `(oral) ${n}/${ex.checklist.length} itens` : text, correct: ratio >= 0.8, expected: ex.model })}>
        Pronto
      </Button>
    </Card>
  )
}
