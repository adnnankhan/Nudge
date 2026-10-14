import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Check, Plus } from 'lucide-react'
import { StatusDot, type DotTone } from './Chip'
import { ICON } from './icons'
import { Overlay, usePresence } from './Overlay'
import s from './Menu.module.css'

export type MenuComputer = { id: string; name: string; status: string; tone: DotTone }

type Props = {
  open: boolean
  onClose: () => void
  /** The switcher pill: the menu drops 8 px under it and focus returns to it. */
  anchor: React.RefObject<HTMLElement | null>
  id?: string
  computers: MenuComputer[]
  currentId: string
  onPick: (id: string) => void
  onAdd: () => void
  /** Components gallery only: shown open without taking focus. */
  inline?: boolean
}

/** Computer menu: computers with dot + status, tick on the current one, "Add a computer". */
export function ComputerMenu({ open, onClose, anchor, id, computers, currentId, onPick, onAdd, inline }: Props) {
  const [mounted, visible] = usePresence(open, 220)
  const menu = useRef<HTMLDivElement | null>(null)
  // The menu mounts inside the overlay host a moment after opening; measure once it is attached.
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 16 })

  useLayoutEffect(() => {
    if (!el || !anchor.current) return
    const host = el.offsetParent as HTMLElement | null
    const a = anchor.current.getBoundingClientRect()
    const h = host?.getBoundingClientRect() ?? { top: 0, left: 0 }
    setPos({ top: a.bottom - h.top + 8, left: a.left - h.left })
  }, [el, anchor])

  useEffect(() => {
    if (!open || !mounted || inline) return
    const items = () => [...(menu.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])]
    const current = items().find((n) => n.getAttribute('aria-checked') === 'true') ?? items()[0]
    current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      const list = items()
      const i = list.indexOf(document.activeElement as HTMLElement)
      if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault()
        onClose()
        anchor.current?.focus()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus()
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        list[e.key === 'Home' ? 0 : list.length - 1]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, mounted, onClose, anchor, inline])

  if (!mounted) return null

  return (
    <Overlay>
      <div className={[s.layer, visible && open && s.visible].filter(Boolean).join(' ')}>
        <div className={s.scrim} onClick={onClose} aria-hidden="true" />
        <div
          ref={(n) => {
            menu.current = n
            setEl(n)
          }}
          id={id}
          role="menu"
          aria-label="Computers"
          className={s.menu}
          style={{ top: pos.top, left: pos.left } as CSSProperties}
        >
          {computers.map((c) => (
            <button
              key={c.id}
              type="button"
              role="menuitemradio"
              aria-checked={c.id === currentId}
              className={s.item}
              onClick={() => {
                onPick(c.id)
                onClose()
              }}
            >
              <StatusDot tone={c.tone} />
              <span className={s.text}>
                <span className={s.name}>{c.name}</span>
                <span className={s.sub}>{c.status}</span>
              </span>
              {c.id === currentId && <Check size={20} className={s.check} {...ICON} />}
            </button>
          ))}
          <div className={s.divider} role="separator" />
          <button
            type="button"
            role="menuitem"
            className={[s.item, s.add].join(' ')}
            onClick={() => {
              onClose()
              onAdd()
            }}
          >
            <Plus size={20} {...ICON} />
            <span className={s.name}>Add a computer</span>
          </button>
        </div>
      </div>
    </Overlay>
  )
}
