import type { ReactNode } from 'react'
import { AgentLogo, AGENT_NAMES, type AgentId } from './icons'
import { Chip, StatusDot } from './Chip'
import s from './AgentRow.module.css'

export type AgentStatus = 'connected' | 'disconnected' | 'not-connected'

const STATUS: Record<AgentStatus, { word: string; tone: 'green' | 'red' | 'grey' }> = {
  connected: { word: 'Connected', tone: 'green' },
  disconnected: { word: 'Disconnected', tone: 'red' },
  'not-connected': { word: 'Not connected', tone: 'grey' },
}

type Props = {
  agent: AgentId
  capabilities: string
  status: AgentStatus
  /** "status": Agents tab (dot + word under the text). "setup": AgentsFound (chip or word on the right). */
  variant?: 'status' | 'setup'
  trailing?: ReactNode
}

/** Agent row: connected · disconnected · not connected. Use inside a ListGroup <ul>. */
export function AgentRow({ agent, capabilities, status, variant = 'status', trailing }: Props) {
  const st = STATUS[status]
  return (
    <li className={[s.row, variant === 'setup' && s.setup].filter(Boolean).join(' ')}>
      <AgentLogo agent={agent} size={18} className={s.logo} />
      <div className={s.text}>
        <span className={s.name}>{AGENT_NAMES[agent]}</span>
        <span className={s.caps}>{capabilities}</span>
        {variant === 'status' && (
          <span className={[s.status, status === 'disconnected' && s.statusBad].filter(Boolean).join(' ')}>
            <StatusDot tone={st.tone} />
            {st.word}
          </span>
        )}
      </div>
      {variant === 'setup' && (
        <span className={s.end}>{status === 'connected' ? <Chip kind="connected" /> : st.word}</span>
      )}
      {trailing}
    </li>
  )
}
