import { useEffect } from 'react'
import screen from '../dev/RefScreens.module.css'
import { SectionTitle, SummaryCard } from '../../components/Summary'
import { ApprovalCard, QuestionCard, SessionRow } from '../../components/RequestCard'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { clockTime, elapsed, minutesAgo } from '../../data/format'
import type { Session } from '../../data/types'

const noop = () => {}
const STATUS: Record<Session['status'], 'working' | 'paused' | 'done' | 'failed' | 'stopped'> = {
  waiting: 'paused',
  working: 'working',
  paused: 'paused',
  done: 'done',
  failed: 'failed',
  stopped: 'stopped',
  denied: 'stopped',
  expired: 'stopped',
}

/**
 * Hidden /#/dev/state — the live fake data while Home doesn't exist yet (M4 builds the real one).
 * Shows requests arriving, sessions progressing and finishing, and what survives a refresh.
 */
export function State() {
  const now = useNow(1000)
  const st = useStore()
  const startArrivals = useStore((x) => x.startArrivals)
  useEffect(() => startArrivals(), [startArrivals])

  const mine = st.requests.filter((r) => r.computerId === st.currentComputer)
  const sessions = st.sessions.filter((s) => s.computerId === st.currentComputer)
  const active = sessions.filter((s) => s.status === 'working' || s.status === 'paused')
  const done = sessions.filter((s) => !['working', 'paused'].includes(s.status))

  return (
    <div className={screen.screen}>
      <h1 className="t-title-3" style={{ marginTop: 'var(--space-3)' }}>
        State
      </h1>
      <p className="t-mono-time ink-2" data-testid="flags">
        next arrival {st.nextArrivalAt ? Math.max(0, Math.round((st.nextArrivalAt - now) / 1000)) + 's' : '—'} · offline {String(st.offline)} · events {st.events.length}
      </p>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <SummaryCard waiting={mine.length} working={active.length} completed={done.length} />
      </div>
      <SectionTitle title="Needs you" count={mine.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }} data-testid="needs">
        {mine.map((r) =>
          r.kind === 'approval' ? (
            <ApprovalCard
              key={r.id}
              agent={r.agent}
              project={r.project}
              time={minutesAgo(r, now)}
              risk={r.risk}
              title={r.title}
              command={r.command}
              timeoutMin={st.settings.timeoutMin}
              onOpen={noop}
              onApprove={() => st.approve(r.id)}
              onDeny={() => st.deny(r.id)}
            />
          ) : (
            <QuestionCard
              key={r.id}
              agent={r.agent}
              project={r.project}
              time={minutesAgo(r, now)}
              question={r.title}
              options={r.kind === 'question' ? r.options : ['Approve plan']}
              timeoutMin={st.settings.timeoutMin}
              onOpen={noop}
              onAnswer={(a) => st.answer(r.id, a)}
            />
          ),
        )}
      </div>
      <SectionTitle title="Working" count={active.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }} data-testid="working">
        {active.map((s) => (
          <div key={s.id}>
            <SessionRow agent={s.agent} project={s.project} time={elapsed(s, now)} status={STATUS[s.status]} text={s.text} onPress={noop} />
            <p className="t-mono-time ink-2">{s.recent.join(' · ') || '—'}</p>
          </div>
        ))}
      </div>
      <SectionTitle title="Completed today" count={done.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)', paddingBottom: 'var(--space-10)' }} data-testid="completed">
        {done.map((s) => (
          <div key={s.id}>
            <SessionRow agent={s.agent} project={s.project} time={clockTime(s)} status={STATUS[s.status]} text={s.text} onPress={noop} />
            <p className="t-mono-time ink-2">{s.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
