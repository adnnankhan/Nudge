import { useId, type ReactNode } from 'react'
import { ArrowUp, Check, Mic } from 'lucide-react'
import { IconButton } from './Button'
import { ICON } from './icons'
import s from './Answer.module.css'

type OptionProps = {
  index: number
  label: string
  /** "select": radio choice (AnswerQuestion). "send": tapping sends at once (Home card). */
  mode?: 'select' | 'send'
  selected?: boolean
  /** After a tap on Home: short "Sent" tick before the card collapses. */
  sent?: boolean
  disabled?: boolean
  onPress?: () => void
}

/** Answer option: default · selected (1.5px ink ring, filled number). */
export function AnswerOption({ index, label, mode = 'select', selected, sent, disabled, onPress }: OptionProps) {
  return (
    <button
      type="button"
      role={mode === 'select' ? 'radio' : undefined}
      aria-checked={mode === 'select' ? !!selected : undefined}
      disabled={disabled}
      className={[s.option, selected && s.selected, sent && s.sent].filter(Boolean).join(' ')}
      onClick={onPress}
    >
      <span className={s.num} aria-hidden="true">
        {sent ? <Check size={14} {...ICON} /> : index}
      </span>
      <span>{label}</span>
      {sent && <span className={s.sentWord}>Sent</span>}
    </button>
  )
}

/** Group wrapper: a radiogroup when choosing, a plain list when each tap sends. */
export function AnswerOptions({ label, mode = 'select', children }: { label: string; mode?: 'select' | 'send'; children: ReactNode }) {
  return (
    <div className={s.options} role={mode === 'select' ? 'radiogroup' : 'group'} aria-label={label}>
      {children}
    </div>
  )
}

type InputProps = {
  value: string
  onChange: (v: string) => void
  onSend?: () => void
  onMic?: () => void
  placeholder?: string
  error?: string
  /** Show the send button even when empty (gallery). */
  forceSend?: boolean
}

/** Answer input: empty · focused · typed (send button appears). */
export function AnswerInput({ value, onChange, onSend, onMic, placeholder = 'Or write your own answer', error, forceSend }: InputProps) {
  const id = useId()
  const typed = value.trim().length > 0 || forceSend
  return (
    <div>
      <div className={[s.input, error && s.inputError].filter(Boolean).join(' ')}>
        <input
          id={id}
          className={s.text}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          enterKeyHint="send"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && typed) onSend?.()
          }}
        />
        <div className={s.end}>
          {typed ? (
            <button type="button" className={s.send} aria-label="Send answer" onClick={onSend}>
              <span className={s.sendDisc}>
                <ArrowUp size={18} {...ICON} />
              </span>
            </button>
          ) : (
            <IconButton plain label="Answer by voice" onClick={onMic}>
              <Mic size={20} {...ICON} />
            </IconButton>
          )}
        </div>
      </div>
      {error && (
        <p id={`${id}-msg`} className={s.message} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
