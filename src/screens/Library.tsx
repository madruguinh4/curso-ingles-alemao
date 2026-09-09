import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search } from 'lucide-react'
import { db } from '../lib/db'
import { lessonsFor } from '../lib/content'
import { GLOSSARY } from '../content/glossary'
import { vocabFront } from '../lib/export'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Screen, SectionTitle, Spinner } from '../components/ui'
import { Say, NoVoiceNotice } from '../components/Say'
import { Md } from '../components/Md'

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
  const terms = GLOSSARY.filter((t) => hit(t.key, t.title, t.definition))

  return (
    <Screen title="Biblioteca" subtitle={LANGUAGE_NAMES[lang]}>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 muted" aria-hidden="true" />
        <input className="input pl-10" placeholder="Buscar palavra, tradução ou termo…" value={q} onChange={(ev) => setQ(ev.target.value)} aria-label="Buscar" />
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

      <SectionTitle>Gramática</SectionTitle>
      <div className="grid gap-3">
        {lessons.filter((l) => hit(l.explanation.title, l.explanation.body, l.title)).map((l) => (
          <details key={l.id} className="card">
            <summary className="font-semibold cursor-pointer">{l.explanation.title} <span className="muted text-sm">({l.title})</span></summary>
            <Md block className="mt-2" text={l.explanation.body} />
          </details>
        ))}
      </div>

      <SectionTitle>Termos de gramática</SectionTitle>
      <p className="text-sm muted mb-2">Tudo o que o curso usa para explicar, em português simples. Estes termos aparecem sublinhados nas aulas.</p>
      <div className="grid gap-2">
        {terms.map((t) => (
          <details key={t.key} className="card-flat">
            <summary className="font-semibold cursor-pointer">{t.title}</summary>
            <p className="text-sm mt-1">{t.definition}</p>
            <p className="text-sm muted mt-1"><i>{t.example}</i></p>
          </details>
        ))}
      </div>
    </Screen>
  )
}
