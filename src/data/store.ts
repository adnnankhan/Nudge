import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMPUTERS, DEFAULT_SETTINGS, DEMO_PICKS, EARLIER, FAILED_TEXT, LIBRARY, PHONES, RECENT_LINES, REPLY, STEP_POOL, USER_EMAIL } from './library'
import type { AgentId, AppEvent, AskMe, Computer, ComputerId, Phone, Request, Session, Settings, Theme, ThreadItem } from './types'

/**
 * One store for the whole prototype, saved to localStorage under nudge-proto-v1
 * (docs/fake-data.md → Persistence). No network calls. Times are real timestamps, so a
 * refresh keeps every timer where it was.
 *
 * Every session is a task with a thread (09-chat-and-tasks.md). A request points at its task
 * (`taskId`); a task that is only waiting on you has status 'waiting' (its card is on Home, it has
 * no Working row). Approving or answering moves the same task on, so Home, Tasks and the thread
 * always agree.
 */
export const STORAGE_KEY = 'nudge-proto-v1'
export type { Theme }

const SEC = 1000
const MIN = 60 * SEC
const DAY = 24 * 60 * MIN
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
  /** The agent's "Got it" comes this long after you send a message. */
  reply: 1.2 * SEC,
  /** Then 1–3 progress lines come quickly. */
  burstEvery: 2 * SEC,
}

/** New task remembers these per agent (09-chat-and-tasks.md → Defaults). */
export type TaskDefaults = { project: string; computerId: ComputerId; askMe: AskMe }
export const FIRST_DEFAULTS: TaskDefaults = { project: 'my-app', computerId: 'win', askMe: 'every' }

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
  /** Sessions = tasks (each with its thread). */
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
  /** New task → Recent: task ids, newest first. */
  recentTasks: string[]
  taskDefaults: Partial<Record<AgentId, TaskDefaults>>
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
  /** Approve a request (or approve a plan): its task works on. */
  approve: (id: string, now?: number) => Session | undefined
  /** Deny: the request leaves Needs you; a task that was only waiting shows in Completed today as "Denied". */
  deny: (id: string, now?: number) => Session | undefined
  undoDeny: (sessionId: string) => void
  /** Answer a question: the agent carries on. */
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
  // Session control (05-session-control.md), now from the thread's Task menu
  stopSession: (id: string) => void
  /** Terminal session: control moves to the phone (TakeOverConfirm, or changing model/intensity). */
  takeOver: (id: string) => void
  continueSession: (id: string, now?: number) => void
  redirectSession: (id: string, instruction: string, now?: number) => void
  setModel: (id: string, model: number) => void
  setIntensity: (id: string, v: Session['intensity']) => void
  setAskMe: (id: string, v: AskMe) => void
  /** A message in the thread. The agent replies ("Got it…") unless `reply` is false (e.g. "Not now"). */
  sendMessage: (id: string, text: string, reply?: boolean, now?: number) => void
  /** SessionFailed → "Send to agent": it carries on with your instruction. */
  sendToSession: (id: string, text: string, now?: number) => void
  // Lock-screen previews (08-…): tapping a notification opens the app at the matching screen.
  /** The waiting request for this library item, added (as waiting `ageMin` minutes) if it isn't there. */
  ensureRequest: (lib: number, ageMin?: number, now?: number) => string
  /** Finish (or fail) a specific session, e.g. Cursor · site for "Finished: contact form added". */
  endSessionAs: (id: string, status: 'done' | 'failed', now?: number) => void
  setAgentStatus: (computer: ComputerId, agent: Session['agent'], status: 'connected' | 'disconnected' | 'not-connected') => void
  /** New task chat → Send. */
  startTask: (t: { computerId: ComputerId; agent: AgentId; project: string; instruction: string; askMe: AskMe }, now?: number) => Session
}

export type State = Data & Actions

/* ---------- Threads ---------- */

type NewItem = ThreadItem extends infer T ? (T extends ThreadItem ? Omit<T, 'id'> : never) : never

