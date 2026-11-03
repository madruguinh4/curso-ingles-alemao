import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search } from 'lucide-react'
import { db } from '../lib/db'
import { lessonsFor } from '../lib/content'
import { vocabFront } from '../lib/export'
import { LANGUAGE_NAMES, type LearnStep } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Screen, SectionTitle, Spinner } from '../components/ui'
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
    <Screen title="Biblioteca" subtitle={LANGUAGE_NAMES[lang]}>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 muted" aria-hidden="true" />
        <input className="input pl-10" placeholder="Buscar palavra ou tradução…" value={q} onChange={(ev) => setQ(ev.target.value)} aria-label="Buscar" />
      </div>
      <NoVoiceNotice lang={lang} />

      <SectionTitle>Vocabulário</SectionTitle>
      <div className="grid gap-3">
        {lessons.map((l) => {
          const items = l.vocabulary.filter((v) => hit(v.term, v.translation, v.example))
          if (!items.length) return null
          return (
            <Card key={l.id}>
              <p className="text-sm muted mb-2"><Link to={`/lesson/${eid}/${l.id}`} style={{ color: 'var(--accent)' }}>{l.title}</Link>{done.has(l.id) ? ' · concluída' : ''}</p>
              <ul className="grid gap-1">
                {items.map((v) => (
                  <li key={v.id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="grow"><b>{vocabFront(v, lang)}</b> <span className="muted">— {v.translation}</span><br /><span className="text-sm">{v.example}</span></div>
                    <Say text={v.example} lang={lang} />
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      <SectionTitle>Regras</SectionTitle>
      <div className="grid gap-3">
        {lessons.map((l) => {
          const rules = l.steps.filter((st): st is LearnStep => st.type === 'learn' && !!st.rule && hit(st.rule, st.text, st.translation))
          if (!rules.length) return null
          return (
            <Card key={l.id}>
              <p className="text-sm muted mb-2">{l.title}</p>
              <ul className="grid gap-2">
                {rules.map((r) => (
                  <li key={r.text} className="flex items-start gap-2">
                    <div className="grow"><b>{r.rule}</b><br /><span className="text-sm">{r.text}</span> <span className="text-sm muted">— {r.translation}</span></div>
                    <Say text={r.text} lang={lang} />
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </Screen>
  )
}
