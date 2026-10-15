import type { ChipKind } from '../components/Chip'
import { AGENT_NAMES } from '../components/icons'
import { clockTime, elapsed } from './format'
import { isActive, needsYou, startOfToday } from './selectors'
import { answerAge, TIMING, type State } from './store'
import type { AgentId, Request, Session } from './types'

const MIN = 60_000

export type TaskGroup = 'needs' | 'running' | 'done' | 'earlier'

export type TaskRowData = {
  task: Session
  group: TaskGroup
  chip: ChipKind
  /** Mono, right: "2m" waiting · "6m" running · "10:42" done · "Mon" earlier. */
  time: string
  computer: string
}

/** The request a task is waiting on, if any (Needs you order). */
export function pendingFor(st: Pick<State, 'requests'>, taskId: string): Request | undefined {
  const mine = st.requests.filter((r) => r.taskId === taskId)
  if (mine.length < 2) return mine[0]
  return needsYou({ requests: mine }, mine[0].computerId)[0]
}

/** "2m" — how long a request has waited (app minutes as shown on Home). */
const waited = (r: Request, now: number) => `${r.ageAtStart + Math.floor((now - r.arrivedAt) / MIN)}m`

const weekday = (t: number) => new Date(t).toLocaleDateString('en-US', { weekday: 'short' })

function chipFor(s: Session, r: Request | undefined): ChipKind {
  if (r) return r.kind === 'approval' ? r.risk : r.kind === 'question' ? 'question' : 'plan'
  if (s.status === 'denied') return 'denied'
  if (s.status === 'expired') return 'stopped'
  return s.status as ChipKind
}

/** Every task in its Tasks-tab group (09-chat-and-tasks.md → Tasks), each group in its own order. */
export function taskRows(st: Pick<State, 'sessions' | 'requests' | 'computers'>, now: number): TaskRowData[] {
  const today = startOfToday(now)
  const names = Object.fromEntries(st.computers.map((c) => [c.id, c.name]))
  const order: Record<TaskGroup, number> = { needs: 0, running: 1, done: 2, earlier: 3 }
  const needsOrder = needsYou({ requests: st.requests }, 'win')
    .concat(st.requests.filter((r) => r.computerId !== 'win'))
    .map((r) => r.taskId)
  const rows = st.sessions.map((task): TaskRowData => {
    const r = pendingFor(st, task.id)
    const group: TaskGroup = r ? 'needs' : isActive(task) || task.status === 'waiting' ? 'running' : (task.finishedAt ?? now) >= today ? 'done' : 'earlier'
    const time = r ? waited(r, now) : group === 'running' ? elapsed(task, now) : group === 'done' ? clockTime(task) : weekday(task.finishedAt ?? now)
    return { task, group, chip: chipFor(task, r), time, computer: names[task.computerId] }
  })
  const key = (x: TaskRowData) =>
    x.group === 'needs' ? needsOrder.indexOf(x.task.id) : x.group === 'running' ? -x.task.startedAt : -(x.task.finishedAt ?? 0)
  return rows.sort((a, b) => order[a.group] - order[b.group] || key(a) - key(b))
}

/** "Claude" · "Codex" · "Cursor" — the short names on the Tasks filter chips. */
export const FILTER_NAMES: Record<AgentId, string> = { claude: 'Claude', codex: 'Codex', cursor: 'Cursor' }

export const agentName = (a: AgentId) => AGENT_NAMES[a]

/** "back to PC in 8 min" — app minutes left before it goes back (the same accelerated clock as the rule). */
export function backToPc(r: Request, timeoutMin: number, now: number) {
  const age = answerAge(r, now) / TIMING.answerMinute
  return `back to PC in ${Math.max(1, Math.ceil(timeoutMin - age))} min`
}
