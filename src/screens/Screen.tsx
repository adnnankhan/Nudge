import { forwardRef, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useNavigationType } from 'react-router-dom'
import s from './Screen.module.css'

const scrollMemory = new Map<string, number>()

type Props = {
  children: ReactNode
  /** Remember the scroll position under this key (Home keeps its place when you come back). */
  scrollKey?: string
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

/**
 * A screen: fills the device, scrolls on its own, respects the safe areas, and slides in
 * (from the right when going forward, from the left when going back; fade with reduced motion).
 */
export const Screen = forwardRef<HTMLDivElement, Props>(function Screen({ children, scrollKey, className, onScroll }, outer) {
  const back = useNavigationType() === 'POP'
  const inner = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = inner.current
    if (!el || !scrollKey) return
    el.scrollTop = scrollMemory.get(scrollKey) ?? 0
    return () => {
      scrollMemory.set(scrollKey, el.scrollTop)
    }
  }, [scrollKey])

  return (
    <div
      ref={(n) => {
        inner.current = n
        if (typeof outer === 'function') outer(n)
        else if (outer) outer.current = n
      }}
      className={[s.screen, back && s.back, className].filter(Boolean).join(' ')}
      onScroll={onScroll}
    >
      {children}
    </div>
  )
})
