import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Banner } from '../components/Notice'
import { AGENT_NAMES } from '../components/icons'
import { useStore } from '../data/store'
import type { AppEvent } from '../data/types'

/**
 * In-app banner when something happens while the app is open (flows.md → Main loop):
 * a request arrives, or a session finishes or fails. One at a time, newest first.
 * Copy: 02/03 docs for approvals and finished; decisions.md (small calls) for the rest.
 */
export function BannerHost() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const events = useStore((x) => x.events)
  const requests = useStore((x) => x.requests)
  const dismiss = useStore((x) => x.dismissEvent)
  // Only events that happen while the app is open — not ones saved before a refresh.
  const since = useRef(Date.now() - 1500)

  // A request that was already answered or timed out isn't worth a banner any more.
  const ev = useMemo(
    () => [...events].reverse().find((e) => e.at >= since.current && (e.kind !== 'request' || requests.some((r) => r.id === e.ref))),
    [events, requests],
  )

  // Don't banner a request you're already looking at.
  useEffect(() => {
    if (ev && pathname.startsWith(`/request/${ev.ref}`)) dismiss(ev.id)
  }, [ev, pathname, dismiss])

  if (!ev) return null

  const content = describe(ev, requests)
  const close = () => dismiss(ev.id)
  return (
    <Banner
      key={ev.id}
      open
      onDismiss={close}
      agent={ev.agent}
      text={content.text}
      action={{
        label: content.action,
        onPress: () => {
          close()
          navigate(content.to)
        },
      }}
    />
  )
}

function describe(ev: AppEvent, requests: ReturnType<typeof useStore.getState>['requests']) {
  const agent = AGENT_NAMES[ev.agent]
  if (ev.kind === 'finished') return { text: `${agent} finished`, action: 'View', to: `/session/${ev.ref}` }
  if (ev.kind === 'failed') return { text: `${agent} failed`, action: 'View', to: `/session/${ev.ref}` }
  const r = requests.find((x) => x.id === ev.ref)
  if (r?.kind === 'question') return { text: `${agent} asked you a question`, action: 'Answer', to: `/request/${ev.ref}` }
  if (r?.kind === 'plan') return { text: `${agent} has a plan ready for review`, action: 'Review', to: `/request/${ev.ref}` }
  return { text: `${agent} needs your approval`, action: 'Review', to: `/request/${ev.ref}` }
}
