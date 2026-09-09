import { Routes, Route } from 'react-router-dom'
import { useApplyTheme } from './state/useTheme'
import { Nav } from './components/Nav'
import { Welcome } from './screens/Welcome'
import { Onboarding } from './screens/Onboarding'
import { Plan } from './screens/Plan'
import { Home } from './screens/Home'
import { CourseMap } from './screens/CourseMap'
import { LessonScreen } from './screens/Lesson'
import { Settings } from './screens/Settings'
import { More } from './screens/More'
import { Screen, Notice } from './components/ui'

function NotFound() {
  return (
    <Screen title="Página não encontrada" back="/">
      <Notice kind="warn">Este endereço não existe no app.</Notice>
    </Screen>
  )
}

export default function App() {
  useApplyTheme()
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/plan/:enrollmentId?" element={<Plan />} />
        <Route path="/map/:enrollmentId?" element={<CourseMap />} />
        <Route path="/lesson/:enrollmentId/:lessonId" element={<LessonScreen />} />
        <Route path="/more" element={<More />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Nav />
    </>
  )
}
