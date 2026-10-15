import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from '../data/store'
import { withStaleReload } from './staleReload'
// Sign in is the first screen for new visitors, so it ships with the app shell.
import { CreateAccount, ForgotPassword, SignIn } from '../screens/onboarding/Auth'
import { useThemeSync } from '../theme/theme'
import { useSimulation } from '../data/simulation'
import { DEMO_EVENT, openDemoMenu } from '../screens/demo/openDemoMenu'
import { PhoneFrame } from './PhoneFrame'
import { Home } from '../screens/home/Home'
import { FeedbackProvider } from './feedback'
import { BannerHost } from './Banners'
import { useEdgeSwipeBack } from './useEdgeSwipeBack'

// Demo menu and hidden developer routes are lazy, so they never cost first load.
const lazyNamed = <T extends string>(load: () => Promise<Record<T, React.ComponentType>>, name: T) =>
  lazy(withStaleReload(() => load().then((m) => ({ default: m[name] }))))
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
const setup = () => import('../screens/onboarding/Setup')
const SetupIntro = lazyNamed(setup, 'SetupIntro')
const LinkSent = lazyNamed(setup, 'LinkSent')
const Scan = lazyNamed(setup, 'Scan')
const EnterCode = lazyNamed(setup, 'EnterCode')
const Connecting = lazyNamed(setup, 'Connecting')
const AgentsFound = lazyNamed(setup, 'AgentsFound')
const NoAgents = lazyNamed(setup, 'NoAgents')
const Notifications = lazyNamed(setup, 'Notifications')
// Demo screens (M7) — lazy, so they never cost first load.
const LockScreen = lazyNamed(() => import('../screens/demo/LockScreen'), 'LockScreen')
const ApprovalStates = lazyNamed(() => import('../screens/demo/StatesScreens'), 'ApprovalStates')
const NewTaskStates = lazyNamed(() => import('../screens/demo/StatesScreens'), 'NewTaskStates')
const Helper = lazyNamed(() => import('../screens/demo/Helper'), 'Helper')
const DemoMenu = lazy(withStaleReload(() => import('../screens/demo/DemoMenu').then((m) => ({ default: m.DemoMenu }))))
const Tokens = lazy(withStaleReload(() => import('../screens/dev/Tokens').then((m) => ({ default: m.Tokens }))))
const RefScreens = lazy(withStaleReload(() => import('../screens/dev/RefScreens').then((m) => ({ default: m.RefScreens }))))
const State = lazy(withStaleReload(() => import('../screens/dev/State').then((m) => ({ default: m.State }))))
const Components = lazy(withStaleReload(() => import('../screens/dev/Components').then((m) => ({ default: m.Components }))))

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

const AUTH = ['/signin', '/signup', '/forgot']

/**
 * First visit starts at Sign in; signed in but not set up resumes setup; set up opens on Home
 * (flows.md). Setup screens stay reachable after setup only for Add a computer and the demo menu.
 */
function useGate(): string | null {
  const { pathname, search } = useLocation()
  const signedIn = useStore((x) => x.signedIn)
  const onboarded = useStore((x) => x.onboarded)
  if (pathname.startsWith('/dev')) return null
  const auth = AUTH.includes(pathname)
  const setupPath = pathname.startsWith('/setup')
  if (!onboarded) {
    if (!signedIn) return auth ? null : '/signin'
    return auth || setupPath ? null : '/setup'
  }
  // Already set up: Sign in / Create account (e.g. browser back) go to Home.
  if (auth && signedIn) return '/'
  if (setupPath && !/mode=(add|demo)/.test(search)) return '/'
  return null
}

/** App screens: phone frame on desktop, full screen on a phone. */
function Framed() {
  useSimulation()
  useDemoKey()
  const [device, setDevice] = useState<HTMLElement | null>(null)
  useEffect(() => setDevice(document.getElementById('device')), [])
  useEdgeSwipeBack(device)
  const redirect = useGate()
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
        {redirect ? (
          <Navigate to={redirect} replace />
        ) : (
        <Routes>
          <Route index element={<Home />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<CreateAccount />} />
          <Route path="forgot" element={<ForgotPassword />} />
          <Route path="setup" element={<SetupIntro />} />
          <Route path="setup/link-sent" element={<LinkSent />} />
          <Route path="setup/scan" element={<Scan />} />
          <Route path="setup/code" element={<EnterCode />} />
          <Route path="setup/connecting" element={<Connecting />} />
          <Route path="setup/agents" element={<AgentsFound />} />
          <Route path="setup/no-agents" element={<NoAgents />} />
          <Route path="setup/notifications" element={<Notifications />} />
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
          <Route path="demo/lock/:kind" element={<LockScreen />} />
          <Route path="demo/states" element={<ApprovalStates />} />
          <Route path="demo/new-task-states" element={<NewTaskStates />} />
          <Route path="dev/tokens" element={<Tokens />} />
          <Route path="dev/ref/:name" element={<RefScreens />} />
          <Route path="dev/state" element={<State />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        )}
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
      {/* The computer helper is a desktop window, not a phone screen. */}
      <Route
        path="demo/helper/:step"
        element={
          <Suspense fallback={null}>
            <Helper />
          </Suspense>
        }
      />
      <Route path="*" element={<Framed />} />
    </Routes>
  )
}
