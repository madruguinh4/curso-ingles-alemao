import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, storageAvailable } from '../lib/db'
import { saveProfile, useProfile } from '../state/useTheme'
import { Button, Card, Choice, Notice, Screen } from '../components/ui'

function isIosSafariNotInstalled(): boolean {
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  return ios && !standalone
}

export function Settings() {
  const p = useProfile()
  const nav = useNavigate()
  const [name, setName] = useState(p.name)
  const [confirm, setConfirm] = useState(0)
  const [storage, setStorage] = useState<boolean | null>(null)
  useEffect(() => { setName(p.name) }, [p.name])
  useEffect(() => { storageAvailable().then(setStorage) }, [])

  async function wipe() {
    await db.delete()
    try { localStorage.clear() } catch { /* ignore */ }
    await db.open()
    nav('/welcome', { replace: true })
  }

  return (
    <Screen title="Perfil e configurações" back="/more">
      <div className="grid gap-4">
        {storage === false && <Notice kind="warn">Este navegador não permite salvar dados (modo privado ou armazenamento bloqueado). Seu progresso <b>não será salvo</b>.</Notice>}
        {isIosSafariNotInstalled() && (
          <Notice>
            <b>Instalar no iPhone:</b> no Safari, toque em <b>Compartilhar</b> (o quadrado com a seta) e depois em <b>Adicionar à Tela de Início</b>. O app passa a abrir em tela cheia e funciona offline.
          </Notice>
        )}

        <Card>
          <label className="block font-semibold mb-1" htmlFor="name">Nome</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveProfile({ name: name.trim() })} />
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Tema</h2>
          <Choice legend="Tema" value={p.theme} onChange={(v) => saveProfile({ theme: v })}
            options={[{ value: 'system' as const, label: 'Automático (segue o sistema)' }, { value: 'light' as const, label: 'Claro' }, { value: 'dark' as const, label: 'Escuro' }]} />
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Tamanho do texto</h2>
          <Choice legend="Tamanho do texto" value={p.textScale} onChange={(v) => saveProfile({ textScale: v })}
            options={[{ value: 1 as const, label: 'Normal' }, { value: 1.15 as const, label: 'Grande' }, { value: 1.3 as const, label: 'Muito grande' }]} />
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Microfone</h2>
          <Choice legend="Microfone" value={p.micAllowed ? 'sim' : 'nao'} onChange={(v) => saveProfile({ micAllowed: v === 'sim' })}
            options={[{ value: 'sim', label: 'Posso falar em voz alta' }, { value: 'nao', label: 'Nem sempre' }]} />
          <p className="text-sm muted mt-2">O app não grava nem reconhece voz nesta versão. Esta opção só muda as instruções das atividades orais.</p>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Seus dados</h2>
          <p className="text-sm muted mb-3">Tudo (perfil, planos, progresso, cartões) fica apenas neste aparelho, no armazenamento do navegador. Não há conta, servidor nem gravações de áudio. Excluir apaga tudo de forma imediata e irreversível.</p>
          {confirm === 0 && <Button variant="secondary" block onClick={() => setConfirm(1)}>Excluir todos os meus dados</Button>}
          {confirm === 1 && (
            <div className="grid gap-2">
              <Notice kind="warn">Tem certeza? Isso apaga seus planos e todo o progresso. Antes, você pode baixar o kit na tela de Conclusão.</Notice>
              <Button block onClick={wipe} style={{ background: 'var(--err)', color: '#fff' }}>Sim, excluir tudo</Button>
              <Button variant="secondary" block onClick={() => setConfirm(0)}>Cancelar</Button>
            </div>
          )}
        </Card>

        <p className="text-xs muted">Versão local — sem conta, sem IA, sem serviços externos. Conteúdo: semana 1 de cada idioma; demais semanas mapeadas, aulas em produção.</p>
      </div>
    </Screen>
  )
}
