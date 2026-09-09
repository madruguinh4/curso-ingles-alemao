import { Routes, Route } from 'react-router-dom'
import { useApplyTheme } from './state/useTheme'
import { useLanguageTheme } from './state/useEnrollments'
import { Nav } from './components/Nav'
import { Welcome } from './screens/Welcome'
import { Onboarding } from './screens/Onboarding'
import { LanguagePicker } from './screens/LanguagePicker'
import { Plan } from './screens/Plan'
import { Home } from './screens/Home'
import { CourseMap } from './screens/CourseMap'
import { LessonScreen } from './screens/Lesson'
import { Review } from './screens/Review'
import { Assessment } from './screens/Assessment'
import { Progress } from './screens/Progress'
import { Library } from './screens/Library'
import { Talk } from './screens/Talk'
import { Finish } from './screens/Finish'
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
  useLanguageTheme()
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/language" element={<LanguagePicker />} />
        <Route path="/plan/:enrollmentId?" element={<Plan />} />
        <Route path="/map/:enrollmentId?" element={<CourseMap />} />
        <Route path="/lesson/:enrollmentId/:lessonId" element={<LessonScreen />} />
        <Route path="/review/:enrollmentId?" element={<Review />} />
        <Route path="/assessment/:enrollmentId/:weekNumber" element={<Assessment />} />
        <Route path="/progress/:enrollmentId?" element={<Progress />} />
        <Route path="/library/:enrollmentId?" element={<Library />} />
        <Route path="/talk/:enrollmentId?" element={<Talk />} />
        <Route path="/finish/:enrollmentId?" element={<Finish />} />
        <Route path="/more" element={<More />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Nav />
    </>
  )
}
