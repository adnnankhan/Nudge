import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, File, Info, Square, TriangleAlert, Undo2 } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import x$ from './Session.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { CommandBox } from '../../components/RequestCard'
import { InlineAlert } from '../../components/InlineAlert'
import { ListGroup, ListRow } from '../../components/List'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { AnswerInput } from '../../components/Answer'
import { AGENT_NAMES, ICON } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { MODELS } from '../../data/library'
import type { Session } from '../../data/types'
import { bar, useBack, VoiceScreen } from '../requests/RequestScreens'

const H = 3_600_000
const MIN = 60_000

const useSession = () => {
  const { id } = useParams()
  return useStore((st) => st.sessions.find((x) => x.id === id))
}

/** "Finished 10 min ago" */
function finishedAgo(x: Session, now: number) {
  const m = Math.max(0, Math.floor((now - (x.finishedAt ?? now)) / MIN))
  return m < 60 ? `Finished ${m} min ago` : `Finished ${Math.floor(m / 60)} h ago`
}

/** "Clears from Home in 3 h." — completed sessions clear after 24 hours. */
function clearsIn(x: Session, now: number) {
  const h = Math.max(1, Math.ceil(((x.finishedAt ?? now) + 24 * H - now) / H))
  return `Clears from Home in ${h} h.`
}

/** /session/:id — shows the screen for the session's state. */
export function SessionScreen() {
  const x = useSession()
  const navigate = useNavigate()
  if (!x) return <Missing onHome={() => navigate('/', { replace: true })} />
  if (x.status === 'working' || x.status === 'paused') return <SessionDetail x={x} />
  if (x.status === 'stopped') return <Stopped x={x} />
  if (x.status === 'done') return <SessionDone x={x} />
  if (x.status === 'failed') return <SessionFailed x={x} />
  return <Closed x={x} />
}

