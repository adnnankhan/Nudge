import type { ComputerId, Request, Session } from './types'
import type { State } from './store'
import type { DotTone } from '../components/Chip'
import type { ChipKind } from '../components/Chip'

const MIN = 60_000

/** When it started waiting, in real time (seeded requests had already waited a few minutes). */
const waitingSince = (r: Request) => r.arrivedAt - r.ageAtStart * MIN

/** Needs you order (decision 7): high risk first, then oldest first. */
export function needsYou(st: Pick<State, 'requests'>, computer: ComputerId): Request[] {
  return st.requests
    .filter((r) => r.computerId === computer)
    .sort((a, b) => {
      const ha = a.kind === 'approval' && a.risk === 'high' ? 0 : 1
      const hb = b.kind === 'approval' && b.risk === 'high' ? 0 : 1
      return ha - hb || waitingSince(a) - waitingSince(b)
    })
}

/** "1 of 3": position across everything waiting, in Needs you order (decision 9). */
export function position(list: Request[], id: string) {
  const i = list.findIndex((r) => r.id === id)
  return i < 0 ? null : `${i + 1} of ${list.length}`
}

export const isActive = (s: Session) => s.status === 'working' || s.status === 'paused'

export function sessionsFor(st: Pick<State, 'sessions'>, computer: ComputerId) {
  const mine = st.sessions.filter((s) => s.computerId === computer)
  return {
    working: mine.filter((s) => s.status === 'working'),
    paused: mine.filter((s) => s.status === 'paused'),
    completed: mine.filter((s) => !isActive(s)).sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0)),
    all: mine,
  }
}

/** Chip for a session row. Denied and timed-out rows use Stopped (decisions.md, small calls). */
export const sessionChip = (s: Session): ChipKind =>
  s.status === 'denied' || s.status === 'expired' ? 'stopped' : (s.status as ChipKind)

/** Status text for a session row (denied / went back use the words from the docs). */
export const sessionText = (s: Session) =>
  s.status === 'denied' ? 'Denied' : s.status === 'expired' ? 'Went back to your computer' : s.text

export function computerStatus(st: Pick<State, 'computers' | 'offline' | 'sessions'>, id: ComputerId) {
  const c = st.computers.find((x) => x.id === id)!
  const state = id === 'win' && st.offline ? 'offline' : c.state
  const tone: DotTone = state === 'awake' ? 'green' : state === 'asleep' ? 'amber' : 'grey'
  const count = st.sessions.filter((s) => s.computerId === id && !['denied', 'expired'].includes(s.status)).length
  // Menu lines (02-home.md): "Awake · 3 sessions" · "Asleep" · "Offline · last seen 1 day ago"
  const menu =
    state === 'awake'
      ? `Awake · ${count} ${count === 1 ? 'session' : 'sessions'}`
      : state === 'asleep'
        ? 'Asleep'
        : `Offline · last seen ${id === 'win' ? '2 min ago' : (c.lastSeen ?? '1 day ago')}`
  return { computer: c, state, tone, menu }
}
