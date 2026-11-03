import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, requestPersistentStorage, type Enrollment } from '../lib/db'
import { todayISO } from '../lib/dates'
import type { Language } from '../lib/types'

const ACTIVE_KEY = 'activeEnrollmentId'

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

/** Sem cadastro: um toque no idioma já abre o curso. Reaproveita a matrícula se ela existir. */
export async function startLanguage(language: Language): Promise<number> {
  const existing = await db.enrollments.where('language').equals(language).first()
  const id = existing?.id ?? ((await db.enrollments.add({ language, level: 'zero', goal: 'pessoal', startDate: todayISO(), createdAt: new Date().toISOString() })) as number)
  setActiveEnrollment(id)
  void requestPersistentStorage()
  return id
}

/** Resolve a matrícula ativa: parâmetro da rota → última usada → primeira. Ao voltar ao app, cai direto no idioma em que parou. */
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
