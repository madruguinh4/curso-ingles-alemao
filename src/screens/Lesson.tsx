import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, BookOpen, MessagesSquare, Lightbulb, PencilLine, Mic, AlertCircle, Compass, Volume2, Turtle, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { db, recordStudyDay } from '../lib/db'
import { getLesson, getWeek } from '../lib/content'
import { ensureCards } from '../lib/srs'
import { vocabFront } from '../lib/export'
import { speak } from '../lib/tts'
import { todayISO } from '../lib/dates'
import type { Lesson } from '../lib/types'
import { Button, Card, Notice, Screen } from '../components/ui'
import { Say, NoVoiceNotice, useVoice } from '../components/Say'
import { Md } from '../components/Md'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'

// Aula com os 8 blocos. Cada bloco concluído é gravado; a aula fica concluída
// quando os 7 blocos interativos estão feitos (o objetivo é o 1º).

type BlockId = 'warmup' | 'dialogue' | 'explanation' | 'guided' | 'production' | 'feedback' | 'task'
const ALL: BlockId[] = ['warmup', 'dialogue', 'explanation', 'guided', 'production', 'feedback', 'task']
const META: Record<BlockId, { label: string; Icon: typeof BookOpen }> = {
  warmup: { label: 'Aquecer', Icon: Lightbulb },
  dialogue: { label: 'Diálogo', Icon: MessagesSquare },
  explanation: { label: 'Regras', Icon: BookOpen },
  guided: { label: 'Praticar', Icon: PencilLine },
  production: { label: 'Produzir', Icon: Mic },
  feedback: { label: 'Erros comuns', Icon: AlertCircle },
  task: { label: 'Missão', Icon: Compass },
}

