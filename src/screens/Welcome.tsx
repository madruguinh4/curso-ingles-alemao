import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { Notice, Spinner } from '../components/ui'
import { startLanguage, useEnrollments } from '../state/useEnrollments'
import { BackupRestore } from '../components/Backup'
import { Mascot, MASCOT_ORDER } from '../components/mascots/Mascots'

// Sem cadastro: a primeira tela é a escolha do idioma, e um toque abre a
// primeira aula. Nome, voz e lembretes ficam opcionais em Configurações.

export function Welcome() {
  const enrollments = useEnrollments()
  const nav = useNavigate()
  const [error, setError] = useState<string>()
  if (!enrollments) return <Spinner />
  if (enrollments.length) return <Navigate to="/" replace />

  async function pick(lang: Language) {
    try {
      await startLanguage(lang)
      nav('/', { replace: true })
    } catch (err) {
      setError(`Não consegui salvar neste navegador (${(err as Error).message}). Em modo privado ou com armazenamento bloqueado, o app não funciona.`)
    }
  }

  return (
    <main className="mx-auto max-w-md min-h-screen flex flex-col justify-end px-6 pb-10 pt-16">
      <div className="hero fade-in mb-6">
        <div className="flex justify-center -space-x-3" aria-hidden="true">
          {MASCOT_ORDER.map((id, i) => <Mascot key={id} id={id} size={i === 3 ? 64 : 48} decorative className="drop-shadow" />)}
        </div>
        <h1 className="text-3xl font-bold leading-tight mt-4">O que você quer aprender?</h1>
        <p className="mt-2 opacity-90">Aulas curtas, do zero, no seu ritmo — com uma turma que ajuda em cada passo.</p>
      </div>
      {error && <div className="mb-3"><Notice kind="warn">{error}</Notice></div>}
      <div className="grid gap-3">
        {(['en', 'de'] as Language[]).map((l) => (
          <button key={l} type="button" className="card flex items-center gap-3 text-left" data-lang={l} onClick={() => pick(l)}>
            <span className="chip chip-accent font-mono text-base px-3 py-1">{l.toUpperCase()}</span>
            <span className="grow text-xl font-bold">{LANGUAGE_NAMES[l]}</span>
            <ChevronRight className="muted" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="text-xs muted text-center mt-3">Sem cadastro. Seu progresso fica salvo neste aparelho.</p>
      <div className="mt-2"><BackupRestore label="Já estudava em outro aparelho? Restaurar cópia" onDone={() => nav('/', { replace: true })} /></div>
    </main>
  )
}
