import { NavLink, useLocation } from 'react-router-dom'
import { Home, Map, RefreshCw, BarChart3, MoreHorizontal } from 'lucide-react'
import { useActiveEnrollment } from '../state/useEnrollments'

const HIDDEN = ['/welcome', '/onboarding', '/language', '/lesson/', '/assessment/']

export function Nav() {
  const { pathname } = useLocation()
  const { enrollment } = useActiveEnrollment()
  if (HIDDEN.some((p) => pathname.startsWith(p)) || !enrollment) return null
  const id = enrollment.id
  const items = [
    { to: '/', label: 'Início', Icon: Home },
    { to: `/map/${id}`, label: 'Trilha', Icon: Map },
    { to: `/review/${id}`, label: 'Revisão', Icon: RefreshCw },
    { to: `/progress/${id}`, label: 'Progresso', Icon: BarChart3 },
    { to: '/more', label: 'Mais', Icon: MoreHorizontal },
  ]
  return (
    <nav aria-label="Navegação principal" className="fixed bottom-0 inset-x-0 border-t backdrop-blur" style={{ background: 'color-mix(in srgb, var(--card) 88%, transparent)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto max-w-md grid grid-cols-5 px-2 py-1 gap-1">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} aria-current={pathname === to ? 'page' : undefined}>
              <Icon size={22} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
