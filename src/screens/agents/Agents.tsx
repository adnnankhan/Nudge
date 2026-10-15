import { useNavigate } from 'react-router-dom'
import { Laptop, Plus } from 'lucide-react'
import { Screen } from '../Screen'
import a$ from './Agents.module.css'
import { TabBar, TabSpacer } from '../../components/Bars'
import { Button } from '../../components/Button'
import { ListGroup, ListRow } from '../../components/List'
import { AgentRow } from '../../components/AgentRow'
import { ICON } from '../../components/icons'
import { useStore } from '../../data/store'
import { computerStatus } from '../../data/selectors'

// 07-agents-settings.md: what each agent can do from the phone.
const CAPS = { claude: 'Approvals, questions, full control', codex: 'Approvals, questions, full control', cursor: 'Approvals only' }

/** Agents — /agents (tab: Agents) */
export function Agents() {
  const navigate = useNavigate()
  const st = useStore()
  const win = computerStatus(st, 'win')
  const keepAwake = win.computer.keepAwake
  const winLine = win.state === 'offline' ? 'Offline' : keepAwake ? 'Awake · keep awake' : 'Awake'
  const withAgents = st.computers.filter((c) => c.agents.length > 0)

  return (
    <>
      <Screen>
        <h1 className={a$.title}>Agents</h1>
        <div className={a$.groups}>
          <ListGroup>
            <ListRow
              title={win.computer.name}
              subtitle={winLine}
              leading={<Laptop size={24} {...ICON} />}
              toggle={{ checked: keepAwake, onChange: (v) => st.setKeepAwake('win', v) }}
            />
          </ListGroup>
          {withAgents.map((c) => {
            const cs = computerStatus(st, c.id)
            const header = c.id === 'win' ? `${c.name} · agents` : `${c.name} · ${cs.state}`
            return (
              <ListGroup key={c.id} header={header}>
                {c.agents.map((a) => (
                  <AgentRow
                    key={a.agent}
                    agent={a.agent}
                    status={a.status}
                    capabilities={a.status === 'disconnected' ? 'Reconnect on your computer' : CAPS[a.agent]}
                  />
                ))}
              </ListGroup>
            )
          })}
        </div>
        <div className={a$.add}>
          <Button variant="secondary" block icon={<Plus size={20} {...ICON} />} onClick={() => navigate('/computers/add')}>
            Add a computer
          </Button>
        </div>
        <TabSpacer />
      </Screen>
      <TabBar />
    </>
  )
}
