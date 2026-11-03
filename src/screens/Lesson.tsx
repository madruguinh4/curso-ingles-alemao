import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Volume2, Turtle, Eye, EyeOff, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react'
import { db, recordStudyDay } from '../lib/db'
import { getLesson, getWeek, isExercise } from '../lib/content'
import { ensureCards } from '../lib/srs'
import { speak } from '../lib/tts'
import { todayISO } from '../lib/dates'
import { resumeIndex, screenKeys } from '../lib/course'
import type { DialogueStep, Exercise, LearnStep, Lesson, Step } from '../lib/types'
import { Button, Card, Notice, ProgressBar, Screen, Spinner } from '../components/ui'
import { Say, NoVoiceNotice, useVoice } from '../components/Say'
import { ExerciseStep } from '../components/exercises/ExerciseRunner'
import { Coach } from '../components/mascots/Coach'
import { Mascot } from '../components/mascots/Mascots'

// Aula em telas curtas, uma ideia por tela: cartões "aprender" intercalados
// com exercícios, o diálogo inteiro no fim e a produção. Cada tela concluída
// é gravada (s0, s1… e "production"); a aula fica concluída com todas feitas.

type Screenful = { key: string; step: Step }

const screensOf = (l: Lesson): Screenful[] => {
  const keys = screenKeys(l)
  return [...l.steps, l.production].map((step, i) => ({ key: keys[i], step }))
}

export function LessonScreen() {
  const { enrollmentId, lessonId } = useParams()
  const eid = Number(enrollmentId)
  const lesson = getLesson(lessonId ?? '')
  const completion = useLiveQuery(() => db.completions.where('[enrollmentId+lessonId]').equals([eid, lessonId ?? '']).first().then((c) => c ?? null), [eid, lessonId])
  const [chosen, setIdx] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [startedAt] = useState(() => new Date().toISOString())
  // Erros desta sessão, para a Bia rever no fim (um por exercício).
  const sessionErrors = useLiveQuery(
    () => db.errors.where('lessonId').equals(lessonId ?? '').filter((e) => e.enrollmentId === eid && e.at >= startedAt).toArray(),
    [eid, lessonId, startedAt],
  )
  const top = useRef<HTMLDivElement>(null)

  useEffect(() => { top.current?.focus() }, [chosen])

  if (!lesson) return <Screen title="Aula" back="/"><Notice kind="warn">Aula não encontrada.</Notice></Screen>
  if (completion === undefined) return <Spinner />
  const screens = screensOf(lesson)
  // Até o aluno avançar, retoma na primeira tela ainda não feita.
  const idx = chosen ?? resumeIndex(lesson, completion)
  const week = getWeek(lesson.weekId)
  const current = screens[idx]

  async function markDone(key: string) {
    const existing = await db.completions.where('[enrollmentId+lessonId]').equals([eid, lesson!.id]).first()
    const wasSkipped = !!existing?.skipped
    const blocksDone = Array.from(new Set([...(wasSkipped ? [] : existing?.blocksDone ?? []), key]))
    const complete = screens.every((s) => blocksDone.includes(s.key))
    const prevDone = wasSkipped ? null : existing?.completedAt ?? null
    const row = { enrollmentId: eid, lessonId: lesson!.id, blocksDone, completedAt: complete ? prevDone ?? new Date().toISOString() : prevDone, skipped: false }
    if (existing?.id) await db.completions.update(existing.id, row)
    else await db.completions.add(row)
    await recordStudyDay(eid, todayISO())
    if (complete) await ensureCards(eid, lesson!.vocabulary.map((v) => v.id))
  }

  async function next() {
    await markDone(current.key)
    if (idx + 1 >= screens.length) setFinished(true)
    else { setIdx(idx + 1); window.scrollTo({ top: 0 }) }
  }

  if (finished) {
    return (
      <Screen title="Aula concluída" back="/">
        <div className="grid gap-4">
          <div className="hero fade-in text-center">
            <Mascot id="zeca" mood="cheer" size={96} className="mx-auto" decorative />
            <p className="text-xl font-bold mt-2">{lesson.title}</p>
            <p className="mt-1 text-sm opacity-90">Aula concluída! As palavras foram para a revisão.</p>
          </div>
          {!!sessionErrors?.length && (
            <Coach who="bia" mood="calm">
              <p className="font-semibold">Vale rever:</p>
              <ul className="grid gap-1 mt-1 text-sm">
                {[...new Map(sessionErrors.map((e) => [e.exerciseId, e])).values()].map((e) => (
                  <li key={e.id}><span style={{ textDecoration: 'line-through' }}>{e.given}</span> → <b>{e.expected}</b></li>
                ))}
              </ul>
            </Coach>
          )}
          <Button to={`/review/${eid}`} block icon={<RefreshCw size={18} />}>Revisar agora</Button>
          <Button variant="secondary" to="/" block>Voltar ao início</Button>
        </div>
      </Screen>
    )
  }

  const step = current.step
  return (
    <Screen title={lesson.title} back="/" subtitle={`${week ? `Semana ${week.number} · ` : ''}${lesson.objective}`}>
      <ProgressBar value={idx / screens.length} label={`${idx + 1} de ${screens.length}`} />
      {idx === 0 && <NoVoiceNotice lang={lesson.language} />}
      {completion?.skipped && idx === 0 && <div className="mb-3"><Notice kind="warn">Você marcou esta aula como “já sei”. Fazer de novo também vale.</Notice></div>}
      <div ref={top} tabIndex={-1} className="outline-none mt-2">
        {step.type === 'learn' && <LearnCard key={current.key} step={step} lesson={lesson} onNext={next} />}
        {step.type === 'dialogue' && <DialogueCard key={current.key} step={step} lesson={lesson} onNext={next} />}
        {isExercise(step) && (
          <ExerciseStep key={current.key} ex={step as Exercise} lang={lesson.language} enrollmentId={eid} lessonId={lesson.id} mode="lesson" last={idx + 1 >= screens.length} onDone={next} />
        )}
      </div>
    </Screen>
  )
}

