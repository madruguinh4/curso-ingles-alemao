import { Link } from 'react-router-dom'
import { useActiveEnrollment, setActiveEnrollment } from '../state/useEnrollments'
import { LANGUAGE_NAMES } from '../lib/types'
import { Card, Screen, Spinner } from '../components/ui'

export function More() {
  const { enrollment, all, loading } = useActiveEnrollment()
  if (loading) return <Spinner />
  const id = enrollment?.id
  const links = [
    { to: `/plan/${id}`, label: 'Plano de 6 meses', desc: 'Datas, objetivos por etapa e conteúdo disponível' },
    { to: `/library/${id}`, label: 'Biblioteca', desc: 'Vocabulário e gramática das aulas' },
    { to: `/talk/${id}`, label: 'Conversação', desc: 'Prática oral e o que não está nesta versão' },
    { to: `/finish/${id}`, label: 'Conclusão e exportação', desc: 'Baixar o kit (HTML) e os cartões (CSV)' },
    { to: '/settings', label: 'Perfil e configurações', desc: 'Nome, tema, tamanho do texto, excluir dados' },
  ]
  return (
    <Screen title="Mais">
      <div className="grid gap-3">
        {all && all.length > 1 && (
          <Card>
            <h2 className="font-semibold mb-2">Idioma ativo</h2>
            <div className="flex gap-2">
              {all.map((e) => (
                <button key={e.id} type="button" className="choice" aria-pressed={e.id === id} onClick={() => { setActiveEnrollment(e.id!); location.reload() }}>
                  {LANGUAGE_NAMES[e.language]}
                </button>
              ))}
            </div>
          </Card>
        )}
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
