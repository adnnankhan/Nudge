import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { ICON } from './icons'
import { haptic } from './haptics'
import s from './HoldButton.module.css'

export type HoldState = 'idle' | 'holding' | 'cancelled' | 'done'

type Props = {
  onComplete: () => void
  size?: 'm' | 'l'
  className?: string
  /** Components gallery only: show a fixed state. */
  demoState?: HoldState
  children?: ReactNode
}

// Sample copy approved in docs/decisions.md (4): the hold hint.
const HINT = 'Keep holding to approve'

/**
 * Hold to approve — high risk is never one tap. Press and hold for 1.2 s while the fill sweeps
 * left → right; releasing early cancels with a small shake and the hint. Touch, mouse and
 * keyboard (hold Space or Enter) all work.
 */
export function HoldButton({ onComplete, size = 'l', className, demoState, children = 'Hold to approve' }: Props) {
  const [state, setState] = useState<HoldState>(demoState ?? 'idle')
  const [shake, setShake] = useState(false)
  const [hint, setHint] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const start = () => {
    if (demoState || state === 'holding' || state === 'done') return
    const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-hold')) || 1200
    setHint(false)
    setState('holding')
    haptic(10)
    timer.current = window.setTimeout(() => {
      setState('done')
      haptic(20)
      onComplete()
    }, ms)
  }

  const cancel = () => {
    if (demoState || state !== 'holding') return
    window.clearTimeout(timer.current)
    setState('cancelled')
    setShake(true)
    setHint(true)
  }

  const showHint = hint || demoState === 'cancelled'

  return (
    <div className={[s.wrap, className].filter(Boolean).join(' ')}>
      <p className={s.hint} role="status" aria-live="polite">
        {showHint ? HINT : ''}
      </p>
      <button
        type="button"
        className={[s.hold, s[size], s[state], demoState === 'holding' && s.demoHolding, shake && s.shake]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.currentTarget.setPointerCapture?.(e.pointerId)
          start()
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault()
            start()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') cancel()
        }}
        onBlur={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onAnimationEnd={() => setShake(false)}
      >
        <span className={s.fill} />
        <span className={s.label}>
          {state === 'done' && <Check size={20} {...ICON} />}
          {children}
        </span>
      </button>
    </div>
  )
}
