import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cssMs } from '../../components/cssTime'

/**
 * Card leaving "Needs you": collapses over 220 ms (design-system §7), then `onDone` removes it
 * from the data. With reduced motion it simply goes.
 */
export function Collapse({ leaving, onDone, children }: { leaving: boolean; onDone: () => void; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  done.current = onDone

  useLayoutEffect(() => {
    const n = el.current
    if (!leaving || !n) return
    const ms = cssMs('--dur-collapse', 220, n)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      done.current()
      return
    }
    n.style.height = `${n.offsetHeight}px`
    n.style.overflow = 'hidden'
    void n.offsetHeight
    n.style.transition = `height ${ms}ms var(--ease), opacity ${ms}ms var(--ease), margin-bottom ${ms}ms var(--ease)`
    n.style.height = '0px'
    n.style.opacity = '0'
    // Swallow the gap below too, so the list closes up smoothly.
    n.style.marginBottom = 'calc(var(--card-gap) * -1)'
    const t = window.setTimeout(() => done.current(), ms)
    return () => window.clearTimeout(t)
  }, [leaving])

  return (
    <div ref={el} aria-hidden={leaving || undefined}>
      {children}
    </div>
  )
}
