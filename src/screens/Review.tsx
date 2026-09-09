import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { RefreshCw, PartyPopper } from 'lucide-react'
import { db, recordStudyDay, type CardRow } from '../lib/db'
import { dueCards, gradeCard, nextDue, GRADE_LABELS, type Grade } from '../lib/srs'
import { getVocab } from '../lib/content'
import { vocabFront } from '../lib/export'
import { todayISO, formatBR } from '../lib/dates'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Button, Card, Notice, ProgressBar, Screen, Spinner } from '../components/ui'
import { Say, NoVoiceNotice } from '../components/Say'
import { Md } from '../components/Md'

// Revisão espaçada: fila fixa carregada na entrada.

export function Review() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const [queue, setQueue] = useState<CardRow[] | null>(null)
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [next, setNext] = useState<Date | null>(null)
  const errors = useLiveQuery(() => db.errors.where('enrollmentId').equals(eid).toArray(), [eid])

  useEffect(() => {
    if (eid < 0) return
    dueCards(eid).then((c) => { setQueue(c); if (!c.length) nextDue(eid).then(setNext) })
  }, [eid])

  if (loading || !e || !queue || !errors) return <Spinner />
  const lang = e.language

  if (queue.length === 0) {
    return (
      <Screen title="Revisão" subtitle={LANGUAGE_NAMES[lang]}>
        <Card>
          <p className="text-lg font-semibold flex items-center gap-2"><RefreshCw size={18} /> Nada para revisar agora.</p>
          <p className="mt-1 muted">{next ? `Próximo cartão vence em ${formatBR(next.toISOString().slice(0, 10))}.` : 'Os cartões entram aqui quando você conclui uma aula.'}</p>
        </Card>
        <p className="text-sm muted mt-3">O intervalo de cada cartão é calculado pelo FSRS (o mesmo algoritmo do Anki): revisar antes da hora não ajuda a memória, então o app não inventa revisão para te manter na tela.</p>
      </Screen>
    )
  }

  if (pos >= queue.length) {
    return (
      <Screen title="Revisão concluída">
        <div className="hero text-center fade-in">
          <PartyPopper size={36} className="mx-auto" aria-hidden="true" />
          <p className="text-lg mt-2">Você revisou <b>{queue.length}</b> cartão(ões) de {LANGUAGE_NAMES[lang]}.</p>
          <p className="text-sm opacity-90 mt-1">Cada um foi reagendado conforme a sua resposta.</p>
        </div>
        <Button to="/" block className="mt-4">Voltar ao início</Button>
      </Screen>
    )
  }

  const card = queue[pos]
  const v = getVocab(card.vocabId)
  const related = v ? errors.filter((x) => x.expected.toLowerCase().includes(v.term.toLowerCase()) || x.prompt.toLowerCase().includes(v.term.toLowerCase())).slice(-1)[0] : undefined

  async function grade(g: Grade) {
    await gradeCard(card, g)
    await recordStudyDay(eid, todayISO())
    setFlipped(false)
    setPos(pos + 1)
  }

  return (
    <Screen title="Revisão" subtitle={LANGUAGE_NAMES[lang]}>
      <ProgressBar value={pos / queue.length} label={`${pos + 1} de ${queue.length}`} />
      <NoVoiceNotice lang={lang} />
      {!v ? (
        <Notice kind="warn">Cartão de um vocabulário que não existe mais ({card.vocabId}). <Button variant="ghost" size="sm" onClick={() => grade('good')}>Pular</Button></Notice>
      ) : (
        <Card className="mt-3 text-center">
          <p className="text-xs muted uppercase tracking-wide">{flipped ? 'Resposta' : 'Você lembra o que significa?'}</p>
          <p className="text-3xl font-bold my-4">{vocabFront(v, lang)} <Say text={v.term} lang={lang} /></p>
          {flipped ? (
            <div className="grid gap-2 text-left fade-in">
              <p className="text-xl text-center">{v.translation}</p>
              <p className="card-flat"><i>{v.example}</i> <Say text={v.example} lang={lang} /><br /><span className="text-sm muted">{v.exampleTranslation}</span></p>
              {related && (
                <div className="text-sm rounded-2xl p-3" style={{ background: 'var(--warn-soft)' }}>
                  <b>Você já errou isso:</b> <span style={{ textDecoration: 'line-through' }}>{related.given}</span> → <b>{related.expected}</b>
                  <Md block className="muted mt-1" text={related.explanation} />
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['again', 'hard', 'good', 'easy'] as Grade[]).map((g) => (
                  <Button key={g} size="sm" variant={g === 'good' ? 'primary' : 'secondary'} onClick={() => grade(g)}>{GRADE_LABELS[g]}</Button>
                ))}
              </div>
              <p className="text-xs muted text-center">Errei = volta logo · Difícil = intervalo curto · Bom = normal · Fácil = longo</p>
            </div>
          ) : (
            <Button block onClick={() => setFlipped(true)}>Mostrar resposta</Button>
          )}
        </Card>
      )}
    </Screen>
  )
}