function LearnCard({ step, lesson, onNext }: { step: LearnStep; lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid gap-3 fade-in">
      <Card className="text-center">
        <p className="text-2xl font-bold leading-snug">{step.text} <Say text={step.text} lang={lesson.language} /></p>
        <p className="muted mt-2">{step.translation}</p>
      </Card>
      {step.rule && <Coach who="tico"><p className="font-semibold">{step.rule}</p></Coach>}
      {step.avoid && (
        <div className="card-flat grid gap-1">
          <p className="flex items-center gap-2"><XCircle size={18} style={{ color: 'var(--err)' }} aria-label="Errado" /><span style={{ textDecoration: 'line-through' }}>{step.avoid.wrong}</span></p>
          <p className="flex items-center gap-2"><CheckCircle2 size={18} style={{ color: 'var(--ok)' }} aria-label="Certo" /><b>{step.avoid.right}</b></p>
        </div>
      )}
      <Button onClick={onNext} block>Continuar</Button>
    </div>
  )
}

function DialogueCard({ step, lesson, onNext }: { step: DialogueStep; lesson: Lesson; onNext: () => void }) {
  const [show, setShow] = useState(false)
  const lang = lesson.language
  const has = useVoice(lang)
  const all = step.lines.map((l) => l.text).join(' ')
  const speakers = [...new Set(step.lines.map((l) => l.speaker))]
  return (
    <div className="grid gap-3 fade-in">
      <Coach who="lu"><h2 className="font-bold">Agora a conversa inteira</h2><p className="text-sm">Ouça e acompanhe.</p></Coach>
      <div className="flex gap-2 flex-wrap items-center">
        {has && <Button variant="secondary" size="sm" icon={<Volume2 size={16} />} onClick={() => speak(all, lang, 1)}>Ouvir</Button>}
        {has && <Button variant="secondary" size="sm" icon={<Turtle size={16} />} onClick={() => speak(all, lang, 0.8)}>Devagar</Button>}
        <Button variant="ghost" size="sm" icon={show ? <EyeOff size={16} /> : <Eye size={16} />} onClick={() => setShow(!show)}>{show ? 'Esconder tradução' : 'Tradução'}</Button>
      </div>
      <ol className="grid gap-2">
        {step.lines.map((l, i) => (
          <li key={i} className={`bubble ${speakers.indexOf(l.speaker) % 2 === 1 ? 'bubble-r' : 'bubble-l'}`}>
            <p className="text-xs muted mb-0.5">{l.speaker}</p>
            <p className="text-lg leading-snug flex items-start gap-1">{l.text} <Say text={l.text} lang={lang} className="shrink-0 -my-1" /></p>
            {show && <p className="text-sm muted mt-0.5">{l.translation}</p>}
          </li>
        ))}
      </ol>
      <Button onClick={onNext} block>Continuar</Button>
    </div>
  )
}
