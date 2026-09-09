import { Card, Screen } from '../components/ui'
import { TOTAL_MONTHS, TOTAL_WEEKS } from '../content/curriculum'

export function About() {
  return (
    <Screen title="Sobre o curso" back="/more">
      <div className="grid gap-4">
        <Card>
          <h2 className="font-bold mb-2">O que este curso é</h2>
          <ul className="list-disc pl-5 grid gap-1 text-sm">
            <li>{TOTAL_WEEKS} semanas em {TOTAL_MONTHS} etapas, com um objetivo prático por semana (“pedir uma refeição”, “resolver um check-in”).</li>
            <li>Aulas com diálogo, explicação em português, exercícios, produção própria e uma tarefa fora do app.</li>
            <li>Todo termo de gramática é explicado quando aparece — toque nas palavras sublinhadas.</li>
            <li>Revisão espaçada do vocabulário e acompanhamento por habilidade: ouvir, ler, escrever, falar.</li>
            <li>Você estuda quando pode. O app registra os dias de estudo, sem cobrar.</li>
            <li>No fim, um kit exportável para continuar sozinho — o objetivo é você não precisar mais do app.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-2">O que este curso não é</h2>
          <ul className="list-disc pl-5 grid gap-1 text-sm">
            <li>Não promete fluência. As metas seguem o seu nível inicial e o tempo que você dedica.</li>
            <li>Usa os níveis A1–B1 do Quadro Europeu só para organizar o conteúdo. As verificações internas não são certificações.</li>
            <li>Não tem vidas, castigos por faltar nem bloqueios.</li>
            <li>Nesta versão não há tutor de IA nem reconhecimento de voz — o app avisa onde isso faria diferença.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-2">Metas realistas</h2>
          <p className="text-sm">Com as {TOTAL_WEEKS} semanas cumpridas, o esperado é uma base sólida de A1–A2 e transição para B1 nas habilidades que você mais praticar. Um nível oficial exige um exame reconhecido (Cambridge, IELTS, Goethe, telc).</p>
        </Card>
      </div>
    </Screen>
  )
}
