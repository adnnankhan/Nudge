import { useState } from 'react'
import { Check, Fingerprint } from 'lucide-react'
import { AgentLogo, AGENT_NAMES, ICON, type AgentId } from './icons'
import { Button } from './Button'
import { Chip, type ChipKind } from './Chip'
import { AnswerInput, AnswerOption, AnswerOptions } from './Answer'
import { InlineAlert, type AlertKind } from './InlineAlert'
import s from './RequestCard.module.css'

export type Risk = 'low' | 'medium' | 'high'

/** Meta row: agent logo · name · project (mono) · time (mono, right). */
export function MetaRow({ agent, project, time }: { agent: AgentId; project: string; time?: string }) {
  return (
    <span className={s.meta}>
      <AgentLogo agent={agent} size={18} />
      <span className={s.agent}>{AGENT_NAMES[agent]}</span>
      <span className={s.project}>{project}</span>
      {time && <span className={s.time}>{time}</span>}
    </span>
  )
}

/** Command box (mono). */
export function CommandBox({ children, className }: { children: string; className?: string }) {
  return <code className={[s.command, className].filter(Boolean).join(' ')}>{children}</code>
}

export const goesBack = (min: number) => `Goes back to your computer after ${min} min`

type ApprovalProps = {
  agent: AgentId
  project: string
  time: string
  risk: Risk
  title: string
  command: string
  timeoutMin: number
  /** Tapping the card body opens its task thread. */
  onOpen: () => void
  /** High risk: Review opens the request (Hold to approve). Defaults to onOpen. */
  onReview?: () => void
  onApprove: () => void
  onDeny: () => void
  /** Shown in place of the buttons when something went wrong (e.g. "Not sent"). */
  alert?: { kind: AlertKind; text: string; action?: { label: string; onPress: () => void } }
}

/**
 * Approval card: meta → chip → title → command → Deny / Approve → footnote.
 * High risk shows Review (no fingerprint) — it is never approved from the card.
 */
export function ApprovalCard(p: ApprovalProps) {
  const high = p.risk === 'high'
  return (
    <article className={s.card} aria-label={`${AGENT_NAMES[p.agent]}, ${p.project}: ${p.title}`}>
      <MetaRow agent={p.agent} project={p.project} time={p.time} />
      <Chip kind={p.risk} className={s.chip} />
      <h3 className={s.title}>
        <button type="button" className={s.open} onClick={p.onOpen} data-stretched>
          {p.title}
        </button>
      </h3>
      <CommandBox>{p.command}</CommandBox>
      {p.alert ? (
        <InlineAlert kind={p.alert.kind} action={p.alert.action} live className={[s.alert, s.above].join(' ')}>
          {p.alert.text}
        </InlineAlert>
      ) : (
        <div className={[s.actions, s.above].join(' ')}>
          <Button variant="secondary" onClick={p.onDeny}>
            Deny
          </Button>
          {high ? (
            <Button onClick={p.onReview ?? p.onOpen}>Review</Button>
          ) : (
            <Button onClick={p.onApprove} icon={<Fingerprint size={18} {...ICON} />}>
              Approve
            </Button>
          )}
        </div>
      )}
      <p className={s.foot}>{goesBack(p.timeoutMin)}</p>
    </article>
  )
}

type QuestionProps = {
  agent: AgentId
  project: string
  time: string
  question: string
  options: string[]
  timeoutMin: number
  onOpen: () => void
  /** Tapping an option sends it at once. */
  onAnswer: (answer: string) => void
  /** Index of an option that was just sent (short "Sent" tick). */
  sentIndex?: number
  /** Shown in place of the options when something went wrong (e.g. "Not sent"). */
  alert?: ApprovalProps['alert']
}

