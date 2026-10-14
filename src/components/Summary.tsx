import { Check, Hourglass } from 'lucide-react'
import { ICON, Spinner } from './icons'
import s from './Summary.module.css'

type Props = { waiting: number; working: number; completed: number }

/** Summary card: numbers + icon + label, hairline dividers. Live counts come from the store. */
export function SummaryCard({ waiting, working, completed }: Props) {
  const stats = [
    { n: waiting, label: 'Waiting', icon: <Hourglass size={14} {...ICON} /> },
    { n: working, label: 'Working', icon: <Spinner size={14} /> },
    { n: completed, label: 'Completed', icon: <Check size={14} {...ICON} /> },
  ]
  return (
    <dl className={s.card}>
      {stats.map((st) => (
        <div key={st.label} className={s.stat}>
          <dt className={s.label}>
            {st.icon}
            {st.label}
          </dt>
          <dd className={s.num}>{st.n}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Section title with optional count ("Needs you 2"). */
export function SectionTitle({ title, count, id }: { title: string; count?: number; id?: string }) {
  return (
    <h2 className={s.section} id={id}>
      <span className={s.sectionTitle}>{title}</span>
      {count !== undefined && <span className={s.count}>{count}</span>}
    </h2>
  )
}
