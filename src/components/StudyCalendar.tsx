import { Flame, CalendarDays } from 'lucide-react'
import type { StudyStats } from '../lib/study'
import { formatBR } from '../lib/dates'

/** Calendário de dias estudados (12 semanas) + totais. Informação, não cobrança. */
export function StudyCalendar({ stats }: { stats: StudyStats }) {
  const weeks: StudyStats['grid'][] = []
  for (let i = 0; i < stats.grid.length; i += 7) weeks.push(stats.grid.slice(i, i + 7))
  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold flex items-center gap-2"><CalendarDays size={18} aria-hidden="true" /> Seus dias de estudo</h2>
        <span className="chip chip-accent"><Flame size={14} aria-hidden="true" /> {stats.currentStreak} dia{stats.currentStreak === 1 ? '' : 's'} seguidos</span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }} role="img" aria-label={`${stats.totalDays} dias estudados nas últimas 12 semanas`}>
        {weeks.map((w, i) => (
          <div key={i} className="grid gap-1">
            {w.map((d) => <div key={d.date} className={`heat ${d.studied ? 'on' : ''} ${d.future ? 'future' : ''}`} title={formatBR(d.date)} />)}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm mt-3">
        <span><b>{stats.totalDays}</b> dia{stats.totalDays === 1 ? '' : 's'} no total</span>
        <span className="muted">esta semana: <b>{stats.thisWeek}</b></span>
        <span className="muted">recorde: <b>{stats.longestStreak}</b></span>
      </div>
      <p className="text-xs muted mt-2">O app registra automaticamente cada dia em que você estuda. Não há meta obrigatória nem punição por pausar.</p>
    </div>
  )
}
