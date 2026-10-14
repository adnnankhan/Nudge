import type { CSSProperties, SVGProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import s from './icons.module.css'
import shared from './shared.module.css'

export type AgentId = 'claude' | 'codex' | 'cursor'

export const AGENT_NAMES: Record<AgentId, string> = {
  claude: 'Claude Code',
  codex: 'Codex',
  cursor: 'Cursor',
}

const brand = (file: string) => `url("${import.meta.env.BASE_URL}brand/${file}")`

/** Agent logo (Claude keeps its orange; Codex and Cursor use the text colour). Decorative. */
export function AgentLogo({ agent, size = 18, className }: { agent: AgentId; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[s.mask, agent === 'claude' && s.claude, className].filter(Boolean).join(' ')}
      style={{ '--src': brand(`agent-${agent}.svg`), width: size, height: size } as CSSProperties}
    />
  )
}

/** The Nudge mark (uses the text colour). */
export function NudgeMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[s.mask, className].filter(Boolean).join(' ')}
      style={{ '--src': brand('nudge-mark.svg'), width: size, height: size } as CSSProperties}
    />
  )
}

/** Google "G" (fixed brand colours, so an image). */
export function GoogleLogo({ size = 20 }: { size?: number }) {
  return <img src={`${import.meta.env.BASE_URL}brand/google-16.png`} width={size} height={size} alt="" />
}

/** Spinner — lucide loader-circle, rotating. */
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <LoaderCircle
      aria-hidden="true"
      size={size}
      strokeWidth={1.75}
      className={[shared.spin, className].filter(Boolean).join(' ')}
    />
  )
}

/** Filled house for the active Home tab (lucide has no filled variant). Door stays cut out. */
export function HouseFilled({ size = 24, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.7 2.6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10.1V19a2 2 0 0 1-2 2h-4v-6.5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1V21H5a2 2 0 0 1-2-2v-8.9a2 2 0 0 1 .7-1.5z"
      />
    </svg>
  )
}

/** Common props for lucide icons so every icon uses the same stroke (design-system §6). */
export const ICON = { strokeWidth: 1.75, 'aria-hidden': true } as const
