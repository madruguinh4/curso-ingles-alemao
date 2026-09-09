import type { ErrorLog } from './db'
import type { Exercise, Language, Lesson, VocabItem, Week } from './types'
import { LANGUAGE_NAMES, SKILL_NAMES } from './types'
import type { SkillScore } from './progress'
import { CONTINUITY } from '../content/continuity'
import { MONTH_TITLES } from '../content/curriculum'
import { formatBR } from './dates'
import { getTerm, termsIn } from '../content/glossary'

// Kit de encerramento: gerado localmente a partir do que já está no aparelho.
// Não depende de assinatura, servidor nem link temporário.

export function csvCell(s: string): string {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function vocabFront(v: VocabItem, lang: Language): string {
  return lang === 'de' && v.noun ? `${v.article} ${v.term}, ${v.plural}` : v.term
}

/** CSV de 3 colunas (front, back, example) — importa direto no Anki. */
export function cardsCsv(lessons: Lesson[], lang: Language): string {
  const rows: string[][] = [['front', 'back', 'example']]
  for (const l of lessons) for (const v of l.vocabulary) rows.push([vocabFront(v, lang), v.translation, v.example])
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n'
}

export interface KitInput {
  lang: Language
  weeks: Week[]
  lessons: Lesson[]
  errors: ErrorLog[]
  scores: SkillScore[]
  objectives: Week[]
  name: string
  completedLessons: number
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type TermMode = 'button' | 'abbr'

/** Ênfase inline (**negrito**, *itálico*) e termos [[glossário]] ou [[termo|texto]]. Escapa HTML antes. */
export function inlineMarkdown(s: string, terms: TermMode = 'button'): string {
  const withTerms = esc(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, key: string, text?: string) => {
    const k = key.trim()
    const label = (text ?? k).trim()
    const t = getTerm(k)
    if (terms === 'abbr') return `<abbr title="${esc(t?.definition ?? '')}">${label}</abbr>`
    return `<button type="button" class="term" data-term="${esc(k)}">${label}</button>`
  })
  return withTerms.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
}

/** Markdown mínimo usado nas explicações: ênfase, termos, parágrafos e listas com "- ". */
export function miniMarkdown(md: string, terms: TermMode = 'button'): string {
  const inline = (s: string) => inlineMarkdown(s, terms)
  return md
    .split(/\n\s*\n/)
    .map((p) => {
      const lines = p.split('\n')
      if (lines.every((l) => l.trim().startsWith('- '))) return `<ul>${lines.map((l) => `<li>${inline(l.trim().slice(2))}</li>`).join('')}</ul>`
      return `<p>${lines.map(inline).join('<br>')}</p>`
    })
    .join('')
}

function exerciseAnswer(e: Exercise): string {
  switch (e.type) {
    case 'choice': return e.options[e.answer]
    case 'gap': return e.answers.join(' / ')
    case 'order': return e.answer
    case 'transform': return e.answers.join(' / ')
    case 'dictation': return e.text
    case 'free': return e.model
  }
}

function exercisePrompt(e: Exercise): string {
  switch (e.type) {
    case 'choice': return `${e.prompt} (${e.options.join(' · ')})`
    case 'transform': return `${e.prompt} — ${e.instruction}`
    case 'dictation': return `Ditado: ouça e escreva. (${e.answers.length} forma(s) aceita(s))`
    case 'order': return `Ordene: ${e.tokens.join(' / ')}`
    default: return e.prompt
  }
}

export function kitHtml(k: KitInput): string {
  const langName = LANGUAGE_NAMES[k.lang]
  const cont = CONTINUITY[k.lang]
  const weeksWithLessons = k.weeks.filter((w) => k.lessons.some((l) => l.weekId === w.id))
  const objectiveIds = new Set(k.objectives.map((w) => w.id))
  const total = k.lessons.length

  const summary = `
    <p>Aluno(a): <b>${esc(k.name)}</b> · Idioma: <b>${langName}</b></p>
    <p>Aulas concluídas: <b>${k.completedLessons} de ${total}</b> aulas existentes, em ${weeksWithLessons.length} semana(s) com conteúdo.</p>
    <ul>${weeksWithLessons.map((w) => `<li><b>Semana ${w.number}</b> (${MONTH_TITLES[w.month]}, ${w.level}) — ${esc(w.title)}: <i>${esc(w.canDo)}</i>${objectiveIds.has(w.id) ? ' ✔ objetivo demonstrado' : ''}</li>`).join('')}</ul>
    <p class="note">Este resumo é uma verificação interna do curso. Não é um nível oficial nem substitui um exame reconhecido.</p>`

  const grammar = k.lessons.map((l) => `
    <article><h3>${esc(l.title)} <small>(${l.id})</small></h3>
    <h4>${esc(l.explanation.title)}</h4>${miniMarkdown(l.explanation.body, 'abbr')}
    <ul>${l.explanation.examples.map((x) => `<li><b>${esc(x.text)}</b> — ${esc(x.translation)}</li>`).join('')}</ul></article>`).join('')
  const usedTerms = [...new Set(k.lessons.flatMap((l) => termsIn(l.explanation.body)).map((t) => t.toLowerCase()))].map(getTerm).filter((t) => !!t)
  const glossary = usedTerms.length
    ? `<h3>Termos de gramática usados no curso</h3><dl>${usedTerms.map((t) => `<dt><b>${esc(t.title)}</b></dt><dd>${esc(t.definition)}<br><small><i>${esc(t.example)}</i></small></dd>`).join('')}</dl>`
    : ''

  const vocab = k.lessons.map((l) => `
    <h3>${esc(l.title)}</h3><table><thead><tr><th>${langName}</th><th>Português</th><th>Exemplo</th></tr></thead><tbody>
    ${l.vocabulary.map((v) => `<tr><td><b>${esc(vocabFront(v, k.lang))}</b></td><td>${esc(v.translation)}</td><td>${esc(v.example)}<br><small>${esc(v.exampleTranslation)}</small></td></tr>`).join('')}
    </tbody></table>`).join('')

  const errors = k.errors.length
    ? `<table><thead><tr><th>Data</th><th>Pergunta</th><th>Você escreveu</th><th>Correto</th><th>Por quê</th></tr></thead><tbody>
       ${k.errors.map((e) => `<tr><td>${formatBR(e.at.slice(0, 10))}</td><td>${esc(e.prompt)}</td><td class="wrong">${esc(e.given)}</td><td class="right">${esc(e.expected)}</td><td>${inlineMarkdown(e.explanation, 'abbr')}</td></tr>`).join('')}
       </tbody></table>`
    : '<p>Nenhum erro registrado ainda. Erros são a parte mais útil deste relatório — continue praticando.</p>'
  const commonErrors = k.lessons.map((l) => `<h4>${esc(l.title)}</h4><ul>${l.feedback.commonErrors.map((c) => `<li><span class="wrong">${esc(c.wrong)}</span> → <span class="right">${esc(c.right)}</span><br><small>${inlineMarkdown(c.why, 'abbr')}</small></li>`).join('')}</ul>`).join('')

  const exercises = k.lessons.map((l) => `
    <h3>${esc(l.title)}</h3><ol>
    ${[...l.guided, l.production].map((e) => `<li>${inlineMarkdown(exercisePrompt(e), 'abbr')}<br><b>Resposta:</b> ${esc(exerciseAnswer(e))}${'explanation' in e ? `<br><small>${inlineMarkdown(e.explanation, 'abbr')}</small>` : ''}</li>`).join('')}
    </ol>`).join('')

  const skills = `<table><thead><tr><th>Habilidade</th><th>Tentativas</th><th>Acerto</th></tr></thead><tbody>
    ${k.scores.map((s) => `<tr><td>${SKILL_NAMES[s.skill]}</td><td>${s.attempts}</td><td>${s.accuracy === null ? '<i>sem evidência ainda</i>' : Math.round(s.accuracy * 100) + '%'}</td></tr>`).join('')}
    </tbody></table>
    <p class="note">Os números vêm dos exercícios automáticos. Fala e escrita livre foram auto-avaliadas — o app não tem reconhecimento de voz nem correção automática de textos. Use este relatório para escolher o que praticar, não como medida de nível.</p>`

  const plan = cont.plan.map((b) => `<h3>${esc(b.title)}</h3><ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`).join('')
  const practice = cont.practice.map((b) => `<h3>${esc(b.title)}</h3><ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`).join('')

  const section = (n: number, title: string, body: string) => `<section><h2>${n}. ${title}</h2>${body}</section>`

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kit de continuidade — ${langName} — ${esc(k.name)}</title>
<style>
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#0f172a;background:#fff}
  h1{font-size:1.8rem;margin:0 0 .25rem} h2{font-size:1.35rem;border-bottom:2px solid #2563eb;padding-bottom:.25rem;margin-top:2.5rem} h3{font-size:1.1rem;margin-top:1.5rem} h4{margin:.75rem 0 .25rem}
  table{border-collapse:collapse;width:100%;font-size:.95rem} th,td{border:1px solid #cbd5e1;padding:.4rem .5rem;text-align:left;vertical-align:top} th{background:#f1f5f9}
  .note{background:#fef3c7;border-left:4px solid #b45309;padding:.5rem .75rem;font-size:.9rem} .wrong{color:#b91c1c;text-decoration:line-through} .right{color:#15803d;font-weight:600}
  small{color:#475569} nav a{margin-right:.75rem} section{page-break-inside:avoid}
  @media print{body{margin:0;max-width:none} nav{display:none} h2{page-break-before:always} h2:first-of-type{page-break-before:auto}}
</style></head><body>
<h1>Kit de continuidade — ${langName}</h1>
<p>Gerado pelo app em ${formatBR(new Date().toISOString().slice(0, 10))}. Este arquivo é seu: funciona sem o app, sem conta e sem internet. Imprima ou salve como PDF pelo navegador.</p>
<nav><a href="#s1">Resumo</a><a href="#s2">Gramática</a><a href="#s3">Vocabulário</a><a href="#s4">Erros</a><a href="#s5">Exercícios</a><a href="#s6">Habilidades</a><a href="#s7">90 dias</a><a href="#s8">Continuar</a></nav>
<div id="s1">${section(1, 'Resumo do que você estudou', summary)}</div>
<div id="s2">${section(2, 'Guia de gramática', glossary + grammar)}</div>
<div id="s3">${section(3, 'Vocabulário e expressões', vocab)}</div>
<div id="s4">${section(4, 'Erros e correções', `<h3>Seus erros registrados</h3>${errors}<h3>Erros comuns de brasileiros vistos no curso</h3>${commonErrors}`)}</div>
<div id="s5">${section(5, 'Exercícios com respostas', exercises)}</div>
<div id="s6">${section(6, 'Relatório por habilidade', skills)}</div>
<div id="s7">${section(7, 'Plano de 90 dias de prática independente', plan)}</div>
<div id="s8">${section(8, 'Como continuar praticando fora do app', practice)}</div>
</body></html>`
}

/** Dispara o download de um arquivo gerado localmente. */
export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
