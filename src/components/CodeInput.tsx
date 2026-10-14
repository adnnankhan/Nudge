import { useId, useRef, useState } from 'react'
import s from './Field.module.css'

type Props = {
  value: string
  onChange: (value: string) => void
  /** Accessible name — the screen title usually ("Enter the code"). */
  label: string
  error?: string
  length?: number
  autoFocus?: boolean
  /** Gallery only: draw a cell as active without focus. */
  demoActive?: boolean
}

/**
 * 6-digit code: empty · active · filled · error. One real input sits over the cells, so typing
 * auto-advances, Backspace goes back, and pasting a code fills every cell.
 */
export function CodeInput({ value, onChange, label, error, length = 6, autoFocus, demoActive }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const id = useId()
  const digits = value.split('')
  const active = Math.min(value.length, length - 1)
  const showActive = focused || demoActive

  return (
    <div>
      <div className={s.code} onClick={() => ref.current?.focus()}>
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={[s.cell, error ? s.cellError : showActive && i === active && s.cellActive].filter(Boolean).join(' ')}
          >
            {digits[i] ?? (showActive && !error && i === active ? <span className={s.caret} /> : '')}
          </div>
        ))}
        <input
          ref={ref}
          className={s.codeInput}
          value={value}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        />
      </div>
      {error && (
        <p id={`${id}-msg`} className={s.message} role="alert" style={{ marginTop: 'var(--space-2)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
