import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { db, requestPersistentStorage } from './lib/db'

// Quem já estuda: garante que o navegador não apague o progresso.
db.enrollments.count().then((n) => { if (n) void requestPersistentStorage() }).catch(() => {})

// App instalado no celular costuma só voltar do segundo plano, sem recarregar:
// procura versão nova sempre que ele volta para a tela.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {})
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
