import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMPUTERS, DEFAULT_SETTINGS, DEMO_PICKS, FAILED_TEXT, LIBRARY, PHONES, RECENT_LINES, USER_EMAIL } from './library'
import type { AppEvent, Computer, ComputerId, Phone, Request, Session, Settings, Theme } from './types'

/**
 * One store for the whole prototype, saved to localStorage under nudge-proto-v1
 * (docs/fake-data.md → Persistence). No network calls. Times are real timestamps, so a
 * refresh keeps every timer where it was.
 */
export const STORAGE_KEY = 'nudge-proto-v1'
export type { Theme }

const SEC = 1000
const MIN = 60 * SEC
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Living-app timings (docs/fake-data.md). Accelerated only for "time to answer": 1 real min = 10 app min. */
export const TIMING = {
  firstArrival: 25 * SEC,
  arrival: [40 * SEC, 70 * SEC] as const,
  maxWaiting: 4,
  recentEvery: 6 * SEC,
  finishAfter: [60 * SEC, 90 * SEC] as const,
  /** Real ms per app minute for the time-to-answer rule. */
  answerMinute: MIN / 10,
}

type Data = {
  theme: Theme
  /** Signed in (any email works in the prototype). */
  signedIn: boolean
  /** Setup finished: later visits open straight on Home (flows.md). */
  onboarded: boolean
  email: string
  /** Show the KeepAwake sheet over Home once, right after setup. */
  showKeepAwake: boolean
  settings: Settings
  computers: Computer[]
  currentComputer: ComputerId
  phones: Phone[]
  requests: Request[]
  sessions: Session[]
  events: AppEvent[]
  /** Demo: Windows PC offline (HomeWarnings, "Not sent"). */
  offline: boolean
  /** Arrival timer: next request at (ms). null until Home is reached. */
  nextArrivalAt: number | null
  /** Rotates through the library. */
  libCursor: number
  /** The request open on screen doesn't time out while it's being read. Not saved. */
  viewing: string | null
  seq: number
}

type Actions = {
  setTheme: (t: Theme) => void
  setSettings: (s: Partial<Settings>) => void
  setOnboarded: (v: boolean) => void
  signIn: (email?: string) => void
  /** End of setup: the living app starts now (fresh fake data), then Home + KeepAwake. */
  completeSetup: (notificationsOn: boolean, now?: number) => void
  answerKeepAwake: (keep: boolean) => void
  setComputer: (id: ComputerId) => void
  setKeepAwake: (id: ComputerId, v: boolean) => void
  removePhone: (id: string) => void
  /** Called when Home is reached: starts the arrival timer (first request 25 s later). */
  startArrivals: (now?: number) => void
  /** Approve a request (or approve a plan): it becomes a working session. */
  approve: (id: string, now?: number) => Session | undefined
  /** Deny: the request leaves Needs you and shows in Completed today as "Denied". */
  deny: (id: string, now?: number) => Session | undefined
  undoDeny: (sessionId: string) => void
  /** Answer a question: the agent carries on, so it becomes a working session. */
  answer: (id: string, answer: string, now?: number) => Session | undefined
  setViewing: (id: string | null) => void
  // Demo menu
  sendRequest: (pick: keyof typeof DEMO_PICKS, now?: number) => Request | undefined
  finishSession: (now?: number) => Session | undefined
  failSession: (now?: number) => Session | undefined
  setOffline: (v: boolean, now?: number) => void
  showEmptyHome: (now?: number) => void
  /** One simulation step. `paused` holds the arrival timer (a sheet or the demo menu is open). */
  tick: (now: number, dtMs: number, paused: boolean) => void
  dismissEvent: (id: string) => void
  // Session control (05-session-control.md)
  stopSession: (id: string) => void
  /** Terminal session: control moves to the phone (TakeOverConfirm, or changing model/intensity). */
  takeOver: (id: string) => void
  continueSession: (id: string, now?: number) => void
  redirectSession: (id: string, instruction: string, now?: number) => void
  setModel: (id: string, model: number) => void
  setIntensity: (id: string, v: Session['intensity']) => void
  /** SessionFailed → "Send to agent": it carries on with your instruction. */
  sendToSession: (id: string, text: string, now?: number) => void
  /** New task → Start. */
  startTask: (t: { computerId: ComputerId; agent: Session['agent']; project: string; instruction: string }, now?: number) => Session
}

