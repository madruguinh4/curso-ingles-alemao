import { inlineMarkdown, miniMarkdown } from '../lib/export'

// Texto do conteúdo: **negrito**, *itálico* e listas.

export function Md({ text, className = '', block = false }: { text: string; className?: string; block?: boolean }) {
  const html = { __html: block ? miniMarkdown(text) : inlineMarkdown(text) }
  const Tag = block ? 'div' : 'span'
  return <Tag className={`${block ? 'prose' : ''} ${className}`} dangerouslySetInnerHTML={html} />
}
