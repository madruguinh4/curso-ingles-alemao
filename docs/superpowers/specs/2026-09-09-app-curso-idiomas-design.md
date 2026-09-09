# App de Curso de Idiomas (Inglês / Alemão) — Design da Etapa 1

**Data:** 2026-09-09
**Status:** Aprovado. Etapa 1: PWA, conteúdo local, sem IA.
**Fonte:** documento de requisitos do produto (12 seções) enviado pelo dono do
produto. Este arquivo recorta o que entra nesta etapa e registra as decisões.

## Princípio do produto

Curso de ~6 meses com início, desenvolvimento e fim. Ao concluir, o aluno deve
continuar praticando **sem depender do app**. Nada de aulas infinitas nem
mecanismos de retenção. Sem perda de vidas, sem punição por ausência, sem
bloqueio de estudo. Sem promessa de fluência; níveis do QECR como organização
curricular, nunca como certificação.

## Escopo da Etapa 1 (esta)

| Entra | Fica para depois | Por quê |
|---|---|---|
| PWA instalável, offline | Lojas Android/iOS (Expo) | Decisão do dono: analisar o app antes |
| Perfil local no aparelho | Autenticação, sync entre aparelhos | Sem backend nesta etapa |
| Conteúdo em JSON no projeto | Área administrativa, publicação | Conteúdo é editado no repositório |
| Revisão espaçada (FSRS) | — | Núcleo pedagógico |
| Exportação CSV dos cartões, kit em texto/HTML imprimível | Áudio para download | Sem direitos de distribuição ainda |
| TTS do navegador (Web Speech) | Reconhecimento de voz, avaliação de pronúncia | Exige serviço externo; o app **informa a limitação** |
| — | Tutor de IA (conversação) | Exige servidor com chaves protegidas |

## O que é "conteúdo real" nesta etapa — declaração honesta

- **Mapa curricular das 26 semanas nos dois idiomas:** completo (objetivo
  comunicativo, gramática, vocabulário e habilidades por semana).
- **Aulas com os 8 blocos do §6:** produzidas para as primeiras semanas de cada
  idioma. As demais semanas existem no mapa e aparecem no app como
  "conteúdo em produção" — nunca como aula fake.
- O app **não declara o curso completo**. A tela de mapa mostra quantas aulas
  existem de fato.

## Onboarding (§2)

Perguntas, uma por tela: idioma(s); nível atual (zero / básico / intermediário);
objetivo (viagem, trabalho, estudos, mudança de país, pessoal); minutos por dia
(20/40/60/90); dias da semana; permissão de microfone (informativo; sem
reconhecimento de voz nesta etapa). Diagnóstico: opcional; "começar do zero"
sempre disponível. Com dois idiomas, o tempo diário é dividido e isso é dito.

O plano gera ~26 semanas a partir da data de início e dos dias escolhidos.
Volume por dia depende dos minutos: 20 min = 1 bloco; 40 = aula; 60 = aula +
revisão; 90 = aula + revisão + produção. **Não comprime o mesmo conteúdo em
todas as opções.** Atraso reorganiza o cronograma e explica o impacto, sem
constranger.

## Estrutura curricular (§3–§5)

6 meses × ~4–5 semanas = 26 semanas. Cada semana tem um objetivo verificável
("consegue pedir uma refeição"). Sequências **próprias por idioma**:

- **Inglês:** to be → presente simples/contínuo → passado → futuro → modais →
  contáveis/incontáveis, quantificadores → comparativos → condicionais →
  present perfect (quando pré-requisitos consolidados). Fala conectada ao longo.
- **Alemão:** sons/umlauts/ß → gênero, artigo, plural (vocabulário sempre com
  artigo + plural) → sein/haben, presente → ordem das palavras → nicht/kein →
  casos em espiral (Nom → Akk → Dat, retomados a cada mês) → modais e
  separáveis → preposições + caso → Perfekt → reflexivos → weil/dass/wenn →
  declinação de adjetivos → Konjunktiv II de cortesia. du/Sie desde a semana 1.

## Aula (§6) — 8 blocos obrigatórios

