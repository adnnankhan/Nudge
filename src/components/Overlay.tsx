import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Overlays (sheets, menus, banners, toasts) render into a host inside the device, so they stay
 * inside the phone frame on desktop and never scroll with the screen. The gallery gives each
 * demo phone its own host.
 */
type Host = { host: HTMLElement | null; content: HTMLElement | null }

const HostContext = createContext<Host | null>(null)

export function OverlayHostProvider({ host, content, children }: Host & { children: ReactNode }) {
  return <HostContext.Provider value={{ host, content }}>{children}</HostContext.Provider>
}

function useHost(): Host {
  const ctx = useContext(HostContext)
  const [fallback, setFallback] = useState<Host>({ host: null, content: null })
  useEffect(() => {
    if (!ctx) setFallback({ host: document.getElementById('overlays'), content: document.getElementById('app-content') })
  }, [ctx])
  return ctx ?? fallback
}

export function Overlay({ children }: { children: ReactNode }) {
  const { host } = useHost()
  return host ? createPortal(children, host) : null
}

let modalCount = 0

/** While a modal is open, the screen behind is inert: no focus, no screen-reader access. */
export function useInertBackground(active: boolean) {
  const { content } = useHost()
  useEffect(() => {
    if (!active || !content) return
    modalCount++
    content.setAttribute('inert', '')
    return () => {
      modalCount--
      if (modalCount <= 0) {
        modalCount = 0
        content.removeAttribute('inert')
      }
    }
  }, [active, content])
}

/** Keep the element mounted while its exit animation runs. Returns [mounted, visible]. */
export function usePresence(open: boolean, exitMs: number): [boolean, boolean] {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(r)
    }
    setVisible(false)
    const t = window.setTimeout(() => setMounted(false), exitMs)
    return () => window.clearTimeout(t)
  }, [open, exitMs])
  return [mounted, visible]
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

/** Focus the first control on open, keep Tab inside, restore focus on close. */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    const before = document.activeElement as HTMLElement | null
    const first = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el
    first.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const a = items[0]
      const z = items[items.length - 1]
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault()
        z.focus()
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault()
        a.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('keydown', onKey)
      before?.focus?.({ preventScroll: true })
    }
  }, [ref, active, onEscape])
}
