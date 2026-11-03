import { useState } from 'react'
import { RotateCcw, ArrowRight } from 'lucide-react'
import { Coach } from '../mascots/Coach'
import { db, recordStudyDay } from '../../lib/db'
import { todayISO } from '../../lib/dates'
import type { Exercise, Language, Skill } from '../../lib/types'
import { SKILL_NAMES } from '../../lib/types'
import { Button, ProgressBar } from '../ui'
import { Md } from '../Md'
import { ChoiceEx } from './Choice'
import { GapEx } from './Gap'
import { OrderEx } from './Order'
import { TransformEx } from './Transform'
import { DictationEx } from './Dictation'
import { FreeEx } from './Free'

// Um exercício por vez. A PRIMEIRA tentativa vira evidência (attempt) e, se
// errada, entra no histórico de erros com a explicação. Tentar de novo
// destrava sem contar como acerto.

export interface ExerciseResult { exerciseId: string; skill: Skill; correct: boolean }
export interface SubmitInfo { given: string; correct: boolean; expected: string; skill?: Skill }

export function ExerciseStep({ ex, lang, enrollmentId, lessonId, mode, last, onDone }: {
  ex: Exercise
  lang: Language
  enrollmentId: number
  lessonId: string
  mode: 'lesson' | 'assessment'
  /** muda o rótulo do botão final para "Concluir" */
  last?: boolean
  onDone: (result: ExerciseResult) => void
}) {
  const [attemptNo, setAttemptNo] = useState(0)
  const [feedback, setFeedback] = useState<SubmitInfo | null>(null)
  const [first, setFirst] = useState<ExerciseResult | null>(null)

  async function submit(info: SubmitInfo) {
    const skill = info.skill ?? ex.skill
    if (attemptNo === 0) {
      const at = new Date().toISOString()
      await db.attempts.add({ enrollmentId, lessonId, exerciseId: ex.id, skill, correct: info.correct, answer: info.given, at })
      if (!info.correct) {
        const prompt = 'prompt' in ex ? ex.prompt : 'text' in ex ? 'Ditado' : ''
        const explanation = 'explanation' in ex ? ex.explanation : ''
        await db.errors.add({ enrollmentId, lessonId, exerciseId: ex.id, prompt, given: info.given, expected: info.expected, explanation, at })
      }
      await recordStudyDay(enrollmentId, todayISO())
      setFirst({ exerciseId: ex.id, skill, correct: info.correct })
    }
    setFeedback(info)
  }

  function retry() {
    setFeedback(null)
    setAttemptNo((n) => n + 1)
  }

  const key = `${ex.id}-${attemptNo}`
  const props = { lang, disabled: !!feedback, onSubmit: submit }
  return (
    <div className="grid gap-3">
      {ex.type === 'choice' && <ChoiceEx key={key} {...props} ex={ex} />}
      {ex.type === 'gap' && <GapEx key={key} {...props} ex={ex} />}
      {ex.type === 'order' && <OrderEx key={key} {...props} ex={ex} />}
      {ex.type === 'transform' && <TransformEx key={key} {...props} ex={ex} />}
      {ex.type === 'dictation' && <DictationEx key={key} {...props} ex={ex} />}
      {ex.type === 'free' && <FreeEx key={key} {...props} ex={ex} />}

      {feedback && (
        <div className="grid gap-3" role="status">
          {ex.type === 'free' ? (
            <Coach who="rafa" mood={feedback.correct ? 'cheer' : 'calm'} tone={feedback.correct ? 'ok' : undefined}>
              <p className="font-bold">{feedback.correct ? 'Boa! Registrado.' : 'Registrado. Vale repetir amanhã, olhando o exemplo.'}</p>
            </Coach>
          ) : feedback.correct ? (
            <Coach who="zeca" mood="cheer" tone="ok">
              <p className="font-bold">Certo!</p>
              {'explanation' in ex && <Md block className="text-sm" text={ex.explanation} />}
            </Coach>
          ) : (
            <Coach who="bia" mood="calm" tone="err">
              <p className="font-bold">Quase. Certo: <span className="font-mono">{feedback.expected}</span></p>
              {'explanation' in ex && <Md block className="text-sm" text={ex.explanation} />}
            </Coach>
          )}
          <div className="flex gap-2">
            {!feedback.correct && mode === 'lesson' && ex.type !== 'free' && <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={retry}>Tentar de novo</Button>}
            <Button onClick={() => onDone(first!)} icon={<ArrowRight size={16} />}>{last ? 'Concluir' : 'Continuar'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Lista de exercícios com barra de progresso (verificação da semana). */
export function ExerciseRunner({ exercises, lang, enrollmentId, lessonId, lessonIdOf, mode, onFinish }: {
  exercises: Exercise[]
  lang: Language
  enrollmentId: number
  lessonId: string
  /** Na verificação semanal os exercícios vêm de várias aulas. */
  lessonIdOf?: (ex: Exercise) => string
  mode: 'lesson' | 'assessment'
  onFinish: (results: ExerciseResult[]) => void
}) {
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const ex = exercises[idx]
  if (!ex) return null

  function done(r: ExerciseResult) {
    const all = [...results, r]
    setResults(all)
    if (idx + 1 >= exercises.length) onFinish(all)
    else setIdx(idx + 1)
  }

  return (
    <div className="grid gap-3">
      <ProgressBar value={idx / exercises.length} label={`${idx + 1} de ${exercises.length} · ${SKILL_NAMES[ex.skill]}`} />
      <ExerciseStep key={ex.id} ex={ex} lang={lang} enrollmentId={enrollmentId} lessonId={lessonIdOf?.(ex) ?? lessonId} mode={mode} last={idx + 1 >= exercises.length} onDone={done} />
    </div>
  )
}
