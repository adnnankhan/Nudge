import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Screen } from '../Screen'
import { TabBar, TabSpacer } from '../../components/Bars'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { EmptyState } from '../../components/EmptyState'
import { SectionTitle } from '../../components/Summary'
import { TextField } from '../../components/TextField'
import { AgentLogo, AGENT_NAMES, ICON, type AgentId } from '../../components/icons'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { FILTER_NAMES, taskRows, type TaskGroup, type TaskRowData } from '../../data/tasks'
import x$ from './Tasks.module.css'

const GROUPS: { key: TaskGroup; title: string }[] = [
  { key: 'needs', title: 'Needs you' },
  { key: 'running', title: 'Running' },
  { key: 'done', title: 'Done today' },
]

/** Tasks — /tasks (tab: Tasks). Refs Tasks.jpg, Tasks-full-page.jpg. */
export function Tasks() {
  const navigate = useNavigate()
  const now = useNow()
  const sessions = useStore((x) => x.sessions)
  const requests = useStore((x) => x.requests)
  const computers = useStore((x) => x.computers)
  const [q, setQ] = useState('')
  const [agent, setAgent] = useState<AgentId | null>(null)
  const [showEarlier, setShowEarlier] = useState(false)

  const rows = useMemo(() => taskRows({ sessions, requests, computers }, now), [sessions, requests, computers, now])
  const query = q.trim().toLowerCase()
  const matches = (r: TaskRowData) =>
    !query || r.task.taskTitle.toLowerCase().includes(query) || r.task.project.toLowerCase().includes(query)
  // Filter counts: what the list shows today (Earlier is folded away).
  const counted = rows.filter((r) => r.group !== 'earlier' && matches(r))
  const visible = rows.filter((r) => matches(r) && (!agent || r.task.agent === agent))
  const earlier = visible.filter((r) => r.group === 'earlier')

  const row = (r: TaskRowData) => (
    <li key={r.task.id}>
      <button type="button" className={x$.row} onClick={() => navigate(`/task/${r.task.id}`)}>
        <AgentLogo agent={r.task.agent} size={20} className={x$.logo} />
        <span className={x$.main}>
          <span className={x$.title}>{r.task.taskTitle}</span>
          <span className={x$.where}>
            <span className={x$.project}>{r.task.project}</span> · {r.computer}
          </span>
          <Chip kind={r.chip} className={x$.chip} />
        </span>
        <span className={x$.time}>{r.time}</span>
      </button>
    </li>
  )

  const filters: { id: AgentId | null; label: string; n: number }[] = [
    { id: null, label: 'All', n: counted.length },
    ...(['claude', 'codex', 'cursor'] as const).map((a) => ({ id: a, label: FILTER_NAMES[a], n: counted.filter((r) => r.task.agent === a).length })),
  ]

  return (
    <>
      <Screen scrollKey="tasks">
        <h1 className={x$.large}>Tasks</h1>
        <TextField
          label="Search tasks or projects"
          hideLabel
          type="search"
          placeholder="Search tasks or projects"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={x$.search}
        />
        <div className={x$.filters} role="group" aria-label="Filter by agent">
          {filters.map((f) => (
            <button
              key={f.label}
              type="button"
              className={[x$.filter, agent === f.id && x$.selected].filter(Boolean).join(' ')}
              aria-pressed={agent === f.id}
              aria-label={f.id ? `${AGENT_NAMES[f.id]}, ${f.n}` : `All, ${f.n}`}
              onClick={() => setAgent(f.id)}
            >
              {f.label}
              <span className={x$.n}>{f.n}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            body="Start one from New task."
            action={
              <Button icon={<Plus size={20} {...ICON} />} onClick={() => navigate('/new')}>
                New task
              </Button>
            }
          />
        ) : (
          <>
            {GROUPS.map(({ key, title }) => {
              const list = visible.filter((r) => r.group === key)
              if (!list.length) return null
              return (
                <section key={key} aria-labelledby={`tasks-${key}`}>
                  <SectionTitle id={`tasks-${key}`} title={title} count={list.length} />
                  <ul className={x$.list}>{list.map(row)}</ul>
                </section>
              )
            })}
            {earlier.length > 0 && (
              <section aria-labelledby="tasks-earlier">
                <div className={x$.earlierHead}>
                  <SectionTitle id="tasks-earlier" title="Earlier" />
                  {!showEarlier && (
                    <button type="button" className={x$.show} onClick={() => setShowEarlier(true)}>
                      Show {earlier.length}
                    </button>
                  )}
                </div>
                {showEarlier && <ul className={x$.list}>{earlier.map(row)}</ul>}
              </section>
            )}
          </>
        )}
        <TabSpacer />
      </Screen>
      <TabBar />
    </>
  )
}
