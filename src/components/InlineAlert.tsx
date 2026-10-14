import { CircleAlert, Info, TriangleAlert } from 'lucide-react'
import { TextButton } from './Button'
import { ICON } from './icons'
import s from './InlineAlert.module.css'

export type AlertKind = 'warning' | 'error' | 'info'

const ICONS = {
  warning: <CircleAlert size={20} className={s.icon} {...ICON} />,
  error: <TriangleAlert size={20} className={s.icon} {...ICON} />,
  info: <Info size={20} className={s.icon} {...ICON} />,
}

// Screen readers hear the kind first, since colour is not the only signal.
const SR_KIND = { warning: 'Warning:', error: 'Error:', info: 'Note:' }

type Props = {
  kind: AlertKind
  children: string
  action?: { label: string; onPress: () => void }
  /** Announce when it appears (alerts that show up in response to something). */
  live?: boolean
  className?: string
}

/** Inline alert: warning · error · info, optional action link. */
export function InlineAlert({ kind, children, action, live, className }: Props) {
  return (
    <div
      className={[s.alert, s[kind], !action && s.noAction, className].filter(Boolean).join(' ')}
      role={live ? (kind === 'error' ? 'alert' : 'status') : undefined}
    >
      {ICONS[kind]}
      <p className={s.text}>
        <span className="sr-only">{SR_KIND[kind]} </span>
        {children}
      </p>
      {action && (
        <TextButton className={s.action} onClick={action.onPress}>
          {action.label}
        </TextButton>
      )}
    </div>
  )
}
