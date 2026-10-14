import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { ICON, Spinner } from './icons'
import s from './EmptyState.module.css'

type Props = {
  kind?: 'empty' | 'loading'
  title?: string
  body?: string
  action?: ReactNode
  /** Heading level for the title (screens that have no other heading use 1). */
  level?: 1 | 2
}

/** Loading or empty state: spinner or tick, title, body, optional action. */
export function EmptyState({ kind = 'empty', title, body, action, level = 2 }: Props) {
  const H = level === 1 ? 'h1' : 'h2'
  return (
    <div className={s.wrap} role={kind === 'loading' ? 'status' : undefined}>
      <span className={s.icon} aria-hidden="true">
        {kind === 'loading' ? <Spinner size={32} /> : <Check size={32} {...ICON} />}
      </span>
      {title && <H className={s.title}>{title}</H>}
      {body && <p className={s.body}>{body}</p>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  )
}

/** One-line note under an empty section ("You're all caught up"). */
export function EmptyLine({ children }: { children: string }) {
  return (
    <div className={[s.wrap, s.compact].join(' ')}>
      <p className={s.body}>{children}</p>
    </div>
  )
}
