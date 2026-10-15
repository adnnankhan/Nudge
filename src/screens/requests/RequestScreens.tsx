import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, CircleAlert, Fingerprint, Mic, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import r$ from './Requests.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { HoldButton } from '../../components/HoldButton'
import { Chip } from '../../components/Chip'
import { CommandBox, CompactApprovalCard } from '../../components/RequestCard'
import { InlineAlert } from '../../components/InlineAlert'
import { AnswerInput, AnswerOption, AnswerOptions } from '../../components/Answer'
import { ProgressSteps, type ProgressState } from '../../components/Steps'
import { TextArea } from '../../components/TextField'
import { AGENT_NAMES, ICON, type AgentId } from '../../components/icons'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { goesBackAfter, minutesAgo } from '../../data/format'
import { needsYou, position } from '../../data/selectors'
import { runNext, runPosition } from '../../data/reviewRun'
import type { Request } from '../../data/types'
import { useRequestActions } from './useRequestActions'

type Approval = Extract<Request, { kind: 'approval' }>
type Question = Extract<Request, { kind: 'question' }>
type Plan = Extract<Request, { kind: 'plan' }>

const bar = (r: { agent: AgentId; project: string }) => `${AGENT_NAMES[r.agent]} · ${r.project}`

/** Keeps the open request from timing out while it's being read. */
function useViewing(id: string | undefined) {
  const setViewing = useStore((x) => x.setViewing)
  useEffect(() => {
    setViewing(id ?? null)
    return () => setViewing(null)
  }, [id, setViewing])
}

function useBack() {
  const navigate = useNavigate()
  return () => (window.history.length > 1 ? navigate(-1) : navigate('/', { replace: true }))
}

/** /request/:id — approval, question or plan. */
export function RequestScreen() {
  const { id } = useParams()
  const req = useStore((x) => x.requests.find((r) => r.id === id))
  useViewing(req ? id : undefined)
  if (!req) return <Gone />
  if (req.kind === 'approval') return <ApprovalDetail r={req} />
  if (req.kind === 'question') return <AnswerQuestion r={req} />
  return <PlanReview r={req} />
}

/** The request was handled or timed out before it was opened (ApprovalStates alert 4). */
function Gone() {
  const navigate = useNavigate()
  return (
    <Screen>
      <TopBar onBack={() => navigate('/', { replace: true })} />
      <h1 className="sr-only">Nudge</h1>
      <InlineAlert kind="warning" className={s.alertTop} live>
        Too late. This request went back to your computer.
      </InlineAlert>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" variant="secondary" onClick={() => navigate('/', { replace: true })}>
          Back to Home
        </Button>
      </BottomBar>
    </Screen>
  )
}

const RISK_ICON = {
  low: <ShieldCheck size={22} className={s.low} {...ICON} />,
  medium: <CircleAlert size={22} className={s.medium} {...ICON} />,
  high: <TriangleAlert size={22} className={s.high} {...ICON} />,
}

