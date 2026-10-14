import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useThemeSync } from '../theme/theme'
import { PhoneFrame } from './PhoneFrame'
import { Blank } from '../screens/home/Blank'

// Hidden developer routes — lazy, so they never cost first load.
const Tokens = lazy(() => import('../screens/dev/Tokens').then((m) => ({ default: m.Tokens })))

/** App shell: phone frame on desktop, full screen on a phone. Every route renders inside it. */
export function Root() {
  useThemeSync()
  return (
    <PhoneFrame>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Blank />} />
          <Route path="dev/tokens" element={<Tokens />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </PhoneFrame>
  )
}
