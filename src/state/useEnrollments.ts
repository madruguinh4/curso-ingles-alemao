import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Enrollment } from '../lib/db'

const ACTIVE_KEY = 'activeEnrollmentId'
const CHOSEN_KEY = 'languageChosen'

export function useEnrollments(): Enrollment[] | undefined {
  return useLiveQuery(() => db.enrollments.toArray(), [])
}

export function setActiveEnrollment(id: number): void {
  try {
    localStorage.setItem(ACTIVE_KEY, String(id))
  } catch {
    /* storage indisponível: só perde a preferência */
  }
}

function readActive(): number | null {
  try {
    const v = localStorage.getItem(ACTIVE_KEY)
    return v ? Number(v) : null
  } catch {
    return null
  }
}

/** Com dois idiomas, o app pede a escolha uma vez por sessão (aba aberta). */
export function markLanguageChosen(): void {
  try { sessionStorage.setItem(CHOSEN_KEY, '1') } catch { /* ignore */ }
}
export function languageChosen(): boolean {
  try { return sessionStorage.getItem(CHOSEN_KEY) === '1' } catch { return true }
}
export function clearLanguageChoice(): void {
  try { sessionStorage.removeItem(CHOSEN_KEY) } catch { /* ignore */ }
}

/** Resolve a matrícula ativa: parâmetro da rota → última usada → primeira. */
export function useActiveEnrollment(paramId?: string): { enrollment: Enrollment | undefined; all: Enrollment[] | undefined; loading: boolean } {
  const all = useEnrollments()
  if (!all) return { enrollment: undefined, all, loading: true }
  const wanted = paramId ? Number(paramId) : readActive()
  const enrollment = all.find((e) => e.id === wanted) ?? all[0]
  if (enrollment?.id != null && enrollment.id !== wanted) setActiveEnrollment(enrollment.id)
  return { enrollment, all, loading: false }
}

/** Marca o idioma ativo no <html> para a cor de destaque acompanhar (inglês azul, alemão âmbar). */
export function useLanguageTheme(): void {
  const { enrollment } = useActiveEnrollment()
  useEffect(() => {
    const root = document.documentElement
    if (enrollment) root.dataset.lang = enrollment.language
    else delete root.dataset.lang
  }, [enrollment?.language])
}
