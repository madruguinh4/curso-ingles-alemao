import { Link } from 'react-router-dom'
import { CalendarRange, Library, MessageCircle, Download, Languages, Plus, Settings, Info, ChevronRight } from 'lucide-react'
import { useActiveEnrollment } from '../state/useEnrollments'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { Screen, Spinner } from '../components/ui'

export function More() {
  const { enrollment, all, loading } = useActiveEnrollment()
  if (loading || !enrollment) return <Spinner />
  const id = enrollment.id
  const lang = LANGUAGE_NAMES[enrollment.language]
  const missing = (['en', 'de'] as Language[]).filter((l) => !all?.some((e) => e.language === l))
  const links = [
    { to: `/plan/${id}`, label: `Plano de um ano — ${lang}`, desc: 'As 52 semanas e o que cada uma ensina', Icon: CalendarRange },
    { to: `/library/${id}`, label: `Biblioteca — ${lang}`, desc: 'Vocabulário, gramática e termos', Icon: Library },
    { to: `/talk/${id}`, label: `Conversação — ${lang}`, desc: 'Prática oral e o que não está nesta versão', Icon: MessageCircle },
    { to: `/finish/${id}`, label: `Kit de continuidade — ${lang}`, desc: 'Baixar o kit (HTML) e os cartões (CSV)', Icon: Download },
    { to: '/language', label: (all?.length ?? 0) > 1 ? 'Trocar idioma' : 'Idiomas', desc: 'Escolher o que estudar agora', Icon: Languages },
    ...missing.map((l) => ({ to: `/onboarding?add=${l}`, label: `Adicionar ${LANGUAGE_NAMES[l]}`, desc: 'Plano separado, com progresso próprio', Icon: Plus })),
    { to: '/settings', label: 'Perfil e configurações', desc: 'Nome, voz, tema, tamanho do texto, dados', Icon: Settings },
    { to: '/about', label: 'Sobre o curso', desc: 'O que ele é, o que não é, metas realistas', Icon: Info },
  ]
  return (
    <Screen title="Mais">
      <div className="grid gap-2">
        {links.map(({ to, label, desc, Icon }) => (
          <Link key={to} to={to} className="card flex items-center gap-3 py-3">
            <span className="grid place-items-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon size={20} /></span>
            <span className="grow"><span className="font-semibold">{label}</span><span className="block text-sm muted">{desc}</span></span>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
      </div>
    </Screen>
  )
}
