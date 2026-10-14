import { useId, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { ICON } from './icons'
import { Toggle } from './Toggle'
import s from './List.module.css'

/** A list group with an optional header (Footnote bold, --ink-2). */
export function ListGroup({ header, children, className }: { header?: string; children: ReactNode; className?: string }) {
  const id = useId()
  return (
    // A labelled group, not a landmark: Settings would otherwise announce five regions.
    <div role="group" className={[s.section, className].filter(Boolean).join(' ')} aria-labelledby={header ? id : undefined}>
      {header && (
        <h2 id={id} className={s.header}>
          {header}
        </h2>
      )}
      <ul className={s.group}>{children}</ul>
    </div>
  )
}

type RowProps = {
  title: string
  subtitle?: string
  /** Right-aligned value (navigation and value rows). */
  value?: string
  leading?: ReactNode
  /** Leading step number (LinkSent list). */
  number?: number
  monoTitle?: boolean
  /** Navigation row: shows the chevron. */
  onPress?: () => void
  chevron?: boolean
  /** Toggle row. */
  toggle?: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }
  /** Action row: a trailing text button or chip. */
  trailing?: ReactNode
  destructive?: boolean
  /** Accessible label override for pressable rows. */
  ariaLabel?: string
}

/** One row. Pressable rows are real buttons; toggle rows label their switch with the title. */
export function ListRow({
  title,
  subtitle,
  value,
  leading,
  number,
  monoTitle,
  onPress,
  chevron,
  toggle,
  trailing,
  destructive,
  ariaLabel,
}: RowProps) {
  const id = useId()
  const content = (
    <>
      {number !== undefined && <span className={[s.leading, s.leadingNumber].join(' ')}>{number}</span>}
      {leading && <span className={s.leading}>{leading}</span>}
      <span className={s.text}>
        <span id={`${id}-t`} className={[s.title, monoTitle && s.titleMono].filter(Boolean).join(' ')}>
          {title}
        </span>
        {subtitle && <span className={s.subtitle}>{subtitle}</span>}
      </span>
      {value !== undefined && <span className={s.value}>{value}</span>}
      {(chevron ?? (onPress && !destructive)) && <ChevronRight size={20} className={s.chevron} {...ICON} />}
    </>
  )

  const cls = [s.row, destructive && s.destructive].filter(Boolean).join(' ')

  return (
    <li>
      {onPress ? (
        <button type="button" className={[cls, s.pressRow].join(' ')} onClick={onPress} aria-label={ariaLabel}>
          {content}
        </button>
      ) : (
        <div className={cls}>
          {content}
          {toggle && (
            <Toggle checked={toggle.checked} onChange={toggle.onChange} disabled={toggle.disabled} labelledBy={`${id}-t`} />
          )}
          {trailing && <span className={s.trailing}>{trailing}</span>}
        </div>
      )}
    </li>
  )
}
