import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Enrollment } from '../lib/db'
import { buildSchedule, dailyAgenda } from '../lib/plan'
import { todayISO, WEEKDAY_LONG } from '../lib/dates'
import { weeksFor } from '../content/curriculum'
import { lessonsForWeek } from '../lib/content'
import { LEVEL_NAMES } from '../content/diagnostic'
import { GOAL_NAMES, LANGUAGE_NAMES, type Goal, type Language, type Minutes, type StartLevel } from '../lib/types'
import { saveProfile } from '../state/useTheme'
import { setActiveEnrollment } from '../state/useEnrollments'
import { Button, Choice, Notice, ProgressBar, Screen } from '../components/ui'
import { Diagnostic } from './Diagnostic'

// Uma pergunta por tela. Com dois idiomas, o tempo é dividido e isso é dito.

type Step = 'name' | 'languages' | 'level' | 'diagnostic' | 'goal' | 'minutes' | 'weekdays' | 'mic' | 'creating'
const ORDER: Step[] = ['name', 'languages', 'level', 'goal', 'minutes', 'weekdays', 'mic']

export function Onboarding() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Partial<Record<Language, StartLevel>>>({})
  const [levelIdx, setLevelIdx] = useState(0)
  const [goal, setGoal] = useState<Goal>()
  const [minutes, setMinutes] = useState<Minutes>()
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
  const [mic, setMic] = useState<boolean>()
  const [error, setError] = useState<string>()

  const two = languages.length === 2
  const progress = ORDER.indexOf(step === 'diagnostic' ? 'level' : step) / ORDER.length
  const next = () => setStep(ORDER[ORDER.indexOf(step) + 1])
  const back = () => (step === 'diagnostic' ? setStep('level') : step === 'name' ? nav('/welcome') : setStep(ORDER[ORDER.indexOf(step) - 1]))

  const currentLang = languages[levelIdx]
  const setLevelFor = (lang: Language, level: StartLevel) => {
    setLevels((l) => ({ ...l, [lang]: level }))
    if (levelIdx + 1 < languages.length) { setLevelIdx(levelIdx + 1); setStep('level') }
    else next()
  }

  async function create() {
    setStep('creating')
    try {
      const startDate = todayISO()
      const createdAt = new Date().toISOString()
      await saveProfile({ name: name.trim(), micAllowed: !!mic })
      let firstId: number | undefined
      for (const language of languages) {
        const e: Enrollment = { language, level: levels[language] ?? 'zero', goal: goal!, minutesPerDay: two ? minutes! / 2 : minutes!, weekdays: [...weekdays].sort(), startDate, createdAt }
        const id = (await db.enrollments.add(e)) as number
        firstId ??= id
        await db.schedule.bulkAdd(buildSchedule({ ...e, id }, weeksFor(language), lessonsForWeek))
      }
      setActiveEnrollment(firstId!)
      nav(`/plan/${firstId}`, { replace: true })
    } catch (err) {
      setError(`Não consegui salvar neste navegador (${(err as Error).message}). Em modo privado ou com armazenamento bloqueado, o app não funciona.`)
      setStep('mic')
    }
  }

  return (
    <Screen onBack={step === 'creating' ? undefined : back}>
      <ProgressBar value={progress} />
      {error && <Notice kind="warn">{error}</Notice>}

      {step === 'name' && (
        <StepBox title="Como você quer ser chamado?">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" aria-label="Seu nome" autoFocus />
          <p className="text-sm muted">Só aparece no app e no kit final. Não há cadastro nem senha — tudo fica neste aparelho.</p>
          <Button block disabled={!name.trim()} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'languages' && (
        <StepBox title="Qual idioma você quer aprender?">
          <Choice multi legend="Idiomas" value={languages} onChange={(v) => setLanguages((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]))}
            options={[{ value: 'en' as Language, label: 'Inglês' }, { value: 'de' as Language, label: 'Alemão' }]} />
          {two && <Notice>Estudar os dois ao mesmo tempo é possível, mas o tempo diário será dividido entre eles e cada um terá seu próprio plano e progresso.</Notice>}
          <Button block disabled={!languages.length} onClick={() => { setLevelIdx(0); next() }}>Continuar</Button>
        </StepBox>
      )}

      {step === 'level' && currentLang && (
        <StepBox title={`Seu conhecimento atual de ${LANGUAGE_NAMES[currentLang]}`}>
          <Choice legend="Nível" value={levels[currentLang]} onChange={(v) => setLevelFor(currentLang, v)}
            options={[
              { value: 'zero' as StartLevel, label: LEVEL_NAMES.zero, description: 'Começa na semana 1 com a base completa de A1.' },
              { value: 'basico' as StartLevel, label: LEVEL_NAMES.basico, description: 'Começa na semana 1 com revisão acelerada; o plano ajusta pelo desempenho.' },
              { value: 'intermediario' as StartLevel, label: LEVEL_NAMES.intermediario, description: 'Começa na semana 1 como revisão rápida e avança pelas avaliações.' },
            ]} />
          <Button variant="secondary" block onClick={() => setStep('diagnostic')}>Não sei — fazer um diagnóstico rápido (8 perguntas)</Button>
          <p className="text-sm muted">Nesta versão, todas as trilhas começam na semana 1: quem já sabe avança mais rápido pelas verificações semanais. Você não fica preso em conteúdo que já domina.</p>
        </StepBox>
      )}

      {step === 'diagnostic' && currentLang && (
        <Diagnostic lang={currentLang} onDone={(lv) => setLevelFor(currentLang, lv)} onSkip={() => setLevelFor(currentLang, 'zero')} />
      )}

      {step === 'goal' && (
        <StepBox title="Qual é o seu objetivo principal?">
          <Choice legend="Objetivo" value={goal} onChange={(v) => { setGoal(v); next() }}
            options={(Object.keys(GOAL_NAMES) as Goal[]).map((g) => ({ value: g, label: GOAL_NAMES[g] }))} />
          <p className="text-sm muted">O 5º mês do curso é adaptado a este objetivo.</p>
        </StepBox>
      )}

      {step === 'minutes' && (
        <StepBox title="Quanto tempo você pode estudar por dia?">
          <Choice legend="Minutos por dia" value={minutes} onChange={(v) => setMinutes(v)}
            options={([20, 40, 60, 90] as Minutes[]).map((m) => {
              const a = dailyAgenda(m, two)
              return { value: m, label: `${m} minutos`, description: a.note, disabled: two && m === 20 }
            })} />
          <Button block disabled={!minutes} onClick={next}>Continuar</Button>
        </StepBox>
      )}

      {step === 'weekdays' && (
        <StepBox title="Em quais dias da semana você vai estudar?">
          <Choice multi legend="Dias" value={weekdays} onChange={(d) => setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]))}
            options={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ value: d, label: WEEKDAY_LONG[d] }))} />
          <p className="text-sm muted">Cada semana do curso usa {weekdays.length || '…'} dia(s) de estudo. Com menos de 2 dias por semana, o curso não cabe em 6 meses.</p>
          <Button block disabled={weekdays.length < 2} onClick={next}>Continuar</Button>
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

      {step === 'creating' && <p className="muted p-4" role="status">Montando seu plano de 26 semanas…</p>}
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
