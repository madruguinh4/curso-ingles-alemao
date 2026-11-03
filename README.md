# Curso de Inglês e Alemão — PWA

Curso de **um ano (52 semanas)** de inglês e alemão para falantes de português brasileiro, como **app web instalável (PWA)**: roda em Android e iPhone, funciona offline, sem conta e sem servidor. O aluno estuda **um idioma por vez**, no ritmo dele; o app registra os dias de estudo e, no fim, exporta um kit para continuar sozinho.

**No ar:** https://madruguinh4.github.io/curso-ingles-alemao/ — publicado automaticamente a cada push na `main` (GitHub Actions → Pages).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run build      # gera dist/ com service worker e manifest
npm run preview    # serve dist/ para testar como PWA
```

Para testar no celular na mesma rede Wi-Fi: `npm run dev -- --host` e abra o endereço IP mostrado.

## Publicar

`npm run build` gera `dist/`. Qualquer hospedagem estática serve (Vercel, Netlify, GitHub Pages, Hostinger…). PWA exige **HTTPS**.

- **Android (Chrome):** menu ⋮ → *Instalar app*.
- **iPhone (Safari apenas):** *Compartilhar* → *Adicionar à Tela de Início*.

## Decisões de produto

- **Sem cadastro.** A primeira tela pergunta só o idioma, e um toque abre a primeira aula. Quem já sabe algo pula aulas com "já sei" ou "começar daqui" no mapa.
- **Continua de onde parou.** Cada tela, resposta, erro, cartão e dia de estudo é gravado na hora (IndexedDB). Ao voltar, o app abre no último idioma usado e a aula reabre na primeira tela não feita. O app pede ao navegador armazenamento permanente, e em Configurações há **cópia de segurança** (baixar/restaurar um arquivo) para trocar de aparelho sem conta.
- **Um idioma por vez.** A primeira tela escolhe um; o segundo é adicionado depois com plano e progresso próprios. A única tela com os dois é a de escolha.
- **Sem perguntas de tempo ou dias.** O aluno faz o que pode, quando pode. O app registra automaticamente cada dia de estudo (calendário, total, sequência) — sem punição.
- **Próximas aulas sempre disponíveis.** Nada fica bloqueado por data.
- **Uma ideia por tela.** A aula alterna cartões "aprender" (uma frase com áudio, a regra em uma linha e, quando cabe, um ✗ errado → ✓ certo) com um exercício logo em seguida. No fim, o diálogo inteiro e uma produção. Aula de 5–8 minutos.
- **Turma de 7 mascotes, cada um com uma função fixa** (`src/components/mascots/`): Tico (tucano) explica as regras · Zeca (mico-leão-dourado) comemora acertos · Bia (capivara) ajuda no erro e lista "vale rever" no fim da aula · Lu (lebre) cuida de ouvir (ditado e diálogo) · Rafa (papagaio) chama para falar e escrever · Nina (tartaruga) acompanha a revisão · Dudu (tatu-bola) conta os dias de estudo, sem cobrança. Desenhos SVG próprios, sem imagens externas; animação desligada para quem prefere menos movimento.
- **Gramática sem jargão.** Padrões em vez de nomes técnicos: "Eu sou = I'm", "ich komme · du kommst · Sie kommen". Nada de "sujeito", "conjugação" ou "dativo".
- **Enunciados de uma linha.** "Complete.", "Ouça e escreva.", "Monte a frase."
- **Nada de explicação longa no início.** "Sobre o curso" fica em Mais → Sobre.
- **Cor por idioma:** inglês azul, alemão âmbar.

## Áudio

Usa a **Web Speech API** do navegador e escolhe automaticamente a melhor voz instalada (neurais primeiro: "Natural", "Neural", "Google", "Premium"). Em Configurações há um seletor de voz por idioma com teste. A qualidade depende do aparelho:

| Onde | Vozes disponíveis |
|---|---|
| Edge no Windows | "Microsoft … Online (Natural)" — muito humanas |
| Chrome no Windows | vozes Google (boas) ou vozes de sistema (robóticas) |
| Android | vozes Google; baixe a versão de alta qualidade em Configurações → Conversão de texto em voz |
| iPhone | vozes Siri/aprimoradas em Ajustes → Acessibilidade → Conteúdo falado |

Para áudio humano garantido em qualquer aparelho seria preciso **pré-gerar arquivos** com um serviço neural (Azure, Google Cloud TTS, ElevenLabs) e embarcá-los — tem custo e exige licença de distribuição. Não está nesta versão.

## Lembretes diários (push)

Push com o app fechado exige um servidor. Aqui ele é mínimo e gratuito:

- **Supabase** — tabela `push_subscriptions` (`supabase/migrations/`): inscrição de push, fuso e último dia de estudo de cada aparelho. Anônimos só inserem/apagam a própria linha (RLS); ninguém lista.
- **GitHub Actions** — `.github/workflows/nudges.yml` roda `scripts/send-nudges.mjs` de hora em hora. Quem não estudou no dia (no fuso dele) recebe até 3 avisos: 18h, 20h30 e 22h. Quem estudou não recebe nada.
- **App** — `src/lib/push.ts` e `src/components/Reminders.tsx`: opt-in em Configurações (ou convite no Início), reversível. iPhone: só com o app instalado na tela inicial (iOS 16.4+).

Segredos do repositório: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`; variável `APP_URL`. Gere chaves VAPID com `npx web-push generate-vapid-keys`. Localmente, copie `.env.example` para `.env.local`.

