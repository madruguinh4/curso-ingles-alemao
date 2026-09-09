import { NavLink, useLocation } from 'react-router-dom'
import { useActiveEnrollment } from '../state/useEnrollments'

const HIDDEN = ['/welcome', '/onboarding', '/lesson/', '/assessment/']

export function Nav() {
  const { pathname } = useLocation()
  const { enrollment } = useActiveEnrollment()
  if (HIDDEN.some((p) => pathname.startsWith(p)) || !enrollment) return null
  const id = enrollment.id
  const items = [
    { to: '/', label: 'Início', icon: '⌂' },
    { to: `/map/${id}`, label: 'Mapa', icon: '▦' },
    { to: `/review/${id}`, label: 'Revisão', icon: '↻' },
    { to: `/progress/${id}`, label: 'Progresso', icon: '◔' },
    { to: '/more', label: 'Mais', icon: '⋯' },
  ]
  return (
    <nav aria-label="Navegação principal" className="fixed bottom-0 inset-x-0 border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto max-w-lg grid grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) => `flex flex-col items-center py-2 text-xs ${isActive ? 'font-bold' : 'muted'}`}
              style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : undefined })}
              aria-current={pathname === it.to ? 'page' : undefined}
            >
              <span aria-hidden="true" className="text-lg leading-none">{it.icon}</span>
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
