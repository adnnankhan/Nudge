import { useCallback, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Overlay, useFocusTrap, useInertBackground, usePresence } from './Overlay'
import s from './Sheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  /** Footnote-size line under the title (pickers: "Applies from the agent's next step."). */
  description?: string
  /** Body-size paragraph under the title (confirm sheets). */
  body?: string
  children?: ReactNode
  /** Buttons, stacked full width. */
  actions?: ReactNode
  /** Footnote after the actions. */
  footnote?: string
  /** Extra footnote between body and actions (KeepAwake). */
  note?: string
  centered?: boolean
  /** Picker sheets close when an option is picked; others (Face ID) can't be dragged away. */
  dismissible?: boolean
  /** Components gallery only: shown open in place, without trapping focus. */
  inline?: boolean
}

const CLOSE_DISTANCE = 90

/** Bottom sheet: handle, title, body, buttons. Drag down, scrim tap or Esc closes it. */
export function Sheet({
  open,
  onClose,
  title,
  icon,
  description,
  body,
  children,
  actions,
  footnote,
  note,
  centered,
  dismissible = true,
  inline,
}: Props) {
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const [mounted, visible] = usePresence(open, 320)
  const [drag, setDrag] = useState<number | null>(null)
  const start = useRef<{ y: number; t: number; id: number } | null>(null)
  const close = useCallback(() => {
    if (dismissible) onClose()
  }, [dismissible, onClose])

  useInertBackground(mounted && open && !inline)
  // Esc always closes (Face ID: Esc = Cancel); drag and scrim only when dismissible.
  useFocusTrap(panel, mounted && open && !inline, onClose)

  if (!mounted) return null

  const onPointerDown = (e: React.PointerEvent) => {
    if (!dismissible || (panel.current?.scrollTop ?? 0) > 0) return
    start.current = { y: e.clientY, t: performance.now(), id: e.pointerId }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const dy = e.clientY - start.current.y
    if (drag === null && dy > 6) panel.current?.setPointerCapture(start.current.id)
    if (dy > 6 || drag !== null) setDrag(Math.max(0, dy))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return
    const dy = e.clientY - start.current.y
    const v = dy / Math.max(1, performance.now() - start.current.t)
    start.current = null
    setDrag(null)
    if (dy > CLOSE_DISTANCE || (dy > 30 && v > 0.6)) onClose()
  }

  return (
    <Overlay>
      <div className={[s.layer, visible && open && s.visible, drag !== null && s.dragging].filter(Boolean).join(' ')}>
        <div className={s.scrim} onClick={close} aria-hidden="true" />
        <div
          ref={panel}
          role="dialog"
          aria-modal={inline ? undefined : true}
          aria-labelledby={`${id}-t`}
          aria-describedby={body || description ? `${id}-d` : undefined}
          tabIndex={-1}
          className={[s.panel, centered && s.center].filter(Boolean).join(' ')}
          style={{ '--drag': `${drag ?? 0}px` } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {dismissible && <div className={s.handle} aria-hidden="true" />}
          <div className={s.head}>
            {icon && <span className={s.headIcon}>{icon}</span>}
            <h2 id={`${id}-t`} className={s.title}>
              {title}
            </h2>
          </div>
          {description && (
            <p id={`${id}-d`} className={s.desc}>
              {description}
            </p>
          )}
          {body && (
            <p id={`${id}-d`} className={s.body}>
              {body}
            </p>
          )}
          {note && <p className={s.desc}>{note}</p>}
          {children && <div className={s.content}>{children}</div>}
          {actions && <div className={s.actions}>{actions}</div>}
          {footnote && <p className={s.foot}>{footnote}</p>}
        </div>
      </div>
    </Overlay>
  )
}
