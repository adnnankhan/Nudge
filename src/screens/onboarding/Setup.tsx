import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Check, Mail, QrCode } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import o from './Onboarding.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { CodeInput } from '../../components/CodeInput'
import { InlineAlert } from '../../components/InlineAlert'
import { ListGroup, ListRow } from '../../components/List'
import { AgentRow } from '../../components/AgentRow'
import { NumberedSteps } from '../../components/Steps'
import { LockNotification } from '../../components/LockNotification'
import { AgentLogo, AGENT_NAMES, ICON, Spinner, type AgentId } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { useStore } from '../../data/store'

/**
 * Setup runs in three modes, carried in ?mode=:
 * - first setup (no mode): ends with Home + KeepAwake
 * - "add" (Add a computer): scan → connecting → back to Home
 * - "demo" (demo menu → "no agents" setup): walks the screens, ends back on Home, changes nothing
 */
function useMode() {
  const [params] = useSearchParams()
  const mode = params.get('mode') as 'add' | 'demo' | null
  const to = (path: string) => (mode ? `${path}?mode=${mode}` : path)
  return { mode, to }
}

const Bar = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate()
  return <TopBar title="Nudge" onBack={onBack ?? (() => navigate(-1))} />
}

/** SetupIntro — /setup */
export function SetupIntro() {
  const navigate = useNavigate()
  const { to } = useMode()
  return (
    <Screen>
      <Bar onBack={() => navigate('/signin', { replace: true })} />
      <h1 className={s.largeTitle}>Set up your computer first</h1>
      <p className={s.lead}>It takes about two minutes. Your phone connects once the helper is running.</p>
      <div className={s.section}>
        <NumberedSteps
          steps={[
            { title: 'Install the helper on your computer', description: 'A small app that talks to your agents' },
            { title: 'Connect your agents', description: 'Claude Code, Codex, Cursor' },
            { title: 'Scan the code with this phone', description: 'Pairs your phone securely' },
          ]}
        />
      </div>
      <p className={s.foot}>The email has an installer and a terminal command. Use either.</p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" icon={<Mail size={20} {...ICON} />} onClick={() => navigate(to('/setup/link-sent'))}>
          Email me the link
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** LinkSent — /setup/link-sent */
export function LinkSent() {
  const navigate = useNavigate()
  const toast = useToast()
  const { to } = useMode()
  const email = useStore((x) => x.email)
  return (
    <Screen>
      <Bar />
      <h1 className={s.largeTitle}>Check your email on your computer</h1>
      <p className={s.lead}>{`We sent the download link to ${email}.`}</p>
      <div className={s.section}>
        <ListGroup header="On your computer">
          <ListRow number={1} title="Open the email" />
          <ListRow number={2} title="Install the helper" subtitle="Installer or terminal command" />
          <ListRow number={3} title="The helper shows a QR code" />
        </ListGroup>
      </div>
      <p className={o.didnt}>
        Didn’t get it?
        <TextButton className={o.inlineLink} onClick={() => toast({ text: `Link sent to ${email}.`, success: true })}>
          Resend link
        </TextButton>
      </p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" icon={<QrCode size={20} {...ICON} />} onClick={() => navigate(to('/setup/scan'))}>
          Scan the code
        </Button>
      </BottomBar>
    </Screen>
  )
}

const SCAN_MS = 2500

/** Scan — /setup/scan. Prototype: succeeds after 2.5 s; "Simulate a failed scan" shows the error. */
export function Scan() {
  const navigate = useNavigate()
  const { to } = useMode()
  const [state, setState] = useState<'looking' | 'ok' | 'failed'>('looking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (state !== 'looking') return
    const t = window.setTimeout(() => setState('ok'), SCAN_MS)
    return () => window.clearTimeout(t)
  }, [state, attempt])

  useEffect(() => {
    if (state !== 'ok') return
    const t = window.setTimeout(() => navigate(to('/setup/connecting')), 500)
    return () => window.clearTimeout(t)
  }, [state, navigate, to])

  return (
    <Screen>
      <Bar />
      <h1 className={s.largeTitle}>Scan the code</h1>
      <p className={s.lead}>Point your camera at the code on your computer.</p>
      <div className={o.camera} role="img" aria-label={state === 'ok' ? 'Code found' : 'Camera'}>
        <div className={[o.frame, state === 'ok' && o.frameOk, state === 'failed' && o.frameBad].filter(Boolean).join(' ')}>
          {state === 'looking' && <span className={o.scanLine} />}
          {state === 'ok' && <Check size={48} className={o.frameTick} {...ICON} strokeWidth={2.25} />}
        </div>
      </div>
      {state === 'failed' ? (
        <InlineAlert
          kind="error"
          live
          className={s.alertTop}
          action={{
            label: 'Try again',
            onPress: () => {
              setState('looking')
              setAttempt((a) => a + 1)
            },
          }}
        >
          Couldn’t read the code.
        </InlineAlert>
      ) : (
        <div className={o.belowCamera}>
          <TextButton disabled={state === 'ok'} onClick={() => setState('failed')}>
            Simulate a failed scan
          </TextButton>
        </div>
      )}
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" variant="secondary" onClick={() => navigate(to('/setup/code'))}>
          Can’t scan? Enter code
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** EnterCode — /setup/code. Any 6 digits connect; 000000 has expired. */
export function EnterCode() {
  const navigate = useNavigate()
  const { to } = useMode()
  const [code, setCode] = useState('')
  const [expired, setExpired] = useState(false)
  const connect = () => {
    if (code.length < 6) return
    if (code === '000000') return setExpired(true)
    navigate(to('/setup/connecting'))
  }
  return (
    <Screen>
      <Bar />
      <h1 className={s.largeTitle}>Enter the code</h1>
      <p className={s.lead}>Type the 6-digit code shown in the helper on your computer.</p>
      <form
        className={o.code}
        onSubmit={(e) => {
          e.preventDefault()
          connect()
        }}
      >
        <CodeInput
          label="Enter the code"
          value={code}
          autoFocus
          error={expired ? 'This code has expired. Use the new code on your computer.' : undefined}
          onChange={(v) => {
            setCode(v)
            setExpired(false)
          }}
        />
      </form>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" disabled={code.length < 6} onClick={connect}>
          Connect
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** Connecting — /setup/connecting. After 1.8 s → agents (or straight back to Home when adding a computer). */
export function Connecting() {
  const navigate = useNavigate()
  const { mode, to } = useMode()
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (mode === 'add') navigate('/', { replace: true })
      else navigate(to('/setup/agents'), { replace: true })
    }, 1800)
    return () => window.clearTimeout(t)
  }, [mode, navigate, to])
  return (
    <Screen>
      <div className={o.connecting} role="status">
        <Spinner size={40} className={o.connectingIcon} />
        <h1 className={o.connectingTitle}>Connecting to your computer…</h1>
        <p className={o.connectingBody}>Keep the helper open on your computer.</p>
        <TextButton className={o.connectingCancel} onClick={() => navigate(to('/setup/scan'), { replace: true })}>
          Cancel
        </TextButton>
      </div>
    </Screen>
  )
}

function ConnectedTo() {
  return (
    <div className={o.connectedRow}>
      <Chip kind="connected" />
      Windows PC
    </div>
  )
}

/** AgentsFound — /setup/agents */
export function AgentsFound() {
  const navigate = useNavigate()
  const { to } = useMode()
  return (
    <Screen>
      <Bar />
      <ConnectedTo />
      <h1 className={o.setupTitle}>Agents on this computer</h1>
      <p className={s.lead}>Tap Yes on your computer to connect each one.</p>
      <div className={s.section}>
        <ListGroup>
          <AgentRow variant="setup" agent="claude" capabilities="Approvals, questions, full control" status="connected" />
          <AgentRow variant="setup" agent="codex" capabilities="Approvals, questions, full control" status="connected" />
          <AgentRow variant="setup" agent="cursor" capabilities="Approvals only" status="not-connected" />
        </ListGroup>
      </div>
      <p className={s.foot}>You said No for Cursor on your computer. Connect it later from Agents.</p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" onClick={() => navigate(to('/setup/notifications'))}>
          Continue
        </Button>
      </BottomBar>
    </Screen>
  )
}

// Each agent's own install guide (decisions.md, M6 small calls).
const INSTALL: Record<AgentId, string> = {
  claude: 'https://docs.anthropic.com/en/docs/claude-code/overview',
  codex: 'https://github.com/openai/codex',
  cursor: 'https://cursor.com/downloads',
}

/** NoAgents — /setup/no-agents (demo menu) */
export function NoAgents() {
  const navigate = useNavigate()
  const { to } = useMode()
  return (
    <Screen>
      <Bar />
      <ConnectedTo />
      <h1 className={o.setupTitle}>No coding agents found on this computer</h1>
      <p className={s.lead}>Install one, then scan again. You can finish setup now and add agents later.</p>
      <div className={s.section}>
        <ListGroup>
          {(['claude', 'codex', 'cursor'] as const).map((a) => (
            <ListRow
              key={a}
              title={`How to install ${AGENT_NAMES[a]}`}
              leading={<AgentLogo agent={a} size={20} />}
              onPress={() => window.open(INSTALL[a], '_blank', 'noopener')}
            />
          ))}
        </ListGroup>
      </div>
      <div className={s.fill} />
      <BottomBar layout="stacked">
        <Button size="l" onClick={() => navigate(to('/setup/scan'))}>
          Scan again
        </Button>
        <Button size="l" variant="secondary" onClick={() => navigate(to('/setup/notifications'))}>
          Continue without agents
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** Ask the browser for notification permission; continue whatever it says (or if it never answers). */
async function askPermission() {
  try {
    if (!('Notification' in window)) return
    await Promise.race([Notification.requestPermission(), new Promise((r) => window.setTimeout(r, 4000))])
  } catch {
    /* unsupported: just continue */
  }
}

/** Notifications — /setup/notifications. Both buttons → Home with the KeepAwake sheet. */
export function Notifications() {
  const navigate = useNavigate()
  const { mode } = useMode()
  const completeSetup = useStore((x) => x.completeSetup)
  const [asking, setAsking] = useState(false)
  const finish = (on: boolean) => {
    if (mode === 'demo') useStore.getState().setSettings({ notificationsOn: on })
    else completeSetup(on)
    navigate('/', { replace: true })
  }
  return (
    <Screen>
      <Bar />
      <h1 className={s.largeTitle}>Turn on notifications</h1>
      <p className={s.lead}>So you never miss a request from your agents, even when the app is closed.</p>
      {/* A picture of a notification: its buttons are part of the preview, not controls. */}
      <div className={o.preview} aria-label="Example notification" role="img">
        <LockNotification
          surface="app"
          preview
          time="now"
          title="Claude Code · my-app"
          body="Wants to delete old build files"
          chip="low"
          buttons={[
            { label: 'Approve', primary: true, fingerprint: true, onPress: () => {} },
            { label: 'Deny', onPress: () => {} },
            { label: 'Open', onPress: () => {} },
          ]}
        />
      </div>
      <div className={s.fill} />
      <BottomBar layout="stacked">
        <Button
          size="l"
          icon={<Bell size={20} {...ICON} />}
          loading={asking}
          onClick={async () => {
            setAsking(true)
            await askPermission()
            finish(true)
          }}
        >
          Turn on notifications
        </Button>
        <Button size="l" variant="secondary" disabled={asking} onClick={() => finish(false)}>
          Not now
        </Button>
      </BottomBar>
    </Screen>
  )
}
