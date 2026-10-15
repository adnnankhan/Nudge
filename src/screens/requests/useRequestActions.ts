import { useCallback, useState } from 'react'
import { useFaceId, useToast } from '../../app/feedback'
import { AGENT_NAMES } from '../../components/icons'
import { haptic } from '../../components/haptics'
import { useStore } from '../../data/store'
import type { Request, Session } from '../../data/types'

type Pending = { kind: 'approve' } | { kind: 'deny' } | { kind: 'answer'; text: string }

// Copy: ApprovalStates alert 1 (03-approvals.md) and the toasts in 03/04 (decisions.md 4).
export const NOT_SENT = 'Not sent: no internet connection. Nothing was sent.'

/**
 * The one place requests are approved, denied and answered — Home cards and the request screens
 * both use it, so the rules stay the same everywhere:
 * - Approve always goes through Face ID first (high risk adds Hold to approve before this).
 * - While the computer is offline nothing is sent: the request shows "Not sent" with Retry.
 * - Deny shows a toast with Undo (4 s).
 */
export function useRequestActions(opts: { onGone?: (id: string, after: () => void) => void } = {}) {
  const faceId = useFaceId()
  const toast = useToast()
  const [notSent, setNotSent] = useState<Record<string, Pending>>({})

  // Remove the request: let the caller animate it out first (Home collapses the card).
  const leave = useCallback(
    (id: string, commit: () => void) => (opts.onGone ? opts.onGone(id, commit) : commit()),
    [opts],
  )

  const send = useCallback(
    (r: Request, p: Pending, quiet = false): Session | undefined => {
      const st = useStore.getState()
      if (st.offline) {
        setNotSent((n) => ({ ...n, [r.id]: p }))
        haptic(30)
        return
      }
      setNotSent(({ [r.id]: _, ...rest }) => rest)
      const agent = AGENT_NAMES[r.agent]
      if (p.kind === 'approve') {
        let made: Session | undefined
        leave(r.id, () => {
          made = useStore.getState().approve(r.id)
          if (!quiet) toast({ text: 'Approved · running', success: true })
        })
        return made
      }
      if (p.kind === 'deny') {
        leave(r.id, () => {
          const s = useStore.getState().deny(r.id)
          if (s) toast({ text: 'Denied', action: { label: 'Undo', onPress: () => useStore.getState().undoDeny(s.id) } })
        })
        return
      }
      leave(r.id, () => {
        useStore.getState().answer(r.id, p.text)
        toast({ text: `Answer sent to ${agent}`, success: true })
      })
    },
    [leave, toast],
  )

  /** Face ID, then send. Returns false if cancelled or not sent. With `quiet` there's no toast: the next screen (ApprovalSent) confirms it. */
  const approve = useCallback(
    async (r: Request, quiet = false) => {
      // High risk always asks (Hold to approve came first); low and medium follow the 5-minute rule.
      if (!(await faceId({ always: r.kind === 'approval' && r.risk === 'high' }))) return false
      const offline = useStore.getState().offline
      send(r, { kind: 'approve' }, quiet)
      return !offline
    },
    [faceId, send],
  )

  /** Approve all (Home): one Face ID for every low-risk request listed. Medium and high are never included. */
  const approveAll = useCallback(
    async (list: Request[]) => {
      const low = list.filter((r) => r.kind === 'approval' && r.risk === 'low')
      if (!low.length || !(await faceId())) return false
      for (const r of low) send(r, { kind: 'approve' }, true)
      // Offline: each card shows "Not sent" with Retry instead.
      if (useStore.getState().offline) return false
      // The cards collapse first, so the toast waits for them (Home's onGone commits after the animation).
      window.setTimeout(() => toast({ text: `${low.length} approved · running`, success: true }), 50)
      return true
    },
    [faceId, send, toast],
  )

  const deny = useCallback((r: Request) => send(r, { kind: 'deny' }), [send])
  const answer = useCallback((r: Request, text: string) => send(r, { kind: 'answer', text }), [send])

  /** Retry a "Not sent" request: sends now if the computer is back (Face ID was already done). */
  const retry = useCallback(
    (r: Request) => {
      const p = notSent[r.id]
      if (!p) return
      setNotSent(({ [r.id]: _, ...rest }) => rest)
      // Re-announce if it fails again: clear first, then send on the next frame.
      requestAnimationFrame(() => send(r, p))
    },
    [notSent, send],
  )

  const alertFor = (r: Request) =>
    notSent[r.id] ? { kind: 'error' as const, text: NOT_SENT, action: { label: 'Retry', onPress: () => retry(r) } } : undefined

  return { approve, approveAll, deny, answer, retry, alertFor, notSent }
}
