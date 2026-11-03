// Chamadas dos lembretes. Cada uma vem de um mascote (ícone em public/mascots/<id>.png)
// e combina com o papel dele no app. Três grupos, um por aviso do dia:
// 1º (18h) convite · 2º (20h30) provocação · 3º (22h) última chamada.
// n = nome do aluno (pode faltar) · l = 'inglês' | 'alemão'

const hi = (n) => (n ? `, ${n}` : '')

export const NUDGES = [
  [
    { mascot: 'zeca', title: 'Zeca: bora jogar?', body: (n, l) => `Uma rodada de ${l}${hi(n)}. Cinco minutos e eu já começo a pular.` },
    { mascot: 'tico', title: 'Tico tem uma regra nova', body: (n, l) => `Cabe numa linha e você aprende hoje${hi(n)}. Vem ver em ${l}?` },
    { mascot: 'lu', title: 'Lu: escuta só isso', body: (n, l) => `Separei uma frase em ${l} para você ouvir${hi(n)}. Aposto que você entende.` },
    { mascot: 'rafa', title: 'Rafa quer conversar', body: (n, l) => `Fala comigo em ${l}${hi(n)}! Só uma frase, prometo.` },
    { mascot: 'nina', title: 'Nina guardou umas palavras', body: (n) => `Será que você ainda lembra delas${hi(n)}? Vem testar.` },
    { mascot: 'dudu', title: 'Dudu está contando', body: (n) => `Hoje ainda não contou${hi(n)}. Uma aula e o dia entra no placar.` },
    { mascot: 'bia', title: 'Bia: sem pressa', body: (n, l) => `Senta, respira e faz uma aula de ${l}${hi(n)}. Errar aqui é permitido.` },
    { mascot: 'zeca', title: 'Zeca desafia você', body: (n) => `Acerta 3 seguidas hoje${hi(n)}? Eu acho que consegue.` },
  ],
  [
    { mascot: 'dudu', title: 'Dudu: o placar está zerado', body: (n) => `Ainda dá tempo${hi(n)}. Uma aula e o dia de hoje vira ponto.` },
    { mascot: 'zeca', title: 'Zeca está entediado', body: (n, l) => `Sem ${l} hoje, nada de comemoração${hi(n)}. Me dá um motivo para pular?` },
    { mascot: 'tico', title: 'Tico aposta que você erra', body: (n) => `Tem uma pegadinha na próxima aula${hi(n)}. Duvido você acertar de primeira.` },
    { mascot: 'nina', title: 'Nina: a memória esfria', body: (n) => `As palavras de ontem estão escapando${hi(n)}. Dois minutos de revisão seguram elas.` },
    { mascot: 'lu', title: 'Lu está com a orelha em pé', body: (n, l) => `Cadê você${hi(n)}? Tem ditado de ${l} esperando.` },
    { mascot: 'rafa', title: 'Rafa: quem fala, aprende', body: (n, l) => `Já falou ${l} hoje${hi(n)}? Uma frase em voz alta vale o dia.` },
    { mascot: 'bia', title: 'Bia guardou seu lugar', body: (n) => `A aula está do jeito que você deixou${hi(n)}. É só continuar.` },
    { mascot: 'tico', title: 'Tico: rapidinho', body: (n, l) => `Uma regra, três exercícios, pronto${hi(n)}. Bora de ${l}?` },
  ],
  [
    { mascot: 'dudu', title: 'Dudu: última chance de hoje', body: (n) => `O dia acaba e o placar fecha${hi(n)}. Uma aula e você dorme com ponto.` },
    { mascot: 'zeca', title: 'Zeca não quer dormir triste', body: (n, l) => `Uma rodada de ${l} antes de deitar${hi(n)}? Eu comemoro baixinho.` },
    { mascot: 'nina', title: 'Nina: revisão de travesseiro', body: (n) => `O que você revisa antes de dormir gruda melhor${hi(n)}. Três cartões e pronto.` },
    { mascot: 'bia', title: 'Bia: sem culpa', body: (n) => `Cinco minutos ainda contam${hi(n)}. Amanhã você agradece.` },
    { mascot: 'lu', title: 'Lu: uma frase para sonhar', body: (n, l) => `Ouve uma frase em ${l} e vai dormir${hi(n)}. Só isso.` },
    { mascot: 'rafa', title: 'Rafa: boa noite em outra língua?', body: (n, l) => `Diz boa noite em ${l}${hi(n)}. Vem que eu te mostro como.` },
    { mascot: 'tico', title: 'Tico: uma regra antes de dormir', body: (n) => `Cabe numa linha${hi(n)}. Lê, faz um exercício e pronto.` },
    { mascot: 'dudu', title: 'Dudu fica acordado esperando', body: (n) => `Enquanto você não estudar, eu não durmo${hi(n)}. Uma aula e apagamos a luz.` },
  ],
]

/** Dia corrido desde 1970 para uma data AAAA-MM-DD. */
const dayNumber = (date) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000)

function hash(s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** Escolhe a chamada do aviso `stage` (0..2) do dia: troca a cada dia e varia entre alunos. */
export function pickNudge(stage, date, seed, name, lang) {
  const pool = NUDGES[stage]
  const m = pool[(dayNumber(date) + hash(seed)) % pool.length]
  return { mascot: m.mascot, title: m.title, body: m.body(name, lang) }
}
