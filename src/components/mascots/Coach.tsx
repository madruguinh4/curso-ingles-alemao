import type { ReactNode } from 'react'
import { MASCOTS, Mascot, type MascotId, type Mood } from './Mascots'

// Mascote + balão de fala. O nome aparece pequeno para o aluno ir conhecendo
// a turma; o tom colore o balão (acerto/erro) sem depender só da cor.

export function Coach({ who, mood = 'happy', size = 52, tone, children }: {
  who: MascotId
  mood?: Mood
  size?: number
  tone?: 'ok' | 'err'
  children: ReactNode
}) {
  return (
    <div className="coach flex items-end gap-2">
      <Mascot id={who} mood={mood} size={size} decorative className="shrink-0" />
      <div className={`coach-bubble grow ${tone ? `coach-${tone}` : ''}`}>
        <p className="text-xs font-semibold muted">{MASCOTS[who].name}</p>
        <div>{children}</div>
      </div>
    </div>
  )
}
