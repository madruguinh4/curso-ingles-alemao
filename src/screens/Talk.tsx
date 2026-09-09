import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { lessonsFor } from '../lib/content'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment } from '../state/useEnrollments'
import { Card, Notice, Screen, Spinner } from '../components/ui'
import { Say } from '../components/Say'

const SCENARIOS = ['Apresentação pessoal', 'Restaurante e supermercado', 'Aeroporto e hotel', 'Entrevista de emprego', 'Reunião de trabalho', 'Consulta médica', 'Conversa com colegas', 'Busca de moradia e mudança de país']

export function Talk() {
  const { enrollmentId } = useParams()
  const { enrollment: e, loading } = useActiveEnrollment(enrollmentId)
  const eid = e?.id ?? -1
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  if (loading || !e || !completions) return <Spinner />
  const lang = e.language
  const done = new Set(completions.filter((c) => c.completedAt).map((c) => c.lessonId))
  const prompts = lessonsFor(lang).filter((l) => l.production.skill === 'speaking')

  return (
    <Screen title={`Conversação — ${LANGUAGE_NAMES[lang]}`}>
      <div className="grid gap-4">
        <Notice kind="warn">
          <b>O tutor de conversação com IA não está nesta versão.</b> Ele exige um servidor para guardar as chaves das APIs de IA, transcrição e voz — colocar chaves dentro do app seria inseguro. Reconhecimento de voz e avaliação de pronúncia também ficam de fora; o app não finge que avalia sua fala.
        </Notice>

        <Card>
          <h2 className="font-bold mb-2">Cenários planejados para o tutor</h2>
          <ul className="grid gap-1">{SCENARIOS.map((s) => <li key={s}>• {s} <span className="chip">planejado</span></li>)}</ul>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">O que dá para praticar agora</h2>
          <p className="text-sm muted mb-3">Roteiros de produção oral das aulas. Grave no seu celular, ouça, compare com o modelo e repita. Foque em ser entendido — sotaque não é erro.</p>
          <ul className="grid gap-3">
            {prompts.map((l) => (
              <li key={l.id} className="border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <p className="font-semibold">{l.title} {done.has(l.id) && <span className="chip">concluída</span>}</p>
                <p className="text-sm">{l.production.prompt}</p>
                <p className="text-sm mt-1"><i>{l.production.model}</i> <Say text={l.production.model} lang={lang} /></p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">Conversar com pessoas de verdade</h2>
          <p className="text-sm">Troca de idiomas (Tandem, HelloTalk) com nativos que aprendem português, grupos de conversação na sua cidade, ou um parceiro do curso. 15 minutos por semana já fazem diferença — e é isso que o plano de 90 dias do kit final recomenda.</p>
        </Card>
      </div>
    </Screen>
  )
}
