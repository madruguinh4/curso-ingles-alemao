import { useState, type MouseEvent } from 'react'
import { inlineMarkdown, miniMarkdown } from '../lib/export'
import { getTerm } from '../content/glossary'
import { X, BookOpen } from 'lucide-react'

// Texto do conteúdo: **negrito**, *itálico*, listas e termos [[glossário]].
// Um toque no termo abre a definição logo abaixo — o aluno nunca fica sem
// saber o que é "contração" ou "dativo".

export function Md({ text, className = '', block = false }: { text: string; className?: string; block?: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  const html = { __html: block ? miniMarkdown(text) : inlineMarkdown(text) }

  const onClick = (e: MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-term]')
    if (!btn) return
    e.preventDefault()
    const key = btn.dataset.term!
    setOpen((cur) => (cur === key ? null : key))
  }

  const term = open ? getTerm(open) : undefined
  const Tag = block ? 'div' : 'span'
  return (
    <>
      <Tag className={`${block ? 'prose' : ''} ${className}`} onClick={onClick} dangerouslySetInnerHTML={html} />
      {term && (
        <aside role="note" className="term-card mt-2" aria-label={`Definição de ${term.title}`}>
          <div className="flex items-start gap-2">
            <BookOpen size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div className="grow">
              <p className="font-bold">{term.title}</p>
              <p className="text-sm mt-1">{term.definition}</p>
              <p className="text-sm mt-1 muted"><i>{term.example}</i></p>
            </div>
            <button type="button" className="btn btn-ghost px-1 py-0 min-h-0" aria-label="Fechar definição" onClick={() => setOpen(null)}><X size={18} /></button>
          </div>
        </aside>
      )}
    </>
  )
}