/** ApprovalDetail / ApprovalMedium / ApprovalHighRisk (03-approvals.md). */
function ApprovalDetail({ r }: { r: Approval }) {
  const navigate = useNavigate()
  const back = useBack()
  const [params] = useSearchParams()
  const queue = params.get('queue') // came from ApprovalQueue: go straight to the next one
  const now = useNow()
  const st = useStore()
  const list = needsYou(st, r.computerId)
  const pos = queue ? position(list.filter((x) => x.agent === queue && x.kind === 'approval'), r.id) : (runPosition(r.id) ?? position(list, r.id))
  const actions = useRequestActions()
  const alert = actions.alertFor(r)
  const high = r.risk === 'high'

  const afterApprove = (ok: boolean) => {
    if (!ok) return
    const next = queue ? needsYou(useStore.getState(), r.computerId).find((x) => x.agent === queue && x.kind === 'approval' && x.id !== r.id) : undefined
    if (next) navigate(`/request/${next.id}?queue=${queue}`, { replace: true })
    else navigate(`/request/${r.id}/sent`, { replace: true })
  }

  return (
    <Screen key={r.id}>
      <TopBar title={bar(r)} agent={r.agent} end={pos} onBack={back} />
      <Chip kind={r.risk} className={s.chip} />
      <p className={s.meta}>Needs your approval · {minutesAgo(r, now)}</p>
      <h1 className={s.title2}>{r.title}</h1>

      <h2 className={s.label}>Command</h2>
      <CommandBox>{r.command}</CommandBox>

      {st.settings.aiExplanation ? (
        <>
          <h2 className={s.label}>What this does</h2>
          <p className={s.explain}>
            {RISK_ICON[r.risk]}
            {r.what}
          </p>
        </>
      ) : (
        <InlineAlert kind="info" className={s.alertTop}>
          AI explanation is off. Showing the risk level and command only.
        </InlineAlert>
      )}

      <h2 className={s.label}>Before this</h2>
      <p className={s.body}>{r.before}</p>
      <p className={s.foot}>{goesBackAfter(st.settings.timeoutMin)}</p>
      <div className={s.fill} />

      {alert ? (
        <BottomBar>
          <InlineAlert kind="error" action={alert.action} live>
            {alert.text}
          </InlineAlert>
        </BottomBar>
      ) : (
        <BottomBar layout="two">
          <Button
            size="l"
            variant="secondary"
            onClick={() => {
              actions.deny(r)
              if (!useStore.getState().offline) navigate('/', { replace: true })
            }}
          >
            Deny
          </Button>
          {high ? (
            // High risk is never one tap: hold 1.2 s, then Face ID.
            <HoldButton onComplete={() => actions.approve(r, true).then(afterApprove)} />
          ) : (
            <Button size="l" icon={<Fingerprint size={20} {...ICON} />} onClick={() => actions.approve(r, true).then(afterApprove)}>
              Approve
            </Button>
          )}
        </BottomBar>
      )}
    </Screen>
  )
}

/** ApprovalSent — /request/:id/sent */
export function ApprovalSent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const st = useStore()
  const session = st.sessions.find((x) => x.fromRequest?.id === id)
  const req = session?.fromRequest as Approval | undefined
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setStep(1), 800)
    return () => window.clearTimeout(t)
  }, [])

  if (!req || req.kind !== 'approval') return <Gone />
  const waiting = needsYou(st, req.computerId)
  // Next in the review run ("Next request (2 of 3)"), else the first one still waiting.
  const next = runNext(req.id, waiting.map((x) => x.id)) ?? (waiting[0] ? { id: waiting[0].id, label: `1 of ${waiting.length}` } : null)
  const states: ProgressState[] = step === 0 ? ['done', 'current', 'pending'] : ['done', 'done', 'current']

  return (
    <Screen>
      <TopBar title={bar(req)} agent={req.agent} onBack={() => navigate('/', { replace: true })} />
      <Chip kind="approved" className={s.chip} />
      <h1 className={[s.title2, r$.sentTitle].join(' ')}>{req.title}</h1>
      <CommandBox className={r$.sentCommand}>{req.command}</CommandBox>
      <div className={s.section}>
        <ProgressSteps
          label="Progress"
          steps={[
            { label: 'Sent', state: states[0] },
            { label: 'Reached your computer', state: states[1] },
            { label: 'Running', state: states[2] },
          ]}
        />
      </div>
      <div className={s.fill} />
      <BottomBar layout={next ? 'two' : 'one'}>
        <Button size="l" variant="secondary" onClick={() => navigate('/', { replace: true })}>
          Back to Home
        </Button>
        {next && (
          <Button size="l" onClick={() => navigate(`/request/${next.id}`, { replace: true })}>
            {`Next request (${next.label})`}
          </Button>
        )}
      </BottomBar>
    </Screen>
  )
}

