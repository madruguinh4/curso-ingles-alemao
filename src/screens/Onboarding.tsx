import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db, type Enrollment } from '../lib/db'
import { todayISO } from '../lib/dates'
import { LEVEL_NAMES } from '../content/diagnostic'
import { GOAL_NAMES, LANGUAGE_NAMES, type Goal, type Language, type StartLevel } from '../lib/types'
import { saveProfile, useProfile } from '../state/useTheme'
import { setActiveEnrollment, markLanguageChosen, useEnrollments } from '../state/useEnrollments'
import { Button, Choice, Notice, ProgressBar, Screen, Spinner } from '../components/ui'
import { Diagnostic } from './Diagnostic'

// Uma pergunta por tela. UM idioma por vez: o segundo é adicionado depois
// (?add=en|de pula nome e microfone). Sem perguntas de tempo ou dias: o aluno
// estuda quando pode e o app conta os dias sozinho.

type Step = 'name' | 'language' | 'level' | 'diagnostic' | 'goal' | 'mic' | 'creating'

export function Onboarding() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const addLang = sp.get('add') as Language | null
  const adding = addLang === 'en' || addLang === 'de'
  const existing = useEnrollments()
  const profile = useProfile()

  const order: Step[] = adding ? ['level', 'goal'] : ['name', 'language', 'level', 'goal', 'mic']
  const [step, setStep] = useState<Step>(order[0])
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<Language | undefined>(adding ? addLang : undefined)
  const [level, setLevel] = useState<StartLevel>()
  const [goal, setGoal] = useState<Goal>()
  const [mic, setMic] = useState<boolean>()
  const [error, setError] = useState<string>()

  if (!existing) return <Spinner />
  const taken = new Set(existing.map((e) => e.language))
  if (adding && taken.has(addLang)) return <Screen title="Idioma" back="/language"><Notice kind="warn">Você já tem um plano de {LANGUAGE_NAMES[addLang]}.</Notice></Screen>

  const progress = order.indexOf(step === 'diagnostic' ? 'level' : step) / order.length
  const isLast = step === order[order.length - 1]
  const next = () => (isLast ? create() : setStep(order[order.indexOf(step) + 1]))
  const back = () => {
    if (step === 'diagnostic') return setStep('level')
    if (step === order[0]) return nav(adding ? '/language' : '/welcome')
    setStep(order[order.indexOf(step) - 1])
  }
  const pickLevel = (lv: StartLevel) => { setLevel(lv); setStep('goal') }
  const pickGoal = (g: Goal) => { setGoal(g); if (adding) create(g); else setStep('mic') }

  async function create(g: Goal | undefined = goal) {
    setStep('creating')
    try {
      const lang = language!
      if (!adding) await saveProfile({ name: name.trim(), micAllowed: !!mic })
      const e: Enrollment = { language: lang, level: level ?? 'zero', goal: g!, startDate: todayISO(), createdAt: new Date().toISOString() }
      const id = (await db.enrollments.add(e)) as number
      setActiveEnrollment(id)
      markLanguageChosen()
      nav('/', { replace: true })
    } catch (err) {
      setError(`Não consegui salvar neste navegador (${(err as Error).message}). Em modo privado ou com armazenamento bloqueado, o app não funciona.`)
      setStep(order[order.length - 1])
    }
  }

  const langName = language ? LANGUAGE_NAMES[language] : ''

  return (
    <Screen onBack={step === 'creating' ? undefined : back}>
      <ProgressBar value={progress} />
      {adding && <p className="text-sm muted mb-2">Adicionando <b>{langName}</b>{profile.name ? ` para ${profile.name}` : ''}. Este plano é independente do outro idioma.</p>}
      {error && <Notice kind="warn">{error}</Notice>}

      {step === 'name' && (
        <StepBox title="Como você quer ser chamado?">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" aria-label="Seu nome" autoFocus />
          <Button block disabled={!name.trim()} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'language' && (
        <StepBox title="Qual idioma você quer aprender agora?">
          <Choice legend="Idioma" value={language} onChange={(v) => setLanguage(v)}
            options={[
              { value: 'en' as Language, label: 'Inglês', icon: <span className="chip chip-accent font-mono">EN</span> },
              { value: 'de' as Language, label: 'Alemão', icon: <span className="chip chip-accent font-mono">DE</span> },
            ]} />
          <p className="text-sm muted">Um idioma por vez. O outro pode ser adicionado depois, com plano e progresso separados.</p>
          <Button block disabled={!language} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'level' && language && (
        <StepBox title={`Você já sabe algo de ${langName}?`}>
          <Choice legend="Nível" value={level} onChange={pickLevel}
            options={[
              { value: 'zero' as StartLevel, label: LEVEL_NAMES.zero },
              { value: 'basico' as StartLevel, label: LEVEL_NAMES.basico },
              { value: 'intermediario' as StartLevel, label: LEVEL_NAMES.intermediario },
            ]} />
          <Button variant="secondary" block onClick={() => setStep('diagnostic')}>Não sei — fazer um teste rápido (8 perguntas)</Button>
        </StepBox>
      )}

      {step === 'diagnostic' && language && (
        <Diagnostic lang={language} onDone={pickLevel} onSkip={() => pickLevel('zero')} />
      )}

      {step === 'goal' && (
        <StepBox title={`Para que você quer ${langName}?`}>
          <Choice legend="Objetivo" value={goal} onChange={pickGoal}
            options={(Object.keys(GOAL_NAMES) as Goal[]).map((g) => ({ value: g, label: GOAL_NAMES[g] }))} />
        </StepBox>
      )}

      {step === 'mic' && (
        <StepBox title="Você pode falar em voz alta enquanto estuda?">
          <Choice legend="Microfone" value={mic === undefined ? undefined : mic ? 'sim' : 'nao'} onChange={(v) => setMic(v === 'sim')}
            options={[{ value: 'sim', label: 'Sim, na maioria das vezes' }, { value: 'nao', label: 'Nem sempre (lugares públicos)' }]} />
          <p className="text-sm muted">Isso só muda as instruções das atividades orais. O app não grava sua voz.</p>
          <Button block disabled={mic === undefined} onClick={() => create()}>Começar a estudar</Button>
        </StepBox>
      )}

      {step === 'creating' && <Spinner label={`Preparando seu curso de ${langName}…`} />}
    </Screen>
  )
}

function StepBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 pt-2 fade-in">
      <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      {children}
    </div>
  )
}
