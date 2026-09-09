// Datas como 'YYYY-MM-DD' no fuso local. Sem dependências.

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const todayISO = (): string => toISO(new Date())

/** 0 = domingo … 6 = sábado */
export const weekdayOf = (iso: string): number => parseISO(iso).getDay()

export function formatBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function daysBetween(fromISO: string, toISO_: string): number {
  return Math.round((parseISO(toISO_).getTime() - parseISO(fromISO).getTime()) / 86_400_000)
}

export const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const WEEKDAY_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
