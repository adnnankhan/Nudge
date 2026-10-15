import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen } from '../Screen'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button } from '../../components/Button'
import {
  AgentText,
  AnsweredLine,
  ChatTopBar,
  Choices,
  Composer,
  ComposerInfo,
  PermissionCard,
  PlanInChat,
  StatusLine,
  Suggestions,
  ToolLine,
  Typing,
  UserBubble,
} from '../../components/Chat'
import { AGENT_NAMES } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { ASK_ME } from '../../data/library'
import { backToPc } from '../../data/tasks'
import type { Request, Session, ThreadItem } from '../../data/types'
import { useBack } from '../requests/RequestScreens'
import { useRequestActions } from '../requests/useRequestActions'
import { TaskMenu, type TaskSheet } from './TaskMenu'
import s from '../Screen.module.css'
import t$ from './Task.module.css'

const FINISHED = ['done', 'failed', 'stopped', 'denied', 'expired']

/** The risk sentence under a high-risk card: the last sentence of "What this does". */
const riskLine = (what: string) => what.split(/(?<=\.)\s+/).pop() ?? what

/** Task chat — /task/:id (09-chat-and-tasks.md; refs Chat-approval, Chat-after-approve, Chat-question, Chat-high-risk). */
export function TaskChat() {
  const { id } = useParams()
  const x = useStore((st) => st.sessions.find((t) => t.id === id))
  const navigate = useNavigate()
  if (!x)
    return (
      <Screen>
        <TopBar onBack={() => navigate('/', { replace: true })} />
        <h1 className="sr-only">Nudge</h1>
        <div className={s.fill} />
        <BottomBar>
          <Button size="l" variant="secondary" onClick={() => navigate('/', { replace: true })}>
            Back to Home
          </Button>
        </BottomBar>
      </Screen>
    )
  return <Thread key={x.id} x={x} />
}

function Thread({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const toast = useToast()
  const now = useNow()
  const st = useStore()
  const actions = useRequestActions()
  const [sheet, setSheet] = useState<TaskSheet>(null)
  const [draft, setDraft] = useState('')
  const [sentIndex, setSentIndex] = useState<Record<string, number>>({})
  const scroller = useRef<HTMLDivElement>(null)

  const computer = st.computers.find((c) => c.id === x.computerId)?.name ?? ''
  const agent = AGENT_NAMES[x.agent]
  const live = (r: Request) => st.requests.find((q) => q.id === r.id)
  const pending = x.thread.flatMap((i) => (i.type === 'request' && i.state === 'pending' && live(i.req) ? [i.req] : []))
  const question = pending.find((r) => r.kind === 'question')
  const working = x.status === 'working' && pending.length === 0
  const firstUser = x.thread.findIndex((i) => i.type === 'user')

  // Opens scrolled to the bottom; new items keep it there unless you scrolled up to read.
  const atBottom = useRef(true)
  useLayoutEffect(() => {
    const el = scroller.current
    if (el && atBottom.current) el.scrollTop = el.scrollHeight
  }, [x.thread.length, working])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    atBottom.current = true
    // While a question waits, what you type is your answer to it.
    if (question) actions.answer(question, text)
    else st.sendMessage(x.id, text)
  }

  const item = (i: ThreadItem, index: number) => {
    switch (i.type) {
      case 'user':
        return <UserBubble key={i.id} text={i.text} note={index === firstUser ? ASK_ME[x.askMe].title : undefined} />
      case 'agent': {
        const last = index === x.thread.length - 1
        return (
          <div key={i.id} className={t$.turn}>
            <AgentText agent={x.agent}>{i.text}</AgentText>
            {last && i.suggestions && (
              <Suggestions options={i.suggestions} onPick={(o, n) => st.sendMessage(x.id, o, n === 0)} />
            )}
          </div>
        )
      }
      case 'tools':
        return <ToolLine key={i.id} summary={i.summary} steps={i.steps} />
      case 'status':
        return <StatusLine key={i.id} icon={i.icon} text={i.text} />
      case 'request':
        return <Fragment key={i.id}>{requestItem(i)}</Fragment>
    }
  }

  function requestItem(i: Extract<ThreadItem, { type: 'request' }>) {
    const r = live(i.req) ?? i.req
    const open = i.state === 'pending' && !!live(i.req)
    const back = backToPc(r, st.settings.timeoutMin, now)
    if (r.kind === 'approval') {
      if (!open) {
        const word = i.state === 'approved' ? 'You approved' : i.state === 'denied' ? 'You denied' : 'Went back to your computer'
        return <AnsweredLine ok={i.state === 'approved'} text={`${word} · ${r.command}`} />
      }
      return (
        <PermissionCard
          agent={x.agent}
          risk={r.risk}
          title={r.title}
          command={r.command}
          back={back}
          warning={riskLine(r.what)}
          alert={actions.alertFor(r)}
          onDeny={() => actions.deny(r)}
          onApprove={() => actions.approve(r, true)}
        />
      )
    }
    if (r.kind === 'plan') {
      if (!open) return <AnsweredLine ok={i.state !== 'expired'} text={i.state === 'expired' ? `Went back to your computer · ${r.title}` : `You approved the plan · ${r.title}`} />
      return (
        <PlanInChat
          agent={x.agent}
          title={r.title}
          summary={r.summary}
          back={back}
          alert={actions.alertFor(r)}
          onRead={() => navigate(`/request/${r.id}`)}
          onAskChanges={() => navigate(`/request/${r.id}?ask=1`)}
          onApprove={() => actions.approve(r, true)}
        />
      )
    }
    // Question: the agent's words, then the answers as numbered choices (tap = send).
    return (
      <div className={t$.turn}>
        <AgentText agent={x.agent}>{r.title}</AgentText>
        {open ? (
          <Choices
            label={r.title}
            options={r.options}
            note={`Or type your own answer below · ${back}`}
            sentIndex={sentIndex[r.id]}
            alert={actions.alertFor(r)}
            onPick={(o) => {
              if (!useStore.getState().offline) setSentIndex((m) => ({ ...m, [r.id]: r.options.indexOf(o) }))
              window.setTimeout(() => actions.answer(r, o), useStore.getState().offline ? 0 : 400)
            }}
          />
        ) : (
          i.state === 'expired' && <AnsweredLine ok={false} text="Went back to your computer" />
        )}
      </div>
    )
  }

  const placeholder = FINISHED.includes(x.status) ? 'Ask a follow-up…' : `Reply to ${agent}…`

  return (
    <>
      <Screen
        ref={scroller}
        className={t$.chat}
        onScroll={(e) => {
          const el = e.currentTarget
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        }}
      >
        <ChatTopBar
          agent={x.agent}
          sub={`${x.project} · ${computer}`}
          agentLabel={`${agent}, ${x.project} · ${computer}. Task menu`}
          onBack={back}
          onAgent={() => setSheet('menu')}
          onMore={() => setSheet('menu')}
        />
        <h1 className="sr-only">{x.taskTitle}</h1>
        <div className={t$.messages}>
          {x.thread.map(item)}
          {working && <Typing agent={x.agent} />}
        </div>
        <div className={s.fill} />
        {x.origin === 'cursor' ? (
          <ComposerInfo>Cursor runs in its editor. You can approve its requests here.</ComposerInfo>
        ) : (
          <Composer
            placeholder={placeholder}
            value={draft}
            onChange={setDraft}
            onSend={send}
            onPlus={() => toast({ text: 'Adding files isn’t in the prototype' })}
          />
        )}
      </Screen>
      <TaskMenu x={x} sheet={sheet} setSheet={setSheet} />
    </>
  )
}
