import { useState } from 'react'
import { db } from '../../lib/db'
import type { Exercise, Language, Skill } from '../../lib/types'
import { SKILL_NAMES } from '../../lib/types'
import { Button, Card, ProgressBar } from '../ui'
import { ChoiceEx } from './Choice'
import { GapEx } from './Gap'
import { OrderEx } from './Order'
import { TransformEx } from './Transform'
import { DictationEx } from './Dictation'
import { FreeEx } from './Free'

// Roda uma lista de exercícios. A PRIMEIRA tentativa vira evidência
// (attempt) e, se errada, entra no histórico de erros com a explicação.
// Tentar de novo destrava sem contar como acerto.

export interface ExerciseResult { exerciseId: string; skill: Skill; correct: boolean }

export interface SubmitInfo { given: string; correct: boolean; expected: string; skill?: Skill }

export function ExerciseRunner({ exercises, lang, enrollmentId, lessonId, mode, onFinish }: {
  exercises: Exercise[]
  lang: Language
  enrollmentId: number
  lessonId: string
  mode: 'lesson' | 'assessment'
  onFinish: (results: ExerciseResult[]) => void
}) {
  const [idx, setIdx] = useState(0)
  const [attemptNo, setAttemptNo] = useState(0)
  const [feedback, setFeedback] = useState<SubmitInfo | null>(null)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const ex = exercises[idx]
  if (!ex) return null

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
      setResults((r) => [...r, { exerciseId: ex.id, skill, correct: info.correct }])
    }
    setFeedback(info)
  }

  function next() {
    setFeedback(null)
    setAttemptNo(0)
    if (idx + 1 >= exercises.length) onFinish(results)
    else setIdx(idx + 1)
  }

  function retry() {
    setFeedback(null)
    setAttemptNo((n) => n + 1)
  }

  const props = { key: `${ex.id}-${attemptNo}`, lang, disabled: !!feedback, onSubmit: submit }
  return (
    <div className="grid gap-3">
      <ProgressBar value={idx / exercises.length} label={`Exercício ${idx + 1} de ${exercises.length} · ${SKILL_NAMES[ex.skill]}`} />
      {ex.type === 'choice' && <ChoiceEx {...props} ex={ex} />}
      {ex.type === 'gap' && <GapEx {...props} ex={ex} />}
      {ex.type === 'order' && <OrderEx {...props} ex={ex} />}
      {ex.type === 'transform' && <TransformEx {...props} ex={ex} />}
      {ex.type === 'dictation' && <DictationEx {...props} ex={ex} />}
      {ex.type === 'free' && <FreeEx {...props} ex={ex} />}

      {feedback && (
        <Card className={feedback.correct ? 'choice-ok' : 'choice-err'}>
          {ex.type === 'free' ? (
            <p><b>Registrado.</b> {feedback.correct ? 'Você marcou a maior parte da lista — boa produção.' : 'Você marcou poucos itens da lista. Vale repetir esta produção amanhã, com o modelo ao lado.'}</p>
          ) : feedback.correct ? (
            <p><b>Certo!</b> {'explanation' in ex && <span className="muted">{ex.explanation}</span>}</p>
          ) : (
            <div>
              <p><b>Ainda não.</b> Resposta esperada: <b>{feedback.expected}</b></p>
              {'explanation' in ex && <p className="mt-1">{ex.explanation}</p>}
              {attemptNo === 0 && mode === 'lesson' && <p className="text-sm muted mt-1">Este erro foi guardado no seu histórico — ele volta em outros contextos e aparece no kit final.</p>}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {!feedback.correct && mode === 'lesson' && ex.type !== 'free' && <Button variant="secondary" onClick={retry}>Tentar de novo</Button>}
            <Button onClick={next}>{idx + 1 >= exercises.length ? 'Concluir' : 'Continuar'}</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
