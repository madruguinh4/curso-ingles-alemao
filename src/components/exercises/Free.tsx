import { useState } from 'react'
import type { Exercise, Language } from '../../lib/types'
import { useProfile } from '../../state/useTheme'
import type { SubmitInfo } from './ExerciseRunner'
import { Say } from '../Say'
import { Button, Card, Notice } from '../ui'
import { Md } from '../Md'

type Ex = Extract<Exercise, { type: 'free' }>

// Produção própria (oral ou escrita), auto-avaliada com uma lista de verificação.
// Sem reconhecimento de voz e sem correção automática de texto nesta versão —
// e a tela diz isso.

export function FreeEx({ ex, lang, disabled, onSubmit }: { ex: Ex; lang: Language; disabled: boolean; onSubmit: (i: SubmitInfo) => void }) {
  const p = useProfile()
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<boolean[]>(ex.checklist.map(() => false))
  const [showModel, setShowModel] = useState(false)
  const speaking = ex.skill === 'speaking'
  const n = checked.filter(Boolean).length
  const ratio = n / ex.checklist.length

  return (
    <Card>
      <p className="text-sm muted mb-1">{speaking ? 'Produção oral' : 'Produção escrita'}</p>
      <Md block className="text-lg mb-3" text={ex.prompt} />

      {speaking ? (
        <Notice>
          {p.micAllowed
            ? 'Abra o gravador do seu celular, grave, e depois ouça. '
            : 'Se não puder falar agora, sussurre ou fale mentalmente e faça em voz alta mais tarde. '}
          O app <b>não grava nem avalia sua fala</b> nesta versão — a lista abaixo é sua autoavaliação, focada em ser entendido, não em sotaque.
        </Notice>
      ) : (
        <textarea className="input min-h-28" value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} aria-label="Seu texto" placeholder="Escreva aqui…" />
      )}

      <fieldset className="mt-4">
        <legend className="font-semibold mb-2">Confira o que você conseguiu:</legend>
        <div className="grid gap-2">
          {ex.checklist.map((c, i) => (
            <label key={c} className="choice flex items-start gap-2 cursor-pointer" aria-checked={checked[i]} role="checkbox">
              <input type="checkbox" className="mt-1" checked={checked[i]} disabled={disabled} onChange={() => setChecked(checked.map((v, j) => (j === i ? !v : v)))} />
              <Md text={c} />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {showModel ? (
          <div className="card">
            <p className="text-sm muted mb-1">Modelo de resposta</p>
            <p className="whitespace-pre-line">{ex.model}</p>
            <Say text={ex.model} lang={lang} />
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setShowModel(true)}>Ver um modelo de resposta</Button>
        )}
      </div>

      <Button className="mt-4" disabled={disabled || (!speaking && !text.trim())} onClick={() => onSubmit({ given: speaking ? `(oral) ${n}/${ex.checklist.length} itens` : text, correct: ratio >= 0.8, expected: ex.model })}>
        Concluir produção
      </Button>
    </Card>
  )
}
