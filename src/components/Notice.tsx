import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { TextButton } from './Button'
import { AgentLogo, ICON, type AgentId } from './icons'
import { Overlay, usePresence } from './Overlay'
import s from './Notice.module.css'

type BannerProps = {
  open: boolean
  onDismiss: () => void
  /** "request": a fake request arrived. "not-sent": something failed to send (Retry). */
  kind?: 'request' | 'not-sent'
  agent?: AgentId
  text: string
  sub?: string
  action: { label: string; onPress: () => void }
  /** Auto-dismiss after this many ms (0 = stay). */
  autoHideMs?: number
}

/** In-app banner: slides down from the top; swipe up to dismiss. Announced politely. */
export function Banner({ open, onDismiss, kind = 'request', agent, text, sub, action, autoHideMs = 6000 }: BannerProps) {
  const [mounted, visible] = usePresence(open, 320)
  const [drag, setDrag] = useState<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!open || !autoHideMs) return
    const t = window.setTimeout(onDismiss, autoHideMs)
    return () => window.clearTimeout(t)
  }, [open, autoHideMs, onDismiss])

  return (
    <Overlay>
      <div className={[s.bannerLayer, visible && open && s.visible, drag !== null && s.dragging].filter(Boolean).join(' ')} role="status" aria-live="polite">
        {mounted && (
          <div
            className={s.banner}
            style={{ '--drag': `${Math.min(0, drag ?? 0)}px` } as CSSProperties}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return
              startY.current = e.clientY
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => startY.current !== null && setDrag(e.clientY - startY.current)}
            onPointerUp={() => {
              const dy = drag ?? 0
              startY.current = null
              setDrag(null)
              if (dy < -24) onDismiss()
            }}
          >
            {kind === 'not-sent' ? (
              <TriangleAlert size={22} className={s.bannerIcon} {...ICON} />
            ) : (
              agent && <AgentLogo agent={agent} size={22} />
            )}
            <p className={s.bannerText}>
              {text}
              {sub && <span className={s.bannerSub}>{sub}</span>}
            </p>
            <TextButton onClick={action.onPress}>{action.label}</TextButton>
          </div>
        )}
      </div>
    </Overlay>
  )
}

type ToastProps = {
  open: boolean
  onDismiss: () => void
  children: ReactNode
  action?: { label: string; onPress: () => void }
  /** Success tick before the text ("Approved · running"). */
  success?: boolean
  autoHideMs?: number
  /** Distance from the bottom when there's no tab bar (e.g. above a bottom bar). */
  bottom?: string
}

/** Toast: short confirmation, optional Undo. Announced politely. */
export function Toast({ open, onDismiss, children, action, success, autoHideMs = 4000, bottom }: ToastProps) {
  const [mounted, visible] = usePresence(open, 320)
  useEffect(() => {
    if (!open || !autoHideMs) return
    const t = window.setTimeout(onDismiss, autoHideMs)
    return () => window.clearTimeout(t)
  }, [open, autoHideMs, onDismiss])

  return (
    <Overlay>
      <div
        className={[s.toastLayer, visible && open && s.visible].filter(Boolean).join(' ')}
        style={bottom ? ({ '--toast-bottom': bottom } as CSSProperties) : undefined}
        role="status"
        aria-live="polite"
      >
        {mounted && (
          <div className={[s.toast, !action && s.toastNoAction].filter(Boolean).join(' ')}>
            {success && <Check size={18} className={s.toastIcon} {...ICON} />}
            <span>{children}</span>
            {action && <TextButton onClick={action.onPress}>{action.label}</TextButton>}
          </div>
        )}
      </div>
    </Overlay>
  )
}