export type State = Data & Actions

function makeSession(id: string, from: Request, text: string, now: number): Session {
  return {
    id,
    computerId: from.computerId,
    agent: from.agent,
    project: from.project,
    status: 'working',
    text,
    // Requests come from agents already running on the computer, so these sessions run in a terminal.
    origin: from.agent === 'cursor' ? 'cursor' : 'terminal',
    startedAt: now,
    finishAt: now + rand(...TIMING.finishAfter),
    nextRecentAt: now + TIMING.recentEvery,
    recent: [],
    model: 0,
    intensity: 'Medium',
    doneText: from.title,
    fromRequest: from,
  }
}

/** A finished row for Completed today (denied, went back to the computer). */
function makeClosed(id: string, from: Request, status: 'denied' | 'expired', now: number): Session {
  return { ...makeSession(id, from, from.title, now), status, finishAt: undefined, nextRecentAt: undefined, finishedAt: now }
}

function makeRequest(lib: number, id: string, now: number, ageAtStart = 0): Request {
  return { ...LIBRARY[lib], id, lib, computerId: 'win', arrivedAt: now, ageAtStart }
}

function seed(now = Date.now()): Data {
  const today = (h: number, m: number) => {
    const d = new Date(now)
    d.setHours(h, m, 0, 0)
    return d.getTime()
  }
  const base = { origin: 'phone' as const, recent: [] as string[], model: 0, intensity: 'Medium' as const }
  return {
    theme: 'dark',
    signedIn: false,
    onboarded: false,
    email: USER_EMAIL,
    showKeepAwake: false,
    settings: { ...DEFAULT_SETTINGS },
    computers: COMPUTERS.map((c) => ({ ...c, agents: c.agents.map((a) => ({ ...a })) })),
    currentComputer: 'win',
    phones: PHONES.map((p) => ({ ...p })),
    // Starting state on Home (fake-data.md): approval 2 min ago, question 5 min ago.
    requests: [makeRequest(0, 'r1', now, 2), makeRequest(6, 'r2', now, 5)],
    sessions: [
      {
        ...base,
        id: 's1',
        computerId: 'win',
        agent: 'claude',
        project: 'portfolio',
        status: 'working',
        text: 'Editing login.js',
        doneText: 'Edited login.js',
        // SessionDetail: Recent (05-session-control.md)
        recent: ['Read 6 files', 'Created LoginForm.tsx', 'Updated 4 more files'],
        startedAt: now - 4 * MIN,
        finishAt: now + rand(...TIMING.finishAfter),
        nextRecentAt: now + TIMING.recentEvery,
      },
      {
        ...base,
        id: 's2',
        computerId: 'win',
        agent: 'cursor',
        project: 'site',
        // Starts working (NotSupported: "Building the contact form…") and finishes a minute or so in,
        // giving the "Cursor finished · View" banner from flows.md (decisions.md, M5 small calls).
        status: 'working',
        text: 'Building the contact form',
        doneText: 'Added the contact form',
        origin: 'cursor',
        startedAt: now - 2 * MIN,
        finishAt: now + rand(...TIMING.finishAfter),
        nextRecentAt: now + TIMING.recentEvery,
        // SessionDone (02-home.md)
        title: 'Added a contact form to the homepage',
        summary: 'Added a contact form to the homepage, updated 3 files and ran the tests. All passed.',
        files: ['index.html', 'styles/contact.css', 'scripts/form.js'],
      },
      {
        ...base,
        id: 's3',
        computerId: 'win',
        agent: 'codex',
        project: 'docs',
        status: 'failed',
        text: FAILED_TEXT,
        startedAt: today(9, 0),
        finishedAt: today(9, 15),
        clock: '09:15',
        // SessionFailed (02-home.md)
        title: 'Stopped: tests didn’t pass',
        why: '2 tests failing in docs.test.js',
        before: 'Rewrote the setup guide and updated 2 files.',
      },
    ],
    events: [],
    offline: false,
    nextArrivalAt: null,
    libCursor: 1,
    viewing: null,
    seq: 10,
  }
}

const isWorking = (s: Session) => s.status === 'working'

