import type { Request, Session } from './types'

const MIN = 60_000

/** "2 min ago" — real minutes since it arrived, plus how long it had waited when the demo began. */
export function minutesAgo(r: Request, now: number) {
  const m = r.ageAtStart + Math.floor((now - r.arrivedAt) / MIN)
  return m < 1 ? 'now' : `${m} min ago`
}

/** Elapsed for working sessions, mono ("4m"). */
export function elapsed(s: Session, now: number) {
  return `${Math.max(0, Math.floor((now - s.startedAt) / MIN))}m`
}

/** Finish time for completed sessions, mono 24-hour ("10:42"). */
export function clockTime(s: Session) {
  if (s.clock) return s.clock
  const d = new Date(s.finishedAt ?? s.startedAt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "Goes back to your computer after 10 min" uses the Time to answer setting. */
export const goesBackAfter = (min: number) => `Goes back to your computer after ${min} min`
