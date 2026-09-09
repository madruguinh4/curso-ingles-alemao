# Curso de Inglês e Alemão — PWA

Curso de **um ano (52 semanas)** de inglês e alemão para falantes de português brasileiro, como **app web instalável (PWA)**: roda em Android e iPhone, funciona offline, sem conta e sem servidor. O aluno estuda **um idioma por vez**, no ritmo dele; o app registra os dias de estudo e, no fim, exporta um kit para continuar sozinho.

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

- **Um idioma por vez.** Onboarding escolhe um; o segundo é adicionado depois com plano e progresso próprios. A única tela com os dois é a de escolha.
- **Sem perguntas de tempo ou dias.** O aluno faz o que pode, quando pode. O app registra automaticamente cada dia de estudo (calendário, total, sequência) — sem punição.
- **Próximas aulas sempre disponíveis.** Nada fica bloqueado por data.
- **Todo termo de gramática é explicado.** O texto marca `[[termo]]`; o app mostra a definição ao toque (glossário em `src/content/glossary.ts`). O teste falha se um termo usado não existir.
- **Regras antes dos exercícios.** Cada explicação traz "Regra 1, 2…" explícitas.
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

## Estado real do projeto

| Área | Situação |
|---|---|
| Onboarding (nome, idioma, nível com diagnóstico opcional, objetivo, microfone) | **Implementado** |
| Mapa curricular de 52 semanas × 2 idiomas (A1 semanas 1–13, A2 14–35, B1 36–52) | **Implementado** (`src/content/curriculum.ts`) |
| Aulas com 8 blocos (aquecer, diálogo, regras, praticar, produzir, erros comuns, missão) | **Implementado**; conteúdo real: **semana 1 de cada idioma (3 aulas cada)** |
| Semanas 2–52 | **Mapeadas, aulas em produção** — o app mostra isso |
| Glossário de termos gramaticais com definição ao toque | **Implementado** (36 termos) |
| 6 tipos de exercício; revisão espaçada (FSRS); verificação semanal | **Implementado** |
| Dias de estudo (calendário, sequência, total) | **Implementado** |
| Progresso por habilidade, objetivos demonstrados, recuperação sugerida | **Implementado** |
| Biblioteca (vocabulário, gramática, termos) | **Implementado** |
| Kit de encerramento: HTML (8 seções + glossário) + CSV para Anki | **Implementado** |
| Tema claro/escuro, texto ajustável, ARIA | **Implementado** |
| Tutor de IA, reconhecimento de voz, login/sync, notificações, áudio para download | **Não implementado** — o app informa onde faria diferença |

**O que exige produção pedagógica:** ~300 aulas (semanas 2–52 × 2 idiomas) no formato de `src/content/en/w01-l1.json`. Cada aula nova é validada automaticamente (Zod + testes de conteúdo): formato, ids únicos, artigo+plural em substantivos alemães, termos do glossário.

## Adicionar uma aula

1. Copie `src/content/en/w01-l1.json` para `src/content/en/w02-l1.json` (id `en-w02-l1`, `weekId` `en-w02`).
2. Preencha os 8 blocos. Regras: ≥5 exercícios com ≥3 tipos e ≥2 habilidades, 1 ditado, produção `free`, 3 erros comuns, ≥8 vocabulários (alemão: `noun`, `article`, `plural`), explicação com "Regra" e termos `[[assim]]`.
3. `npm test`. A aula entra automaticamente no início, na trilha e nos cartões.
