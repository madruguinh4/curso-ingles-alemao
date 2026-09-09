// Comparação tolerante de respostas escritas: ignora caixa, pontuação e
// espaços extras; trata ß/ss como iguais; mantém apóstrofos e umlauts
// (schon ≠ schön — o umlaut faz parte da palavra).

export function normalize(s: string): string {
  return s
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[.,!?;:"()[\]…\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matches(given: string, answers: string[]): boolean {
  const g = normalize(given)
  if (!g) return false
  return answers.some((a) => normalize(a) === g)
}

export function orderMatches(tokens: string[], answer: string): boolean {
  return normalize(tokens.join(' ')) === normalize(answer)
}
