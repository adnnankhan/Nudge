import type { AgentId } from '../components/icons'

export type { AgentId }
export type ComputerId = 'win' | 'mac' | 'mac2'
export type Risk = 'low' | 'medium' | 'high'
export type Theme = 'dark' | 'light'

export type AgentStatus = 'connected' | 'disconnected' | 'not-connected'

export type Computer = {
  id: ComputerId
  name: string
  state: 'awake' | 'asleep' | 'offline'
  /** Offline only: "last seen 1 day ago". */
  lastSeen?: string
  keepAwake: boolean
  agents: { agent: AgentId; status: AgentStatus }[]
}

/** A request template from docs/fake-data.md → Request library. */
export type LibraryItem =
  | {
      kind: 'approval'
      agent: AgentId
      project: string
      risk: Risk
      title: string
      command: string
      what: string
      before: string
    }
  | { kind: 'question'; agent: AgentId; project: string; title: string; options: string[]; why?: string }
  | { kind: 'plan'; agent: AgentId; project: string; title: string; summary: string[]; steps: string[] }

/** A request waiting in Needs you. */
export type Request = LibraryItem & {
  id: string
  /** Index in the library (so the arrival timer can skip ones already waiting). */
  lib: number
  computerId: ComputerId
  /** Real time it arrived (ms). */
  arrivedAt: number
  /** Minutes it had already waited when the demo started ("2 min ago" in the starting state). */
  ageAtStart: number
}

export type SessionStatus = 'working' | 'paused' | 'done' | 'failed' | 'stopped' | 'denied' | 'expired'

export type Session = {
  id: string
  computerId: ComputerId
  agent: AgentId
  project: string
  status: SessionStatus
  /** One-line status text ("Editing login.js", "Added the contact form"). */
  text: string
  /** Where it runs: started from the phone, in a terminal, or inside Cursor. */
  origin: 'phone' | 'terminal' | 'cursor'
  startedAt: number
  /** Working sessions finish on their own at this time (ms). */
  finishAt?: number
  /** Next time a Recent line is added (ms). */
  nextRecentAt?: number
  finishedAt?: number
  /** Fixed clock label for the seeded completed sessions ("10:42"). */
  clock?: string
  recent: string[]
  model: string
  intensity: 'Low' | 'Medium' | 'High'
  /** The request it came from (approve → session; deny → "Denied" row; undo restores it). */
  fromRequest?: Request
  /** Demo-only rows (offline mode's usage-limit session) are removed when the demo state ends. */
  demo?: boolean
  /** While paused by offline mode: the text to restore when the computer is back. */
  pausedText?: string
}

export type AppEvent = {
  id: string
  at: number
  kind: 'request' | 'finished' | 'failed'
  agent: AgentId
  /** Request or session it refers to. */
  ref: string
}

export type Settings = {
  timeoutMin: 5 | 10 | 15 | 30
  aiExplanation: boolean
  notifyFinished: boolean
  notifyFailed: boolean
  /** null until the Notifications setup step answers. */
  notificationsOn: boolean | null
}

export type Phone = { id: string; name: string; detail: string; current?: boolean }
