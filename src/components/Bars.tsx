import { useRef, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, House, Laptop, Plus, SlidersHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { IconButton } from './Button'
import { StatusDot, type DotTone } from './Chip'
import { AgentLogo, HouseFilled, ICON, NudgeMark, type AgentId } from './icons'
import s from './Bars.module.css'

/* ---------- Home header ---------- */

type HeaderProps = {
  onSettings: () => void
  /** Long-press on the mark opens the demo menu (flows.md). */
  onLongPressMark?: () => void
}

/** Home header: Nudge mark + "Nudge" (decision 1) · Settings icon button. */
export function HomeHeader({ onSettings, onLongPressMark }: HeaderProps) {
  const timer = useRef<number | undefined>(undefined)
  const startPress = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onLongPressMark?.(), 600)
  }
  const endPress = () => window.clearTimeout(timer.current)
  return (
    <header className={s.header}>
      <h1
        className={s.brand}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        <NudgeMark size={32} />
        Nudge
      </h1>
      <IconButton label="Settings" onClick={onSettings}>
        <SlidersHorizontal size={20} {...ICON} />
      </IconButton>
    </header>
  )
}

type SwitcherProps = {
  name: string
  /** "awake" · "asleep" · "offline" — shown as "· awake". */
  state: string
  tone: DotTone
  expanded: boolean
  onPress: () => void
  controls?: string
}

/** Computer switcher pill: status dot + name + "· awake" + chevron. */
export function ComputerSwitcher({ name, state, tone, expanded, onPress, controls }: SwitcherProps) {
  return (
    <button
      type="button"
      className={s.switcher}
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onPress}
    >
      <StatusDot tone={tone} />
      <span className={s.switcherName}>{name}</span>
      <span className={s.switcherState}>· {state}</span>
      <ChevronDown size={16} className={s.switcherChevron} {...ICON} />
    </button>
  )
}

/* ---------- Top bar ---------- */

type TopBarProps = {
  title?: string
  agent?: AgentId
  /** Trailing mono count ("1 of 3") or an action. */
  end?: ReactNode
  onBack?: () => void
  /** The title is the screen's heading (Settings, Paired phones). Detail screens have their own h1. */
  heading?: boolean
}

/** Top bar: back arrow (no background) · centred title (optional agent logo) · trailing count/action. */
export function TopBar({ title, agent, end, onBack, heading }: TopBarProps) {
  const Title = heading ? 'h1' : 'span'
  return (
    <div className={s.topbar}>
      {onBack ? (
        <IconButton plain label="Back" onClick={onBack} className={s.back}>
          <ChevronLeft size={28} {...ICON} />
        </IconButton>
      ) : (
        <span />
      )}
      <div className={s.topTitle}>
        {agent && <AgentLogo agent={agent} size={18} />}
        {title && <Title className={s.topHeading}>{title}</Title>}
      </div>
      <div className={s.topEnd}>{end}</div>
    </div>
  )
}

/* ---------- Bottom action bar ---------- */

/** Bottom action bar: one · two (secondary + primary, primary wider) · stacked. */
export function BottomBar({ layout = 'one', children }: { layout?: 'one' | 'two' | 'stacked'; children: ReactNode }) {
  return (
    <div className={[s.bottombar, layout === 'two' && s.two, layout === 'stacked' && s.stacked].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

/* ---------- Tab bar ---------- */

/** Floating tab bar: Home · New task (solid disc) · Agents. Active tab = bubble + 600 label + filled icon. */
export function TabBar({ active }: { /** Force the active tab (dev comparisons). */ active?: 'home' | 'agents' | 'none' } = {}) {
  const cls = (tab: 'home' | 'agents') => ({ isActive }: { isActive: boolean }) =>
    [s.tab, (active ? active === tab : isActive) && s.active].filter(Boolean).join(' ')
  return (
    <nav className={s.tabbar} aria-label="Tabs">
      <NavLink to="/" end className={cls('home')}>
        {({ isActive }) => (
          <>
            {(active ? active === 'home' : isActive) ? <HouseFilled size={22} /> : <House size={22} {...ICON} />}
            Home
          </>
        )}
      </NavLink>
      <NavLink to="/new" className={[s.tab, s.tabNew].join(' ')}>
        <span className={s.newDisc}>
          <Plus size={20} {...ICON} strokeWidth={2} />
        </span>
        New task
      </NavLink>
      <NavLink to="/agents" className={cls('agents')}>
        <Laptop size={22} {...ICON} />
        Agents
      </NavLink>
    </nav>
  )
}

/** Put at the end of a scrolling screen that shows the tab bar. */
export function TabSpacer() {
  return <div className={s.tabSpacer} aria-hidden="true" />
}
