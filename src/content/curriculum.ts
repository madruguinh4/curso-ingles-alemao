import type { Language, Level, Skill, Week } from '../lib/types'

// Mapa curricular de 52 semanas (12 meses) por idioma.
// A1: meses 1–3 (semanas 1–13) · A2: meses 4–8 (14–35) · B1: meses 9–12 (36–52).
// As sequências de inglês e alemão são independentes: cada uma respeita as
// dificuldades da própria língua para falantes de português brasileiro.

export const TOTAL_WEEKS = 52
export const TOTAL_MONTHS = 12

export const MONTH_TITLES: Record<number, string> = {
  1: 'Fundamentos',
  2: 'Vida cotidiana',
  3: 'Autonomia em situações comuns',
  4: 'Passado e experiências',
  5: 'Planos, opiniões e comparações',
  6: 'Consolidação do básico',
  7: 'Aplicação aos objetivos pessoais',
  8: 'Comunicação mais desenvolvida',
  9: 'Materiais autênticos e cultura',
  10: 'Situações complexas',
  11: 'Conversa e escrita com fluência',
  12: 'Consolidação e independência',
}

const ALL: Skill[] = ['listening', 'reading', 'writing', 'speaking']
const NO_WRITING: Skill[] = ['listening', 'speaking', 'reading']

function w(
  language: Language,
  number: number,
  month: number,
  level: Level,
  title: string,
  canDo: string,
  grammar: string[],
  vocabulary: string[],
  skills: Skill[] = ALL,
): Week {
  return { id: `${language}-w${String(number).padStart(2, '0')}`, language, number, month, level, title, canDo, grammar, vocabulary, skills }
}

