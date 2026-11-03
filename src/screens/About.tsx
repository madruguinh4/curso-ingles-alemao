import { Card, Screen } from '../components/ui'
import { Mascot, MASCOTS, MASCOT_ORDER } from '../components/mascots/Mascots'
import { TOTAL_MONTHS, TOTAL_WEEKS } from '../content/curriculum'

export function About() {
  return (
    <Screen title="Sobre o curso" back="/more">
      <div className="grid gap-4">
        <Card>
          <h2 className="font-bold mb-2">O que este curso é</h2>
          <ul className="list-disc pl-5 grid gap-1 text-sm">
            <li>{TOTAL_WEEKS} semanas em {TOTAL_MONTHS} etapas, com um objetivo prático por semana (“pedir uma refeição”, “resolver um check-in”).</li>
            <li>Aulas curtas, uma ideia por tela: uma frase com áudio, a regra em uma linha e logo um exercício.</li>
            <li>Gramática sem jargão: padrões simples como “Eu sou = I'm”.</li>
            <li>Revisão espaçada do vocabulário e acompanhamento por habilidade: ouvir, ler, escrever, falar.</li>
            <li>Você estuda quando pode. O app registra os dias de estudo, sem cobrar.</li>
            <li>No fim, um kit exportável para continuar sozinho — o objetivo é você não precisar mais do app.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-3">A turma</h2>
          <ul className="grid gap-3">
            {MASCOT_ORDER.map((id) => (
              <li key={id} className="flex items-center gap-3">
                <Mascot id={id} size={48} decorative />
                <span><b>{MASCOTS[id].name}</b>, {MASCOTS[id].animal}<span className="block text-sm muted">{MASCOTS[id].role}</span></span>
              </li>
            ))}
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
