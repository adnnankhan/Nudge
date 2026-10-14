import type { KeyboardEvent, ReactNode } from 'react'
import s from './OptionRow.module.css'

type Props = {
  title: string
  description?: string
  selected?: boolean
  disabled?: boolean
  leading?: ReactNode
  /** "radio" for pickers; "action" for rows that do something (Stopped → Continue / Redirect / Undo). */
  kind?: 'radio' | 'action'
  onSelect?: () => void
}

/** Option row: default · selected (ring + filled radio) · disabled (50%). */
export function OptionRow({ title, description, selected, disabled, leading, kind = 'radio', onSelect }: Props) {
  return (
    <button
      type="button"
      role={kind === 'radio' ? 'radio' : undefined}
      aria-checked={kind === 'radio' ? !!selected : undefined}
      aria-disabled={disabled || undefined}
      className={[s.row, selected && s.selected, disabled && s.disabled].filter(Boolean).join(' ')}
      onClick={() => {
        if (!disabled) onSelect?.()
      }}
    >
      {leading}
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        {description && <span className={s.desc}>{description}</span>}
      </span>
      <span className={s.radio} aria-hidden="true" />
    </button>
  )
}

/** Radio group with arrow-key movement (Up/Down), as screen-reader users expect. */
export function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([aria-disabled="true"])')]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    const next = items[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length]
    next.focus()
    next.click()
  }
  return (
    <div className={s.group} role="radiogroup" aria-label={label} onKeyDown={onKey}>
      {children}
    </div>
  )
}
