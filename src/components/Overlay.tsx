import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
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

/** True while a modal sheet (incl. the demo menu) is open — the arrival timer holds meanwhile. */
export const isModalOpen = () => modalCount > 0

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

/**
 * Focus the first control on open, keep Tab inside, Esc closes, restore focus on close.
 * Runs once per opening: callers re-render often (live data), and re-running would yank focus.
 */
export function useFocusTrap(el: HTMLElement | null, active: boolean, onEscape?: () => void) {
  const escape = useRef(onEscape)
  escape.current = onEscape
  useEffect(() => {
    // The panel mounts into the overlay layer a moment after opening, so wait for the element.
    if (!active || !el) return
    const before = document.activeElement as HTMLElement | null
    const first = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el
    first.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        escape.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const a = items[0]
      const z = items[items.length - 1]
      if (!el.contains(document.activeElement)) {
        e.preventDefault()
        a.focus()
      } else if (e.shiftKey && document.activeElement === a) {
        e.preventDefault()
        z.focus()
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault()
        a.focus()
      }
    }
    // On the document so Esc and Tab work even if focus slipped out (e.g. a clicked row re-rendered).
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      before?.focus?.({ preventScroll: true })
    }
  }, [el, active])
}
