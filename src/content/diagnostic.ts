import type { Language, StartLevel } from '../lib/types'

// Diagnóstico inicial: 8 itens por idioma (3 leitura, 3 escuta, 2 escrita).
// Produz uma ESTIMATIVA de ponto de partida — o app diz isso ao aluno.
// Não há avaliação de fala: sem reconhecimento de voz nesta versão.

export type DiagItem =
  | { id: string; skill: 'reading'; prompt: string; options: string[]; answer: number }
  | { id: string; skill: 'listening'; speak: string; prompt: string; options: string[]; answer: number }
  | { id: string; skill: 'writing'; prompt: string; answers: string[] }

export const DIAGNOSTIC: Record<Language, DiagItem[]> = {
  en: [
    { id: 'en-d1', skill: 'reading', prompt: 'Qual frase está correta?', options: ['She have a car.', 'She has a car.', 'She haves a car.'], answer: 1 },
    { id: 'en-d2', skill: 'reading', prompt: 'Complete: "I ___ to the cinema yesterday."', options: ['go', 'went', 'gone'], answer: 1 },
    { id: 'en-d3', skill: 'reading', prompt: '"I\'ve never been to London." significa:', options: ['Eu nunca fui a Londres.', 'Eu não vou a Londres.', 'Eu fui a Londres uma vez.'], answer: 0 },
    { id: 'en-d4', skill: 'listening', speak: 'Could you open the window, please?', prompt: 'O que você ouviu?', options: ['Could you open the window, please?', 'Would you close the window, please?', 'Can you open the door, please?'], answer: 0 },
    { id: 'en-d5', skill: 'listening', speak: "I'm going to visit my parents next weekend.", prompt: 'O que você ouviu?', options: ["I'm going to visit my friends next week.", "I'm going to visit my parents next weekend.", 'I want to visit my parents this weekend.'], answer: 1 },
    { id: 'en-d6', skill: 'listening', speak: "There isn't any milk in the fridge.", prompt: 'O que você ouviu?', options: ['There is some milk in the fridge.', "There isn't any milk in the fridge.", 'There are some eggs in the fridge.'], answer: 1 },
    { id: 'en-d7', skill: 'writing', prompt: 'Complete com a forma negativa: "She ___ (not / like) coffee."', answers: ["doesn't like", 'does not like'] },
    { id: 'en-d8', skill: 'writing', prompt: 'Complete: "If it ___ (rain) tomorrow, we\'ll stay home."', answers: ['rains'] },
  ],
  de: [
    { id: 'de-d1', skill: 'reading', prompt: 'Qual frase está correta?', options: ['Ich habe ein Hund.', 'Ich habe einen Hund.', 'Ich habe einem Hund.'], answer: 1 },
    { id: 'de-d2', skill: 'reading', prompt: 'Complete: "Gestern ___ ich ins Kino gegangen."', options: ['habe', 'bin', 'war'], answer: 1 },
    { id: 'de-d3', skill: 'reading', prompt: '"Ich muss morgen früh aufstehen." significa:', options: ['Eu preciso acordar cedo amanhã.', 'Eu acordei cedo hoje.', 'Eu quero dormir até tarde amanhã.'], answer: 0 },
    { id: 'de-d4', skill: 'listening', speak: 'Können Sie das bitte wiederholen?', prompt: 'O que você ouviu?', options: ['Können Sie das bitte wiederholen?', 'Können Sie mir bitte helfen?', 'Kannst du das bitte buchstabieren?'], answer: 0 },
    { id: 'de-d5', skill: 'listening', speak: 'Ich fahre am Wochenende zu meinen Eltern.', prompt: 'O que você ouviu?', options: ['Ich fahre am Wochenende zu meinen Freunden.', 'Ich fahre am Wochenende zu meinen Eltern.', 'Ich bleibe am Wochenende zu Hause.'], answer: 1 },
    { id: 'de-d6', skill: 'listening', speak: 'Es gibt keine Milch mehr im Kühlschrank.', prompt: 'O que você ouviu?', options: ['Es gibt noch Milch im Kühlschrank.', 'Es gibt keine Milch mehr im Kühlschrank.', 'Es gibt Eier im Kühlschrank.'], answer: 1 },
    { id: 'de-d7', skill: 'writing', prompt: 'Complete com a contração de "in + das": "Ich gehe ___ Kino."', answers: ['ins', 'in das'] },
    { id: 'de-d8', skill: 'writing', prompt: 'Complete com "porque": "Er kommt nicht, ___ er krank ist."', answers: ['weil'] },
  ],
}

export function suggestLevel(correct: number): StartLevel {
  if (correct <= 3) return 'zero'
  if (correct <= 6) return 'basico'
  return 'intermediario'
}

export const LEVEL_NAMES: Record<StartLevel, string> = {
  zero: 'Do zero',
  basico: 'Básico (já sei algumas frases)',
  intermediario: 'Intermediário (consigo me virar)',
}
