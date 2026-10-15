/**
 * A review run keeps "x of y" steady while you work through Needs you (03-approvals.md:
 * ApprovalDetail "1 of 3" → approve → "Next request (2 of 3)" → ApprovalMedium "2 of 3").
 * It starts when a request is opened from Home and lasts until you're back on Home.
 */
let run: string[] = []

export function startRun(ids: string[]) {
  run = [...ids]
}

export function endRun() {
  run = []
}

/** "2 of 3" within the run, or null if this request isn't part of one. */
export function runPosition(id: string) {
  const i = run.indexOf(id)
  return i < 0 ? null : `${i + 1} of ${run.length}`
}

/** The next request in the run after `id` that is still waiting. */
export function runNext(id: string, waiting: string[]) {
  const i = run.indexOf(id)
  if (i < 0) return null
  const next = run.slice(i + 1).find((x) => waiting.includes(x)) ?? run.slice(0, i).find((x) => waiting.includes(x))
  return next ? { id: next, label: `${run.indexOf(next) + 1} of ${run.length}` } : null
}
