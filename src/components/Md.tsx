import { inlineMarkdown } from '../lib/export'

/** Texto do conteúdo com ênfase inline (**negrito**, *itálico*). O conteúdo é nosso e é escapado antes. */
export function Md({ text, className = '', block = false }: { text: string; className?: string; block?: boolean }) {
  const html = { __html: inlineMarkdown(text) }
  return block ? <p className={className} dangerouslySetInnerHTML={html} /> : <span className={className} dangerouslySetInnerHTML={html} />
}
