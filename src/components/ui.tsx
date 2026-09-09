import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Componentes pequenos e compartilhados. Estilos vivem em index.css (.btn, .card…).

type Variant = 'primary' | 'secondary' | 'ghost'

export function Button({ variant = 'primary', to, block, className = '', children, ...rest }: { variant?: Variant; to?: string; block?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`
  if (to) return <Link to={to} className={cls} role="button">{children}</Link>
  return <button type="button" className={cls} {...rest}>{children}</button>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const color = kind === 'warn' ? 'var(--warn)' : kind === 'ok' ? 'var(--ok)' : 'var(--accent)'
  return (
    <div role={kind === 'warn' ? 'alert' : 'status'} className="card text-sm" style={{ borderLeft: `4px solid ${color}` }}>
      {children}
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="my-2">
      {label && <div className="flex justify-between text-sm mb-1"><span>{label}</span><span className="muted">{pct}%</span></div>}
      <div className="h-2 rounded-full" style={{ background: 'var(--border)' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
    </div>
  )
}

export interface ChoiceOption<T extends string | number> { value: T; label: string; description?: string; disabled?: boolean }

export function Choice<T extends string | number>({ options, value, onChange, multi = false, legend }: {
  options: ChoiceOption<T>[]
  value: T | T[] | undefined
  onChange: (v: T) => void
  multi?: boolean
  legend?: string
}) {
  const selected = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v)
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={legend} className="grid gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role={multi ? 'checkbox' : 'radio'}
          aria-checked={selected(o.value)}
          disabled={o.disabled}
          className="choice disabled:opacity-50"
          onClick={() => onChange(o.value)}
        >
          <span className="font-semibold">{o.label}</span>
          {o.description && <span className="block text-sm muted mt-0.5">{o.description}</span>}
        </button>
      ))}
    </div>
  )
}

export function Screen({ title, back, onBack, children, wide }: { title?: string; back?: string | true; onBack?: () => void; children: ReactNode; wide?: boolean }) {
  const nav = useNavigate()
  const hasBack = !!back || !!onBack
  return (
    <main className={`mx-auto px-4 pt-4 pb-28 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
      {(title || hasBack) && (
        <header className="flex items-center gap-2 mb-4">
          {hasBack && (
            <button type="button" aria-label="Voltar" className="btn btn-ghost px-2" onClick={() => (onBack ? onBack() : back === true ? nav(-1) : nav(back as string))}>
              ←
            </button>
          )}
          {title && <h1 className="text-2xl font-bold leading-tight">{title}</h1>}
        </header>
      )}
      {children}
    </main>
  )
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return <p className="muted p-4" role="status">{label}</p>
}
