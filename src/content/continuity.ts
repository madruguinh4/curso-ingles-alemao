import type { Language } from '../lib/types'

// Plano de prática independente (90 dias) e orientações para continuar sem o
// app. Só recursos gratuitos e de acesso aberto. Faz parte do kit exportado.

export interface ContinuityBlock {
  title: string
  items: string[]
}

export interface Continuity {
  plan: ContinuityBlock[]
  practice: ContinuityBlock[]
}

export const CONTINUITY: Record<Language, Continuity> = {
  en: {
    plan: [
      {
        title: 'Dias 1–30 — manter o que você construiu',
        items: [
          'Revise seus cartões todos os dias (10 min). Importe o CSV deste kit no Anki (gratuito no computador e no Android).',
          'Ouça 10 min por dia de áudio para iniciantes: BBC Learning English (6 Minute English) ou "Podcasts in English" (nível 1).',
          'Leia um texto curto por dia no News in Levels (nível 1 ou 2). Anote 3 palavras novas — e só 3.',
          'Escreva 3 frases por dia sobre o seu dia, usando o presente simples e o passado.',
          'Grave 1 minuto por dia repetindo um diálogo do curso (shadowing). Ouça e compare.',
        ],
      },
      {
        title: 'Dias 31–60 — aumentar o contato com inglês real',
        items: [
          'Assista a um episódio por semana de uma série que você já conhece, com legendas em inglês (não em português).',
          'Leia um artigo curto por semana na Simple English Wikipedia sobre um tema que você gosta.',
          'Escreva um e-mail ou mensagem por semana (trabalho, viagem, hobby). Peça correção em uma comunidade de troca (LangCorrect, r/EnglishLearning).',
          'Converse 15 min por semana com um parceiro de tandem (Tandem, HelloTalk) ou em um grupo local.',
          'Continue os cartões: 10 min por dia. Adicione as palavras novas que encontrar.',
        ],
      },
      {
        title: 'Dias 61–90 — autonomia',
        items: [
          'Escolha uma "semana temática" por vez (viagem, trabalho, saúde) e consuma só conteúdo sobre isso: vídeo, texto, conversa.',
          'Faça shadowing 5 min por dia com um trecho de podcast, imitando ritmo e sílabas fortes.',
          'Escreva um texto de 100 palavras por semana e peça correção.',
          'Converse 30 min por semana. Se não tiver parceiro, fale sozinho em voz alta sobre o seu dia e grave.',
          'No dia 90, refaça a avaliação final deste kit e compare com o resultado do curso.',
        ],
      },
    ],
    practice: [
      {
        title: 'Leitura',
        items: ['News in Levels (notícias em 3 níveis)', 'Simple English Wikipedia', 'Graded readers (livros por nível) — muitos gratuitos no Project Gutenberg e em bibliotecas', 'Legendas em inglês em tudo o que assistir'],
      },
      {
        title: 'Áudio',
        items: ['BBC Learning English — 6 Minute English', 'Podcasts in English (níveis 1–3)', 'YouTube com legendas em inglês, velocidade 0,75 no começo', 'Áudios do seu próprio celular: repita e grave'],
      },
      {
        title: 'Escrita',
        items: ['Diário de 3 frases por dia', 'LangCorrect (correção por nativos, gratuito)', 'Reescreva mensagens que você mandou em português, em inglês', 'Releia seus erros deste kit uma vez por mês'],
      },
      {
        title: 'Conversação',
        items: ['Tandem / HelloTalk (troca com nativos que aprendem português)', 'Grupos de conversação da sua cidade (bibliotecas, universidades, meetups)', 'Falar sozinho em voz alta: descreva o que está fazendo', 'Sombrear (shadowing) diálogos: ouvir e repetir junto'],
      },
    ],
  },
  de: {
    plan: [
      {
        title: 'Dias 1–30 — manter o que você construiu',
        items: [
          'Revise seus cartões todos os dias (10 min) — sempre com artigo e plural. Importe o CSV deste kit no Anki.',
          'Ouça 10 min por dia: "Slow German" (podcast) ou "Langsam gesprochene Nachrichten" da Deutsche Welle.',
          'Leia uma notícia por dia no Nachrichtenleicht (notícias em alemão simples, Deutschlandfunk).',
          'Escreva 3 frases por dia e marque o caso de cada artigo (Nom / Akk / Dat).',
          'Grave 1 minuto por dia repetindo um diálogo do curso. Preste atenção na posição do verbo.',
        ],
      },
      {
        title: 'Dias 31–60 — aumentar o contato com alemão real',
        items: [
          'Assista a um vídeo por semana do Easy German (YouTube), com legendas em alemão.',
          'Faça uma unidade por semana do "Nicos Weg" (curso gratuito da Deutsche Welle, A1–B1).',
          'Escreva um e-mail formal e uma mensagem informal por semana. Peça correção (LangCorrect, r/German).',
          'Converse 15 min por semana com um parceiro de tandem (Tandem, HelloTalk) ou em um Stammtisch local.',
          'Toda semana, revise a tabela de casos e escolha 5 substantivos novos com artigo e plural.',
        ],
      },
      {
        title: 'Dias 61–90 — autonomia',
        items: [
          'Escolha uma "semana temática" por vez (Wohnungssuche, Arbeit, Arzt) e consuma só conteúdo sobre isso.',
          'Faça shadowing 5 min por dia com um trecho do Easy German, imitando a entonação.',
          'Escreva um texto de 100 palavras por semana e peça correção. Confira os casos e a posição do verbo antes de enviar.',
          'Converse 30 min por semana. Sem parceiro, fale sozinho em voz alta e grave.',
          'No dia 90, refaça a avaliação final deste kit e compare com o resultado do curso.',
        ],
      },
    ],
    practice: [
      {
        title: 'Leitura',
        items: ['Nachrichtenleicht (Deutschlandfunk) — notícias em alemão simples', 'Deutsche Welle — Deutsch lernen (textos por nível)', 'Livros infantis e graded readers A2', 'Legendas em alemão em tudo o que assistir'],
      },
      {
        title: 'Áudio',
        items: ['Slow German (podcast)', 'Easy German (YouTube, com legendas em alemão e inglês)', 'Deutsche Welle — Langsam gesprochene Nachrichten', 'Nicos Weg (curso gratuito em vídeo, DW)'],
      },
      {
        title: 'Escrita',
        items: ['Diário de 3 frases por dia, marcando os casos', 'LangCorrect (correção por nativos, gratuito)', 'Reescreva mensagens que você mandou em português, em alemão', 'Releia seus erros deste kit uma vez por mês'],
      },
      {
        title: 'Conversação',
        items: ['Tandem / HelloTalk (troca com nativos que aprendem português)', 'Stammtisch de alemão na sua cidade; eventos do Goethe-Institut', 'Falar sozinho em voz alta: descreva o que está fazendo', 'Sombrear (shadowing) diálogos: ouvir e repetir junto'],
      },
    ],
  },
}
