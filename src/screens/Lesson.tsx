import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { getLesson, getWeek } from '../lib/content'
import { ensureCards } from '../lib/srs'
import { miniMarkdown, vocabFront } from '../lib/export'
import type { Lesson } from '../lib/types'
import { Button, Card, Notice, Screen } from '../components/ui'
import { Say, NoVoiceNotice } from '../components/Say'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'

// Aula com os 8 blocos do §6. Cada bloco concluído é gravado; a aula fica
// concluída quando os 7 blocos interativos estão feitos (o objetivo é o 1º).

type BlockId = 'warmup' | 'dialogue' | 'explanation' | 'guided' | 'production' | 'feedback' | 'task'
const ALL: BlockId[] = ['warmup', 'dialogue', 'explanation', 'guided', 'production', 'feedback', 'task']
const LABEL: Record<BlockId, string> = { warmup: 'Revisão', dialogue: 'Diálogo', explanation: 'Explicação', guided: 'Exercícios', production: 'Produção', feedback: 'Correções', task: 'Tarefa' }

export function LessonScreen() {
  const { enrollmentId, lessonId } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const part = sp.get('part') as 'a' | 'b' | null
  const eid = Number(enrollmentId)
  const lesson = getLesson(lessonId ?? '')
  const blocks = part === 'a' ? ALL.slice(0, 4) : part === 'b' ? ALL.slice(4) : ALL
  const [idx, setIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const completion = useLiveQuery(() => db.completions.where('[enrollmentId+lessonId]').equals([eid, lessonId ?? '']).first(), [eid, lessonId])

  if (!lesson) return <Screen title="Aula" back="/"><Notice kind="warn">Aula não encontrada.</Notice></Screen>
  const week = getWeek(lesson.weekId)
  const current = blocks[idx]

  async function markBlock(b: BlockId) {
    const existing = await db.completions.where('[enrollmentId+lessonId]').equals([eid, lesson!.id]).first()
    const blocksDone = Array.from(new Set([...(existing?.blocksDone ?? []), b]))
    const complete = ALL.every((x) => blocksDone.includes(x))
    const row = { enrollmentId: eid, lessonId: lesson!.id, blocksDone, completedAt: complete ? existing?.completedAt ?? new Date().toISOString() : existing?.completedAt ?? null }
    if (existing?.id) await db.completions.update(existing.id, row)
    else await db.completions.add(row)
    if (complete) await ensureCards(eid, lesson!.vocabulary.map((v) => v.id))
  }

  async function markSchedule() {
    const kind = part === 'a' ? 'lesson-a' : part === 'b' ? 'lesson-b' : 'lesson'
    const item = await db.schedule.where('enrollmentId').equals(eid).filter((i) => i.lessonId === lesson!.id && i.kind === kind && i.status === 'pending').first()
    if (item?.id) await db.schedule.update(item.id, { status: 'done' })
  }

  async function advance() {
    await markBlock(current)
    if (idx + 1 >= blocks.length) {
      await markSchedule()
      setFinished(true)
    } else {
      setIdx(idx + 1)
      window.scrollTo({ top: 0 })
    }
  }

  if (finished) {
    const all = completion?.completedAt || part === null || part === 'b'
    return (
      <Screen title={part === 'a' ? 'Parte A concluída' : 'Aula concluída'} back="/">
        <div className="grid gap-4">
          <Card>
            <p className="text-lg"><b>{lesson.title}</b></p>
            <p className="mt-1">{part === 'a' ? 'Na próxima sessão você faz a produção, as correções e a tarefa.' : 'O vocabulário desta aula entrou nos seus cartões de revisão.'}</p>
          </Card>
          <Card>
            <p className="font-semibold">Tarefa fora do app</p>
            <p className="mt-1">{lesson.task}</p>
          </Card>
          {all && <Button to={`/review/${eid}`} block>Revisar os cartões agora</Button>}
          <Button variant="secondary" to="/" block>Voltar ao início</Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen title={lesson.title} back="/">
      <p className="text-sm muted -mt-3 mb-2">{week ? `Semana ${week.number} · ` : ''}<b>Objetivo:</b> {lesson.objective}</p>
      <ol className="flex gap-1 mb-4 flex-wrap" aria-label="Blocos da aula">
        {blocks.map((b, i) => (
          <li key={b} aria-current={i === idx ? 'step' : undefined}>
            <button type="button" className="chip" style={{ borderColor: i === idx ? 'var(--accent)' : undefined, color: i < idx || completion?.blocksDone.includes(b) ? 'var(--ok)' : undefined }} onClick={() => i < idx && setIdx(i)} disabled={i > idx}>
              {i < idx || completion?.blocksDone.includes(b) ? '✓ ' : ''}{LABEL[b]}
            </button>
          </li>
        ))}
      </ol>

      {current === 'warmup' && <Warmup lesson={lesson} onNext={advance} />}
      {current === 'dialogue' && <Dialogue lesson={lesson} onNext={advance} />}
      {current === 'explanation' && <Explanation lesson={lesson} onNext={advance} />}
      {current === 'guided' && (
        <ExerciseRunner key="guided" exercises={lesson.guided} lang={lesson.language} enrollmentId={eid} lessonId={lesson.id} mode="lesson" onFinish={advance} />
      )}
      {current === 'production' && (
        <ExerciseRunner key="production" exercises={[lesson.production]} lang={lesson.language} enrollmentId={eid} lessonId={lesson.id} mode="lesson" onFinish={advance} />
      )}
      {current === 'feedback' && <Feedback lesson={lesson} onNext={advance} />}
      {current === 'task' && <Task lesson={lesson} onNext={advance} onLater={() => nav('/')} />}
    </Screen>
  )
}

function Warmup({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid gap-3">
      <Card>
        <h2 className="font-bold mb-2">{lesson.warmup.prompt}</h2>
        <ul className="list-disc pl-5 grid gap-2">{lesson.warmup.items.map((i) => <li key={i}>{i}</li>)}</ul>
      </Card>
      <Button onClick={onNext} block>Pronto, vamos à aula</Button>
    </div>
  )
}

function Dialogue({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const [show, setShow] = useState(false)
  const lang = lesson.language
  const all = lesson.dialogue.lines.map((l) => l.text).join(' ')
  return (
    <div className="grid gap-3">
      <p className="muted text-sm">{lesson.dialogue.context}</p>
      <div className="flex gap-2 flex-wrap items-center">
        <Say text={all} lang={lang} label="Ouvir tudo" />
        <Say text={all} lang={lang} rate={0.8} label="Devagar" />
        <Button variant="ghost" onClick={() => setShow(!show)}>{show ? 'Esconder tradução' : 'Mostrar tradução'}</Button>
      </div>
      <NoVoiceNotice lang={lang} />
      <ol className="grid gap-2">
        {lesson.dialogue.lines.map((l, i) => (
          <li key={i} className="card py-2">
            <div className="flex items-start gap-2">
              <span className="chip shrink-0">{l.speaker}</span>
              <div className="grow">
                <p className="text-lg">{l.text}</p>
                {show && <p className="text-sm muted">{l.translation}</p>}
              </div>
              <Say text={l.text} lang={lang} />
            </div>
          </li>
        ))}
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
      <Card>
        <h2 className="font-bold text-lg mb-2">{lesson.explanation.title}</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: miniMarkdown(lesson.explanation.body) }} />
      </Card>
      <Card>
        <h3 className="font-semibold mb-2">Exemplos</h3>
        <ul className="grid gap-2">
          {lesson.explanation.examples.map((x) => (
            <li key={x.text} className="flex items-start gap-2">
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
            <li key={v.id} className="flex items-center gap-2 py-1 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
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
        <h2 className="font-bold mb-2">Erros comuns de brasileiros nesta aula</h2>
        <ul className="grid gap-3">
          {lesson.feedback.commonErrors.map((c) => (
            <li key={c.wrong}>
              <span style={{ color: 'var(--err)', textDecoration: 'line-through' }}>{c.wrong}</span> → <b style={{ color: 'var(--ok)' }}>{c.right}</b>
              <p className="text-sm muted mt-0.5">{c.why}</p>
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
        <h2 className="font-bold mb-2">Tarefa prática fora do app</h2>
        <p className="text-lg">{lesson.task}</p>
      </Card>
      <p className="text-sm muted">É aqui que o idioma sai da tela. A tarefa não é avaliada pelo app — é para você.</p>
      <Button onClick={onNext} block>Entendi, vou fazer</Button>
      <Button variant="ghost" onClick={onLater} block>Ver depois (a aula fica em andamento)</Button>
    </div>
  )
}
