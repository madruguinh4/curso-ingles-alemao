import { Navigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, RefreshCw, ClipboardCheck, ChevronRight, CheckCircle2, CircleDot, Circle, Languages } from 'lucide-react'
import { db, type Enrollment } from '../lib/db'
import { dueCards } from '../lib/srs'
import { todayISO } from '../lib/dates'
import { lessonsFor, contentStats } from '../lib/content'
import { MONTH_TITLES, TOTAL_WEEKS } from '../content/curriculum'
import { nextLesson, upcomingLessons, currentWeek, pendingAssessments, lessonStatus } from '../lib/course'
import { studyStats } from '../lib/study'
import { LANGUAGE_NAMES } from '../lib/types'
import { useActiveEnrollment, languageChosen } from '../state/useEnrollments'
import { useProfile } from '../state/useTheme'
import { Button, Card, Ring, Screen, SectionTitle, Spinner } from '../components/ui'
import { StudyCalendar } from '../components/StudyCalendar'

export function Home() {
  const { enrollment: e, all, loading } = useActiveEnrollment()
  const p = useProfile()
  if (loading) return <Spinner />
  if (!all?.length || !e) return <Navigate to="/welcome" replace />
  if (all.length > 1 && !languageChosen()) return <Navigate to="/language" replace />
  return (
    <Screen>
      <Today e={e} name={p.name} canSwitch={all.length > 1} />
    </Screen>
  )
}

function Today({ e, name, canSwitch }: { e: Enrollment; name: string; canSwitch: boolean }) {
  const eid = e.id!
  const today = todayISO()
  const completions = useLiveQuery(() => db.completions.where('enrollmentId').equals(eid).toArray(), [eid])
  const due = useLiveQuery(() => dueCards(eid), [eid])
  const days = useLiveQuery(() => db.studyDays.where('enrollmentId').equals(eid).toArray(), [eid])
  const assessed = useLiveQuery(() => db.assessments.where('enrollmentId').equals(eid).toArray(), [eid])
  if (!completions || !due || !days || !assessed) return <Spinner />

  const lang = e.language
  const lessons = lessonsFor(lang)
  const stats = contentStats(lang)
  const next = nextLesson(lessons, completions)
  const week = currentWeek(lang, completions)
  const doneCount = completions.filter((c) => c.completedAt).length
  const upcoming = upcomingLessons(lessons, completions, 5)
  const checks = pendingAssessments(lang, completions, assessed)
  const study = studyStats(days.map((d) => d.date), today)
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="grid gap-4">
      <section className="hero fade-in">
        <div className="flex items-center justify-between">
          <span className="chip" style={{ background: 'rgba(255,255,255,.2)', borderColor: 'transparent', color: 'inherit' }}><span className="font-mono">{lang.toUpperCase()}</span> {LANGUAGE_NAMES[lang]}</span>
          <Button variant="ghost" size="sm" to="/language" icon={<Languages size={16} />}>{canSwitch ? 'Trocar' : 'Adicionar idioma'}</Button>
        </div>
        <h1 className="text-2xl font-bold mt-3">{greet}{name ? `, ${name}` : ''}</h1>
        {week && <p className="muted text-sm mt-0.5">Semana {week.number} de {TOTAL_WEEKS} · {MONTH_TITLES[week.month]}</p>}
        <div className="flex items-center gap-4 mt-4">
          <Ring value={stats.lessons ? doneCount / stats.lessons : 0} size={76} label={`${doneCount} de ${stats.lessons} aulas`}>
            <span className="font-bold text-lg leading-none">{doneCount}</span>
            <span className="block text-[10px] opacity-80">de {stats.lessons}</span>
          </Ring>
          <div className="text-sm">
            <p className="font-semibold">{week ? week.canDo : 'Todas as aulas disponíveis concluídas.'}</p>
            <p className="muted mt-1">{week ? 'Objetivo da semana' : 'Novas aulas chegam em atualizações.'}</p>
          </div>
        </div>
      </section>

      {next ? (
        <Card>
          <p className="text-xs muted uppercase tracking-wide">{lessonStatus(next.id, completions) === 'progress' ? 'Continuar de onde parou' : 'Próxima aula'}</p>
          <h2 className="text-xl font-bold mt-1">{next.title}</h2>
          <p className="text-sm muted mt-1">{next.objective}</p>
          <Button className="mt-4" block to={`/lesson/${eid}/${next.id}`} icon={<Play size={18} />}>{lessonStatus(next.id, completions) === 'progress' ? 'Continuar aula' : 'Começar aula'}</Button>
        </Card>
      ) : (
        <Card>
          <h2 className="text-lg font-bold">Você concluiu tudo o que existe até agora 🎉</h2>
          <p className="text-sm muted mt-1">{stats.lessons} aulas em {stats.weeksWithLessons} semana(s). Continue revisando os cartões e refazendo as produções orais; novas semanas entram em atualizações.</p>
        </Card>
      )}

      {due.length > 0 && (
        <Link to={`/review/${eid}`} className="card flex items-center gap-3">
          <span className="grid place-items-center rounded-2xl" style={{ width: 44, height: 44, background: 'var(--accent-soft)', color: 'var(--accent)' }}><RefreshCw size={22} /></span>
          <span className="grow"><b>Revisão</b><span className="block text-sm muted">{due.length} cartão(ões) de vocabulário para hoje</span></span>
          <ChevronRight className="muted" />
        </Link>
      )}

      {checks.map((w) => (
        <Link key={w.id} to={`/assessment/${eid}/${w.number}`} className="card flex items-center gap-3">
          <span className="grid place-items-center rounded-2xl" style={{ width: 44, height: 44, background: 'var(--ok-soft)', color: 'var(--ok)' }}><ClipboardCheck size={22} /></span>
          <span className="grow"><b>Verificação da semana {w.number}</b><span className="block text-sm muted">Você concluiu as aulas — veja o que ficou.</span></span>
          <ChevronRight className="muted" />
        </Link>
      ))}

      <StudyCalendar stats={study} />

      <SectionTitle action={<Link to={`/map/${eid}`} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Ver trilha</Link>}>Próximas aulas</SectionTitle>
      <ul className="grid gap-2">
        {upcoming.map((l) => {
          const s = lessonStatus(l.id, completions)
          const Icon = s === 'done' ? CheckCircle2 : s === 'progress' ? CircleDot : Circle
          return (
            <li key={l.id}>
              <Link to={`/lesson/${eid}/${l.id}`} className="card-flat flex items-center gap-3">
                <Icon size={20} style={{ color: s === 'todo' ? 'var(--muted)' : 'var(--accent)' }} aria-hidden="true" />
                <span className="grow"><span className="font-semibold">{l.title}</span><span className="block text-xs muted">Semana {Number(l.weekId.slice(-2))} · {l.objective}</span></span>
                <ChevronRight size={18} className="muted" />
              </Link>
            </li>
          )
        })}
        {upcoming.length < 5 && (
          <li className="card-flat text-sm muted">As próximas semanas já estão planejadas na trilha; as aulas estão em produção e chegam em atualizações.</li>
        )}
      </ul>
    </div>
  )
}
