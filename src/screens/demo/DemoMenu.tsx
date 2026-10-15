import { useNavigate } from 'react-router-dom'
import { Sheet } from '../../components/Sheet'
import { ListGroup, ListRow } from '../../components/List'
import { DEMO_PICKS } from '../../data/library'
import { resetDemo, useStore } from '../../data/store'

type Props = { open: boolean; onClose: () => void }

/**
 * Demo menu (docs/flows.md): shows every state without real agents. Items whose screens
 * arrive in later milestones are listed in DEMO_SCREENS and appear when their route exists.
 */
export const DEMO_SCREENS: { label: string; to: string; ready: boolean }[] = [
  { label: 'Show “no agents” setup', to: '/setup/no-agents', ready: false },
  { label: 'Lock screen: approvals', to: '/demo/lock/approvals', ready: false },
  { label: 'Lock screen: questions', to: '/demo/lock/questions', ready: false },
  { label: 'Lock screen: other alerts', to: '/demo/lock/alerts', ready: false },
  { label: 'Computer helper: pair', to: '/demo/helper/pair', ready: false },
  { label: 'Computer helper: connect agent', to: '/demo/helper/connect', ready: false },
  { label: 'Computer helper: status', to: '/demo/helper/status', ready: false },
  { label: 'Approval states', to: '/demo/states', ready: false },
  { label: 'New task states', to: '/demo/new-task-states', ready: false },
]

const SEND: { label: string; pick: keyof typeof DEMO_PICKS }[] = [
  { label: 'Send a low-risk request', pick: 'low' },
  { label: 'Send a medium-risk request', pick: 'medium' },
  { label: 'Send a high-risk request', pick: 'high' },
  { label: 'Send a question', pick: 'question' },
  { label: 'Send a plan', pick: 'plan' },
]

export function DemoMenu({ open, onClose }: Props) {
  const navigate = useNavigate()
  const requests = useStore((s) => s.requests)
  const sessions = useStore((s) => s.sessions)
  const offline = useStore((s) => s.offline)
  const { sendRequest, finishSession, failSession, setOffline, showEmptyHome } = useStore.getState()

  const waiting = new Set(requests.map((r) => r.lib))
  const anyWorking = sessions.some((s) => s.status === 'working')
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Demo" footnote="Only in the prototype.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <ListGroup>
          {SEND.map((x) => (
            <ListRow
              key={x.pick}
              title={x.label}
              chevron={false}
              // Disabled when every request of that kind is already waiting.
              disabled={DEMO_PICKS[x.pick].every((i) => waiting.has(i))}
              onPress={run(() => sendRequest(x.pick))}
            />
          ))}
        </ListGroup>
        <ListGroup>
          <ListRow title="Finish a session" chevron={false} disabled={!anyWorking} onPress={run(() => finishSession())} />
          <ListRow title="Fail a session" chevron={false} disabled={!anyWorking} onPress={run(() => failSession())} />
        </ListGroup>
        <ListGroup>
          <ListRow title="Computer offline" toggle={{ checked: offline, onChange: (v) => setOffline(v) }} />
          <ListRow title="Show empty Home" chevron={false} onPress={run(() => showEmptyHome())} />
        </ListGroup>
        {DEMO_SCREENS.some((d) => d.ready) && (
          <ListGroup>
            {DEMO_SCREENS.filter((d) => d.ready).map((d) => (
              <ListRow key={d.to} title={d.label} onPress={run(() => navigate(d.to))} />
            ))}
          </ListGroup>
        )}
        <ListGroup>
          <ListRow title="Reset demo" destructive onPress={resetDemo} />
        </ListGroup>
      </div>
    </Sheet>
  )
}
