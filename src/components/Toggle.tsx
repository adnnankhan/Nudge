import { haptic } from './haptics'
import s from './Toggle.module.css'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name when no visible label is linked. */
  label?: string
  labelledBy?: string
  disabled?: boolean
}

/** Toggle: on · off · disabled. A real switch button, keyboard operable. */
export function Toggle({ checked, onChange, label, labelledBy, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      className={[s.toggle, checked && s.on].filter(Boolean).join(' ')}
      onClick={() => {
        haptic(10)
        onChange(!checked)
      }}
    >
      <span className={s.knob} />
    </button>
  )
}
