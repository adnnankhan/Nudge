import { Check, Fingerprint, Hourglass, ShieldCheck } from 'lucide-react'
import { Button } from './Button'
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

/** Approve all bar (Home, 2+ low-risk requests waiting): one Face ID approves them all. */
export function ApproveAllBar({ count, onApprove }: { count: number; onApprove: () => void }) {
  return (
    <div className={s.approveAll}>
      <ShieldCheck size={20} className={s.approveAllIcon} {...ICON} />
      <span className={s.approveAllText}>{count} low-risk requests</span>
      <Button onClick={onApprove} className={s.approveAllButton} icon={<Fingerprint size={18} {...ICON} />}>
        Approve all
      </Button>
    </div>
  )
}
