import { useId } from 'react'
import { ChevronRight } from 'lucide-react'
import { ICON } from './icons'
import s from './FormField.module.css'

type Props = {
  label: string
  value?: string
  placeholder?: string
  note?: string
  disabled?: boolean
  onPress?: () => void
}

/** Form field (New task): default · placeholder · with note · disabled. Opens a picker sheet. */
export function FormField({ label, value, placeholder, note, disabled, onPress }: Props) {
  const id = useId()
  return (
    <div className={s.wrap}>
      <span id={`${id}-label`} className={s.label}>
        {label}
      </span>
      <button
        type="button"
        className={s.field}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-describedby={note ? `${id}-note` : undefined}
        onClick={onPress}
      >
        <span id={`${id}-value`} className={[s.value, !value && s.placeholder].filter(Boolean).join(' ')}>
          {value || placeholder}
        </span>
        <ChevronRight size={20} className={s.chevron} {...ICON} />
      </button>
      {note && (
        <p id={`${id}-note`} className={s.note}>
          {note}
        </p>
      )}
    </div>
  )
}