## Estado real do projeto

| Área | Situação |
|---|---|
| Entrada sem cadastro: a primeira tela só pergunta o idioma; nome, voz e lembretes são opcionais em Configurações | **Implementado** |
| Mapa curricular de 52 semanas × 2 idiomas (A1 semanas 1–13, A2 14–35, B1 36–52) | **Implementado** (`src/content/curriculum.ts`) |
| Aulas em telas curtas (aprender → exercício, diálogo no fim, produção) | **Implementado**; conteúdo real: **semana 1 de cada idioma (3 aulas cada)** |
| Semanas 2–52 | **Mapeadas, aulas em produção** — o app mostra isso |
| 6 tipos de exercício; revisão espaçada (FSRS); verificação semanal | **Implementado** |
| Dias de estudo (calendário, sequência, total) | **Implementado** |
| Progresso por habilidade, objetivos demonstrados, recuperação sugerida | **Implementado** |
| Biblioteca (vocabulário e regras) | **Implementado** |
| Kit de encerramento: HTML (8 seções) + CSV para Anki | **Implementado** |
| Tema claro/escuro, texto ajustável, ARIA | **Implementado** |
| Lembretes diários por push (3 avisos escalonados) | **Implementado** — Supabase + GitHub Actions |
| Tutor de IA, reconhecimento de voz, login/sync, áudio para download | **Não implementado** — o app informa onde faria diferença |

**O que exige produção pedagógica:** ~300 aulas (semanas 2–52 × 2 idiomas) no formato de `src/content/en/w01-l1.json`. Cada aula nova é validada automaticamente (Zod + testes de conteúdo): formato, ids únicos, artigo+plural em substantivos alemães, aula começando por um cartão "aprender", sem marcações de jargão.

## Adicionar uma aula

1. Copie `src/content/en/w01-l1.json` para `src/content/en/w02-l1.json` (id `en-w02-l1`, `weekId` `en-w02`).
2. Monte `steps` na ordem em que o aluno vê:
   - `learn`: `text` (frase no idioma), `translation`, `rule` opcional (uma linha, sem jargão) e `avoid` opcional (`wrong` / `right`).
   - Logo depois, um exercício sobre aquilo (`choice`, `gap`, `order`, `transform`, `dictation`), com enunciado e `explanation` de uma linha.
   - Um `dialogue` no fim, juntando tudo.

   Regras: começar com `learn`, ≥3 cartões com `rule`, ≥5 exercícios com ≥3 tipos e ≥2 habilidades, 1 ditado, produção `free` com 3 itens, ≥8 vocabulários (alemão: `noun`, `article`, `plural`).
3. `npm test`. A aula entra automaticamente no início, na trilha e nos cartões.
