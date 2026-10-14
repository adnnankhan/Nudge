import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { IconButton } from './Button'
import { ICON } from './icons'
import s from './Field.module.css'

type Common = {
  label?: string
  /** Shown under the field in the high-risk colour; also sets the error ring. */
  error?: string
  note?: string
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean
  /** Components gallery only: draw the focused ring. */
  demoFocused?: boolean
}

type TextFieldProps = Common &
  InputHTMLAttributes<HTMLInputElement> & {
    password?: boolean
    trailing?: ReactNode
  }

/** Text field: default · focused · filled · error · disabled. Password adds a 44×44 eye toggle. */
export function TextField({ label, error, note, hideLabel, password, trailing, disabled, className, id, demoFocused, ...rest }: TextFieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  const msgId = `${inputId}-msg`
  const [shown, setShown] = useState(false)
  const end =
    trailing ??
    (password ? (
      <IconButton plain label={shown ? 'Hide password' : 'Show password'} onClick={() => setShown((v) => !v)} disabled={disabled}>
        {shown ? <EyeOff size={20} {...ICON} /> : <Eye size={20} {...ICON} />}
      </IconButton>
    ) : null)

  return (
    <div className={[s.wrap, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={hideLabel ? 'sr-only' : s.label}>
          {label}
        </label>
      )}
      <div
        className={[s.box, error && s.error, disabled && s.disabled, end && s.withTrailing].filter(Boolean).join(' ')}
        data-demo={demoFocused ? 'focused' : undefined}
      >
        <input
          id={inputId}
          className={s.input}
          type={password && !shown ? 'password' : rest.type ?? 'text'}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || note ? msgId : undefined}
          {...rest}
        />
        {end && <div className={s.trailing}>{end}</div>}
      </div>
      {error ? (
        <p id={msgId} className={s.message} role="alert">
          {error}
        </p>
      ) : note ? (
        <p id={msgId} className={s.note}>
          {note}
        </p>
      ) : null}
    </div>
  )
}

type TextAreaProps = Common & TextareaHTMLAttributes<HTMLTextAreaElement>

/** Multi-line field (New task → Instruction, VoiceAnswer → Transcript). */
export function TextArea({ label, error, note, hideLabel, disabled, className, id, demoFocused, ...rest }: TextAreaProps) {
  const auto = useId()
  const inputId = id ?? auto
  const msgId = `${inputId}-msg`
  return (
    <div className={[s.wrap, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={hideLabel ? 'sr-only' : s.label}>
          {label}
        </label>
      )}
      <div className={[s.box, error && s.error, disabled && s.disabled].filter(Boolean).join(' ')} data-demo={demoFocused ? 'focused' : undefined}>
        <textarea
          id={inputId}
          className={[s.input, s.textarea].join(' ')}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || note ? msgId : undefined}
          {...rest}
        />
      </div>
      {error ? (
        <p id={msgId} className={s.message} role="alert">
          {error}
        </p>
      ) : note ? (
        <p id={msgId} className={s.note}>
          {note}
        </p>
      ) : null}
    </div>
  )
}
