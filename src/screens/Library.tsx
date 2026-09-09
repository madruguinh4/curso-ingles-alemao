import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { lessonsFor } from '../lib/content'
import { miniMarkdown, vocabFront } from '../lib/export'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Screen, Spinner } from '../components/ui'
import { Say, NoVoiceNotice } from '../components/Say'

export function Library() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const [q, setQ] = useState('')
  if (loading || !e || !completions) return <Spinner />
  const lang = e.language
  const lessons = lessonsFor(lang)
  const done = new Set(completions.filter((c) => c.completedAt).map((c) => c.lessonId))
  const norm = (s: string) => s.toLowerCase()
  const query = norm(q.trim())
  const hit = (...fields: string[]) => !query || fields.some((f) => norm(f).includes(query))

  return (
    <Screen title={`Biblioteca — ${LANGUAGE_NAMES[lang]}`}>
      <input className="input mb-3" placeholder="Buscar palavra, tradução ou tema…" value={q} onChange={(ev) => setQ(ev.target.value)} aria-label="Buscar" />
      <NoVoiceNotice lang={lang} />
      <h2 className="text-lg font-bold mt-2 mb-2">Vocabulário</h2>
      <div className="grid gap-3">
        {lessons.map((l) => {
          const items = l.vocabulary.filter((v) => hit(v.term, v.translation, v.example))
          if (!items.length) return null
          return (
            <Card key={l.id}>
              <p className="text-sm muted mb-2"><Link to={`/lesson/${eid}/${l.id}`} style={{ color: 'var(--accent)' }}>{l.title}</Link>{done.has(l.id) ? ' · concluída' : ''}</p>
              <ul className="grid gap-1">
                {items.map((v) => (
                  <li key={v.id} className="flex items-center gap-2 py-1 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="grow"><b>{vocabFront(v, lang)}</b> <span className="muted">— {v.translation}</span><br /><span className="text-sm">{v.example}</span></div>
                    <Say text={v.example} lang={lang} />
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
      <h2 className="text-lg font-bold mt-6 mb-2">Gramática</h2>
      <div className="grid gap-3">
        {lessons.filter((l) => hit(l.explanation.title, l.explanation.body, l.title)).map((l) => (
          <details key={l.id} className="card">
            <summary className="font-semibold cursor-pointer">{l.explanation.title} <span className="muted text-sm">({l.title})</span></summary>
            <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: miniMarkdown(l.explanation.body) }} />
          </details>
        ))}
      </div>
    </Screen>
  )
}