/** Append an item (threads only grow, so the index is a stable id). */
export const push = (thread: ThreadItem[], x: NewItem): ThreadItem[] => [...thread, { ...x, id: `i${thread.length}` } as ThreadItem]

const markRequest = (thread: ThreadItem[], reqId: string, state: Extract<ThreadItem, { type: 'request' }>['state']) =>
  thread.map((i) => (i.type === 'request' && i.req.id === reqId ? { ...i, state } : i))

/** A progress line joins the tool line under it (up to 6 steps), or starts a new one. */
function addStep(thread: ThreadItem[], line: string): ThreadItem[] {
  const last = thread[thread.length - 1]
  if (last?.type !== 'tools') return push(thread, { type: 'tools', steps: [line] })
  if (last.steps.length >= 6) return thread
  return [...thread.slice(0, -1), { ...last, steps: [...last.steps, line], summary: undefined }]
}

export const hhmm = (t: number) => {
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** The task's title when you start it: your instruction without the full stop. */
const titleFrom = (text: string) => text.trim().replace(/[.!]+$/, '')

/* ---------- Factories ---------- */

const BASE = { recent: [] as string[], model: 0, intensity: 'Medium' as const, askMe: 'every' as AskMe }

function makeRequest(lib: number, id: string, now: number, ageAtStart = 0): Request {
  return { ...LIBRARY[lib], id, lib, computerId: 'win', arrivedAt: now, ageAtStart }
}

/**
 * Put a new request into a task: the agent/project's running task if it isn't already waiting on
 * you, otherwise a new task started on the computer.
 */
function attach(sessions: Session[], requests: Request[], r: Request, seq: number, now: number) {
  const busy = new Set(requests.map((x) => x.taskId))
  const host = sessions.find(
    (s) => s.agent === r.agent && s.project === r.project && s.computerId === r.computerId && (s.status === 'working' || s.status === 'paused') && !busy.has(s.id),
  )
  // An approval says what it did first ("Before this"); a question or plan is the agent's turn itself.
  const intro = (thread: ThreadItem[]) => (r.kind === 'approval' ? push(thread, { type: 'agent', text: r.before }) : thread)
  if (host) {
    const req = { ...r, taskId: host.id }
    const thread = push(intro(host.thread), { type: 'request', req, state: 'pending' })
    return { request: req, sessions: sessions.map((s) => (s.id === host.id ? { ...s, thread } : s)), seq }
  }
  seq++
  const id = `s${seq}`
  const req = { ...r, taskId: id }
  let thread = push([], { type: 'status', icon: 'info', text: r.agent === 'cursor' ? 'Started in Cursor' : 'Started in terminal' })
  thread = push(intro(thread), { type: 'request', req, state: 'pending' })
  const s: Session = {
    ...BASE,
    id,
    computerId: r.computerId,
    agent: r.agent,
    project: r.project,
    status: 'waiting',
    text: r.title,
    // Requests come from agents already running on the computer, so these tasks run in a terminal.
    origin: r.agent === 'cursor' ? 'cursor' : 'terminal',
    startedAt: now,
    taskTitle: r.title,
    thread,
  }
  return { request: req, sessions: [s, ...sessions], seq }
}

/** Finished or failed: the thread says so (and the agent's closing message, if it has one). */
function finish(s: Session, status: 'done' | 'failed', now: number): Session {
  let thread = s.thread
  if (status === 'done' && s.doneMessage) thread = push(thread, { type: 'agent', text: s.doneMessage.text, suggestions: s.doneMessage.suggestions })
  else if (status === 'done') thread = push(thread, { type: 'status', icon: 'done', text: `Finished · ${hhmm(now)}` })
  else thread = push(thread, { type: 'status', icon: 'failed', text: `Stopped · ${s.why ?? 'tests didn’t pass'}` })
  return {
    ...s,
    status,
    finishedAt: now,
    finishAt: undefined,
    nextRecentAt: undefined,
    replyAt: undefined,
    clock: undefined,
    doneMessage: undefined,
    text: status === 'failed' ? FAILED_TEXT : (s.doneText ?? s.text),
    thread,
  }
}

/* ---------- Starting state ---------- */

function seed(now = Date.now()): Data {
  const today = (h: number, m: number) => {
    const d = new Date(now)
    d.setHours(h, m, 0, 0)
    return d.getTime()
  }
  const r1: Request = { ...makeRequest(0, 'r1', now, 2), taskId: 's4' }
  const r2: Request = { ...makeRequest(6, 'r2', now, 5), taskId: 's5' }
  const denied: Request = { ...makeRequest(5, 'r0', today(8, 45)), taskId: 's7' }
  const t = (...items: NewItem[]) => items.reduce<ThreadItem[]>((th, x) => push(th, x), [])

  // Starting threads (fake-data.md → Task threads). The agents' words in the my-app thread are the
  // approved designs' (docs/reference/new/Chat-*.jpg).
  const sessions: Session[] = [
    {
      ...BASE,
      id: 's4',
      computerId: 'win',
      agent: 'claude',
      project: 'my-app',
      status: 'waiting',
      text: r1.title,
      origin: 'phone',
      startedAt: now - 8 * MIN,
      taskTitle: 'Clean up the build and login page',
      thread: t(
        { type: 'user', text: 'Clean up the build and get the login page ready.' },
        { type: 'agent', text: 'On it. I’ll update the login page first, then clean up the old build.' },
        { type: 'tools', summary: 'Read 5 files, edited 3', steps: ['Read 5 files', 'Updated LoginForm.tsx', 'Updated login.css', 'Updated routes.ts'] },
        { type: 'agent', text: 'The login page is updated. Next I need to delete the old build folder.' },
        { type: 'request', req: r1, state: 'pending' },
      ),
      doneMessage: { text: 'Done. The old build folder is gone and the login page is ready. Want me to run the tests?', suggestions: ['Yes, run the tests', 'Not now'] },
    },
    {
      ...BASE,
      id: 's5',
      computerId: 'win',
      agent: 'codex',
      project: 'api',
      status: 'waiting',
      text: r2.title,
      origin: 'phone',
      startedAt: now - 12 * MIN,
      taskTitle: 'Add sign-in to the API',
      thread: t(
        { type: 'user', text: 'Add sign-in to the API.' },
        { type: 'agent', text: 'I’ll add sign-in to the login page.' },
        { type: 'tools', summary: 'Read 8 files, set up the auth routes', steps: ['Read 8 files', 'Set up the auth routes'] },
        { type: 'request', req: r2, state: 'pending' },
      ),
    },
    {
      ...BASE,
      id: 's1',
      computerId: 'win',
      agent: 'claude',
      project: 'portfolio',
      status: 'working',
      text: 'Editing login.js',
      doneText: 'Edited login.js',
      origin: 'phone',
      recent: ['Read 6 files', 'Created LoginForm.tsx', 'Updated 4 more files'],
      startedAt: now - 4 * MIN,
      finishAt: now + rand(...TIMING.finishAfter),
      nextRecentAt: now + TIMING.recentEvery,
      taskTitle: 'Build the login page',
      thread: t({ type: 'user', text: 'Build the login page.' }, { type: 'tools', steps: ['Read 6 files', 'Created LoginForm.tsx', 'Updated 4 more files'] }),
    },
    {
      ...BASE,
      id: 's2',
      computerId: 'win',
      agent: 'cursor',
      project: 'site',
      status: 'done',
      text: 'Added the contact form',
      origin: 'cursor',
      startedAt: today(10, 20),
      finishedAt: today(10, 42),
      clock: '10:42',
      // SessionDone (02-home.md)
      title: 'Added a contact form to the homepage',
      summary: 'Added a contact form to the homepage, updated 3 files and ran the tests. All passed.',
      files: ['index.html', 'styles/contact.css', 'scripts/form.js'],
      taskTitle: 'Add the contact form',
      thread: t(
        { type: 'status', icon: 'info', text: 'Started in Cursor' },
        { type: 'tools', steps: ['Added the contact form', 'Ran the tests · 12 passed'] },
        { type: 'agent', text: 'Added a contact form to the homepage, updated 3 files and ran the tests. All passed.' },
        { type: 'status', icon: 'done', text: 'Finished · 10:42' },
      ),
    },
    {
      ...BASE,
      id: 's3',
      computerId: 'win',
      agent: 'codex',
      project: 'docs',
      status: 'failed',
      text: FAILED_TEXT,
      origin: 'phone',
      startedAt: today(9, 0),
      finishedAt: today(9, 15),
      clock: '09:15',
      // SessionFailed (02-home.md)
      title: 'Stopped: tests didn’t pass',
      why: '2 tests failing in docs.test.js',
      before: 'Rewrote the setup guide and updated 2 files.',
      taskTitle: 'Rewrite the setup guide',
      thread: t(
        { type: 'user', text: 'Rewrite the setup guide.' },
        { type: 'tools', steps: ['Rewrote the setup guide', 'Updated 2 files', 'Ran the tests'] },
        { type: 'status', icon: 'failed', text: 'Stopped · 2 tests failing in docs.test.js' },
      ),
    },
    {
      ...BASE,
      id: 's6',
      computerId: 'mac',
      agent: 'claude',
      project: 'shop',
      status: 'paused',
      text: 'Paused until your computer is back',
      origin: 'phone',
      startedAt: now - 18 * MIN,
      taskTitle: 'Fix the checkout bug',
      thread: t(
        { type: 'user', text: 'Fix the checkout bug.' },
        { type: 'tools', steps: ['Read 3 files', 'Fixed a type error'] },
        { type: 'status', icon: 'paused', text: 'Paused · MacBook went to sleep' },
      ),
    },
    {
      ...BASE,
      id: 's7',
      computerId: 'win',
      agent: 'codex',
      project: 'api',
      status: 'denied',
      text: denied.title,
      origin: 'terminal',
      startedAt: today(8, 45),
      finishedAt: today(8, 50),
      clock: '08:50',
      taskTitle: 'Delete old migrations',
      fromRequest: denied,
      thread: t(
        { type: 'status', icon: 'info', text: 'Started in terminal' },
        { type: 'agent', text: denied.kind === 'approval' ? denied.before : '' },
        { type: 'request', req: denied, state: 'denied' },
      ),
    },
    // Tasks → Earlier: 12 older tasks.
    ...EARLIER.map((e, i): Session => {
      const at = today(17 - (i % 6), 10 + i) - e.daysAgo * DAY
      return {
        ...BASE,
        id: `h${i + 1}`,
        computerId: 'win',
        agent: e.agent,
        project: e.project,
        status: e.failed ? 'failed' : 'done',
        text: e.failed ? FAILED_TEXT : e.title,
        origin: e.agent === 'cursor' ? 'cursor' : 'phone',
        startedAt: at - 20 * MIN,
        finishedAt: at,
        taskTitle: e.title,
        thread: t(
          e.agent === 'cursor' ? { type: 'status', icon: 'info', text: 'Started in Cursor' } : { type: 'user', text: `${e.title}.` },
          { type: 'tools', steps: ['Read 3 files', 'Ran the tests · 12 passed'] },
          e.failed ? { type: 'status', icon: 'failed', text: 'Stopped · tests didn’t pass' } : { type: 'status', icon: 'done', text: `Finished · ${hhmm(at)}` },
        ),
      }
    }),
  ]

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
    requests: [r1, r2],
    sessions,
    events: [],
    offline: false,
    nextArrivalAt: null,
    libCursor: 1,
    viewing: null,
    seq: 10,
    // New task → Recent (fake-data.md): "Build the login page" (portfolio), "Add sign-in to the API" (api).
    recentTasks: ['s1', 's5'],
    taskDefaults: {},
  }
}

