import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

// Componentes pequenos e compartilhados. Estilos vivem em index.css.

type Variant = 'primary' | 'secondary' | 'ghost'

export function Button({ variant = 'primary', to, block, size, icon, className = '', children, ...rest }: {
  variant?: Variant; to?: string; block?: boolean; size?: 'sm'; icon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `btn btn-${variant} ${block ? 'btn-block' : ''} ${size === 'sm' ? 'btn-sm' : ''} ${className}`
  const inner = <>{icon}{children}</>
  if (to) return <Link to={to} className={cls} role="button">{inner}</Link>
  return <button type="button" className={cls} {...rest}>{inner}</button>
}

export function Card({ children, className = '', flat }: { children: ReactNode; className?: string; flat?: boolean }) {
  return <div className={`${flat ? 'card-flat' : 'card'} fade-in ${className}`}>{children}</div>
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const color = kind === 'warn' ? 'var(--warn)' : kind === 'ok' ? 'var(--ok)' : 'var(--accent)'
  const bg = kind === 'warn' ? 'var(--warn-soft)' : kind === 'ok' ? 'var(--ok-soft)' : 'var(--accent-soft)'
  const Icon = kind === 'warn' ? AlertTriangle : kind === 'ok' ? CheckCircle2 : Info
  return (
    <div role={kind === 'warn' ? 'alert' : 'status'} className="rounded-2xl p-3 text-sm flex gap-2 items-start" style={{ background: bg }}>
      <Icon size={18} style={{ color, flex: 'none', marginTop: 2 }} aria-hidden="true" />
      <div className="grow">{children}</div>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="my-2">
      {label && <div className="flex justify-between text-sm mb-1"><span>{label}</span><span className="muted">{pct}%</span></div>}
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
    </div>
  )
}

/** Anel de progresso (SVG). */
export function Ring({ value, size = 72, stroke = 8, label, children }: { value: number; size?: number; stroke?: number; label?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute text-center leading-tight">{children ?? <span className="font-bold">{Math.round(v * 100)}%</span>}</div>
    </div>
  )
}

export interface ChoiceOption<T extends string | number> { value: T; label: string; description?: string; disabled?: boolean; icon?: ReactNode }

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
      {options.map((o) => {
        const on = selected(o.value)
        return (
          <button key={String(o.value)} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={on} disabled={o.disabled} className="choice disabled:opacity-50" onClick={() => onChange(o.value)}>
            <span className="dot" aria-hidden="true">{on && <Check size={14} strokeWidth={3} />}</span>
            <span className="grow">
              <span className="font-semibold flex items-center gap-2">{o.icon}{o.label}</span>
              {o.description && <span className="block text-sm muted mt-0.5">{o.description}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function Screen({ title, back, onBack, children, wide, subtitle }: { title?: string; back?: string | true; onBack?: () => void; children: ReactNode; wide?: boolean; subtitle?: string }) {
  const nav = useNavigate()
  const hasBack = !!back || !!onBack
  return (
    <main className={`mx-auto px-4 pt-4 pb-28 ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
      {(title || hasBack) && (
        <header className="flex items-center gap-2 mb-4">
          {hasBack && (
            <button type="button" aria-label="Voltar" className="btn btn-ghost px-2" onClick={() => (onBack ? onBack() : back === true ? nav(-1) : nav(back as string))}>
              <ArrowLeft size={22} />
            </button>
          )}
          <div>
            {title && <h1 className="text-2xl font-bold leading-tight">{title}</h1>}
            {subtitle && <p className="text-sm muted">{subtitle}</p>}
          </div>
        </header>
      )}
      {children}
    </main>
  )
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return <p className="muted p-4 text-center" role="status">{label}</p>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2">
      <h2 className="text-lg font-bold">{children}</h2>
      {action}
    </div>
  )
}
