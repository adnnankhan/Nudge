import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Undo2 } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import x$ from './Session.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { InlineAlert } from '../../components/InlineAlert'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { AnswerInput } from '../../components/Answer'
import { ICON } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { useStore } from '../../data/store'
import type { Session } from '../../data/types'
import { bar, useBack } from '../requests/RequestScreens'

/*
 * 05-session-control.md: the Session screens are now the task thread (/task/:id) and its ⋯ menu.
 * Stopped and UndoFurther stay as written; old /session/:id links open the thread.
 */

const useSession = () => {
  const { id } = useParams()
  return useStore((st) => st.sessions.find((x) => x.id === id))
}

/** /session/:id → the task thread (a session is a task). */
export function SessionRedirect() {
  const { id } = useParams()
  return <Navigate to={`/task/${id}`} replace />
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

/** Stopped — /session/:id/stopped. Every choice returns to the thread. */
function Stopped({ x }: { x: Session }) {
  const back = useBack()
  const navigate = useNavigate()
  const toast = useToast()
  const st = useStore()
  const [redirect, setRedirect] = useState(false)
  const [text, setText] = useState('')
  const [empty, setEmpty] = useState(false)
  const toThread = () => navigate(`/task/${x.id}`, { replace: true })

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
            toThread()
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
            toThread()
          }}
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

/** /session/:id/stopped — once it's running again (Continue, Redirect), this opens the thread. */
export function StoppedRoute() {
  const x = useSession()
  const navigate = useNavigate()
  if (!x) return <Missing onHome={() => navigate('/', { replace: true })} />
  return x.status === 'stopped' ? <Stopped x={x} /> : <Navigate to={`/task/${x.id}`} replace />
}
