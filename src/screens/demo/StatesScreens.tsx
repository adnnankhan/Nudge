import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import d from './Demo.module.css'
import { TopBar } from '../../components/Bars'
import { InlineAlert, type AlertKind } from '../../components/InlineAlert'

type Item = { kind: AlertKind; text: string; action?: string }

// 03-approvals.md → ApprovalStates, in this order.
const APPROVAL: Item[] = [
  { kind: 'error', text: 'Not sent: no internet connection. Nothing was sent.', action: 'Retry' },
  { kind: 'error', text: 'Didn’t reach your computer. Your answer was sent but not received.', action: 'Retry' },
  { kind: 'info', text: 'Answered on your computer. This request was handled there.' },
  { kind: 'warning', text: 'Too late. This request went back to your computer.', action: 'Message agent' },
  { kind: 'warning', text: 'Face ID didn’t match. Use your phone passcode instead.', action: 'Use passcode' },
  { kind: 'info', text: 'AI explanation is off. Showing the risk level and command only.' },
  { kind: 'error', text: 'Type an answer first.' },
]

// 06-new-task.md → NewTaskStates.
const NEW_TASK: Item[] = [
  { kind: 'error', text: 'Windows PC is offline. Start a task when it’s back online.' },
  { kind: 'info', text: 'Cursor can’t start tasks from the phone. Start Cursor tasks in the Cursor editor.' },
  { kind: 'warning', text: 'No project found. Check the name, or open the project once on your computer.' },
]

function StatesList({ title, lead, items }: { title: string; lead: string; items: Item[] }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState<number | null>(null)
  // A catalogue of states: actions show they were tapped (brief spinner) and the state stays on screen.
  const press = (i: number) => {
    setBusy(i)
    window.setTimeout(() => setBusy(null), 900)
  }
  return (
    <Screen>
      <TopBar onBack={() => navigate(-1)} />
      <h1 className={s.largeTitle}>{title}</h1>
      <p className={s.lead}>{lead}</p>
      <div className={d.alerts}>
        {items.map((it, i) => (
          <InlineAlert key={it.text} kind={it.kind} action={it.action ? { label: it.action, onPress: () => press(i), busy: busy === i } : undefined}>
            {it.text}
          </InlineAlert>
        ))}
      </div>
    </Screen>
  )
}

/** ApprovalStates — /demo/states */
export function ApprovalStates() {
  return <StatesList title="Approval and answer states" lead="Messages shown in place of the buttons when something goes wrong." items={APPROVAL} />
}

/** NewTaskStates — /demo/new-task-states */
export function NewTaskStates() {
  return <StatesList title="When a task can’t start" lead="What you see instead of Start." items={NEW_TASK} />
}