`objective`, `warmup` (revisão), `dialogue`, `explanation`, `guided` (exercícios),
`production` (oral ou escrita), `feedback` (correções explicadas), `task`
(tarefa fora do app). Tipos de exercício além de múltipla escolha: lacuna,
ordenação, transformação, ditado (com TTS), resposta livre com auto-avaliação
guiada. Revisão espaçada retoma erros em novos contextos.

## Progresso e avaliação (§8)

Mostrar separadamente: concluído; desempenho por habilidade (ouvir, ler,
escrever, falar); o que precisa de revisão; objetivos comunicativos demonstrados.
Progressão por evidência (exercícios + produção), não por aula aberta.
Revisão semanal. Avaliação mensal com tarefas práticas. Limitações da avaliação
interna são exibidas no próprio app.

## Encerramento (§9)

Kit gerado **localmente**, a partir do que já está no aparelho: resumo, guia de
gramática, vocabulário com exemplos, histórico de erros e correções, exercícios
com respostas, relatório por habilidade, plano de 90 dias. Formatos: HTML
imprimível (PDF pelo navegador) e CSV dos cartões (compatível com Anki).
Não depende de assinatura nem de link.

## Telas (§10) nesta etapa

Boas-vindas · Onboarding (idiomas, nível, objetivo, tempo, dias, microfone) ·
Diagnóstico (opcional) · Plano de 6 meses · Início (atividade do dia) · Mapa do
curso · Aula · Revisão · Avaliação · Progresso por habilidade · Biblioteca ·
Conclusão/exportação · Perfil e configurações (tema claro/escuro, tamanho do
texto, excluir dados). Tela de Conversação existe e **explica que o tutor de IA
não está disponível nesta versão**.

Acessibilidade: contraste AA, texto ajustável, foco visível, rótulos ARIA,
`prefers-color-scheme` + escolha manual.

## Arquitetura

```
src/
  content/
    en/  de/          semanas e aulas em JSON
    curriculum.ts     mapa das 26 semanas por idioma
  lib/
    schema.ts         Zod: lição, exercício, semana; falha cedo e alto
    db.ts             Dexie: perfil, matrícula por idioma, plano, tentativas,
                      erros, cartões FSRS, notas por habilidade
    srs.ts            ts-fsrs: agenda de revisão
    plan.ts           gera/reorganiza as 26 semanas a partir do onboarding
    progress.ts       calcula progresso por habilidade e objetivos demonstrados
    tts.ts            Web Speech API; detecta vozes en/de
    export.ts         kit HTML + CSV
  screens/            uma pasta por tela
  components/         UI compartilhada
```

**Conteúdo vs. progresso:** conteúdo é somente-leitura e versionado no
repositório; só o progresso muda e fica no IndexedDB. Uma matrícula
(`enrollment`) por idioma — planos e históricos independentes.

## Modelo de dados (Dexie)

- `profile` — nome, tema, tamanho de texto
- `enrollments` — `{id, language, level, goal, minutesPerDay, weekdays, startDate}`
- `schedule` — `{enrollmentId, date, lessonId, status}`
- `attempts` — `{enrollmentId, exerciseId, skill, correct, answer, at}`
- `errors` — `{enrollmentId, lessonId, prompt, given, expected, explanation, at}`
- `cards` — `{enrollmentId, vocabId, ...estado FSRS}`
- `completions` — `{enrollmentId, lessonId, blocksDone, completedAt}`

## Tratamento de erro

- JSON inválido → Zod falha na carga com arquivo/campo. Nunca renderiza torto.
- IndexedDB indisponível → funciona em memória e avisa que não salva.
- Sem voz `de-DE`/`en-US` → esconde áudio e informa; nunca fala alemão em inglês.

## Testes

Unitários (Vitest): `schema`, `srs`, `plan`, `progress`, `export`. Todo o
conteúdo JSON é validado em teste — conteúdo quebrado quebra a suíte.
Manual: instalar em Android e iPhone; modo avião; leitor de tela.

## Limitações declaradas ao usuário

iPhone instala só pelo Safari ("Compartilhar → Adicionar à Tela de Início").
Sem reconhecimento de voz: prática oral é auto-avaliada com guia. Sem tutor de IA.
Atualizar conteúdo exige republicar.