const isWorking = (s: Session) => s.status === 'working'

/** Ms a request has waited in app time, for the time-to-answer rule (accelerated). */
export function answerAge(r: Request, now: number) {
  return r.ageAtStart * TIMING.answerMinute + (now - r.arrivedAt)
}

function endSession(st: Data, id: string, status: 'done' | 'failed', now: number): Partial<Data> {
  const seq = st.seq + 1
  const sessions = st.sessions.map((s) => (s.id === id ? finish(s, status, now) : s))
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
        const host = st.sessions.find((x) => x.id === r?.taskId)
        if (!r || !host || st.offline) return
        const fresh = host.status === 'waiting'
        const s: Session = {
          ...host,
          ...resume(now),
          status: 'working',
          text: r.kind === 'approval' ? `Running: ${r.command}` : r.title,
          doneText: r.title,
          fromRequest: r,
          prevStatus: host.status,
          startedAt: fresh ? now : host.startedAt,
          thread: markRequest(host.thread, r.id, 'approved'),
        }
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: patch(st.sessions, s.id, s) })
        return s
      },

      deny: (id, now = Date.now()) => {
        const st = get()
        const r = st.requests.find((x) => x.id === id)
        const host = st.sessions.find((x) => x.id === r?.taskId)
        if (!r || !host || st.offline) return
        const thread = markRequest(host.thread, r.id, 'denied')
        // A task that was only waiting on this ends as "Denied"; a running one carries on without it.
        const s: Session =
          host.status === 'waiting'
            ? { ...host, status: 'denied', finishedAt: now, text: r.title, fromRequest: r, prevStatus: 'waiting', thread }
            : { ...host, fromRequest: r, prevStatus: host.status, thread }
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: patch(st.sessions, s.id, s) })
        return s
      },

      undoDeny: (sessionId) => {
        const st = get()
        const s = st.sessions.find((x) => x.id === sessionId)
        const r = s?.fromRequest
        if (!s || !r || st.requests.some((x) => x.id === r.id)) return
        const back: Partial<Session> = { thread: markRequest(s.thread, r.id, 'pending') }
        if (s.status === 'denied') Object.assign(back, { status: s.prevStatus ?? 'waiting', finishedAt: undefined })
        set({ sessions: patch(st.sessions, s.id, back), requests: [...st.requests, r] })
      },

      answer: (id, text, now = Date.now()) => {
        const st = get()
        const r = st.requests.find((x) => x.id === id)
        const host = st.sessions.find((x) => x.id === r?.taskId)
        if (!r || !host || st.offline) return
        const fresh = host.status === 'waiting'
        const s: Session = {
          ...host,
          ...resume(now),
          status: 'working',
          text: r.kind === 'plan' ? r.title : RECENT_LINES[0],
          doneText: host.doneText ?? r.title,
          startedAt: fresh ? now : host.startedAt,
          thread: push(markRequest(host.thread, r.id, 'answered'), { type: 'user', text }),
        }
        set({ requests: st.requests.filter((x) => x.id !== id), sessions: patch(st.sessions, s.id, s) })
        return s
      },

      setViewing: (viewing) => set({ viewing }),

      sendRequest: (pick, now = Date.now()) => {
        const st = get()
        const waiting = new Set(st.requests.map((r) => r.lib))
        const lib = DEMO_PICKS[pick].find((i) => !waiting.has(i))
        if (lib === undefined) return // every request of this kind is already waiting
        let seq = st.seq + 1
        const made = attach(st.sessions, st.requests, makeRequest(lib, `r${seq}`, now), seq, now)
        seq = made.seq
        const ev: AppEvent = { id: `e${seq}`, at: now, kind: 'request', agent: made.request.agent, ref: made.request.id }
        set({ requests: [...st.requests, made.request], sessions: made.sessions, events: [...st.events, ev].slice(-10), seq })
        return made.request
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
              s.computerId === 'win' && isWorking(s)
                ? {
                    ...s,
                    status: 'paused' as const,
                    pausedText: s.text,
                    text: 'Paused until your computer is back',
                    thread: push(s.thread, { type: 'status', icon: 'paused', text: 'Paused · Windows PC went offline' }),
                  }
                : s,
            )
            const limit: Session = {
              ...BASE,
              id: `s${st.seq + 1}`,
              computerId: 'win',
              agent: 'claude',
              project: 'my-app',
              status: 'paused',
              text: 'Usage limit · continues at 3:45 pm',
              origin: 'phone',
              startedAt: now - 18 * MIN,
              demo: true,
              taskTitle: 'Update the login page',
              thread: push(push([], { type: 'user', text: 'Update the login page.' }), { type: 'status', icon: 'paused', text: 'Paused · usage limit · continues at 3:45 pm' }),
            }
            return { offline: true, sessions: [...sessions, limit], seq: st.seq + 1 }
          }
          const sessions = st.sessions
            .filter((s) => !s.demo)
            .map((s) =>
              s.status === 'paused' && s.computerId === 'win'
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
                  const made = attach(sessions, requests, makeRequest(lib, `r${seq}`, now), seq, now)
                  seq = made.seq
                  sessions = made.sessions
                  requests = [...requests, made.request]
                  add({ at: now, kind: 'request', agent: made.request.agent, ref: made.request.id })
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
              for (const r of expired) {
                sessions = sessions.map((s) => {
                  if (s.id !== r.taskId) return s
                  const thread = markRequest(s.thread, r.id, 'expired')
                  return s.status === 'waiting' ? { ...s, status: 'expired', finishedAt: now, text: r.title, fromRequest: r, thread } : { ...s, thread }
                })
              }
            }
          }

          // Working sessions: a progress line every ~6 s, finish after 60–90 s (they hold while offline,
          // and while their task waits on you). A message you sent gets its reply first.
          if (!st.offline) {
            const finished: Session[] = []
            const waitingOnYou = new Set(requests.map((r) => r.taskId))
            sessions = sessions.map((s) => {
              let next = s
              if (s.replyAt !== undefined && now >= s.replyAt) {
                next = { ...next, replyAt: undefined, thread: push(s.thread, { type: 'agent', text: REPLY }), nextRecentAt: now + TIMING.burstEvery }
                changed = true
              }
              if (!isWorking(next)) return next
              if (waitingOnYou.has(next.id) || next.replyAt !== undefined) {
                if (next.finishAt !== undefined) {
                  next = { ...next, finishAt: next.finishAt + dt, nextRecentAt: (next.nextRecentAt ?? now) + dt }
                  changed = true
                }
                return next
              }
              if (next.nextRecentAt !== undefined && now >= next.nextRecentAt) {
                const line = STEP_POOL[Math.floor(now / 1000) % STEP_POOL.length]
                const burst = next.burst ?? 0
                next = {
                  ...next,
                  recent: [...next.recent, line].slice(-6),
                  thread: addStep(next.thread, line),
                  nextRecentAt: now + (burst > 0 ? TIMING.burstEvery : TIMING.recentEvery),
                  burst: Math.max(0, burst - 1),
                }
                changed = true
              }
              if (next.finishAt !== undefined && now >= next.finishAt) {
                next = finish(next, 'done', now)
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

      stopSession: (id) =>
        set((st) => {
          const s = st.sessions.find((x) => x.id === id)
          if (!s) return {}
          return {
            sessions: patch(st.sessions, id, {
              status: 'stopped',
              origin: s.origin === 'cursor' ? 'cursor' : 'phone',
              finishAt: undefined,
              nextRecentAt: undefined,
              replyAt: undefined,
              thread: push(s.thread, { type: 'status', icon: 'stopped', text: 'Stopped by you' }),
            }),
          }
        }),
      takeOver: (id) => set((st) => ({ sessions: patch(st.sessions, id, { origin: 'phone' }) })),
      continueSession: (id, now = Date.now()) => set((st) => ({ sessions: patch(st.sessions, id, resume(now)) })),
      redirectSession: (id, instruction, now = Date.now()) => {
        get().sendMessage(id, instruction, true, now)
        set((st) => ({ sessions: patch(st.sessions, id, { text: instruction, doneText: instruction }) }))
      },
      setModel: (id, model) => set((st) => ({ sessions: patch(st.sessions, id, { model }) })),
      setIntensity: (id, intensity) => set((st) => ({ sessions: patch(st.sessions, id, { intensity }) })),
      setAskMe: (id, askMe) => set((st) => ({ sessions: patch(st.sessions, id, { askMe }) })),

      sendMessage: (id, text, reply = true, now = Date.now()) =>
        set((st) => {
          const s = st.sessions.find((x) => x.id === id)
          if (!s) return {}
          const thread = push(s.thread, { type: 'user', text })
          if (!reply) return { sessions: patch(st.sessions, id, { thread }) }
          const p: Partial<Session> = { thread, replyAt: now + TIMING.reply, burst: 1 + Math.floor(Math.random() * 3) }
          // A finished, failed or stopped task picks up again with your message.
          if (!['working', 'paused', 'waiting'].includes(s.status))
            Object.assign(p, resume(now), {
              status: 'working',
              text,
              doneText: text,
              startedAt: now,
              finishedAt: undefined,
              clock: undefined,
              origin: s.origin === 'cursor' ? 'cursor' : 'phone',
            })
          return { sessions: patch(st.sessions, id, p) }
        }),
      sendToSession: (id, text, now = Date.now()) => get().sendMessage(id, text, true, now),

      ensureRequest: (lib, ageMin = 0, now = Date.now()) => {
        const st = get()
        const found = st.requests.find((r) => r.lib === lib)
        if (found) return found.id
        const made = attach(st.sessions, st.requests, makeRequest(lib, `r${st.seq + 1}`, now, ageMin), st.seq + 1, now)
        set({ requests: [...st.requests, made.request], sessions: made.sessions, seq: made.seq })
        return made.request.id
      },
      endSessionAs: (id, status, now = Date.now()) =>
        set((st) => {
          const x = st.sessions.find((s) => s.id === id)
          if (!x || x.status === status) return {}
          const { events, seq, ...rest } = endSession(st, id, status, now)
          // No in-app banner: you came from the notification itself.
          return { ...rest, seq }
        }),
      setAgentStatus: (computer, agent, status) =>
        set((st) => ({
          computers: st.computers.map((c) => (c.id === computer ? { ...c, agents: c.agents.map((a) => (a.agent === agent ? { ...a, status } : a)) } : c)),
        })),
      startTask: ({ computerId, agent, project, instruction, askMe }, now = Date.now()) => {
        const st = get()
        const s: Session = {
          ...BASE,
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
          askMe,
          taskTitle: titleFrom(instruction),
          thread: push([], { type: 'user', text: instruction }),
          replyAt: now + TIMING.reply,
          burst: 2,
        }
        set({
          sessions: [s, ...st.sessions],
          seq: st.seq + 1,
          recentTasks: [s.id, ...st.recentTasks.filter((x) => x !== s.id)].slice(0, 3),
          taskDefaults: { ...st.taskDefaults, [agent]: { project, computerId, askMe } },
        })
        return s
      },
    }),
    {
      name: STORAGE_KEY,
      version: 5,
      // Older saves don't have tasks: keep who you are, the theme and settings; start the fake data again.
      migrate: (old, version) => {
        const prev = (old ?? {}) as Partial<Data>
        if (version >= 5) return prev as State
        return {
          ...seed(),
          theme: prev.theme ?? 'dark',
          settings: { ...DEFAULT_SETTINGS, ...prev.settings },
          signedIn: prev.signedIn ?? false,
          onboarded: prev.onboarded ?? false,
          email: prev.email ?? USER_EMAIL,
        } as State
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

/** Back to working: a fresh 60–90 s run with progress lines. */
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
