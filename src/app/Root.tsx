import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useThemeSync } from '../theme/theme'
import { PhoneFrame } from './PhoneFrame'
import { Blank } from '../screens/home/Blank'

// Hidden developer routes — lazy, so they never cost first load.
const Tokens = lazy(() => import('../screens/dev/Tokens').then((m) => ({ default: m.Tokens })))
const RefScreens = lazy(() => import('../screens/dev/RefScreens').then((m) => ({ default: m.RefScreens })))
const Components = lazy(() => import('../screens/dev/Components').then((m) => ({ default: m.Components })))

/** App screens: phone frame on desktop, full screen on a phone. */
function Framed() {
  return (
    <PhoneFrame>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Blank />} />
          <Route path="dev/tokens" element={<Tokens />} />
          <Route path="dev/ref/:name" element={<RefScreens />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </PhoneFrame>
  )
}

export function Root() {
  useThemeSync()
  return (
    <Routes>
      {/* The components gallery needs the full window for dark and light side by side. */}
      <Route
        path="dev/components"
        element={
          <Suspense fallback={null}>
            <Components />
          </Suspense>
        }
      />
      <Route path="*" element={<Framed />} />
    </Routes>
  )
}
