import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useThemeSync } from '../theme/theme'
import { useSimulation } from '../data/simulation'
import { DEMO_EVENT, openDemoMenu } from '../screens/demo/openDemoMenu'
import { PhoneFrame } from './PhoneFrame'
import { Home } from '../screens/home/Home'
import { FeedbackProvider } from './feedback'
import { BannerHost } from './Banners'
import { useEdgeSwipeBack } from './useEdgeSwipeBack'

// Demo menu and hidden developer routes are lazy, so they never cost first load.
const lazyNamed = <T extends string>(load: () => Promise<Record<T, React.ComponentType>>, name: T) => lazy(() => load().then((m) => ({ default: m[name] })))
const RequestScreen = lazyNamed(() => import('../screens/requests/RequestScreens'), 'RequestScreen')
const ApprovalSent = lazyNamed(() => import('../screens/requests/RequestScreens'), 'ApprovalSent')
const ApprovalQueue = lazyNamed(() => import('../screens/requests/RequestScreens'), 'ApprovalQueue')
const VoiceAnswer = lazyNamed(() => import('../screens/requests/RequestScreens'), 'VoiceAnswer')
const AddComputer = lazyNamed(() => import('../screens/home/AddComputer'), 'AddComputer')
const SessionScreen = lazyNamed(() => import('../screens/session/SessionScreens'), 'SessionScreen')
const StoppedRoute = lazyNamed(() => import('../screens/session/SessionScreens'), 'StoppedRoute')
const UndoFurther = lazyNamed(() => import('../screens/session/SessionScreens'), 'UndoFurther')
const SessionVoice = lazyNamed(() => import('../screens/session/SessionScreens'), 'SessionVoice')
const NewTask = lazyNamed(() => import('../screens/newtask/NewTask'), 'NewTask')
const FolderPicker = lazyNamed(() => import('../screens/newtask/NewTask'), 'FolderPicker')
const Agents = lazyNamed(() => import('../screens/agents/Agents'), 'Agents')
const Settings = lazyNamed(() => import('../screens/settings/Settings'), 'Settings')
const PairedPhones = lazyNamed(() => import('../screens/settings/Settings'), 'PairedPhones')
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
  const [device, setDevice] = useState<HTMLElement | null>(null)
  useEffect(() => setDevice(document.getElementById('device')), [])
  useEdgeSwipeBack(device)
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
      <FeedbackProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="request/:id" element={<RequestScreen />} />
          <Route path="request/:id/sent" element={<ApprovalSent />} />
          <Route path="request/:id/voice" element={<VoiceAnswer />} />
          <Route path="queue/:agent" element={<ApprovalQueue />} />
          <Route path="computers/add" element={<AddComputer />} />
          <Route path="session/:id" element={<SessionScreen />} />
          <Route path="session/:id/stopped" element={<StoppedRoute />} />
          <Route path="session/:id/undo" element={<UndoFurther />} />
          <Route path="session/:id/voice" element={<SessionVoice />} />
          <Route path="new" element={<NewTask />} />
          <Route path="new/folder" element={<FolderPicker />} />
          <Route path="agents" element={<Agents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/phones" element={<PairedPhones />} />
          <Route path="dev/tokens" element={<Tokens />} />
          <Route path="dev/ref/:name" element={<RefScreens />} />
          <Route path="dev/state" element={<State />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {demoLoaded && <DemoMenu open={demo} onClose={() => setDemo(false)} />}
      </Suspense>
      <BannerHost />
      </FeedbackProvider>
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
