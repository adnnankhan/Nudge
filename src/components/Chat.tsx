import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, File, Fingerprint, Info, Mic, MoreHorizontal, Pause, Plus, ShieldCheck, Square, TriangleAlert, Wrench, X } from 'lucide-react'
import { Button, IconButton } from './Button'
import { HoldButton } from './HoldButton'
import { Chip } from './Chip'
import { CommandBox } from './RequestCard'
import { AnswerOption, AnswerOptions } from './Answer'
import { InlineAlert, type AlertKind } from './InlineAlert'
import { AgentLogo, AGENT_NAMES, ICON, type AgentId } from './icons'
import { Listening, useVoice } from './voice'
import s from './Chat.module.css'

/*
 * Chat pieces for the task thread and the new task chat (09-chat-and-tasks.md). The patterns are the
 * ones people know from the Claude and ChatGPT apps: your words in a right bubble, the agent's as
 * plain text, tool activity on one collapsible line, a rounded composer at the bottom.
 */

/* ---------- Top bar ---------- */

type TopProps = { agent: AgentId; sub: string; onBack: () => void; onAgent: () => void; onMore: () => void; agentLabel: string }

/** back · logo + agent name + chevron, "project · computer" under it · ••• */
export function ChatTopBar({ agent, sub, onBack, onAgent, onMore, agentLabel }: TopProps) {
  return (
    <div className={s.top}>
      <IconButton plain label="Back" onClick={onBack} className={s.back}>
        <ChevronLeft size={28} {...ICON} />
      </IconButton>
      <button type="button" className={s.who} onClick={onAgent} aria-label={agentLabel}>
        <span className={s.whoLine}>
          <AgentLogo agent={agent} size={18} />
          <span className={s.whoName}>{AGENT_NAMES[agent]}</span>
          <ChevronDown size={16} className={s.whoChevron} {...ICON} />
        </span>
        <span className={s.whoSub}>{sub}</span>
      </button>
      <IconButton plain label="Task menu" onClick={onMore} className={s.more}>
        <MoreHorizontal size={24} {...ICON} strokeWidth={2.5} />
      </IconButton>
    </div>
  )
}

/* ---------- Messages ---------- */

/** Your message: right bubble, max 80%. The Ask-me line shows only under your first message. */
export function UserBubble({ text, note }: { text: string; note?: string }) {
  return (
    <div className={s.mine}>
      <p className={s.bubble}>{text}</p>
      {note && <p className={s.note}>{note}</p>}
    </div>
  )
}

/** Agent turn: logo on its own line, then plain full-width text (no bubble, no name). */
export function AgentText({ agent, children, logo = true }: { agent: AgentId; children: ReactNode; logo?: boolean }) {
  return (
    <div className={s.agent}>
      {logo && <AgentLogo agent={agent} size={20} className={s.agentLogo} />}
      <div className={s.agentText}>{children}</div>
    </div>
  )
}

/** "Read 5 files, edited 3": the steps joined into one line when the agent didn't sum them up. */
export function toolSummary(steps: string[]) {
  const [first, ...rest] = steps
  if (!rest.length) return first
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
  return rest.length === 1 ? `${first}, ${lower(rest[0])}` : `${first}, ${lower(rest[0])} and ${rest.length - 1} more`
}

