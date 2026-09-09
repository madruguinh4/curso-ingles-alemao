import { Navigate } from 'react-router-dom'
import { Button, Card, Screen, Spinner } from '../components/ui'
import { useEnrollments } from '../state/useEnrollments'

export function Welcome() {
  const enrollments = useEnrollments()
  if (!enrollments) return <Spinner />
  if (enrollments.length) return <Navigate to="/" replace />
  return (
    <Screen>
      <div className="grid gap-4 pt-6">
        <h1 className="text-3xl font-bold leading-tight">Curso de Inglês e Alemão</h1>
        <p className="text-lg">Um curso de <b>seis meses</b>, com começo, meio e fim, feito para quem fala português.</p>
        <Card>
          <h2 className="font-bold mb-2">O que este curso é</h2>
          <ul className="list-disc pl-5 grid gap-1">
            <li>26 semanas organizadas em 6 etapas, com objetivos práticos por semana (“pedir uma refeição”, “resolver um check-in”).</li>
            <li>Aulas com diálogo, explicação em português, exercícios, produção própria e uma tarefa fora do app.</li>
            <li>Revisão espaçada do vocabulário e acompanhamento por habilidade: ouvir, ler, escrever, falar.</li>
            <li>No fim, um <b>kit exportável</b> para continuar sozinho — o objetivo é você não precisar mais do app.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-2">O que este curso não é</h2>
          <ul className="list-disc pl-5 grid gap-1">
            <li>Não promete fluência em seis meses. As metas seguem o seu nível inicial e o tempo que você tem.</li>
            <li>Usa os níveis A1–B1 do Quadro Europeu só para organizar o conteúdo. As verificações internas <b>não são</b> certificações.</li>
            <li>Não tem vidas, castigos por faltar nem bloqueios. Se você atrasar, o plano se reorganiza.</li>
          </ul>
        </Card>
        <Button to="/onboarding" block>Começar</Button>
        <p className="text-sm muted">Tudo fica salvo só neste aparelho. Nada é enviado para servidor nenhum.</p>
      </div>
    </Screen>
  )
}
