import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db, type Enrollment } from '../lib/db'
import { buildSchedule, dailyAgenda } from '../lib/plan'
import { todayISO, WEEKDAY_LONG } from '../lib/dates'
import { weeksFor } from '../content/curriculum'
import { lessonsForWeek } from '../lib/content'
import { LEVEL_NAMES } from '../content/diagnostic'
import { GOAL_NAMES, LANGUAGE_NAMES, type Goal, type Language, type Minutes, type StartLevel } from '../lib/types'
import { saveProfile, useProfile } from '../state/useTheme'
import { setActiveEnrollment, markLanguageChosen, useEnrollments } from '../state/useEnrollments'
import { Button, Choice, Notice, ProgressBar, Screen, Spinner } from '../components/ui'
import { Diagnostic } from './Diagnostic'

// Uma pergunta por tela. UM idioma por vez: o segundo é adicionado depois,
// com plano próprio (?add=en|de pula nome e microfone, já respondidos).

type Step = 'name' | 'language' | 'level' | 'diagnostic' | 'goal' | 'minutes' | 'weekdays' | 'mic' | 'creating'

export function Onboarding() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const addLang = sp.get('add') as Language | null
  const adding = addLang === 'en' || addLang === 'de'
  const existing = useEnrollments()
  const profile = useProfile()

  const order: Step[] = adding ? ['level', 'goal', 'minutes', 'weekdays'] : ['name', 'language', 'level', 'goal', 'minutes', 'weekdays', 'mic']
  const [step, setStep] = useState<Step>(order[0])
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<Language | undefined>(adding ? addLang : undefined)
  const [level, setLevel] = useState<StartLevel>()
  const [goal, setGoal] = useState<Goal>()
  const [minutes, setMinutes] = useState<Minutes>()
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
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

  async function create() {
    setStep('creating')
    try {
      const lang = language!
      if (!adding) await saveProfile({ name: name.trim(), micAllowed: !!mic })
      const e: Enrollment = { language: lang, level: level ?? 'zero', goal: goal!, minutesPerDay: minutes!, weekdays: [...weekdays].sort(), startDate: todayISO(), createdAt: new Date().toISOString() }
      const id = (await db.enrollments.add(e)) as number
      await db.schedule.bulkAdd(buildSchedule({ ...e, id }, weeksFor(lang), lessonsForWeek))
      setActiveEnrollment(id)
      markLanguageChosen()
      nav(`/plan/${id}`, { replace: true })
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
          <p className="text-sm muted">Só aparece no app e no kit final. Não há cadastro nem senha — tudo fica neste aparelho.</p>
          <Button block disabled={!name.trim()} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'language' && (
        <StepBox title="Qual idioma você quer aprender agora?">
          <Choice legend="Idioma" value={language} onChange={(v) => setLanguage(v)}
            options={[
              { value: 'en' as Language, label: '🇬🇧 Inglês', description: '26 semanas, do zero ao A2 com transição para B1.' },
              { value: 'de' as Language, label: '🇩🇪 Alemão', description: '26 semanas, do zero ao A2 com transição para B1. Casos e artigos trabalhados desde o início.' },
            ]} />
          <Notice>Um idioma por vez. Se quiser estudar os dois, você adiciona o outro depois — cada um com plano, tempo e progresso próprios. O app nunca mistura os dois na mesma tela.</Notice>
          <Button block disabled={!language} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'level' && language && (
        <StepBox title={`Seu conhecimento atual de ${langName}`}>
          <Choice legend="Nível" value={level} onChange={pickLevel}
            options={[
              { value: 'zero' as StartLevel, label: LEVEL_NAMES.zero, description: 'Começa na semana 1 com a base completa de A1.' },
              { value: 'basico' as StartLevel, label: LEVEL_NAMES.basico, description: 'Começa na semana 1 como revisão; o plano ajusta pelo desempenho.' },
              { value: 'intermediario' as StartLevel, label: LEVEL_NAMES.intermediario, description: 'Começa na semana 1 como revisão rápida e avança pelas verificações.' },
            ]} />
          <Button variant="secondary" block onClick={() => setStep('diagnostic')}>Não sei — fazer um diagnóstico rápido (8 perguntas)</Button>
          <p className="text-sm muted">Nesta versão, todas as trilhas começam na semana 1: quem já sabe avança mais rápido pelas verificações semanais. Você não fica preso em conteúdo que já domina.</p>
        </StepBox>
      )}

      {step === 'diagnostic' && language && (
        <Diagnostic lang={language} onDone={pickLevel} onSkip={() => pickLevel('zero')} />
      )}

      {step === 'goal' && (
        <StepBox title={`Qual é o seu objetivo com ${langName}?`}>
          <Choice legend="Objetivo" value={goal} onChange={(v) => { setGoal(v); setStep('minutes') }}
            options={(Object.keys(GOAL_NAMES) as Goal[]).map((g) => ({ value: g, label: GOAL_NAMES[g] }))} />
          <p className="text-sm muted">O 5º mês do curso é adaptado a este objetivo.</p>
        </StepBox>
      )}

      {step === 'minutes' && (
        <StepBox title={`Quanto tempo por dia para ${langName}?`}>
          <Choice legend="Minutos por dia" value={minutes} onChange={(v) => setMinutes(v)}
            options={([20, 40, 60, 90] as Minutes[]).map((m) => ({ value: m, label: `${m} minutos`, description: dailyAgenda(m, false).note }))} />
          {taken.size > 0 && <p className="text-sm muted">Este tempo é só para {langName}. O outro idioma tem o tempo dele.</p>}
          <Button block disabled={!minutes} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'weekdays' && (
        <StepBox title={`Em quais dias você vai estudar ${langName}?`}>
          <Choice multi legend="Dias" value={weekdays} onChange={(d) => setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]))}
            options={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ value: d, label: WEEKDAY_LONG[d] }))} />
          <p className="text-sm muted">Cada semana do curso usa {weekdays.length || '…'} dia(s) de estudo. Com menos de 2 dias por semana, o curso não cabe em 6 meses.{taken.size > 0 ? ' Dica: dias diferentes do outro idioma ajudam a não misturar.' : ''}</p>
          <Button block disabled={weekdays.length < 2} onClick={next}>{isLast ? 'Criar meu plano' : 'Continuar'}</Button>
        </StepBox>
      )}

      {step === 'mic' && (
        <StepBox title="Você pode usar o microfone durante as aulas?">
          <Choice legend="Microfone" value={mic === undefined ? undefined : mic ? 'sim' : 'nao'} onChange={(v) => setMic(v === 'sim')}
            options={[{ value: 'sim', label: 'Sim, posso falar em voz alta' }, { value: 'nao', label: 'Nem sempre (estudo em lugares públicos)' }]} />
          <Notice>
            Nesta versão o app <b>não grava nem reconhece sua voz</b>. As atividades orais pedem que você grave no gravador do seu celular e se avalie com uma lista de verificação. Nada é enviado a lugar nenhum.
          </Notice>
          <Button block disabled={mic === undefined} onClick={create}>Criar meu plano</Button>
        </StepBox>
      )}

      {step === 'creating' && <p className="muted p-4" role="status">Montando seu plano de 26 semanas de {langName}…</p>}
    </Screen>
  )
}

function StepBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 pt-2">
      <h1 className="text-2xl font-bold leading-tight">{title}</h1>
      {children}
    </div>
  )
}
