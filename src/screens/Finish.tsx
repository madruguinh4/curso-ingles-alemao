import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { lessonsFor, lessonsForWeek, contentStats } from '../lib/content'
import { weeksFor } from '../content/curriculum'
import { CONTINUITY } from '../content/continuity'
import { skillScores, demonstratedObjectives, completedCount } from '../lib/progress'
import { cardsCsv, kitHtml, download } from '../lib/export'
import { todayISO } from '../lib/dates'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { useProfile } from '../state/useTheme'
import { Button, Card, Notice, Screen, Spinner } from '../components/ui'

export function Finish() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const p = useProfile()
  const eid = e?.id ?? -1
  const attempts = useLiveQuery(() => db.attempts.where('enrollmentId').equals(eid).toArray(), [eid])
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const errors = useLiveQuery(() => db.errors.where('enrollmentId').equals(eid).toArray(), [eid])
  if (loading || !e || !attempts || !completions || !errors) return <Spinner />

  const lang = e.language
  const lessons = lessonsFor(lang)
  const weeks = weeksFor(lang)
  const stats = contentStats(lang)
  const done = completedCount(completions)
  const objectives = demonstratedObjectives(weeks, completions, attempts, lessonsForWeek)
  const name = p.name || 'Aluno(a)'
  const stamp = todayISO()

  const kit = () => download(`kit-${lang}-${stamp}.html`, kitHtml({ lang, weeks, lessons, errors, scores: skillScores(attempts), objectives, name, completedLessons: done }), 'text/html')
  const csv = () => download(`cartoes-${lang}-${stamp}.csv`, cardsCsv(lessons, lang), 'text/csv')

  return (
    <Screen title={`Conclusão — ${LANGUAGE_NAMES[lang]}`}>
      <div className="grid gap-4">
        <Card>
          <p>Você concluiu <b>{done} de {stats.lessons}</b> aulas existentes e demonstrou <b>{objectives.length}</b> objetivo(s) comunicativo(s).</p>
          <p className="text-sm muted mt-1">O curso completo prevê 26 semanas; hoje existem aulas em {stats.weeksWithLessons}. Esta tela nunca fica bloqueada: o kit é seu a qualquer momento.</p>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Seu kit de continuidade</h2>
          <p className="text-sm mb-3">Um arquivo HTML autocontido com resumo, guia de gramática, vocabulário, seus erros e correções, exercícios com respostas, relatório por habilidade, plano de 90 dias e orientações para praticar fora do app. Abra no navegador e use <b>Imprimir → Salvar como PDF</b> se quiser.</p>
          <Button block onClick={kit}>Baixar kit (HTML)</Button>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Seus cartões de revisão</h2>
          <p className="text-sm mb-3">CSV com 3 colunas (frente, verso, exemplo) — importa direto no Anki ou em qualquer app de flashcards. Em alemão, a frente traz artigo e plural.</p>
          <Button variant="secondary" block onClick={csv}>Baixar cartões (CSV)</Button>
        </Card>

        <Notice>
          Os arquivos ficam no seu aparelho e funcionam sem o app, sem conta e sem internet. Não há assinatura nem link temporário. Áudio para download não está incluído: sem direitos de distribuição de vozes, o app não gera arquivos de áudio.
        </Notice>

        <Card>
          <h2 className="font-bold mb-2">Primeiros 30 dias sem o app</h2>
          <ul className="list-disc pl-5 grid gap-1 text-sm">{CONTINUITY[lang].plan[0].items.map((i) => <li key={i}>{i}</li>)}</ul>
          <p className="text-xs muted mt-2">O plano completo de 90 dias está no kit.</p>
        </Card>
      </div>
    </Screen>
  )
}
