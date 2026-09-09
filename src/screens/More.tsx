import { Link } from 'react-router-dom'
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
    { to: `/plan/${id}`, label: `Plano de 6 meses — ${lang}`, desc: 'Datas, objetivos por etapa e conteúdo disponível' },
    { to: `/library/${id}`, label: `Biblioteca — ${lang}`, desc: 'Vocabulário e gramática das aulas' },
    { to: `/talk/${id}`, label: `Conversação — ${lang}`, desc: 'Prática oral e o que não está nesta versão' },
    { to: `/finish/${id}`, label: `Conclusão e exportação — ${lang}`, desc: 'Baixar o kit (HTML) e os cartões (CSV)' },
    { to: '/language', label: (all?.length ?? 0) > 1 ? 'Trocar idioma' : 'Idiomas', desc: (all?.length ?? 0) > 1 ? 'Escolher o que estudar agora' : 'Seu plano atual e opções' },
    ...missing.map((l) => ({ to: `/onboarding?add=${l}`, label: `Adicionar ${LANGUAGE_NAMES[l]}`, desc: 'Plano separado, com tempo e progresso próprios' })),
    { to: '/settings', label: 'Perfil e configurações', desc: 'Nome, tema, tamanho do texto, excluir dados' },
  ]
  return (
    <Screen title="Mais">
      <div className="grid gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="card block">
            <span className="font-semibold">{l.label}</span>
            <span className="block text-sm muted">{l.desc}</span>
          </Link>
        ))}
      </div>
    </Screen>
  )
}
