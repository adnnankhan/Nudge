import { Check } from 'lucide-react'
import { ICON, Spinner } from './icons'
import s from './Steps.module.css'

/** Numbered steps in a card (SetupIntro, AddComputer). */
export function NumberedSteps({ steps }: { steps: { title: string; description?: string }[] }) {
  return (
    <ol className={s.card}>
      {steps.map((st, i) => (
        <li key={st.title} className={s.step}>
          <span className={s.disc} aria-hidden="true">
            {i + 1}
          </span>
          <span className={s.text}>
            <span className={s.title}>{st.title}</span>
            {st.description && <span className={s.desc}>{st.description}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export type ProgressState = 'done' | 'current' | 'pending'

// Screen-reader state words; the visible state is the disc (tick / spinner / empty).
const SR = { done: 'done', current: 'in progress', pending: 'not started' }

/** Progress steps: done · current (spinner) · pending. */
export function ProgressSteps({ steps, label }: { steps: { label: string; state: ProgressState }[]; label: string }) {
  return (
    <ol className={s.card} aria-label={label}>
      {steps.map((st) => (
        <li key={st.label} className={[s.pstep, s[st.state]].join(' ')}>
          <span className={s.pdisc} aria-hidden="true">
            {st.state === 'done' && <Check size={16} {...ICON} strokeWidth={2.25} />}
            {st.state === 'current' && <Spinner size={18} />}
          </span>
          <span>
            {st.label}
            <span className="sr-only">, {SR[st.state]}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
