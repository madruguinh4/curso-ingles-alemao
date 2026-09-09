# Curso de Inglês e Alemão — PWA

Curso estruturado de ~6 meses (26 semanas) de inglês e alemão para falantes de português brasileiro, como **app web instalável (PWA)**: roda em Android e iPhone, funciona offline, sem conta e sem servidor. O princípio do produto: ao terminar, o aluno continua sozinho — o app exporta um kit e não tenta reter ninguém.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 68 testes (Vitest)
npm run build      # gera dist/ com service worker e manifest
npm run preview    # serve dist/ localmente para testar como PWA
```

Para testar no celular na mesma rede Wi-Fi: `npm run dev -- --host` e abra o endereço IP mostrado.

## Publicar

`npm run build` gera a pasta `dist/`. Qualquer hospedagem de arquivos estáticos serve (Vercel, Netlify, GitHub Pages, Hostinger…). O PWA exige **HTTPS** para instalar e funcionar offline.

- **Android (Chrome):** menu ⋮ → *Instalar app* (ou o banner automático).
- **iPhone (Safari apenas):** *Compartilhar* → *Adicionar à Tela de Início*. Outros navegadores no iOS não instalam PWA.

## Estado real do projeto

| Área | Situação |
|---|---|
| Onboarding (idiomas, nível, objetivo, tempo, dias, microfone), diagnóstico opcional | **Implementado** |
| Plano de 26 semanas gerado por disponibilidade; reorganização de atrasos sem punição | **Implementado** |
| Mapa curricular completo: 26 semanas × 2 idiomas com objetivo, gramática e vocabulário | **Implementado** (`src/content/curriculum.ts`) |
| Aulas com os 8 blocos (objetivo, revisão, diálogo, explicação, exercícios, produção, correções, tarefa) | **Implementado**; conteúdo real: **semana 1 de cada idioma (3 aulas cada)** |
| Semanas 2–26 | **Mapeadas, aulas em produção** — o app mostra isso, não finge |
| 6 tipos de exercício (escolha, lacuna, ordenação, transformação, ditado, produção livre) | **Implementado** |
| Revisão espaçada (FSRS, o algoritmo do Anki) | **Implementado** |
| Verificação semanal; progresso por habilidade; objetivos demonstrados; recuperação sugerida | **Implementado** |
| Biblioteca (vocabulário e gramática com busca) | **Implementado** |
| Kit de encerramento: HTML autocontido (8 seções) + CSV para Anki | **Implementado** |
| Tema claro/escuro, texto ajustável, foco visível, rótulos ARIA | **Implementado** |
| Áudio de pronúncia | **Web Speech API do navegador** — depende das vozes instaladas no aparelho; sem voz, o app esconde o botão e explica |
| Tutor de IA para conversação | **Não implementado** — exige servidor com chaves protegidas |
| Reconhecimento de voz / avaliação de pronúncia | **Não implementado** — o app informa; produção oral é autoavaliada |
| Login, sincronização entre aparelhos, área administrativa | **Não implementado** — sem backend nesta etapa |
| Notificações | **Não implementado** — sem servidor não há push; lembretes locais são instáveis no iOS |
| Áudio para download | **Não implementado** — sem direitos de distribuição de vozes |
| Avaliação mensal e final com tarefas novas | **Parcial** — a verificação semanal existe; mensal/final dependem de conteúdo das semanas seguintes |

**O que exige produção pedagógica:** ~250 aulas (semanas 2–26 × 2 idiomas) no formato de `src/content/en/w01-l1.json`. Cada aula nova é validada automaticamente (Zod) — um JSON fora do formato quebra os testes com a mensagem apontando arquivo e campo. Substantivos alemães sem artigo e plural são rejeitados.

## Estrutura

```
src/content/curriculum.ts   mapa das 26 semanas por idioma
src/content/en|de/*.json    aulas (8 blocos)
src/content/continuity.ts   plano de 90 dias e orientações do kit
src/content/diagnostic.ts   diagnóstico inicial
src/lib/                    lógica pura e testada: schema, plan, srs, progress, export, tts, answers
src/screens/                14 telas
src/components/exercises/   motor de exercícios
tests/                      Vitest (conteúdo, cronograma, FSRS, progresso, exportação…)
docs/superpowers/           spec e plano de implementação
```

## Adicionar uma aula

1. Copie `src/content/en/w01-l1.json` para `src/content/en/w02-l1.json` (id `en-w02-l1`, `weekId` `en-w02`).
2. Preencha os 8 blocos. Regras: ≥5 exercícios com ≥3 tipos e ≥2 habilidades, 1 ditado, produção `free`, 3 erros comuns, ≥8 vocabulários (alemão: substantivos com `noun`, `article`, `plural`).
3. `npm test` — o conteúdo é validado. Ids de exercício e vocabulário devem ser únicos.
4. A aula aparece automaticamente no mapa, no cronograma e nos cartões.