/** Ms a request has waited in app time, for the time-to-answer rule (accelerated). */
export function answerAge(r: Request, now: number) {
  return r.ageAtStart * TIMING.answerMinute + (now - r.arrivedAt)
}

function endSession(st: Data, id: string, status: 'done' | 'failed', now: number): Partial<Data> {
  const seq = st.seq + 1
  const sessions = st.sessions.map((s) =>
    s.id === id
      ? { ...s, status, finishedAt: now, finishAt: undefined, nextRecentAt: undefined, text: status === 'failed' ? FAILED_TEXT : (s.doneText ?? s.text) }
      : s,
  )
  const s = sessions.find((x) => x.id === id)!
  const ev: AppEvent = { id: `e${seq}`, at: now, kind: status === 'done' ? 'finished' : 'failed', agent: s.agent, ref: id }
  return { sessions, events: [...st.events, ev].slice(-10), seq }
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...seed(),

      setTheme: (theme) => set({ theme }),
      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      setOnboarded: (onboarded) => set({ onboarded }),
      signIn: (email) => set({ signedIn: true, email: email?.trim() || USER_EMAIL }),
      completeSetup: (notificationsOn, now = Date.now()) =>
        set((st) => {
          const fresh = seed(now)
          return {
            ...fresh,
            theme: st.theme,
            email: st.email,
            signedIn: true,
            onboarded: true,
            showKeepAwake: true,
            settings: { ...st.settings, notificationsOn },
          }
        }),
      answerKeepAwake: (keep) =>
        set((st) => ({ showKeepAwake: false, computers: st.computers.map((c) => (c.id === 'win' ? { ...c, keepAwake: keep } : c)) })),
      setComputer: (currentComputer) => set({ currentComputer }),
      setKeepAwake: (id, v) => set((st) => ({ computers: st.computers.map((c) => (c.id === id ? { ...c, keepAwake: v } : c)) })),
      removePhone: (id) => set((st) => ({ phones: st.phones.filter((p) => p.id !== id) })),

      startArrivals: (now = Date.now()) => {
        if (get().nextArrivalAt === null) set({ nextArrivalAt: now + TIMING.firstArrival })
      },

      approve: (id, now = Date.now()) => {
        const st = get()
        const r = st.requests.find((x) => x.id === id)
        if (!r || st.offline) return
        const s = makeSession(`s${st.seq + 1}`, r, r.kind === 'approval' ? `Running: ${r.command}` : r.title, now)
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: [s, ...st.sessions], seq: st.seq + 1 })
        return s
      },

      deny: (id, now = Date.now()) => {
        const st = get()
        const r = st.requests.find((x) => x.id === id)
        if (!r || st.offline) return
        const s = makeClosed(`s${st.seq + 1}`, r, 'denied', now)
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: [s, ...st.sessions], seq: st.seq + 1 })
        return s
      },

      undoDeny: (sessionId) => {
        const st = get()
        const s = st.sessions.find((x) => x.id === sessionId)
        if (!s?.fromRequest || s.status !== 'denied') return
        set({ sessions: st.sessions.filter((x) => x.id !== sessionId), requests: [...st.requests, s.fromRequest] })
      },

      answer: (id, _answer, now = Date.now()) => {
        const st = get()
        const r = st.requests.find((x) => x.id === id)
        if (!r || st.offline) return
        const s = makeSession(`s${st.seq + 1}`, r, r.kind === 'plan' ? r.title : RECENT_LINES[0], now)
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: [s, ...st.sessions], seq: st.seq + 1 })
        return s
      },

      setViewing: (viewing) => set({ viewing }),

      sendRequest: (pick, now = Date.now()) => {
        const st = get()
        const waiting = new Set(st.requests.map((r) => r.lib))
        const lib = DEMO_PICKS[pick].find((i) => !waiting.has(i))
        if (lib === undefined) return // every request of this kind is already waiting
        const seq = st.seq + 1
        const r = makeRequest(lib, `r${seq}`, now)
        const ev: AppEvent = { id: `e${seq}`, at: now, kind: 'request', agent: r.agent, ref: r.id }
        set({ requests: [...st.requests, r], events: [...st.events, ev].slice(-10), seq })
        return r
      },

      finishSession: (now = Date.now()) => {
        const s = get().sessions.find(isWorking)
        if (!s) return
        set((st) => endSession(st, s.id, 'done', now))
        return get().sessions.find((x) => x.id === s.id)
      },

      failSession: (now = Date.now()) => {
        const s = get().sessions.find(isWorking)
        if (!s) return
        set((st) => endSession(st, s.id, 'failed', now))
        return get().sessions.find((x) => x.id === s.id)
      },

      setOffline: (v, now = Date.now()) =>
        set((st) => {
          if (v === st.offline) return {}
          if (v) {
            // HomeWarnings: working sessions pause until the computer is back, and the
            // usage-limit session from the reference shows alongside them.
            const sessions = st.sessions.map((s) =>
              s.computerId === 'win' && isWorking(s) ? { ...s, status: 'paused' as const, pausedText: s.text, text: 'Paused until your computer is back' } : s,
            )
            const limit: Session = {
              id: `s${st.seq + 1}`,
              computerId: 'win',
              agent: 'claude',
              project: 'my-app',
              status: 'paused',
              text: 'Usage limit · continues at 3:45 pm',
              origin: 'phone',
              startedAt: now - 18 * MIN,
              recent: [],
              model: 0,
              intensity: 'Medium',
              demo: true,
            }
            return { offline: true, sessions: [...sessions, limit], seq: st.seq + 1 }
          }
          const sessions = st.sessions
            .filter((s) => !s.demo)
            .map((s) =>
              s.status === 'paused'
                ? { ...s, status: 'working' as const, text: s.pausedText ?? s.text, pausedText: undefined, finishAt: now + rand(...TIMING.finishAfter), nextRecentAt: now + TIMING.recentEvery }
                : s,
            )
          // Requests waited while the computer was away; restart their clocks so none expire at once.
          const requests = st.requests.map((r) => ({ ...r, arrivedAt: now, ageAtStart: 0 }))
          return { offline: false, sessions, requests }
        }),

      showEmptyHome: (now = Date.now()) =>
        set((st) => ({
          requests: st.requests.filter((r) => r.computerId !== st.currentComputer),
          sessions: st.sessions.filter((s) => s.computerId !== st.currentComputer),
          nextArrivalAt: st.nextArrivalAt === null ? null : now + TIMING.firstArrival,
        })),

      tick: (now, dt, paused) =>
        set((st) => {
          // Nothing lives until setup is done (completeSetup starts the fake data fresh).
          if (!st.onboarded) return {}
          let { requests, sessions, events, seq, libCursor, nextArrivalAt } = st
          let changed = false
          const add = (e: Omit<AppEvent, 'id'>) => {
            seq++
            events = [...events, { ...e, id: `e${seq}` }].slice(-10)
          }

          // Arrival timer (Windows PC). Holds while a sheet or the demo menu is open, or while offline.
          if (nextArrivalAt !== null) {
            if (paused || st.offline) {
              nextArrivalAt += dt
              changed = true
            } else if (now >= nextArrivalAt) {
              nextArrivalAt = now + rand(...TIMING.arrival)
              changed = true
              if (requests.length < TIMING.maxWaiting) {
                const waiting = new Set(requests.map((r) => r.lib))
                let lib = libCursor
                for (let i = 0; i < LIBRARY.length && waiting.has(lib); i++) lib = (lib + 1) % LIBRARY.length
                if (!waiting.has(lib)) {
                  seq++
                  const r = makeRequest(lib, `r${seq}`, now)
                  requests = [...requests, r]
                  add({ at: now, kind: 'request', agent: r.agent, ref: r.id })
                  libCursor = (lib + 1) % LIBRARY.length
                }
              }
            }
          }

          // Time to answer holds while a sheet is open (e.g. mid Face ID), so a request never vanishes under it.
          if (paused && requests.length) {
            requests = requests.map((r) => ({ ...r, arrivedAt: r.arrivedAt + dt }))
            changed = true
          }

          // Time to answer: older than the setting → back to the computer ("Went back to your computer").
          if (!st.offline && !paused) {
            const limit = st.settings.timeoutMin * TIMING.answerMinute
            const expired = requests.filter((r) => r.id !== st.viewing && answerAge(r, now) >= limit)
            if (expired.length) {
              changed = true
              requests = requests.filter((r) => !expired.includes(r))
              const closed = expired.map((r) => {
                seq++
                return makeClosed(`s${seq}`, r, 'expired', now)
              })
              sessions = [...closed, ...sessions]
            }
          }

          // Working sessions: a Recent line every ~6 s, finish after 60–90 s (they hold while offline).
          if (!st.offline) {
            const finished: Session[] = []
            sessions = sessions.map((s) => {
              if (!isWorking(s)) return s
              let next = s
              if (s.nextRecentAt !== undefined && now >= s.nextRecentAt) {
                const line = RECENT_LINES[s.recent.length % RECENT_LINES.length]
                next = { ...next, recent: [...s.recent, line].slice(-6), nextRecentAt: now + TIMING.recentEvery }
                changed = true
              }
              if (s.finishAt !== undefined && now >= s.finishAt) {
                next = { ...next, status: 'done', text: s.doneText ?? s.text, finishedAt: now, finishAt: undefined, nextRecentAt: undefined }
                finished.push(next)
                changed = true
              }
              return next
            })
            for (const f of finished) add({ at: now, kind: 'finished', agent: f.agent, ref: f.id })
          }

          return changed ? { requests, sessions, events, seq, libCursor, nextArrivalAt } : {}
        }),

      dismissEvent: (id) => set((st) => ({ events: st.events.filter((e) => e.id !== id) })),

      stopSession: (id) => set((st) => ({ sessions: patch(st.sessions, id, { status: 'stopped', origin: 'phone', finishAt: undefined, nextRecentAt: undefined }) })),
      takeOver: (id) => set((st) => ({ sessions: patch(st.sessions, id, { origin: 'phone' }) })),
      continueSession: (id, now = Date.now()) => set((st) => ({ sessions: patch(st.sessions, id, resume(now)) })),
      redirectSession: (id, instruction, now = Date.now()) =>
        set((st) => ({ sessions: patch(st.sessions, id, { ...resume(now), text: instruction, doneText: instruction }) })),
      setModel: (id, model) => set((st) => ({ sessions: patch(st.sessions, id, { model }) })),
      setIntensity: (id, intensity) => set((st) => ({ sessions: patch(st.sessions, id, { intensity }) })),
      sendToSession: (id, text, now = Date.now()) =>
        set((st) => ({ sessions: patch(st.sessions, id, { ...resume(now), status: 'working', text, doneText: text, finishedAt: undefined, clock: undefined }) })),
      startTask: ({ computerId, agent, project, instruction }, now = Date.now()) => {
        const st = get()
        const s: Session = {
          id: `s${st.seq + 1}`,
          computerId,
          agent,
          project,
          status: 'working',
          text: instruction,
          doneText: instruction,
          origin: 'phone',
          startedAt: now,
          ...resume(now),
          recent: [],
          model: 0,
          intensity: 'Medium',
        }
        set({ sessions: [s, ...st.sessions], seq: st.seq + 1 })
        return s
      },
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      // Older saves (M1–M4) don't have every field: keep the theme and settings, seed the rest.
      migrate: (old, version) => {
        const prev = (old ?? {}) as Partial<Data>
        return (version < 4 ? { ...seed(), theme: prev.theme ?? 'dark', settings: { ...DEFAULT_SETTINGS, ...prev.settings } } : prev) as State
      },
      partialize: (st) => {
        const data: Partial<Data> = {}
        for (const [k, v] of Object.entries(st)) if (typeof v !== 'function' && k !== 'viewing') (data as Record<string, unknown>)[k] = v
        return data as State
      },
    },
  ),
)

const patch = (list: Session[], id: string, p: Partial<Session>) => list.map((s) => (s.id === id ? { ...s, ...p } : s))

/** Back to working: a fresh 60–90 s run with Recent lines. */
const resume = (now: number): Partial<Session> => ({
  status: 'working',
  finishAt: now + rand(...TIMING.finishAfter),
  nextRecentAt: now + TIMING.recentEvery,
})

/** Reset demo: delete everything saved and start again (Sign in once onboarding exists, M6). */
export function resetDemo() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage blocked: nothing was saved anyway */
  }
  window.location.hash = '#/signin'
  window.location.reload()
}