/** A session that has cleared (e.g. after Reset demo) — nothing to show, so offer the way back. */
function Missing({ onHome }: { onHome: () => void }) {
  return (
    <Screen>
      <TopBar onBack={onHome} />
      <h1 className="sr-only">Nudge</h1>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" variant="secondary" onClick={onHome}>
          Back to Home
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** Session (working) · started in terminal · Cursor (NotSupported) — 05-session-control.md */
function SessionDetail({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const st = useStore()
  const [sheet, setSheet] = useState<null | 'model' | 'intensity' | 'stop' | 'takeover' | 'cursor'>(null)
  const cursor = x.origin === 'cursor'
  const terminal = x.origin === 'terminal'
  const close = () => setSheet(null)
  const title = x.text.endsWith('…') ? x.text : `${x.text}…`
  const recent = x.recent.slice(-3)

  // Changing model or intensity on a terminal session moves control to the phone first (info alert).
  const pick = (fn: () => void) => {
    if (terminal) st.takeOver(x.id)
    fn()
    window.setTimeout(close, 180)
  }

  return (
    <Screen>
      <TopBar title={bar(x)} agent={x.agent} onBack={back} />
      <div className={x$.chipRow}>
        <Chip kind={x.status === 'paused' ? 'paused' : 'working'} />
        {terminal && <span className={x$.chipNote}>Started in terminal</span>}
        {cursor && <span className={x$.chipNote}>Running in Cursor</span>}
      </div>
      <h1 className={x$.title}>{title}</h1>

      <div className={x$.groups}>
        {!cursor && recent.length > 0 && (
          <ListGroup header="Recent">
            {recent.map((line, i) => (
              <ListRow key={`${i}-${line}`} title={line} leading={<File size={20} {...ICON} />} />
            ))}
          </ListGroup>
        )}
        <ListGroup header="Settings">
          {cursor ? (
            <>
              <ListRow title="Model" value="Set in Cursor" />
              <ListRow title="Intensity" value="Set in Cursor" />
            </>
          ) : (
            <>
              <ListRow title="Model" value={MODELS[x.model]} onPress={() => setSheet('model')} />
              <ListRow title="Intensity" value={x.intensity} onPress={() => setSheet('intensity')} />
            </>
          )}
        </ListGroup>
        {terminal && (
          <InlineAlert kind="info">
            This session runs in your terminal. Stopping it, undoing or changing the model moves control to your phone first.
          </InlineAlert>
        )}
      </div>

      <div className={s.fill} />
      <BottomBar>
        <Button size="l" variant="secondary" icon={<Square size={18} {...ICON} />} onClick={() => setSheet(cursor ? 'cursor' : terminal ? 'takeover' : 'stop')}>
          Stop
        </Button>
      </BottomBar>

      <Sheet open={sheet === 'model'} onClose={close} title="Model" description="Applies from the agent’s next step.">
        <OptionGroup label="Model">
          <OptionRow title="Default" description="Set on your computer" selected={x.model === 0} onSelect={() => pick(() => st.setModel(x.id, 0))} />
          <OptionRow title="[Model name]" description="[Short description]" selected={x.model === 1} onSelect={() => pick(() => st.setModel(x.id, 1))} />
          <OptionRow title="[Model name]" description="[Short description]" selected={x.model === 2} onSelect={() => pick(() => st.setModel(x.id, 2))} />
        </OptionGroup>
      </Sheet>

      <Sheet open={sheet === 'intensity'} onClose={close} title="Intensity" description="How much the agent thinks before acting.">
        <OptionGroup label="Intensity">
          {(
            [
              ['Low', 'Faster, uses less'],
              ['Medium', 'Balanced'],
              ['High', 'Slower, more careful'],
            ] as const
          ).map(([v, d]) => (
            <OptionRow key={v} title={v} description={d} selected={x.intensity === v} onSelect={() => pick(() => st.setIntensity(x.id, v))} />
          ))}
        </OptionGroup>
      </Sheet>

      <Sheet
        open={sheet === 'stop'}
        onClose={close}
        title="Stop this session?"
        body="5 files were already changed. They’ll stay changed until you undo them."
        actions={
          <>
            <Button
              size="l"
              block
              onClick={() => {
                st.stopSession(x.id)
                close()
                navigate(`/session/${x.id}/stopped`, { replace: true })
              }}
            >
              Stop session
            </Button>
            <Button size="l" block variant="secondary" onClick={close}>
              Keep going
            </Button>
          </>
        }
      />

      <Sheet
        open={sheet === 'takeover'}
        onClose={close}
        title="Stop this session?"
        body="It stops in your terminal and continues from your phone, in the same conversation."
        actions={
          <>
            <Button
              size="l"
              block
              onClick={() => {
                st.stopSession(x.id)
                close()
                navigate(`/session/${x.id}/stopped`, { replace: true })
              }}
            >
              Stop
            </Button>
            <Button size="l" block variant="secondary" onClick={close}>
              Cancel
            </Button>
          </>
        }
      />

      <Sheet
        open={sheet === 'cursor'}
        onClose={close}
        icon={<Info size={24} {...ICON} />}
        title="Can’t stop Cursor from the phone"
        body="Cursor runs inside its own editor, so it can only be stopped there. You can still approve its requests here."
        actions={
          <Button size="l" block onClick={close}>
            OK
          </Button>
        }
      />
    </Screen>
  )
}

/** Stopped — /session/:id/stopped */
function Stopped({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const toast = useToast()
  const st = useStore()
  const [redirect, setRedirect] = useState(false)
  const [text, setText] = useState('')
  const [empty, setEmpty] = useState(false)

  return (
    <Screen>
      <TopBar title={bar(x)} agent={x.agent} onBack={back} />
      <Chip kind="stopped" className={s.chip} />
      <h1 className={x$.bigTitle}>What next?</h1>
      <div className={x$.options}>
        <OptionRow
          kind="action"
          title="Continue"
          description="Pick up where it left off."
          onSelect={() => {
            st.continueSession(x.id)
            navigate(`/session/${x.id}`, { replace: true })
          }}
        />
        <OptionRow kind="action" title="Redirect" description="Give a new instruction." onSelect={() => setRedirect(true)} />
        <OptionRow
          kind="action"
          title="Undo file changes from the last step"
          description="Restores files only. Commands it ran, like installing or deleting, can’t be undone."
          onSelect={() => toast({ text: 'Files restored', success: true })}
        />
      </div>
      <div className={x$.further}>
        <TextButton onClick={() => navigate(`/session/${x.id}/undo`)}>Go back further</TextButton>
      </div>

      <Sheet open={redirect} onClose={() => setRedirect(false)} title="Redirect" description="Give a new instruction.">
        <AnswerInput
          value={text}
          placeholder="Tell the agent what to do next"
          error={empty ? 'Type an answer first.' : undefined}
          onChange={(v) => {
            setText(v)
            setEmpty(false)
          }}
          onSend={() => {
            if (!text.trim()) return setEmpty(true)
            st.redirectSession(x.id, text.trim())
            setRedirect(false)
            navigate(`/session/${x.id}`, { replace: true })
          }}
          onMic={() => navigate(`/session/${x.id}/voice`)}
        />
      </Sheet>
    </Screen>
  )
}

/** UndoFurther — /session/:id/undo */
export function UndoFurther() {
  const x = useSession()
  const navigate = useNavigate()
  const back = useBack()
  const toast = useToast()
  const [point, setPoint] = useState(0)
  if (!x) return <Missing onHome={() => navigate('/', { replace: true })} />
  const points = [
    ['Before: update 4 files', 'Last step'],
    ['Before: create LoginForm.tsx', '2 steps back'],
    ['Before this session started', 'All changes undone'],
  ] as const
  return (
    <Screen>
      <TopBar title="Go back further" onBack={back} />
      <h1 className={s.largeTitle}>Choose a point</h1>
      <p className={s.lead}>Files go back to how they were then.</p>
      <InlineAlert kind="info" className={s.alertTop}>
        Restores files only. Commands it ran can’t be undone. The conversation stays as it is.
      </InlineAlert>
      <div className={x$.options}>
        <OptionGroup label="Choose a point">
          {points.map(([t, d], i) => (
            <OptionRow key={t} title={t} description={d} selected={point === i} onSelect={() => setPoint(i)} />
          ))}
        </OptionGroup>
      </div>
      <div className={s.fill} />
      <BottomBar>
        <Button
          size="l"
          icon={<Undo2 size={20} {...ICON} />}
          onClick={() => {
            toast({ text: 'Files restored', success: true })
            navigate(-1)
          }}
        >
          Restore files to this point
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** SessionDone (02-home.md) */
function SessionDone({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const now = useNow()
  const did = x.summary
  const lines = x.recent.slice(-3)
  return (
    <Screen>
      <TopBar title={bar(x)} agent={x.agent} onBack={back} />
      <Chip kind="done" className={s.chip} />
      <h1 className={x$.title}>{x.title ?? x.doneText ?? x.text}</h1>
      <p className={s.meta}>{finishedAgo(x, now)}</p>
      {(did || lines.length > 0) && (
        <>
          <h2 className={s.label}>What it did</h2>
          {did ? <p className={s.body}>{did}</p> : <p className={s.body}>{lines.join(' · ')}</p>}
        </>
      )}
      {x.files && (
        <div className={s.section}>
          <ListGroup header="Files changed">
            {x.files.map((f) => (
              <ListRow key={f} title={f} monoTitle leading={<File size={20} {...ICON} />} />
            ))}
          </ListGroup>
        </div>
      )}
      <p className={s.foot}>{clearsIn(x, now)}</p>
      <div className={s.fill} />
      <BottomBar>
        {/* Cursor can't start tasks from the phone, so a Cursor follow-up starts with Claude Code. */}
        <Button size="l" onClick={() => navigate('/new', { state: { followUp: { agent: x.agent, project: x.project } } })}>
          Start a follow-up task
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** SessionFailed (02-home.md) */
function SessionFailed({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const toast = useToast()
  const now = useNow()
  const st = useStore()
  const [text, setText] = useState('')
  const [empty, setEmpty] = useState(false)
  const send = (t = text.trim()) => {
    if (!t) return setEmpty(true)
    st.sendToSession(x.id, t)
    toast({ text: `Sent to ${AGENT_NAMES[x.agent]}`, success: true })
    navigate(`/session/${x.id}`, { replace: true })
  }
  return (
    <Screen>
      <TopBar title={bar(x)} agent={x.agent} onBack={back} />
      <Chip kind="failed" className={s.chip} />
      <h1 className={x$.title}>{x.title ?? 'Stopped: tests didn’t pass'}</h1>
      <h2 className={s.label}>Why it stopped</h2>
      <p className={s.explain}>
        <TriangleAlert size={22} className={s.high} {...ICON} />
        {x.why ?? x.text}
      </p>
      {x.before && (
        <>
          <h2 className={s.label}>What it did before</h2>
          <p className={s.body}>{x.before}</p>
        </>
      )}
      <div className={s.section}>
        <AnswerInput
          value={text}
          placeholder="Tell the agent what to do next"
          error={empty ? 'Type an answer first.' : undefined}
          onChange={(v) => {
            setText(v)
            setEmpty(false)
          }}
          onSend={() => send()}
          onMic={() => navigate(`/session/${x.id}/voice`)}
        />
      </div>
      <p className={s.foot}>{clearsIn(x, now)}</p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" icon={<ArrowRight size={20} {...ICON} />} onClick={() => send()}>
          Send to agent
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** Completed rows that never ran: Denied, or went back to the computer. */
function Closed({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const now = useNow()
  const r = x.fromRequest
  return (
    <Screen>
      <TopBar title={bar(x)} agent={x.agent} onBack={back} />
      <Chip kind="stopped" className={s.chip} />
      <p className={s.meta}>{x.status === 'denied' ? 'Denied' : 'Went back to your computer'}</p>
      <h1 className={s.title2}>{r?.title ?? x.text}</h1>
      {r?.kind === 'approval' && (
        <>
          <h2 className={s.label}>Command</h2>
          <CommandBox>{r.command}</CommandBox>
        </>
      )}
      <p className={s.foot}>{clearsIn(x, now)}</p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" variant="secondary" onClick={() => navigate('/', { replace: true })}>
          Back to Home
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** /session/:id/stopped */
export function StoppedRoute() {
  const x = useSession()
  const navigate = useNavigate()
  if (!x) return <Missing onHome={() => navigate('/', { replace: true })} />
  return x.status === 'stopped' ? <Stopped x={x} /> : <SessionScreen />
}

/** /session/:id/voice — tell a failed or stopped session what to do next, by voice. */
export function SessionVoice() {
  const x = useSession()
  const navigate = useNavigate()
  const back = useBack()
  const toast = useToast()
  const st = useStore()
  if (!x) return <Missing onHome={() => navigate('/', { replace: true })} />
  return (
    <VoiceScreen
      title={bar(x)}
      agent={x.agent}
      onBack={back}
      onSend={(text) => {
        if (x.status === 'stopped') st.redirectSession(x.id, text)
        else st.sendToSession(x.id, text)
        toast({ text: `Sent to ${AGENT_NAMES[x.agent]}`, success: true })
        navigate(`/session/${x.id}`, { replace: true })
      }}
    />
  )
}
