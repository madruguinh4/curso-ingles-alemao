import type { ReactElement } from 'react'

// A turma: 7 animais brasileiros, cada um com UMA função fixa no curso, para
// o aluno saber o que vem só de ver quem apareceu. Desenhos em SVG próprio
// (sem imagens externas), viewBox 120×120, com humor que muda a expressão.

export type Mood = 'happy' | 'cheer' | 'calm' | 'think'
export type MascotId = 'tico' | 'zeca' | 'bia' | 'lu' | 'rafa' | 'nina' | 'dudu'

const INK = '#1f2937'
const CHEEK = '#fb7185'

function Eye({ x, y, r, mood }: { x: number; y: number; r: number; mood: Mood }) {
  if (mood === 'cheer') return <path d={`M${x - r} ${y + 1} Q${x} ${y - r * 1.4} ${x + r} ${y + 1}`} stroke={INK} strokeWidth={r * 0.55} fill="none" strokeLinecap="round" />
  const dx = mood === 'think' ? r * 0.3 : 0
  const dy = mood === 'think' ? -r * 0.3 : r * 0.1
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + dx} cy={y + dy} r={r * 0.62} fill={INK} />
      <circle cx={x + dx + r * 0.22} cy={y + dy - r * 0.25} r={r * 0.22} fill="#fff" />
      {mood === 'calm' && <path d={`M${x - r * 0.8} ${y - r * 1.45} Q${x} ${y - r * 2.05} ${x + r * 0.8} ${y - r * 1.45}`} stroke={INK} strokeWidth={r * 0.28} fill="none" strokeLinecap="round" />}
    </g>
  )
}

function Mouth({ x, y, w, mood }: { x: number; y: number; w: number; mood: Mood }) {
  if (mood === 'cheer') return (
    <g>
      <path d={`M${x - w} ${y} Q${x} ${y + w * 1.7} ${x + w} ${y} Z`} fill={INK} />
      <ellipse cx={x} cy={y + w * 0.62} rx={w * 0.45} ry={w * 0.22} fill={CHEEK} />
    </g>
  )
  const d = mood === 'think' ? `M${x - w * 0.5} ${y + 1} L${x + w * 0.5} ${y - 1}` : mood === 'calm' ? `M${x - w * 0.6} ${y} Q${x} ${y + w * 0.45} ${x + w * 0.6} ${y}` : `M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}`
  return <path d={d} stroke={INK} strokeWidth={w * 0.32} fill="none" strokeLinecap="round" />
}

const Cheeks = ({ y, x1, x2, r = 5 }: { y: number; x1: number; x2: number; r?: number }) => (
  <g opacity={0.5}><ellipse cx={x1} cy={y} rx={r} ry={r * 0.65} fill={CHEEK} /><ellipse cx={x2} cy={y} rx={r} ry={r * 0.65} fill={CHEEK} /></g>
)

const Shadow = () => <ellipse cx={60} cy={114} rx={34} ry={4} fill="#000" opacity={0.08} />

