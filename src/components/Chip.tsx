import { Check, CircleAlert, Pause, ShieldCheck, Square, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ICON, Spinner } from './icons'
import s from './Chip.module.css'

export type ChipKind =
  | 'low'
  | 'medium'
  | 'high'
  | 'working'
  | 'paused'
  | 'stopped'
  | 'done'
  | 'approved'
  | 'connected'
  | 'failed'

const CHIPS: Record<ChipKind, { label: string; tone: 'low' | 'medium' | 'high' | 'neutral'; icon: ReactNode }> = {
  low: { label: 'Low risk', tone: 'low', icon: <ShieldCheck size={16} {...ICON} /> },
  medium: { label: 'Medium risk', tone: 'medium', icon: <CircleAlert size={16} {...ICON} /> },
  high: { label: 'High risk', tone: 'high', icon: <TriangleAlert size={16} {...ICON} /> },
  working: { label: 'Working', tone: 'neutral', icon: <Spinner size={16} /> },
  paused: { label: 'Paused', tone: 'neutral', icon: <Pause size={16} {...ICON} /> },
  stopped: { label: 'Stopped', tone: 'neutral', icon: <Square size={14} {...ICON} /> },
  done: { label: 'Done', tone: 'low', icon: <Check size={16} {...ICON} /> },
  approved: { label: 'Approved', tone: 'low', icon: <Check size={16} {...ICON} /> },
  connected: { label: 'Connected', tone: 'low', icon: <Check size={16} {...ICON} /> },
  failed: { label: 'Failed', tone: 'high', icon: <X size={16} {...ICON} /> },
}

/** Status is never colour alone: every chip is icon + word. */
export function Chip({ kind, className }: { kind: ChipKind; className?: string }) {
  const c = CHIPS[kind]
  return (
    <span className={[s.chip, s[c.tone], className].filter(Boolean).join(' ')}>
      {c.icon}
      {c.label}
    </span>
  )
}

export type DotTone = 'green' | 'amber' | 'red' | 'grey'

const DOT = { green: s.dotGreen, amber: s.dotAmber, red: s.dotRed, grey: s.dotGrey }

/** A coloured dot. Always pair it with a word next to it. */
export function StatusDot({ tone }: { tone: DotTone }) {
  return <span aria-hidden="true" className={[s.dot, DOT[tone]].join(' ')} />
}