export function LessonScreen() {
  const { enrollmentId, lessonId } = useParams()
  const nav = useNavigate()
  const eid = Number(enrollmentId)
  const lesson = getLesson(lessonId ?? '')
  const [idx, setIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const completion = useLiveQuery(() => db.completions.where('[enrollmentId+lessonId]').equals([eid, lessonId ?? '']).first(), [eid, lessonId])

  if (!lesson) return <Screen title="Aula" back="/"><Notice kind="warn">Aula não encontrada.</Notice></Screen>
  const week = getWeek(lesson.weekId)
  const current = ALL[idx]
  const doneSet = new Set(completion?.blocksDone ?? [])

  async function markBlock(b: BlockId) {
    const existing = await db.completions.where('[enrollmentId+lessonId]').equals([eid, lesson!.id]).first()
    const blocksDone = Array.from(new Set([...(existing?.blocksDone ?? []), b]))
    const complete = ALL.every((x) => blocksDone.includes(x))
    const row = { enrollmentId: eid, lessonId: lesson!.id, blocksDone, completedAt: complete ? existing?.completedAt ?? new Date().toISOString() : existing?.completedAt ?? null }
    if (existing?.id) await db.completions.update(existing.id, row)
    else await db.completions.add(row)
    await recordStudyDay(eid, todayISO())
    if (complete) await ensureCards(eid, lesson!.vocabulary.map((v) => v.id))
  }

  async function advance() {
    await markBlock(current)
    if (idx + 1 >= ALL.length) setFinished(true)
    else { setIdx(idx + 1); window.scrollTo({ top: 0 }) }
  }

  if (finished) {
    return (
      <Screen title="Aula concluída" back="/">
        <div className="grid gap-4">
          <div className="hero fade-in text-center">
            <Check size={40} className="mx-auto" aria-hidden="true" />
            <p className="text-xl font-bold mt-2">{lesson.title}</p>
            <p className="mt-1 text-sm opacity-90">O vocabulário desta aula entrou nos seus cartões de revisão.</p>
          </div>
          <Card>
            <p className="font-semibold flex items-center gap-2"><Compass size={18} /> Sua missão fora do app</p>
            <Md block className="mt-1" text={lesson.task} />
          </Card>
          <Button to={`/review/${eid}`} block icon={<RefreshCw size={18} />}>Revisar os cartões agora</Button>
          <Button variant="secondary" to="/" block>Voltar ao início</Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen title={lesson.title} back="/" subtitle={`${week ? `Semana ${week.number} · ` : ''}${lesson.objective}`}>
      <ol className="grid grid-cols-7 gap-1 mb-4" aria-label="Blocos da aula">
        {ALL.map((b, i) => {
          const { label, Icon } = META[b]
          const done = i < idx || doneSet.has(b)
          const active = i === idx
          return (
            <li key={b} aria-current={active ? 'step' : undefined}>
              <button type="button" className="w-full flex flex-col items-center gap-1 text-[10px] font-semibold rounded-xl py-1.5"
                style={{ color: active ? 'var(--accent)' : done ? 'var(--ok)' : 'var(--muted)', background: active ? 'var(--accent-soft)' : 'transparent' }}
                onClick={() => i < idx && setIdx(i)} disabled={i > idx} aria-label={`${label}${done ? ' (feito)' : ''}`}>
                {done && !active ? <Check size={18} /> : <Icon size={18} />}
                <span className="truncate w-full text-center">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {current === 'warmup' && <Warmup lesson={lesson} onNext={advance} />}
      {current === 'dialogue' && <Dialogue lesson={lesson} onNext={advance} />}
      {current === 'explanation' && <Explanation lesson={lesson} onNext={advance} />}
      {current === 'guided' && <ExerciseRunner key="guided" exercises={lesson.guided} lang={lesson.language} enrollmentId={eid} lessonId={lesson.id} mode="lesson" onFinish={advance} />}
      {current === 'production' && <ExerciseRunner key="production" exercises={[lesson.production]} lang={lesson.language} enrollmentId={eid} lessonId={lesson.id} mode="lesson" onFinish={advance} />}
      {current === 'feedback' && <Feedback lesson={lesson} onNext={advance} />}
      {current === 'task' && <Task lesson={lesson} onNext={advance} onLater={() => nav('/')} />}
    </Screen>
  )
}

function Warmup({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid gap-3">
      <Card>
        <h2 className="font-bold mb-2 flex items-center gap-2"><Lightbulb size={18} /> {lesson.warmup.prompt}</h2>
        <ul className="grid gap-2">{lesson.warmup.items.map((i) => <li key={i} className="card-flat py-2"><Md text={i} /></li>)}</ul>
      </Card>
      <Button onClick={onNext} block>Pronto, vamos à aula</Button>
    </div>
  )
}

function Dialogue({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const [show, setShow] = useState(true)
  const lang = lesson.language
  const has = useVoice(lang)
  const all = lesson.dialogue.lines.map((l) => l.text).join(' ')
  const speakers = [...new Set(lesson.dialogue.lines.map((l) => l.speaker))]
  return (
    <div className="grid gap-3">
      <p className="muted text-sm">{lesson.dialogue.context}</p>
      <div className="flex gap-2 flex-wrap items-center">
        {has && <Button variant="secondary" size="sm" icon={<Volume2 size={16} />} onClick={() => speak(all, lang, 1)}>Ouvir tudo</Button>}
        {has && <Button variant="secondary" size="sm" icon={<Turtle size={16} />} onClick={() => speak(all, lang, 0.8)}>Devagar</Button>}
        <Button variant="ghost" size="sm" icon={show ? <EyeOff size={16} /> : <Eye size={16} />} onClick={() => setShow(!show)}>{show ? 'Esconder tradução' : 'Mostrar tradução'}</Button>
      </div>
      <NoVoiceNotice lang={lang} />
      <ol className="grid gap-2">
        {lesson.dialogue.lines.map((l, i) => {
          const right = speakers.indexOf(l.speaker) % 2 === 1
          return (
            <li key={i} className={`bubble fade-in ${right ? 'bubble-r' : 'bubble-l'}`}>
              <p className="text-xs muted mb-0.5">{l.speaker}</p>
              <p className="text-lg leading-snug flex items-start gap-1">{l.text} <Say text={l.text} lang={lang} className="shrink-0 -my-1" /></p>
              {show && <p className="text-sm muted mt-0.5">{l.translation}</p>}
            </li>
          )
        })}
      </ol>
      <p className="text-sm muted">Dica: ouça uma vez sem ler, depois leia, depois repita em voz alta junto com o áudio.</p>
      <Button onClick={onNext} block>Entendi o diálogo</Button>
    </div>
  )
}

function Explanation({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const lang = lesson.language
  return (
    <div className="grid gap-3">
      <Notice>Toque nas palavras <span className="term" style={{ pointerEvents: 'none' }}>sublinhadas</span> para ver o que significam. Cada regra aparece antes do exercício que a usa.</Notice>
      <Card>
        <h2 className="font-bold text-lg mb-2">{lesson.explanation.title}</h2>
        <Md block text={lesson.explanation.body} />
      </Card>
      <Card>
        <h3 className="font-semibold mb-2">Exemplos</h3>
        <ul className="grid gap-2">
          {lesson.explanation.examples.map((x) => (
            <li key={x.text} className="flex items-start gap-2 card-flat py-2">
              <div className="grow"><b>{x.text}</b><br /><span className="text-sm muted">{x.translation}</span></div>
              <Say text={x.text} lang={lang} />
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="font-semibold mb-2">Vocabulário desta aula</h3>
        <ul className="grid gap-1">
          {lesson.vocabulary.map((v) => (
            <li key={v.id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div className="grow"><b>{vocabFront(v, lang)}</b> <span className="muted">— {v.translation}</span><br /><span className="text-sm">{v.example}</span></div>
              <Say text={v.example} lang={lang} />
            </li>
          ))}
        </ul>
      </Card>
      <Button onClick={onNext} block>Ir para os exercícios</Button>
    </div>
  )
}

function Feedback({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid gap-3">
      <Card>
        <h2 className="font-bold mb-3 flex items-center gap-2"><AlertCircle size={18} /> Erros comuns de brasileiros nesta aula</h2>
        <ul className="grid gap-3">
          {lesson.feedback.commonErrors.map((c) => (
            <li key={c.wrong} className="card-flat">
              <p><span style={{ color: 'var(--err)', textDecoration: 'line-through' }}>{c.wrong}</span></p>
              <p><b style={{ color: 'var(--ok)' }}>✓ {c.right}</b></p>
              <Md block className="text-sm muted mt-1" text={c.why} />
            </li>
          ))}
        </ul>
      </Card>
      <Button onClick={onNext} block>Continuar</Button>
    </div>
  )
}

function Task({ lesson, onNext, onLater }: { lesson: Lesson; onNext: () => void; onLater: () => void }) {
  return (
    <div className="grid gap-3">
      <Card>
        <h2 className="font-bold mb-2 flex items-center gap-2"><Compass size={18} /> Missão fora do app</h2>
        <Md block className="text-lg" text={lesson.task} />
      </Card>
      <p className="text-sm muted">É aqui que o idioma sai da tela. A missão não é avaliada pelo app — é para você.</p>
      <Button onClick={onNext} block>Entendi, vou fazer</Button>
      <Button variant="ghost" onClick={onLater} block>Ver depois (a aula fica em andamento)</Button>
    </div>
  )
}
