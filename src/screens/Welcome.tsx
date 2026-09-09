import { Navigate } from 'react-router-dom'
import { Button, Spinner } from '../components/ui'
import { useEnrollments } from '../state/useEnrollments'

// Sem explicações longas no início: nome e idioma vêm no onboarding.
// "Sobre o curso" fica em Mais → Sobre.

export function Welcome() {
  const enrollments = useEnrollments()
  if (!enrollments) return <Spinner />
  if (enrollments.length) return <Navigate to="/" replace />
  return (
    <main className="mx-auto max-w-md min-h-screen flex flex-col justify-end px-6 pb-10 pt-16">
      <div className="hero fade-in mb-6">
        <img src={`${import.meta.env.BASE_URL}icons/logo.svg`} alt="" width={72} height={72} className="rounded-2xl shadow-lg" />
        <h1 className="text-3xl font-bold leading-tight mt-4">Inglês ou alemão,<br />no seu ritmo.</h1>
        <p className="mt-2 opacity-90">Aulas curtas, explicações em português e um plano de um ano que termina de verdade.</p>
      </div>
      <Button to="/onboarding" block>Começar</Button>
      <p className="text-xs muted text-center mt-3">Sem cadastro. Tudo fica só neste aparelho.</p>
    </main>
  )
}