/** ApprovalQueue — /queue/:agent (reached from the lock-screen "3 requests waiting"). */
export function ApprovalQueue() {
  const { agent = 'codex' } = useParams()
  const navigate = useNavigate()
  const back = useBack()
  const st = useStore()
  const list = needsYou(st, 'win').filter((x): x is Approval => x.agent === agent && x.kind === 'approval')
  const first = list[0]
  if (!first) return <Gone />
  return (
    <Screen>
      <TopBar title={bar(first)} agent={first.agent} onBack={back} />
      <h1 className={s.largeTitle}>{`${list.length} ${list.length === 1 ? 'request' : 'requests'} waiting`}</h1>
      <p className={s.lead}>Review them one at a time. The oldest is first.</p>
      <div className={[s.stack, s.section].join(' ')}>
        {list.map((x) => (
          <CompactApprovalCard key={x.id} risk={x.risk} title={x.title} command={x.command} />
        ))}
      </div>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" onClick={() => navigate(`/request/${first.id}?queue=${agent}`)}>
          Review one by one
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** AnswerQuestion (04-questions.md). Options select here; Send answer sends. */
function AnswerQuestion({ r }: { r: Question }) {
  const navigate = useNavigate()
  const back = useBack()
  const now = useNow()
  const st = useStore()
  const pos = runPosition(r.id) ?? position(needsYou(st, r.computerId), r.id)
  const actions = useRequestActions()
  const alert = actions.alertFor(r)
  const [pick, setPick] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [empty, setEmpty] = useState(false)
  const answer = text.trim() || (pick !== null ? r.options[pick] : '')

  const send = () => {
    if (!answer) {
      setEmpty(true)
      return
    }
    actions.answer(r, answer)
    if (!useStore.getState().offline) navigate('/', { replace: true })
  }

  return (
    <Screen>
      <TopBar title={bar(r)} agent={r.agent} end={pos} onBack={back} />
      <p className={[s.meta, s.metaFirst].join(' ')}>Asked you a question · {minutesAgo(r, now)}</p>
      <h1 className={s.title2}>{r.title}</h1>
      {r.why && (
        <>
          <h2 className={s.label}>Why it’s asking</h2>
          <p className={s.body}>{r.why}</p>
        </>
      )}
      <div className={[r$.answers, s.section].join(' ')}>
        <AnswerOptions label={r.title}>
          {r.options.map((o, i) => (
            <AnswerOption
              key={o}
              index={i + 1}
              label={o}
              selected={pick === i}
              onPress={() => {
                setPick(i)
                setEmpty(false)
              }}
            />
          ))}
        </AnswerOptions>
        <AnswerInput
          value={text}
          onChange={(v) => {
            setText(v)
            setEmpty(false)
          }}
          onSend={send}
          onMic={() => navigate(`/request/${r.id}/voice`)}
          error={empty ? 'Type an answer first.' : undefined}
        />
      </div>
      <p className={s.foot}>{goesBackAfter(st.settings.timeoutMin)}</p>
      <div className={s.fill} />
      {alert ? (
        <BottomBar>
          <InlineAlert kind="error" action={alert.action} live>
            {alert.text}
          </InlineAlert>
        </BottomBar>
      ) : (
        <BottomBar layout="two">
          <Button size="l" variant="secondary" onClick={back}>
            Answer later
          </Button>
          {/* Looks disabled until there's an answer; tapping it then explains why (04-questions.md). */}
          <Button size="l" icon={<ArrowRight size={20} {...ICON} />} aria-disabled={!answer || undefined} className={!answer ? r$.softDisabled : undefined} onClick={send}>
            Send answer
          </Button>
        </BottomBar>
      )}
    </Screen>
  )
}

const TRANSCRIPT = 'Use email and password, and add a forgot password link under the form.'

/** VoiceAnswer — /request/:id/voice. Prototype: 2 s "Listening…" wave, then the transcript. */
export function VoiceAnswer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const back = useBack()
  const req = useStore((x) => x.requests.find((q) => q.id === id))
  useViewing(req ? id : undefined)
  const actions = useRequestActions()
  const [listening, setListening] = useState(true)
  const [text, setText] = useState(TRANSCRIPT)
  useEffect(() => {
    if (!listening) return
    const t = window.setTimeout(() => setListening(false), 2000)
    return () => window.clearTimeout(t)
  }, [listening])

  if (!req) return <Gone />
  const alert = actions.alertFor(req)
  const send = () => {
    if (!text.trim()) return
    actions.answer(req, text.trim())
    if (!useStore.getState().offline) navigate('/', { replace: true })
  }

  return (
    <Screen>
      <TopBar title={bar(req)} agent={req.agent} onBack={back} />
      {listening ? (
        <div className={r$.listening} role="status">
          <span className={r$.wave} aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
          <p className={r$.listeningText}>Listening…</p>
        </div>
      ) : (
        <>
          <h1 className={s.largeTitle}>Your answer</h1>
          <p className={s.lead}>Check the text before sending. Fix any wrong words.</p>
          <TextArea label="Transcript" value={text} onChange={(e) => setText(e.target.value)} className={[s.section, r$.transcript].join(' ')} />
        </>
      )}
      <div className={s.fill} />
      {alert ? (
        <BottomBar>
          <InlineAlert kind="error" action={alert.action} live>
            {alert.text}
          </InlineAlert>
        </BottomBar>
      ) : (
        <BottomBar layout="two">
          <Button size="l" variant="secondary" icon={<Mic size={20} {...ICON} />} disabled={listening} onClick={() => setListening(true)}>
            Record again
          </Button>
          <Button size="l" icon={<ArrowRight size={20} {...ICON} />} disabled={listening || !text.trim()} onClick={send}>
            Send
          </Button>
        </BottomBar>
      )}
    </Screen>
  )
}

/** PlanReview (04-questions.md). */
function PlanReview({ r }: { r: Plan }) {
  const navigate = useNavigate()
  const back = useBack()
  const now = useNow()
  const [params] = useSearchParams()
  const actions = useRequestActions()
  const alert = actions.alertFor(r)
  const [full, setFull] = useState(false)
  const [asking, setAsking] = useState(params.get('ask') === '1')
  const [text, setText] = useState('')

  const approve = async () => {
    if (await actions.approve(r)) navigate('/', { replace: true })
  }
  const sendChanges = () => {
    if (!text.trim()) return
    actions.answer(r, text.trim())
    if (!useStore.getState().offline) navigate('/', { replace: true })
  }

  return (
    <Screen>
      <TopBar title={bar(r)} agent={r.agent} onBack={back} />
      <p className={[s.meta, s.metaFirst].join(' ')}>Plan ready for review · {minutesAgo(r, now)}</p>
      <h1 className={s.title2}>{r.title}</h1>
      <h2 className={s.label}>Summary</h2>
      <ul className={r$.summary}>
        {r.summary.map((line) => (
          <li key={line}>
            <Check size={18} {...ICON} />
            {line}
          </li>
        ))}
      </ul>
      {full ? (
        <ol className={r$.steps}>
          {r.steps.map((step, i) => (
            <li key={step}>
              <span className={r$.stepNum}>{i + 1}</span>
              <span>{withFiles(step)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className={s.centerLink}>
          <TextButton aria-expanded={false} onClick={() => setFull(true)}>
            Read full plan
          </TextButton>
        </div>
      )}
      {asking && (
        <div className={s.section}>
          <AnswerInput value={text} onChange={setText} onSend={sendChanges} onMic={() => navigate(`/request/${r.id}/voice`)} />
        </div>
      )}
      <div className={s.fill} />
      {alert ? (
        <BottomBar>
          <InlineAlert kind="error" action={alert.action} live>
            {alert.text}
          </InlineAlert>
        </BottomBar>
      ) : (
        <BottomBar layout="two">
          <Button size="l" variant="secondary" aria-expanded={asking} onClick={() => setAsking(true)}>
            Ask for changes
          </Button>
          <Button size="l" onClick={approve}>
            Approve plan
          </Button>
        </BottomBar>
      )}
    </Screen>
  )
}

/** File names in plan steps are shown in mono. */
function withFiles(text: string) {
  return text.split(/(\b[\w-]+\.tsx?\b)/).map((part, i) => (/\.tsx?$/.test(part) ? <code key={i} className={r$.file}>{part}</code> : part))
}