/** Tool activity: one line (icon + summary + chevron); tap to show the steps. Collapsed by default. */
export function ToolLine({ summary, steps }: { summary?: string; steps: string[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={s.tools}>
      <button type="button" className={s.toolLine} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <Wrench size={18} className={s.toolIcon} {...ICON} />
        <span className={s.toolText}>{summary ?? toolSummary(steps)}</span>
        {open ? <ChevronDown size={16} {...ICON} /> : <ChevronRight size={16} {...ICON} />}
      </button>
      {open && (
        <ul id={id} className={s.steps}>
          {steps.map((t, i) => (
            <li key={`${i}-${t}`}>
              <File size={16} {...ICON} />
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Alert = { kind: AlertKind; text: string; action?: { label: string; onPress: () => void } }

type PermissionProps = {
  agent: AgentId
  risk: 'low' | 'medium' | 'high'
  title: string
  command: string
  /** "back to PC in 8 min" */
  back: string
  /** The risk sentence shown under a high-risk card. */
  warning?: string
  onApprove: () => void
  onDeny: () => void
  alert?: Alert
}

/**
 * Permission card (approval in chat): header · risk chip + "back to PC in N min" · title · command ·
 * Deny / Approve. No meta row — the top bar already says who and where. High risk: Hold to approve,
 * and the risk sentence under the card.
 */
export function PermissionCard(p: PermissionProps) {
  const high = p.risk === 'high'
  return (
    <div className={s.permission}>
      <article className={s.card} aria-label={`${AGENT_NAMES[p.agent]} wants to run a command: ${p.title}`}>
        <p className={s.cardHead}>{AGENT_NAMES[p.agent]} wants to run a command</p>
        <div className={s.cardRow}>
          <Chip kind={p.risk} />
          <span className={s.backTime}>{p.back}</span>
        </div>
        <h3 className={s.cardTitle}>{p.title}</h3>
        <CommandBox>{p.command}</CommandBox>
        {p.alert ? (
          <InlineAlert kind={p.alert.kind} action={p.alert.action} live className={s.cardAlert}>
            {p.alert.text}
          </InlineAlert>
        ) : (
          <div className={s.cardActions}>
            <Button variant="secondary" onClick={p.onDeny}>
              Deny
            </Button>
            {high ? (
              <HoldButton size="m" onComplete={p.onApprove}>
                <Fingerprint size={18} {...ICON} />
                Hold to approve
              </HoldButton>
            ) : (
              <Button onClick={p.onApprove} icon={<Fingerprint size={18} {...ICON} />}>
                Approve
              </Button>
            )}
          </div>
        )}
      </article>
      {high && p.warning && (
        <p className={s.warning}>
          <TriangleAlert size={18} className={s.warningIcon} {...ICON} />
          {p.warning}
        </p>
      )}
    </div>
  )
}

type PlanProps = {
  agent: AgentId
  title: string
  summary: string[]
  back: string
  onRead: () => void
  onAskChanges: () => void
  onApprove: () => void
  alert?: Alert
}

/** A plan in chat (not in the approved designs, so it follows the permission card). */
export function PlanInChat(p: PlanProps) {
  return (
    <article className={s.card} aria-label={`${AGENT_NAMES[p.agent]} has a plan ready for review: ${p.title}`}>
      <p className={s.cardHead}>{AGENT_NAMES[p.agent]} has a plan ready for review</p>
      <div className={s.cardRow}>
        <Chip kind="plan" />
        <span className={s.backTime}>{p.back}</span>
      </div>
      <h3 className={s.cardTitle}>{p.title}</h3>
      <ul className={s.planList}>
        {p.summary.map((line) => (
          <li key={line}>
            <Check size={16} {...ICON} />
            {line}
          </li>
        ))}
      </ul>
      <button type="button" className={s.link} onClick={p.onRead}>
        Read full plan
      </button>
      {p.alert ? (
        <InlineAlert kind={p.alert.kind} action={p.alert.action} live className={s.cardAlert}>
          {p.alert.text}
        </InlineAlert>
      ) : (
        <div className={s.cardActions}>
          <Button variant="secondary" onClick={p.onAskChanges}>
            Ask for changes
          </Button>
          <Button onClick={p.onApprove}>Approve plan</Button>
        </div>
      )}
    </article>
  )
}

/** After you answer: one quiet line in place of the card. */
export function AnsweredLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={s.answered}>
      {ok ? <Check size={18} className={s.okIcon} {...ICON} /> : <X size={18} className={s.noIcon} {...ICON} />}
      {text}
    </p>
  )
}

/** A question's answers as numbered choices: tap = send. */
export function Choices({ label, options, note, onPick, sentIndex, alert }: { label: string; options: string[]; note: string; onPick: (o: string) => void; sentIndex?: number; alert?: Alert }) {
  return (
    <div className={s.choices}>
      {alert ? (
        <InlineAlert kind={alert.kind} action={alert.action} live>
          {alert.text}
        </InlineAlert>
      ) : (
        <AnswerOptions label={label} mode="send">
          {options.map((o, i) => (
            <AnswerOption key={o} index={i + 1} label={o} mode="send" sent={sentIndex === i} disabled={sentIndex !== undefined} onPress={() => onPick(o)} />
          ))}
        </AnswerOptions>
      )}
      <p className={s.choiceNote}>{note}</p>
    </div>
  )
}

/** Suggested replies under an agent message: secondary pills, tap = send. */
export function Suggestions({ options, onPick }: { options: string[]; onPick: (o: string, i: number) => void }) {
  return (
    <div className={s.suggestions}>
      {options.map((o, i) => (
        <Button key={o} variant="secondary" onClick={() => onPick(o, i)}>
          {o}
        </Button>
      ))}
    </div>
  )
}

const STATUS_ICON = {
  paused: <Pause size={14} {...ICON} />,
  done: <Check size={14} {...ICON} />,
  failed: <X size={14} {...ICON} />,
  stopped: <Square size={12} {...ICON} />,
  info: <Info size={14} {...ICON} />,
}

/** Status line: centred footnote + icon ("Paused · Windows PC went offline", "Finished · 10:42"). */
export function StatusLine({ icon, text }: { icon: keyof typeof STATUS_ICON; text: string }) {
  return (
    <p className={[s.status, icon === 'failed' && s.statusFailed].filter(Boolean).join(' ')}>
      {STATUS_ICON[icon]}
      {text}
    </p>
  )
}

/** Working indicator: logo + three pulsing dots + "Working…". */
export function Typing({ agent }: { agent: AgentId }) {
  return (
    <div className={s.typing} role="status">
      <AgentLogo agent={agent} size={20} />
      <span className={s.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className={s.typingText}>Working…</span>
    </div>
  )
}

/* ---------- Composer ---------- */

type ComposerProps = {
  placeholder: string
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onPlus: () => void
  /** New task: the Ask me chip next to +. */
  chip?: ReactNode
  /** Shown above the box (e.g. "Windows PC is offline…"). */
  alert?: ReactNode
  autoFocus?: boolean
}

/**
 * Composer: rounded box with the text on top; + (and the Ask me chip) left; mic + send right. The send
 * disc fills once there's text. The mic listens for 2 s, then the transcript drops into the box.
 */
export function Composer({ placeholder, value, onChange, onSend, onPlus, chip, alert, autoFocus }: ComposerProps) {
  const box = useRef<HTMLTextAreaElement>(null)
  const voice = useVoice((t) => {
    onChange(t)
    box.current?.focus()
  })
  const typed = value.trim().length > 0

  // Grow with the text, up to five lines.
  useEffect(() => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`
  }, [value])

  return (
    <div className={s.composerWrap}>
      {alert}
      <div className={s.composer}>
        {voice.listening ? (
          <div className={s.composerListening}>
            <Listening />
          </div>
        ) : (
          <textarea
            ref={box}
            className={s.composerText}
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label={placeholder}
            enterKeyHint="send"
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (typed) onSend()
              }
            }}
          />
        )}
        <div className={s.composerRow}>
          <button type="button" className={s.round} aria-label="Add" onClick={onPlus}>
            <Plus size={20} {...ICON} />
          </button>
          {chip}
          <span className={s.grow} />
          <IconButton plain label="Answer by voice" onClick={voice.start} disabled={voice.listening} className={s.mic}>
            <Mic size={22} {...ICON} />
          </IconButton>
          <button
            type="button"
            className={[s.round, s.send, typed && s.sendReady].filter(Boolean).join(' ')}
            aria-label="Send"
            aria-disabled={!typed}
            onClick={() => typed && onSend()}
          >
            <ArrowUp size={20} {...ICON} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Cursor tasks: an info line in place of the composer. */
export function ComposerInfo({ children }: { children: string }) {
  return (
    <div className={s.composerWrap}>
      <p className={s.composerInfo}>
        <Info size={18} {...ICON} />
        {children}
      </p>
    </div>
  )
}

/** Ask me chip in the new task composer: shield + setting + chevron. */
export function AskMeChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button type="button" className={s.askChip} onClick={onPress} aria-haspopup="dialog">
      <ShieldCheck size={16} {...ICON} />
      {label}
      <ChevronDown size={14} {...ICON} />
    </button>
  )
}

/* ---------- New task ---------- */

/** Agent tile (New task): logo 32, name, "Ready" — Cursor is disabled ("Start in Cursor"). */
export function AgentTile({ agent, status, disabled, onPress }: { agent: AgentId; status: string; disabled?: boolean; onPress: () => void }) {
  return (
    <button type="button" className={[s.tile, disabled && s.tileOff].filter(Boolean).join(' ')} aria-disabled={disabled || undefined} onClick={onPress}>
      <AgentLogo agent={agent} size={32} />
      <span className={s.tileName}>{AGENT_NAMES[agent]}</span>
      <span className={s.tileStatus}>{status}</span>
    </button>
  )
}
