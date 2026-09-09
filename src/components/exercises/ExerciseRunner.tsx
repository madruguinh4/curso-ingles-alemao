import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react'
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

// Roda uma lista de exercícios. A PRIMEIRA tentativa vira evidência
// (attempt) e, se errada, entra no histórico de erros com a explicação.
// Tentar de novo destrava sem contar como acerto.

export interface ExerciseResult { exerciseId: string; skill: Skill; correct: boolean }
export interface SubmitInfo { given: string; correct: boolean; expected: string; skill?: Skill }

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
  const [attemptNo, setAttemptNo] = useState(0)
  const [feedback, setFeedback] = useState<SubmitInfo | null>(null)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const ex = exercises[idx]
  if (!ex) return null

  async function submit(info: SubmitInfo) {
    const skill = info.skill ?? ex.skill
    if (attemptNo === 0) {
      const at = new Date().toISOString()
      const lid = lessonIdOf?.(ex) ?? lessonId
      await db.attempts.add({ enrollmentId, lessonId: lid, exerciseId: ex.id, skill, correct: info.correct, answer: info.given, at })
      if (!info.correct) {
        const prompt = 'prompt' in ex ? ex.prompt : 'text' in ex ? 'Ditado' : ''
        const explanation = 'explanation' in ex ? ex.explanation : ''
        await db.errors.add({ enrollmentId, lessonId: lid, exerciseId: ex.id, prompt, given: info.given, expected: info.expected, explanation, at })
      }
      await recordStudyDay(enrollmentId, todayISO())
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

  const key = `${ex.id}-${attemptNo}`
  const props = { lang, disabled: !!feedback, onSubmit: submit }
  const last = idx + 1 >= exercises.length
  return (
    <div className="grid gap-3">
      <ProgressBar value={idx / exercises.length} label={`Exercício ${idx + 1} de ${exercises.length} · ${SKILL_NAMES[ex.skill]}`} />
      {ex.type === 'choice' && <ChoiceEx key={key} {...props} ex={ex} />}
      {ex.type === 'gap' && <GapEx key={key} {...props} ex={ex} />}
      {ex.type === 'order' && <OrderEx key={key} {...props} ex={ex} />}
      {ex.type === 'transform' && <TransformEx key={key} {...props} ex={ex} />}
      {ex.type === 'dictation' && <DictationEx key={key} {...props} ex={ex} />}
      {ex.type === 'free' && <FreeEx key={key} {...props} ex={ex} />}

      {feedback && (
        <div className={`fade-in ${feedback.correct ? 'feedback-ok' : 'feedback-err'}`} role="status">
          <div className="flex items-start gap-2">
            {feedback.correct ? <CheckCircle2 size={22} style={{ color: 'var(--ok)', flex: 'none' }} /> : <XCircle size={22} style={{ color: 'var(--err)', flex: 'none' }} />}
            <div className="grow">
              {ex.type === 'free' ? (
                <p><b>Registrado.</b> {feedback.correct ? 'Você marcou a maior parte da lista — boa produção.' : 'Você marcou poucos itens. Vale repetir esta produção amanhã, com o modelo ao lado.'}</p>
              ) : feedback.correct ? (
                <div><p className="font-bold">Certo!</p>{'explanation' in ex && <Md block className="text-sm mt-1" text={ex.explanation} />}</div>
              ) : (
                <div>
                  <p className="font-bold">Ainda não. A resposta esperada era: <span className="font-mono">{feedback.expected}</span></p>
                  {'explanation' in ex && <Md block className="text-sm mt-1" text={ex.explanation} />}
                  {attemptNo === 0 && mode === 'lesson' && <p className="text-xs muted mt-1">Este erro ficou no seu histórico — ele volta em outros contextos e aparece no kit final.</p>}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {!feedback.correct && mode === 'lesson' && ex.type !== 'free' && <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={retry}>Tentar de novo</Button>}
            <Button onClick={next} icon={<ArrowRight size={16} />}>{last ? 'Concluir' : 'Continuar'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