/** Question card: meta → question → options (tap sends) → answer input → footnote. */
export function QuestionCard(p: QuestionProps) {
  const [text, setText] = useState('')
  return (
    <article className={s.card} aria-label={`${AGENT_NAMES[p.agent]}, ${p.project}: ${p.question}`}>
      <MetaRow agent={p.agent} project={p.project} time={p.time} />
      <h3 className={s.title}>
        <button type="button" className={s.open} onClick={p.onOpen} data-stretched>
          {p.question}
        </button>
      </h3>
      {p.alert ? (
        <InlineAlert kind={p.alert.kind} action={p.alert.action} live className={[s.alert, s.above].join(' ')}>
          {p.alert.text}
        </InlineAlert>
      ) : (
      <div className={[s.answers, s.above].join(' ')}>
        <AnswerOptions label={p.question} mode="send">
          {p.options.map((o, i) => (
            <AnswerOption
              key={o}
              index={i + 1}
              label={o}
              mode="send"
              sent={p.sentIndex === i}
              disabled={p.sentIndex !== undefined}
              onPress={() => p.onAnswer(o)}
            />
          ))}
        </AnswerOptions>
        <AnswerInput value={text} onChange={setText} onSend={() => text.trim() && p.onAnswer(text.trim())} />
      </div>
      )}
      <p className={s.foot}>{goesBack(p.timeoutMin)}</p>
    </article>
  )
}

type PlanProps = {
  agent: AgentId
  project: string
  time: string
  title: string
  summary: string[]
  timeoutMin: number
  onOpen: () => void
  onApprove: () => void
  /** "Ask for changes" opens the plan with the answer field ready. */
  onAskChanges: () => void
  alert?: ApprovalProps['alert']
}

/** Plan card: meta → title → summary with ticks → Ask for changes / Approve plan → footnote. */
export function PlanCard(p: PlanProps) {
  return (
    <article className={s.card} aria-label={`${AGENT_NAMES[p.agent]}, ${p.project}: ${p.title}`}>
      <MetaRow agent={p.agent} project={p.project} time={p.time} />
      <h3 className={[s.title, s.planTitle].join(' ')}>
        <button type="button" className={s.open} onClick={p.onOpen} data-stretched>
          {p.title}
        </button>
      </h3>
      <ul className={s.summary}>
        {p.summary.map((line) => (
          <li key={line}>
            <Check size={16} {...ICON} />
            {line}
          </li>
        ))}
      </ul>
      {p.alert ? (
        <InlineAlert kind={p.alert.kind} action={p.alert.action} live className={[s.alert, s.above].join(' ')}>
          {p.alert.text}
        </InlineAlert>
      ) : (
        <div className={[s.actions, s.above].join(' ')}>
          <Button variant="secondary" onClick={p.onAskChanges}>
            Ask for changes
          </Button>
          <Button onClick={p.onApprove}>Approve plan</Button>
        </div>
      )}
      <p className={s.foot}>{goesBack(p.timeoutMin)}</p>
    </article>
  )
}

/** Compact approval card (ApprovalQueue): chip → title → command. */
export function CompactApprovalCard({ risk, title, command }: { risk: Risk; title: string; command: string }) {
  return (
    <article className={[s.card, s.compact].join(' ')}>
      <Chip kind={risk} className={s.chip} />
      <h3 className={s.title}>{title}</h3>
      <CommandBox>{command}</CommandBox>
    </article>
  )
}

export type SessionStatus = 'working' | 'paused' | 'done' | 'failed' | 'stopped'

type SessionProps = {
  agent: AgentId
  project: string
  /** Elapsed ("4m") or finish time ("10:42"), mono. */
  time: string
  status: SessionStatus
  /** One-line status text ("Editing login.js"). */
  text: string
  onPress: () => void
}

/** Session row: meta row + chip (status word) + one-line status text (decision 6). */
export function SessionRow({ agent, project, time, status, text, onPress }: SessionProps) {
  return (
    <button type="button" className={[s.card, s.session].join(' ')} onClick={onPress}>
      <MetaRow agent={agent} project={project} time={time} />
      <span className={s.status}>
        <Chip kind={status as ChipKind} />
        <span className={s.statusText}>{text}</span>
      </span>
    </button>
  )
}
