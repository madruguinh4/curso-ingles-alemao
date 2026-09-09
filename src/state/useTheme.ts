import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Profile } from '../lib/db'

export const DEFAULT_PROFILE: Profile = { id: 'me', name: '', theme: 'system', textScale: 1, micAllowed: false, createdAt: '' }

export function useProfile(): Profile {
  return useLiveQuery(() => db.profile.get('me'), []) ?? DEFAULT_PROFILE
}

export async function saveProfile(patch: Partial<Profile>): Promise<void> {
  const current = (await db.profile.get('me')) ?? { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }
  await db.profile.put({ ...current, ...patch, id: 'me' })
}

/** Aplica tema (claro/escuro/sistema) e tamanho do texto no <html>. */
export function useApplyTheme(): void {
  const p = useProfile()
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = p.theme === 'dark' || (p.theme === 'system' && mq.matches)
      root.dataset.theme = dark ? 'dark' : 'light'
      root.style.setProperty('--text-scale', String(p.textScale))
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f172a' : '#f8fafc')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [p.theme, p.textScale])
}