/** Tico, o tucano: explica as regras. */
function Tico({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <ellipse cx={46} cy={72} rx={32} ry={38} fill="#1e293b" />
      <ellipse cx={44} cy={84} rx={19} ry={22} fill="#f8fafc" />
      <ellipse cx={22} cy={78} rx={9} ry={20} fill="#0f172a" transform={mood === 'cheer' ? 'rotate(-35 22 78)' : 'rotate(12 22 78)'} />
      <circle cx={44} cy={50} r={12} fill="#38bdf8" />
      <Eye x={44} y={50} r={6.5} mood={mood} />
      <path d="M56 44 C76 30 108 32 114 50 C106 60 80 62 56 58 Z" fill="#f97316" />
      <path d="M56 44 C76 30 104 32 111 43 C94 41 76 44 56 49 Z" fill="#facc15" />
      <path d="M108 44 C112 46 114 48 114 50 C111 52 108 52 106 50 Z" fill="#9a3412" />
      <path d="M38 108 l-4 6 M38 108 l2 6 M54 108 l-2 6 M54 108 l4 6" stroke="#f97316" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

function maneSpikes(cx: number, cy: number, r1: number, r2: number, n: number): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1
    const a = (Math.PI * i) / n
    pts.push(`${(cx + r * Math.sin(a)).toFixed(1)},${(cy - r * Math.cos(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** Zeca, o mico-leão-dourado: comemora os acertos. */
function Zeca({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <path d="M86 96 C108 94 110 72 96 70" stroke="#f59e0b" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={60} cy={98} rx={17} ry={15} fill="#f59e0b" />
      <ellipse cx={60} cy={102} rx={9} ry={8} fill="#fcd9b6" />
      <ellipse cx={50} cy={111} rx={6} ry={3.5} fill="#d97706" />
      <ellipse cx={70} cy={111} rx={6} ry={3.5} fill="#d97706" />
      <polygon points={maneSpikes(60, 54, 42, 33, 14)} fill="#f59e0b" />
      <circle cx={60} cy={54} r={34} fill="#fbbf24" />
      <ellipse cx={60} cy={60} rx={22} ry={25} fill="#fcd9b6" />
      <Eye x={51} y={55} r={5.5} mood={mood} />
      <Eye x={69} y={55} r={5.5} mood={mood} />
      <ellipse cx={60} cy={66} rx={4} ry={2.6} fill="#7c2d12" />
      <Cheeks y={68} x1={45} x2={75} r={4.5} />
      <Mouth x={60} y={73} w={6} mood={mood} />
      {mood === 'cheer' && <path d="M30 96 L18 78 M90 96 L104 80" stroke="#f59e0b" strokeWidth={7} strokeLinecap="round" />}
    </g>
  )
}

/** Bia, a capivara: ajuda quando você erra. */
function Bia({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <rect x={16} y={56} width={88} height={54} rx={27} fill="#a16207" />
      <circle cx={34} cy={34} r={7} fill="#854d0e" />
      <circle cx={86} cy={34} r={7} fill="#854d0e" />
      <rect x={24} y={28} width={72} height={66} rx={32} fill="#c08a4b" />
      <circle cx={60} cy={24} r={7} fill="#fb923c" />
      <path d="M60 17 q5 -6 10 -3" stroke="#16a34a" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Eye x={45} y={50} r={4.5} mood={mood} />
      <Eye x={75} y={50} r={4.5} mood={mood} />
      <rect x={38} y={60} width={44} height={28} rx={14} fill="#8b5a2b" />
      <ellipse cx={52} cy={67} rx={2.6} ry={3.4} fill={INK} />
      <ellipse cx={68} cy={67} rx={2.6} ry={3.4} fill={INK} />
      <Cheeks y={62} x1={33} x2={87} r={4.5} />
      <Mouth x={60} y={78} w={6} mood={mood} />
    </g>
  )
}

/** Lu, a lebre: cuida da parte de ouvir. */
function Lu({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <ellipse cx={44} cy={30} rx={9} ry={27} fill="#c4b5fd" transform="rotate(-12 44 30)" />
      <ellipse cx={44} cy={32} rx={4.5} ry={19} fill="#f9a8d4" transform="rotate(-12 44 32)" />
      <ellipse cx={76} cy={30} rx={9} ry={27} fill="#c4b5fd" transform={`rotate(${mood === 'think' ? 40 : 12} 76 52)`} />
      <ellipse cx={76} cy={32} rx={4.5} ry={19} fill="#f9a8d4" transform={`rotate(${mood === 'think' ? 40 : 12} 76 52)`} />
      <ellipse cx={60} cy={102} rx={24} ry={12} fill="#c4b5fd" />
      <circle cx={60} cy={72} r={32} fill="#ddd6fe" />
      <Eye x={49} y={67} r={5.5} mood={mood} />
      <Eye x={71} y={67} r={5.5} mood={mood} />
      <Cheeks y={79} x1={41} x2={79} />
      <path d="M56 76 L64 76 L60 80 Z" fill="#ec4899" />
      <Mouth x={60} y={84} w={5} mood={mood} />
      {mood !== 'cheer' && <rect x={57.5} y={84} width={5} height={5} rx={1} fill="#fff" />}
    </g>
  )
}

/** Rafa, o papagaio: chama você para falar e escrever. */
function Rafa({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <ellipse cx={50} cy={22} rx={5} ry={13} fill="#ef4444" transform="rotate(-25 50 30)" />
      <ellipse cx={60} cy={18} rx={5} ry={14} fill="#f97316" />
      <ellipse cx={70} cy={22} rx={5} ry={13} fill="#ef4444" transform="rotate(25 70 30)" />
      <ellipse cx={24} cy={78} rx={10} ry={24} fill="#3b82f6" transform={mood === 'cheer' ? 'rotate(40 24 70)' : 'rotate(10 24 78)'} />
      <ellipse cx={96} cy={78} rx={10} ry={24} fill="#3b82f6" transform={mood === 'cheer' ? 'rotate(-40 96 70)' : 'rotate(-10 96 78)'} />
      <ellipse cx={60} cy={68} rx={34} ry={42} fill="#22c55e" />
      <ellipse cx={60} cy={88} rx={20} ry={18} fill="#86efac" />
      <circle cx={47} cy={54} r={9} fill="#f0fdf4" />
      <circle cx={73} cy={54} r={9} fill="#f0fdf4" />
      <Eye x={47} y={54} r={5.5} mood={mood} />
      <Eye x={73} y={54} r={5.5} mood={mood} />
      <path d="M50 64 Q60 56 70 64 Q70 76 60 82 Q51 75 50 64 Z" fill="#fbbf24" />
      <path d="M52 70 Q60 74 68 70 Q66 78 60 82 Q54 77 52 70 Z" fill={mood === 'cheer' ? INK : '#f59e0b'} />
    </g>
  )
}

/** Nina, a tartaruga: acompanha a revisão — devagar e sempre. */
function Nina({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <path d="M12 90 Q12 34 60 32 Q108 34 108 90 Z" fill="#059669" />
      <polygon points="60,40 72,47 72,61 60,68 48,61 48,47" fill="#10b981" />
      <polygon points="34,56 44,62 44,74 34,80 24,74 24,62" fill="#10b981" />
      <polygon points="86,56 96,62 96,74 86,80 76,74 76,62" fill="#10b981" />
      <rect x={10} y={86} width={100} height={10} rx={5} fill="#047857" />
      <ellipse cx={32} cy={106} rx={10} ry={6} fill="#6ee7b7" />
      <ellipse cx={88} cy={106} rx={10} ry={6} fill="#6ee7b7" />
      <circle cx={60} cy={84} r={22} fill="#6ee7b7" />
      <Eye x={52} y={80} r={4.5} mood={mood} />
      <Eye x={68} y={80} r={4.5} mood={mood} />
      <g stroke={INK} strokeWidth={2} fill="none"><circle cx={52} cy={80} r={7.5} /><circle cx={68} cy={80} r={7.5} /><path d="M59.5 80 h1" /></g>
      <Cheeks y={90} x1={45} x2={75} r={4} />
      <Mouth x={60} y={93} w={5} mood={mood} />
    </g>
  )
}

/** Dudu, o tatu-bola: conta seus dias de estudo. */
function Dudu({ mood }: { mood: Mood }) {
  return (
    <g>
      <Shadow />
      <ellipse cx={60} cy={66} rx={46} ry={40} fill="#94a3b8" />
      <g stroke="#64748b" strokeWidth={3} fill="none">
        <path d="M18 56 Q60 36 102 56" /><path d="M15 70 Q60 50 105 70" /><path d="M18 84 Q60 66 102 84" />
      </g>
      <path d="M42 50 L38 34 L52 46 Z" fill="#cbd5e1" />
      <path d="M78 50 L82 34 L68 46 Z" fill="#cbd5e1" />
      <circle cx={60} cy={76} r={24} fill="#e2e8f0" />
      <rect x={36} y={60} width={48} height={7} rx={3.5} fill="#ef4444" />
      <Eye x={51} y={74} r={4.5} mood={mood} />
      <Eye x={69} y={74} r={4.5} mood={mood} />
      <ellipse cx={60} cy={86} rx={9} ry={6} fill="#cbd5e1" />
      <ellipse cx={60} cy={83} rx={3.5} ry={2.5} fill={INK} />
      <Cheeks y={84} x1={44} x2={76} r={4} />
      <Mouth x={60} y={91} w={4.5} mood={mood} />
      <ellipse cx={42} cy={106} rx={8} ry={5} fill="#94a3b8" />
      <ellipse cx={78} cy={106} rx={8} ry={5} fill="#94a3b8" />
    </g>
  )
}

export const MASCOTS: Record<MascotId, { name: string; animal: string; role: string; Art: (p: { mood: Mood }) => ReactElement }> = {
  tico: { name: 'Tico', animal: 'tucano', role: 'Explica as regras', Art: Tico },
  zeca: { name: 'Zeca', animal: 'mico-leão-dourado', role: 'Comemora seus acertos', Art: Zeca },
  bia: { name: 'Bia', animal: 'capivara', role: 'Ajuda quando você erra', Art: Bia },
  lu: { name: 'Lu', animal: 'lebre', role: 'Cuida da parte de ouvir', Art: Lu },
  rafa: { name: 'Rafa', animal: 'papagaio', role: 'Chama você para falar e escrever', Art: Rafa },
  nina: { name: 'Nina', animal: 'tartaruga', role: 'Acompanha a revisão', Art: Nina },
  dudu: { name: 'Dudu', animal: 'tatu-bola', role: 'Conta seus dias de estudo', Art: Dudu },
}

export const MASCOT_ORDER: MascotId[] = ['tico', 'zeca', 'bia', 'lu', 'rafa', 'nina', 'dudu']

export function Mascot({ id, mood = 'happy', size = 56, className = '', decorative = false }: { id: MascotId; mood?: Mood; size?: number; className?: string; decorative?: boolean }) {
  const m = MASCOTS[id]
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={`mascot mascot-${mood} ${className}`}
      role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${m.name}, ${m.animal}`}>
      <m.Art mood={mood} />
    </svg>
  )
}
