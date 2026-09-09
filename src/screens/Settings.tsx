import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, Sparkles } from 'lucide-react'
import { db, storageAvailable } from '../lib/db'
import { saveProfile, useProfile } from '../state/useTheme'
import { useEnrollments } from '../state/useEnrollments'
import { voicesFor, isNeural, speak, ttsSupported } from '../lib/tts'
import { LANGUAGE_NAMES, type Language } from '../lib/types'
import { Button, Card, Choice, Notice, Screen } from '../components/ui'
import { RemindersCard } from '../components/Reminders'

function isIosSafariNotInstalled(): boolean {
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  return ios && !standalone
}

const SAMPLE: Record<Language, string> = { en: "Hi! I'm Ana. Nice to meet you.", de: 'Hallo! Ich bin Lucas. Freut mich!' }

export function Settings() {
  const p = useProfile()
  const nav = useNavigate()
  const enrollments = useEnrollments()
  const [name, setName] = useState(p.name)
  const [confirm, setConfirm] = useState(0)
  const [storage, setStorage] = useState<boolean | null>(null)
  useEffect(() => { setName(p.name) }, [p.name])
  useEffect(() => { storageAvailable().then(setStorage) }, [])

  async function wipe() {
    await db.delete()
    try { localStorage.clear(); sessionStorage.clear() } catch { /* ignore */ }
    await db.open()
    nav('/welcome', { replace: true })
  }

  const langs = [...new Set((enrollments ?? []).map((e) => e.language))]

  return (
    <Screen title="Perfil e configurações" back="/more">
      <div className="grid gap-4">
        {storage === false && <Notice kind="warn">Este navegador não permite salvar dados. Seu progresso <b>não será salvo</b>.</Notice>}
        {isIosSafariNotInstalled() && <Notice><b>Instalar no iPhone:</b> no Safari, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</Notice>}

        <Card>
          <label className="block font-semibold mb-1" htmlFor="name">Nome</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveProfile({ name: name.trim() })} />
        </Card>

        {(enrollments ?? []).map((e) => <RemindersCard key={e.id} enrollmentId={e.id!} lang={e.language} />)}
        {langs.map((l) => <VoicePicker key={l} lang={l} value={p.voices?.[l] ?? ''} onChange={(uri) => saveProfile({ voices: { ...(p.voices ?? {}), [l]: uri } })} />)}

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
          <h2 className="font-semibold mb-2">Falar em voz alta</h2>
          <Choice legend="Microfone" value={p.micAllowed ? 'sim' : 'nao'} onChange={(v) => saveProfile({ micAllowed: v === 'sim' })}
            options={[{ value: 'sim', label: 'Posso falar em voz alta' }, { value: 'nao', label: 'Nem sempre' }]} />
          <p className="text-sm muted mt-2">Só muda as instruções das atividades orais. O app não grava nem reconhece voz nesta versão.</p>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Seus dados</h2>
          <p className="text-sm muted mb-3">Tudo fica apenas neste aparelho. Não há conta, servidor nem gravações. Excluir apaga tudo de forma imediata e irreversível.</p>
          {confirm === 0 && <Button variant="secondary" block onClick={() => setConfirm(1)}>Excluir todos os meus dados</Button>}
          {confirm === 1 && (
            <div className="grid gap-2">
              <Notice kind="warn">Tem certeza? Antes, você pode baixar o kit na tela de Conclusão.</Notice>
              <Button block onClick={wipe} style={{ background: 'var(--err)', color: '#fff' }}>Sim, excluir tudo</Button>
              <Button variant="secondary" block onClick={() => setConfirm(0)}>Cancelar</Button>
            </div>
          )}
        </Card>
      </div>
    </Screen>
  )
}

function VoicePicker({ lang, value, onChange }: { lang: Language; value: string; onChange: (uri: string) => void }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null)
  useEffect(() => { voicesFor(lang).then(setVoices) }, [lang])
  if (!ttsSupported()) return null
  const best = voices?.[0]
  return (
    <Card>
      <h2 className="font-semibold mb-1 flex items-center gap-2"><Volume2 size={18} /> Voz de {LANGUAGE_NAMES[lang]}</h2>
      {!voices ? <p className="muted text-sm">Procurando vozes…</p> : voices.length === 0 ? (
        <Notice kind="warn">Nenhuma voz de {LANGUAGE_NAMES[lang]} instalada. No Android: Configurações → Idiomas → Conversão de texto em voz → baixe a voz de {LANGUAGE_NAMES[lang]} (alta qualidade). No iPhone: Ajustes → Acessibilidade → Conteúdo falado → Vozes. No Windows, o Edge já traz vozes naturais.</Notice>
      ) : (
        <>
          <select className="input mt-2" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`Voz de ${LANGUAGE_NAMES[lang]}`}>
            <option value="">Automática{best ? ` — ${best.name}` : ''}</option>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{isNeural(v) ? '★ ' : ''}{v.name} ({v.lang})</option>)}
          </select>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="secondary" size="sm" icon={<Volume2 size={16} />} onClick={() => speak(SAMPLE[lang], lang)}>Testar</Button>
            {best && isNeural(voices.find((v) => v.voiceURI === value) ?? best) ? (
              <span className="chip chip-ok"><Sparkles size={14} /> voz natural</span>
            ) : (
              <span className="text-xs muted">Vozes com ★ são neurais (mais humanas). Sem ★, o som fica robótico — instale uma voz melhor no sistema.</span>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