const EN: Week[] = [
  // ───── Mês 1 — Fundamentos (A1)
  w('en', 1, 1, 'A1', 'Apresentar-se', 'Cumprimentar, dizer nome e origem e despedir-se.',
    ['verbo to be (I / you)', 'pronomes sujeito', 'contrações I\'m / you\'re', 'sons /h/ e /θ/', 'alfabeto e soletração'],
    ['cumprimentos e despedidas', 'nome', 'países e nacionalidades'], NO_WRITING),
  w('en', 2, 1, 'A1', 'Dados pessoais', 'Dar e pedir dados pessoais básicos: idade, telefone, e-mail.',
    ['to be (he / she / it / we / they)', 'perguntas sim/não com to be', 'respostas curtas', 'artigos a / an', 'números 0–100'],
    ['idade', 'telefone e e-mail', 'profissões básicas'], NO_WRITING),
  w('en', 3, 1, 'A1', 'Horas e datas', 'Perguntar e dizer horas e datas; marcar um encontro simples.',
    ['perguntas com what / where / when / who / how', 'this / that', 'preposições de tempo at / on / in'],
    ['dias da semana', 'meses', 'horas', 'datas']),
  w('en', 4, 1, 'A1', 'Coisas ao redor', 'Descrever o que há em um lugar e dizer o que você tem.',
    ['there is / there are', 'plural regular e irregular', 'have got / have', 'this / these / that / those'],
    ['objetos do dia a dia', 'cores', 'sala de aula e escritório']),

  // ───── Mês 2 — Vida cotidiana (A1)
  w('en', 5, 2, 'A1', 'Família e pessoas', 'Apresentar a família e descrever pessoas.',
    ["possessivo 's", 'adjetivos possessivos my / your / his / her / our / their', 'adjetivos de aparência e personalidade'],
    ['família', 'aparência física', 'personalidade']),
  w('en', 6, 2, 'A1', 'Minha rotina', 'Contar sua rotina e perguntar sobre a de alguém.',
    ['present simple (I / you / we / they)', 'advérbios de frequência', 'perguntas com do'],
    ['verbos de rotina', 'horários', 'partes do dia']),
  w('en', 7, 2, 'A1', 'A rotina dos outros', 'Falar da rotina de outra pessoa e fazer perguntas sobre ela.',
    ['present simple 3ª pessoa (-s / -es)', 'does / doesn\'t', 'pronúncia de -s final'],
    ['trabalho e estudo', 'atividades de lazer', 'frequência']),
  w('en', 8, 2, 'A1', 'Comida e compras', 'Pedir uma refeição e fazer compras simples.',
    ['contáveis e incontáveis', 'some / any', 'how much / how many', 'would like'],
    ['alimentos e bebidas', 'restaurante', 'preços e pagamento']),
  w('en', 9, 2, 'A1', 'Casa e agora', 'Descrever sua casa e dizer o que as pessoas estão fazendo agora.',
    ['preposições de lugar', 'present continuous', 'there is / are (revisão)'],
    ['cômodos e móveis', 'tarefas domésticas', 'ações em andamento']),

  // ───── Mês 3 — Autonomia em situações comuns (A1)
  w('en', 10, 3, 'A1', 'Transporte e direções', 'Pedir e dar direções; comprar uma passagem.',
    ['imperativo', 'can / can\'t (habilidade e permissão)', 'preposições de movimento'],
    ['transportes', 'lugares na cidade', 'direções']),
  w('en', 11, 3, 'A1', 'Viagem e hotel', 'Fazer uma reserva, resolver o check-in e um problema no quarto.',
    ['would like / I\'d like', 'Can I…? / Could you…?', 'pedidos educados'],
    ['aeroporto', 'hotel', 'reservas e problemas']),
  w('en', 12, 3, 'A1', 'Saúde e ajuda', 'Descrever um problema de saúde e pedir ajuda.',
    ['should / shouldn\'t', 'must / have to', 'perguntas com how often / how long'],
    ['partes do corpo', 'sintomas', 'farmácia e emergência']),
  w('en', 13, 3, 'A1', 'Revisão do A1', 'Resolver um problema simples (perda, atraso, reclamação) usando tudo o que aprendeu.',
    ['present simple vs present continuous', 'contrações e formas fracas (fala conectada)', 'verificação de etapa A1'],
    ['objetos perdidos', 'atrasos e cancelamentos', 'reclamações educadas']),

  // ───── Mês 4 — Passado e experiências (A2)
  w('en', 14, 4, 'A2', 'Ontem', 'Contar o que fez ontem e no fim de semana.',
    ['was / were', 'past simple regular (-ed)', 'pronúncia de -ed', 'expressões de tempo passado'],
    ['fim de semana', 'atividades passadas', 'expressões de tempo']),
  w('en', 15, 4, 'A2', 'Experiências', 'Contar uma experiência de viagem e perguntar sobre a de alguém.',
    ['past simple irregular (verbos frequentes)', 'did / didn\'t', 'perguntas no passado'],
    ['viagens', 'verbos irregulares frequentes', 'lugares e eventos']),
  w('en', 16, 4, 'A2', 'Narrar', 'Narrar uma história curta com começo, meio e fim.',
    ['past continuous', 'when / while', 'sequenciadores first / then / after that / finally'],
    ['histórias e anedotas', 'sentimentos', 'conectores de narrativa']),
  w('en', 17, 4, 'A2', 'Antigamente', 'Contar como era sua vida antes e o que mudou.',
    ['used to', 'past simple vs used to', 'expressões: when I was a child, years ago'],
    ['infância', 'mudanças de vida', 'hábitos antigos']),

  // ───── Mês 5 — Planos, opiniões e comparações (A2)
  w('en', 18, 5, 'A2', 'Planos e convites', 'Fazer planos e convites; aceitar e recusar com educação.',
    ['going to', 'present continuous para o futuro', 'expressões de tempo futuro'],
    ['eventos sociais', 'convites', 'agenda']),
  w('en', 19, 5, 'A2', 'Previsões e decisões', 'Fazer previsões, promessas e ofertas.',
    ['will / won\'t', 'Shall I…? (ofertas)', 'I think it will…'],
    ['tempo (clima)', 'promessas', 'ofertas de ajuda']),
  w('en', 20, 5, 'A2', 'Comparar', 'Comparar lugares, produtos e pessoas.',
    ['comparativos', 'superlativos', 'as … as / not as … as'],
    ['cidades', 'produtos e serviços', 'características']),
  w('en', 21, 5, 'A2', 'Opiniões', 'Dar opinião e reagir à opinião dos outros.',
    ['I think / I agree / I disagree', 'too / enough', 'adjetivos -ed / -ing (bored / boring)'],
    ['filmes e séries', 'expressões de opinião', 'sentimentos']),
  w('en', 22, 5, 'A2', 'Quantidades e artigos', 'Falar de quantidades e usar the / a / nada com precisão.',
    ['a lot of / a few / a little / much / many', 'the vs artigo zero', 'some / any / no'],
    ['compras maiores', 'quantidades', 'generalizações']),

  // ───── Mês 6 — Consolidação do básico (A2)
  w('en', 23, 6, 'A2', 'Obrigação e permissão', 'Explicar regras e pedir permissão.',
    ['must / mustn\'t', 'have to / don\'t have to', 'can / may (permissão)'],
    ['regras', 'trabalho e escola', 'sinais e avisos']),
  w('en', 24, 6, 'A2', 'Sugestões e conselhos', 'Sugerir, aconselhar e responder a sugestões.',
    ['should / shouldn\'t', 'Why don\'t we…? / Let\'s / How about…?', 'responder: Good idea / I\'d rather…'],
    ['lazer', 'problemas do dia a dia', 'conselhos']),
  w('en', 25, 6, 'A2', 'Present perfect: experiências', 'Falar de experiências de vida sem dizer quando.',
    ['present perfect (have + particípio)', 'ever / never', 'particípios frequentes'],
    ['experiências de vida', 'viagens', 'comidas e atividades']),
  w('en', 26, 6, 'A2', 'Verificação de etapa', 'Realizar tarefas integradas do primeiro semestre.',
    ['revisão integrada A1–A2 inicial', 'avaliação mensal com tarefas práticas', 'autocorreção'],
    ['revisão geral', 'vocabulário do aluno', 'situações integradas']),

  // ───── Mês 7 — Aplicação aos objetivos pessoais (A2)
  w('en', 27, 7, 'A2', 'Trabalho e estudos', 'Falar da sua experiência profissional ou acadêmica.',
    ['present perfect vs past simple', 'apresentação profissional', 'perguntas de entrevista'],
    ['profissões e áreas', 'currículo', 'habilidades']),
  w('en', 28, 7, 'A2', 'E-mails e mensagens', 'Escrever um e-mail ou mensagem para trabalho ou estudo.',
    ['registro formal e informal', 'phrasal verbs 1 (set up, find out, pick up, get back)', 'conectores and / but / so / because'],
    ['e-mail e mensagens', 'saudações e fechamentos', 'pedidos e agradecimentos'], ['reading', 'writing', 'listening', 'speaking']),
  w('en', 29, 7, 'A2', 'Mudança de país', 'Lidar com uma situação de mudança: alugar um lugar, abrir conta, documentos.',
    ['perguntas indiretas (Could you tell me…?)', 'preposições com documentos', 'vocabulário de burocracia'],
    ['moradia', 'banco', 'documentos e burocracia']),
  w('en', 30, 7, 'A2', 'Situações do seu objetivo', 'Resolver uma situação típica do seu objetivo (entrevista, aula, viagem, mudança).',
    ['role-plays guiados por objetivo', 'revisão de pedidos educados', 'vocabulário específico do objetivo'],
    ['entrevista de emprego', 'aula e universidade', 'viagem e mudança']),

  // ───── Mês 8 — Comunicação mais desenvolvida (A2)
  w('en', 31, 8, 'A2', 'Condições', 'Explicar condições e consequências.',
    ['zero conditional', 'first conditional', 'when / if / unless'],
    ['regras e consequências', 'acordos', 'planos condicionais']),
  w('en', 32, 8, 'A2', 'Present perfect: até agora', 'Falar do que começou no passado e continua.',
    ['for / since', 'just / already / yet', 'present perfect continuous (introdução)'],
    ['duração', 'mudanças recentes', 'tarefas pendentes']),
  w('en', 33, 8, 'A2', 'Gerúndio e infinitivo', 'Falar de gostos, vontades e planos com verbos combinados.',
    ['verbo + -ing (like / enjoy / stop)', 'verbo + to (want / need / decide)', 'verbos com os dois'],
    ['hobbies', 'preferências', 'decisões']),
  w('en', 34, 8, 'A2', 'Descrever pessoas, coisas e lugares', 'Descrever com detalhe usando orações relativas.',
    ['relative clauses (who / which / that / where)', 'ordem dos adjetivos', 'adjetivos compostos'],
    ['descrições', 'objetos e lugares', 'pessoas']),
  w('en', 35, 8, 'A2', 'Verificação de etapa A2', 'Realizar tarefas integradas do nível A2.',
    ['revisão integrada A2', 'avaliação com tarefas práticas', 'autocorreção'],
    ['revisão geral', 'vocabulário do aluno', 'situações integradas']),

  // ───── Mês 9 — Materiais autênticos e cultura (B1)
  w('en', 36, 9, 'B1', 'Ouvir de verdade', 'Entender a ideia principal de um áudio autêntico curto.',
    ['variedades britânica e americana', 'fala conectada avançada (linking, redução)', 'estratégias de escuta'],
    ['podcasts', 'avisos e anúncios', 'entrevistas curtas']),
  w('en', 37, 9, 'B1', 'Ler de verdade', 'Entender textos autênticos curtos e inferir palavras novas.',
    ['skimming e scanning', 'inferir vocabulário pelo contexto', 'referência (it / this / they)'],
    ['notícias curtas', 'artigos de site', 'instruções']),
  w('en', 38, 9, 'B1', 'Cultura e small talk', 'Conversar informalmente e entender expressões comuns.',
    ['expressões idiomáticas frequentes', 'small talk e cortesia', 'humor e ironia leve'],
    ['clima e fim de semana', 'expressões idiomáticas', 'cortesia']),
  w('en', 39, 9, 'B1', 'Voz passiva', 'Descrever processos e entender notícias.',
    ['passive (be + particípio) no presente e passado', 'by + agente', 'quando usar a passiva'],
    ['processos', 'notícias', 'produtos e invenções']),

  // ───── Mês 10 — Situações complexas (B1)
  w('en', 40, 10, 'B1', 'Burocracia e reclamações', 'Reclamar formalmente e resolver um problema com serviço.',
    ['registro formal', 'second conditional (introdução)', 'I\'d like to / I\'m afraid'],
    ['serviços', 'reclamações', 'formulários']),
  w('en', 41, 10, 'B1', 'Saúde e emergências', 'Descrever sintomas com detalhe e seguir instruções.',
    ['modais de dedução (must be / might be / can\'t be)', 'instruções e sequência', 'perguntas do médico'],
    ['sintomas e tratamentos', 'emergência', 'instruções médicas']),
  w('en', 42, 10, 'B1', 'Relatar o que disseram', 'Contar o que alguém disse ou perguntou.',
    ['reported speech (say / tell)', 'backshift básico', 'perguntas relatadas'],
    ['recados', 'notícias de amigos', 'reuniões']),
  w('en', 43, 10, 'B1', 'Resolver conflitos', 'Pedir desculpas, negociar e suavizar.',
    ['question tags', 'softeners (a bit, actually, I\'m afraid)', 'desculpar-se e aceitar desculpas'],
    ['conflitos do dia a dia', 'negociação', 'desculpas']),

  // ───── Mês 11 — Conversa e escrita com fluência (B1)
  w('en', 44, 11, 'B1', 'Hipóteses', 'Falar de situações imaginárias e dar conselhos.',
    ['second conditional', 'If I were you…', 'wish + past'],
    ['sonhos e planos', 'conselhos', 'situações imaginárias']),
  w('en', 45, 11, 'B1', 'Narrar com riqueza', 'Contar histórias com ordem e detalhe.',
    ['past perfect', 'sequenciadores avançados', 'vocabulário de sentimentos'],
    ['histórias', 'sentimentos', 'acontecimentos']),
  w('en', 46, 11, 'B1', 'Argumentar', 'Defender uma opinião com argumentos.',
    ['conectores although / however / therefore / in addition', 'estrutura de argumento', 'concordar parcialmente'],
    ['temas de debate', 'argumentos', 'concessão']),
  w('en', 47, 11, 'B1', 'Escrever gêneros', 'Escrever e-mail formal, avaliação, história curta e reclamação.',
    ['estrutura de e-mail formal', 'review (avaliação)', 'história curta', 'mensagem de reclamação'],
    ['gêneros de texto', 'conectores de escrita', 'fórmulas de abertura e fechamento'], ['reading', 'writing', 'listening', 'speaking']),
  w('en', 48, 11, 'B1', 'Phrasal verbs e colocações', 'Usar combinações naturais de palavras.',
    ['phrasal verbs 2 (get / take / make / do)', 'collocations frequentes', 'verbos com preposição'],
    ['colocações', 'expressões com get / take / make / do', 'vocabulário natural']),

  // ───── Mês 12 — Consolidação e independência (B1)
  w('en', 49, 12, 'B1', 'Manter conversas longas', 'Manter uma conversa de dez minutos sobre temas variados.',
    ['fillers e perguntas de retorno', 'mudar de assunto', 'discordar com educação'],
    ['temas variados', 'expressões conversacionais', 'opiniões']),
  w('en', 50, 12, 'B1', 'Projeto prático', 'Apresentar-se em um contexto real e revisar seus próprios erros.',
    ['revisão das dificuldades do aluno', 'autocorreção', 'apresentação pessoal completa'],
    ['apresentação pessoal', 'revisão geral', 'vocabulário do aluno']),
  w('en', 51, 12, 'B1', 'Avaliação final', 'Manter uma conversa, entender instruções, escrever uma mensagem e resolver uma situação cotidiana.',
    ['tarefas integradas novas', 'avaliação final por habilidade', 'limitações da avaliação interna'],
    ['situações integradas', 'tarefas práticas', 'revisão final']),
  w('en', 52, 12, 'B1', 'Continuidade', 'Planejar e iniciar o estudo independente.',
    ['estratégias de aprendizagem autônoma', 'plano de 90 dias', 'recursos gratuitos'],
    ['recursos', 'metas', 'rotina de prática']),
]

