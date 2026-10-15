import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useThemeSync } from '../theme/theme'
import { useSimulation } from '../data/simulation'
import { DEMO_EVENT, openDemoMenu } from '../screens/demo/openDemoMenu'
import { PhoneFrame } from './PhoneFrame'
import { Blank } from '../screens/home/Blank'

// Demo menu and hidden developer routes are lazy, so they never cost first load.
const DemoMenu = lazy(() => import('../screens/demo/DemoMenu').then((m) => ({ default: m.DemoMenu })))
const Tokens = lazy(() => import('../screens/dev/Tokens').then((m) => ({ default: m.Tokens })))
const RefScreens = lazy(() => import('../screens/dev/RefScreens').then((m) => ({ default: m.RefScreens })))
const State = lazy(() => import('../screens/dev/State').then((m) => ({ default: m.State })))
const Components = lazy(() => import('../screens/dev/Components').then((m) => ({ default: m.Components })))

/** `D` opens the demo menu on a keyboard (tech.md) — not while typing in a field. */
function useDemoKey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      openDemoMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** App screens: phone frame on desktop, full screen on a phone. */
function Framed() {
  useSimulation()
  useDemoKey()
  const [demo, setDemo] = useState(false)
  const [demoLoaded, setDemoLoaded] = useState(false)
  useEffect(() => {
    const open = () => {
      setDemoLoaded(true)
      setDemo(true)
    }
    window.addEventListener(DEMO_EVENT, open)
    return () => window.removeEventListener(DEMO_EVENT, open)
  }, [])

  return (
    <PhoneFrame>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Blank />} />
          <Route path="dev/tokens" element={<Tokens />} />
          <Route path="dev/ref/:name" element={<RefScreens />} />
          <Route path="dev/state" element={<State />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {demoLoaded && <DemoMenu open={demo} onClose={() => setDemo(false)} />}
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