const DE: Week[] = [
  // ───── Mês 1 — Fundamentos (A1)
  w('de', 1, 1, 'A1', 'Sons e cumprimentos', 'Cumprimentar e dizer nome e origem, escolhendo du ou Sie.',
    ['alfabeto, umlauts (ä ö ü) e ß', 'ich / du / Sie', 'sein (ich bin, du bist, Sie sind)', 'Wie heißt du? / Wie heißen Sie?'],
    ['cumprimentos e despedidas', 'nome', 'países'], NO_WRITING),
  w('de', 2, 1, 'A1', 'Dados pessoais', 'Dar e pedir dados pessoais básicos.',
    ['números 0–100', 'wohnen / kommen (presente regular)', 'W-Fragen (wie, wo, woher, was)', 'posição do verbo na pergunta'],
    ['idade', 'cidade e país', 'telefone e e-mail'], NO_WRITING),
  w('de', 3, 1, 'A1', 'Gênero, artigos e plural', 'Nomear objetos com artigo e plural corretos e dizer o que tem.',
    ['der / die / das', 'ein / eine', 'cinco padrões de plural', 'haben'],
    ['objetos do dia a dia (sempre com artigo e plural)', 'cores', 'sala e escritório']),
  w('de', 4, 1, 'A1', 'Horas e datas', 'Perguntar e dizer horas; marcar um encontro simples.',
    ['Uhrzeit formal e informal', 'Ja/Nein-Fragen', 'posição do verbo (V2)', 'am / um / im'],
    ['Wochentage', 'Monate', 'horas e compromissos']),

  // ───── Mês 2 — Vida cotidiana (A1)
  w('de', 5, 2, 'A1', 'Família', 'Apresentar a família e descrever pessoas.',
    ['Possessivartikel (mein / dein / sein / ihr)', 'Nominativo consolidado', 'adjetivos predicativos'],
    ['família', 'aparência', 'personalidade']),
  w('de', 6, 2, 'A1', 'Rotina', 'Contar sua rotina e perguntar sobre a de alguém.',
    ['verbos separáveis (aufstehen, anfangen, einkaufen)', 'V2 com Zeitangabe no início', 'presente com mudança de vogal (essen, fahren)'],
    ['verbos de rotina', 'horários', 'partes do dia']),
  w('de', 7, 2, 'A1', 'Comida e compras', 'Pedir uma refeição e fazer compras simples.',
    ['Akkusativ (den / einen / keinen)', 'nicht vs. kein', 'möchten', 'preços'],
    ['alimentos e bebidas', 'restaurante', 'supermercado e mercado']),
  w('de', 8, 2, 'A1', 'Casa e moradia', 'Descrever sua casa e dizer onde as coisas estão.',
    ['Dativo (dem / der / dem / den)', 'Wo? + in / an / auf + Dativ', 'es gibt + Akkusativ'],
    ['Zimmer e Möbel (com artigo e plural)', 'moradia', 'posição de objetos']),
  w('de', 9, 2, 'A1', 'Pessoas, lugares e preferências', 'Descrever pessoas, lugares e o que você gosta de fazer.',
    ['gern / lieber / am liebsten', 'adjetivos predicativos', 'revisão Nominativo e Akkusativ'],
    ['lazer e hobbies', 'lugares da cidade', 'preferências']),

  // ───── Mês 3 — Autonomia em situações comuns (A1)
  w('de', 10, 3, 'A1', 'Transporte e direções', 'Pedir e dar direções; usar o transporte público.',
    ['Wechselpräpositionen (Wo? Dativ / Wohin? Akkusativ)', 'Imperativ (Sie / du)', 'mit + Dativ'],
    ['transportes', 'lugares na cidade', 'direções']),
  w('de', 11, 3, 'A1', 'Viagem e hotel', 'Fazer uma reserva e resolver o check-in.',
    ['Modalverben können / wollen / müssen', 'Satzklammer (verbo modal + infinitivo no fim)', 'pedidos educados'],
    ['aeroporto e estação', 'hotel', 'reservas']),
  w('de', 12, 3, 'A1', 'Saúde', 'Descrever um problema de saúde e marcar uma consulta.',
    ['sollen / dürfen', 'Dativo de pessoa (mir tut … weh)', 'Termin beim Arzt'],
    ['Körperteile (com artigo e plural)', 'sintomas', 'farmácia e emergência']),
  w('de', 13, 3, 'A1', 'Revisão do A1', 'Resolver um problema simples (perda, atraso, reclamação) usando tudo o que aprendeu.',
    ['casos Nominativo / Akkusativ / Dativ (revisão)', 'posição do verbo (revisão)', 'verificação de etapa A1'],
    ['objetos perdidos', 'atrasos e cancelamentos', 'reclamações']),

  // ───── Mês 4 — Passado e experiências (A2)
  w('de', 14, 4, 'A2', 'Ontem', 'Contar o que fez ontem e no fim de semana.',
    ['Perfekt com haben', 'Partizip II regular (ge-…-t)', 'posição do Partizip no fim'],
    ['fim de semana', 'atividades passadas', 'expressões de tempo']),
  w('de', 15, 4, 'A2', 'Experiências', 'Contar uma experiência de viagem.',
    ['Perfekt com sein (movimento e mudança)', 'Partizip II irregular frequente', 'schon mal / noch nie'],
    ['viagens', 'lugares e eventos', 'sentimentos']),
  w('de', 16, 4, 'A2', 'Narrar', 'Narrar uma história curta com começo, meio e fim.',
    ['Präteritum de sein / haben / modais (war, hatte, konnte)', 'zuerst / dann / danach / zum Schluss', 'Perfekt vs. Präteritum na fala'],
    ['histórias', 'sequência de eventos', 'sentimentos']),
  w('de', 17, 4, 'A2', 'Antigamente', 'Contar como era sua vida antes e o que mudou.',
    ['früher + Präteritum', 'Präteritum de verbos frequentes (gehen, kommen, geben, wissen)', 'als (uma vez no passado)'],
    ['infância', 'mudanças de vida', 'hábitos antigos']),

  // ───── Mês 5 — Planos, opiniões e comparações (A2)
  w('de', 18, 5, 'A2', 'Planos e convites', 'Fazer planos e convites; aceitar e recusar.',
    ['Präsens + Zeitangabe para o futuro', 'werden (introdução)', 'Termine vereinbaren'],
    ['eventos sociais', 'convites', 'Termine']),
  w('de', 19, 5, 'A2', 'Verbos com dativo e pronomes', 'Falar de ajuda, gosto e posse usando os pronomes certos.',
    ['Verben mit Dativ (helfen, gefallen, gehören, danken)', 'pronomes pessoais Akkusativ / Dativ (mich/mir, dich/dir…)', 'ordem dos objetos'],
    ['presentes', 'ajuda', 'gostos']),
  w('de', 20, 5, 'A2', 'Comparar', 'Comparar lugares, produtos e pessoas.',
    ['Komparativ / Superlativ', 'als / wie', 'genauso … wie'],
    ['cidades', 'produtos e serviços', 'características']),
  w('de', 21, 5, 'A2', 'Opiniões e justificativas', 'Dar opinião, justificar e concordar ou discordar.',
    ['weil / dass (verbo no fim)', 'denn (verbo na 2ª posição)', 'ich finde / glaube / meine'],
    ['expressões de opinião', 'filmes e séries', 'argumentos simples']),
  w('de', 22, 5, 'A2', 'Preposições e casos', 'Usar as preposições mais frequentes com o caso certo.',
    ['preposições + Akkusativ (für, ohne, durch, gegen, um)', 'preposições + Dativ (mit, nach, aus, zu, bei, von, seit)', 'Wechselpräpositionen (revisão)'],
    ['deslocamentos', 'presentes e destinatários', 'tempo e lugar']),

  // ───── Mês 6 — Consolidação do básico (A2)
  w('de', 23, 6, 'A2', 'Reflexivos e cotidiano', 'Falar da rotina pessoal e de sentimentos.',
    ['verbos reflexivos (sich waschen, sich freuen auf)', 'pronomes reflexivos Akkusativ / Dativ', 'sich + preposição'],
    ['cuidados pessoais', 'sentimentos', 'rotina']),
  w('de', 24, 6, 'A2', 'wenn, als e ob', 'Falar de condições, momentos do passado e perguntas indiretas.',
    ['wenn (condição e repetição)', 'als (uma vez no passado)', 'ob (perguntas indiretas)'],
    ['condições', 'lembranças', 'perguntas indiretas']),
  w('de', 25, 6, 'A2', 'Adjetivos 1: depois de der/die/das', 'Descrever com adjetivos antes do substantivo.',
    ['Adjektivdeklination depois de artigo definido', 'terminações -e / -en', 'adjetivos frequentes'],
    ['roupas', 'descrições', 'compras']),
  w('de', 26, 6, 'A2', 'Verificação de etapa', 'Realizar tarefas integradas do primeiro semestre.',
    ['revisão integrada A1–A2 inicial', 'avaliação mensal com tarefas práticas', 'autocorreção de casos e posição do verbo'],
    ['revisão geral', 'vocabulário do aluno', 'situações integradas']),

  // ───── Mês 7 — Aplicação aos objetivos pessoais (A2)
  w('de', 27, 7, 'A2', 'Trabalho e estudos', 'Apresentar-se profissionalmente e fazer pedidos educados.',
    ['Konjunktiv II de cortesia (könnten Sie, ich hätte gern, würden Sie)', 'Lebenslauf', 'apresentação profissional'],
    ['Berufe', 'currículo', 'habilidades']),
  w('de', 28, 7, 'A2', 'E-mails e mensagens', 'Escrever um e-mail formal e uma mensagem informal.',
    ['Anrede e Grußformel', 'formal vs. informal', 'Nebensätze (revisão weil / dass / wenn)'],
    ['e-mail', 'saudações e fechamentos', 'pedidos e agradecimentos'], ['reading', 'writing', 'listening', 'speaking']),
  w('de', 29, 7, 'A2', 'Mudança de país', 'Lidar com burocracia e busca de moradia.',
    ['Behördensprache básica', 'perguntas indiretas com ob / W-Wort', 'Formulare ausfüllen'],
    ['Anmeldung', 'Wohnungssuche', 'Bankkonto e Krankenversicherung']),
  w('de', 30, 7, 'A2', 'Situações do seu objetivo', 'Resolver uma situação típica do seu objetivo (entrevista, aula, viagem, mudança).',
    ['role-plays guiados por objetivo', 'Redemittel para reunião e aula', 'vocabulário específico do objetivo'],
    ['Bewerbungsgespräch', 'Universität', 'Reise e Umzug']),

  // ───── Mês 8 — Comunicação mais desenvolvida (A2)
  w('de', 31, 8, 'A2', 'Adjetivos 2: depois de ein/kein e sem artigo', 'Descrever com adjetivos em qualquer contexto.',
    ['Adjektivdeklination depois de ein / kein / possessivos', 'Adjektivdeklination sem artigo', 'tabela completa'],
    ['descrições', 'anúncios', 'compras']),
  w('de', 32, 8, 'A2', 'Orações subordinadas 2', 'Explicar finalidade, concessão e sequência.',
    ['obwohl', 'damit / um … zu', 'bevor / nachdem / während'],
    ['razões e finalidades', 'concessão', 'sequência']),
  w('de', 33, 8, 'A2', 'Verbos com preposição', 'Falar de interesses, esperas e medos com a preposição certa.',
    ['Verben mit Präpositionen (warten auf, sich interessieren für, Angst haben vor)', 'Fragewörter wofür / worauf', 'da-Wörter (darauf, dafür)'],
    ['interesses', 'sentimentos', 'planos']),
  w('de', 34, 8, 'A2', 'Orações relativas', 'Descrever pessoas e coisas com detalhe.',
    ['Relativsätze (der / die / das)', 'pronome relativo no Akkusativ e Dativ', 'verbo no fim'],
    ['descrições', 'objetos e lugares', 'pessoas']),
  w('de', 35, 8, 'A2', 'Verificação de etapa A2', 'Realizar tarefas integradas do nível A2.',
    ['revisão integrada A2', 'avaliação com tarefas práticas', 'autocorreção de casos, Adjektivdeklination e Nebensätze'],
    ['revisão geral', 'vocabulário do aluno', 'situações integradas']),

  // ───── Mês 9 — Materiais autênticos e cultura (B1)
  w('de', 36, 9, 'B1', 'Ouvir de verdade', 'Entender a ideia principal de um áudio autêntico curto.',
    ['Umgangssprache vs. Standard', 'reduções na fala (haste, biste, ’n)', 'estratégias de escuta'],
    ['Nachrichten leicht', 'podcasts', 'avisos e anúncios']),
  w('de', 37, 9, 'B1', 'Ler de verdade', 'Entender textos autênticos curtos e decifrar palavras compostas.',
    ['Komposita (palavras compostas)', 'prefixos e sufixos (un-, -ung, -keit, -lich)', 'ideia principal e detalhes'],
    ['notícias curtas', 'artigos de site', 'instruções']),
  w('de', 38, 9, 'B1', 'Cultura e partículas', 'Conversar de forma natural e entender o tom.',
    ['Modalpartikeln (doch, mal, ja, eigentlich)', 'Redewendungen frequentes', 'Alemanha, Áustria e Suíça'],
    ['small talk', 'expressões idiomáticas', 'diferenças regionais']),
  w('de', 39, 9, 'B1', 'Voz passiva', 'Descrever processos e entender notícias.',
    ['Passiv (werden + Partizip II)', 'Passiv com modais', 'von + agente'],
    ['processos', 'notícias', 'regras e procedimentos']),

  // ───── Mês 10 — Situações complexas (B1)
  w('de', 40, 10, 'B1', 'Burocracia e reclamações', 'Reclamar formalmente e resolver um problema com serviço.',
    ['Behördendeutsch', 'Konjunktiv II ampliado (wäre, hätte, könnte, müsste)', 'reclamar com educação'],
    ['serviços', 'reclamações', 'formulários e cartas']),
  w('de', 41, 10, 'B1', 'Saúde e emergências', 'Descrever sintomas com detalhe e seguir instruções.',
    ['sollte / könnte / müsste (conselho e suposição)', 'Anweisungen (Imperativ e Passiv)', 'perguntas do médico'],
    ['sintomas e tratamentos', 'emergência', 'instruções médicas']),
  w('de', 42, 10, 'B1', 'Relatar o que disseram', 'Contar o que alguém disse ou perguntou.',
    ['indirekte Rede com dass / ob', 'Konjunktiv I (reconhecimento)', 'sagen / fragen / meinen'],
    ['recados', 'notícias de amigos', 'reuniões']),
  w('de', 43, 10, 'B1', 'Resolver conflitos', 'Pedir desculpas, negociar e explicar motivos.',
    ['Genitiv (wegen, trotz, während)', 'sich entschuldigen / verhandeln', 'suavizar (eigentlich, vielleicht, leider)'],
    ['conflitos do dia a dia', 'negociação', 'desculpas']),

  // ───── Mês 11 — Conversa e escrita com fluência (B1)
  w('de', 44, 11, 'B1', 'Hipóteses', 'Falar de situações imaginárias e dar conselhos.',
    ['Konjunktiv II com würde / hätte / wäre', 'an deiner Stelle', 'wenn … dann (irreal)'],
    ['sonhos e planos', 'conselhos', 'situações imaginárias']),
  w('de', 45, 11, 'B1', 'Narrar com riqueza', 'Contar histórias com ordem e detalhe.',
    ['Plusquamperfekt', 'nachdem + Plusquamperfekt', 'vocabulário de sentimentos'],
    ['histórias', 'sentimentos', 'acontecimentos']),
  w('de', 46, 11, 'B1', 'Argumentar', 'Defender uma opinião com argumentos.',
    ['Konnektoren (deshalb, trotzdem, außerdem)', 'zweiteilige Konnektoren (einerseits … andererseits, nicht nur … sondern auch)', 'estrutura de argumento'],
    ['temas de debate', 'argumentos', 'concessão']),
  w('de', 47, 11, 'B1', 'Escrever gêneros', 'Escrever e-mail formal, reclamação, avaliação e história curta.',
    ['formale E-Mail', 'Beschwerdebrief', 'Bewertung', 'kurze Geschichte'],
    ['gêneros de texto', 'conectores de escrita', 'fórmulas de abertura e fechamento'], ['reading', 'writing', 'listening', 'speaking']),
  w('de', 48, 11, 'B1', 'Futuro e planos de longo prazo', 'Falar de planos, previsões e intenções.',
    ['Futur I (werden + infinitivo)', 'ordem com dois verbos', 'wahrscheinlich / vielleicht / bestimmt'],
    ['planos de vida', 'previsões', 'intenções']),

  // ───── Mês 12 — Consolidação e independência (B1)
  w('de', 49, 12, 'B1', 'Manter conversas longas', 'Manter uma conversa de dez minutos sobre temas variados.',
    ['Redemittel para reagir e opinar', 'Rückfragen e Themenwechsel', 'widersprechen com educação'],
    ['temas variados', 'expressões conversacionais', 'opiniões']),
  w('de', 50, 12, 'B1', 'Projeto prático', 'Apresentar-se em um contexto real e revisar seus próprios erros.',
    ['revisão das dificuldades do aluno (casos, posição do verbo, Adjektivdeklination)', 'autocorreção', 'apresentação pessoal completa'],
    ['apresentação pessoal', 'revisão geral', 'vocabulário do aluno']),
  w('de', 51, 12, 'B1', 'Avaliação final', 'Manter uma conversa, entender instruções, escrever uma mensagem e resolver uma situação cotidiana.',
    ['tarefas integradas novas (Gespräch, Anweisungen, Nachricht, Alltagssituation)', 'avaliação final por habilidade', 'limitações da avaliação interna'],
    ['situações integradas', 'tarefas práticas', 'revisão final']),
  w('de', 52, 12, 'B1', 'Continuidade', 'Planejar e iniciar o estudo independente.',
    ['estratégias de aprendizagem autônoma para alemão', 'plano de 90 dias', 'recursos gratuitos'],
    ['recursos', 'metas', 'rotina de prática']),
]

export const CURRICULUM: Week[] = [...EN, ...DE]

export function weeksFor(language: Language): Week[] {
  return CURRICULUM.filter((w) => w.language === language)
}

export function weeksForMonth(language: Language, month: number): Week[] {
  return weeksFor(language).filter((w) => w.month === month)
}

export const weekId = (language: Language, number: number) => `${language}-w${String(number).padStart(2, '0')}`
