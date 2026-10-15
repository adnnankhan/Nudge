import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Plus } from 'lucide-react'
import { Screen } from '../Screen'
import { ComputerSwitcher, HomeHeader, TabBar, TabSpacer } from '../../components/Bars'
import { ComputerMenu } from '../../components/ComputerMenu'
import { Sheet } from '../../components/Sheet'
import { ApproveAllBar, SectionTitle, SummaryCard } from '../../components/Summary'
import { ApprovalCard, PlanCard, QuestionCard, SessionRow, type SessionStatus } from '../../components/RequestCard'
import { InlineAlert } from '../../components/InlineAlert'
import { EmptyLine, EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/Button'
import { ICON, Spinner } from '../../components/icons'
import { useStore } from '../../data/store'
import { useNow } from '../../data/simulation'
import { clockTime, elapsed, minutesAgo } from '../../data/format'
import { computerStatus, needsYou, sessionChip, sessionsFor, sessionText } from '../../data/selectors'
import type { ComputerId, Request, Session } from '../../data/types'
import { openDemoMenu } from '../demo/openDemoMenu'
import { useRequestActions } from '../requests/useRequestActions'
import { Collapse } from './Collapse'
import { endRun, startRun } from '../../data/reviewRun'
import s from './Home.module.css'
import screen from '../Screen.module.css'

const PULL_TRIGGER = 64

/** Home (02-home.md): header · switcher · summary · Needs you · Working · Completed today. */
export function Home() {
  const navigate = useNavigate()
  const now = useNow()
  const st = useStore()
  const { currentComputer, settings, offline } = st
  const status = computerStatus(st, currentComputer)

  // Reaching Home starts the arrival timer (first request 25 s later).
  const startArrivals = useStore((x) => x.startArrivals)
  useEffect(() => startArrivals(), [startArrivals])

  // Cards collapse first, then the data changes (design-system §7).
  const [leaving, setLeaving] = useState<Record<string, () => void>>({})
  const onGone = useCallback((id: string, commit: () => void) => setLeaving((l) => ({ ...l, [id]: commit })), [])
  const actions = useRequestActions({ onGone })
  const [sentIndex, setSentIndex] = useState<Record<string, number>>({})

  const needs = needsYou(st, currentComputer)
  const { working, paused, completed, all } = sessionsFor(st, currentComputer)
  const empty = needs.length === 0 && all.length === 0

  // Computer switcher + menu
  const pill = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState(false)
  const computers = useMemo(
    () => st.computers.map((c) => ({ id: c.id, name: c.name, status: computerStatus(st, c.id).menu, tone: computerStatus(st, c.id).tone })),
    [st],
  )

  // Warnings (HomeWarnings): offline demo shows all three; Mac 2 is offline; notifications off.
  const alerts: { kind: 'warning' | 'error' | 'info'; text: string; action?: { label: string; onPress: () => void } }[] = []
  const notificationsAlert = {
    kind: 'warning' as const,
    text: 'Notifications are off. You’ll miss requests.',
    action: {
      label: 'Turn on',
      onPress: async () => {
        try {
          if ('Notification' in window) await Notification.requestPermission()
        } catch {
          /* unsupported: just continue */
        }
        st.setSettings({ notificationsOn: true })
      },
    },
  }
  if (offline && currentComputer === 'win') {
    if (settings.notificationsOn !== true) alerts.push(notificationsAlert)
    alerts.push({ kind: 'error', text: 'Windows PC is offline · last seen 2 min ago' })
    alerts.push({ kind: 'info', text: 'Codex disconnected after an update. Reconnect on your computer.' })
  } else {
    if (settings.notificationsOn === false) alerts.push(notificationsAlert)
    if (status.state === 'offline') alerts.push({ kind: 'error', text: `${status.computer.name} is offline · last seen ${status.computer.lastSeen ?? '1 day ago'}` })
  }

  // Pull down to refresh (fake: spinner 0.6 s)
  const scroller = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = (scroller.current?.scrollTop ?? 1) <= 0 ? e.touches[0].clientY : null
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || refreshing) return
    const dy = e.touches[0].clientY - startY.current
    setPull(dy > 0 ? Math.min(96, dy * 0.5) : 0)
  }
  const onTouchEnd = () => {
    if (pull >= PULL_TRIGGER * 0.75) {
      setRefreshing(true)
      setPull(48)
      window.setTimeout(() => {
        setRefreshing(false)
        setPull(0)
      }, 600)
    } else setPull(0)
    startY.current = null
  }

  // Opening a request starts a review run so "x of y" holds steady (data/reviewRun.ts).
  useEffect(() => endRun(), [])
  // A card opens its task thread (decision 13); high-risk Review opens the request to hold-approve.
  const openThread = (r: Request) => navigate(`/task/${r.taskId}`)
  const openRequest = (r: Request) => {
    startRun(needs.map((x) => x.id))
    navigate(`/request/${r.id}`)
  }
  const openSession = (x: Session) => navigate(`/task/${x.id}`)
  const lowRisk = needs.filter((r) => r.kind === 'approval' && r.risk === 'low')

  const card = (r: Request) => {
    const common = { agent: r.agent, project: r.project, time: minutesAgo(r, now), timeoutMin: settings.timeoutMin, onOpen: () => openThread(r) }
    const alert = actions.alertFor(r)
    if (r.kind === 'approval')
      return (
        <ApprovalCard
          {...common}
          risk={r.risk}
          title={r.title}
          command={r.command}
          alert={alert}
          onReview={() => openRequest(r)}
          onApprove={() => actions.approve(r)}
          onDeny={() => actions.deny(r)}
        />
      )
    if (r.kind === 'question')
      return (
        <QuestionCard
          {...common}
          question={r.title}
          options={r.options}
          alert={alert}
          sentIndex={sentIndex[r.id]}
          onAnswer={(a) => {
            const i = r.options.indexOf(a)
            if (i >= 0 && !useStore.getState().offline) {
              // Short "Sent" tick on the option, then the card collapses.
              setSentIndex((x) => ({ ...x, [r.id]: i }))
              window.setTimeout(() => actions.answer(r, a), 600)
            } else actions.answer(r, a)
          }}
        />
      )
    return (
      <PlanCard
        {...common}
        title={r.title}
        summary={r.summary}
        alert={alert}
        onApprove={() => actions.approve(r)}
        onAskChanges={() => navigate(`/request/${r.id}?ask=1`)}
      />
    )
  }

  const row = (x: Session, time: string) => (
    <SessionRow key={x.id} agent={x.agent} project={x.project} time={time} status={sessionChip(x) as SessionStatus} text={sessionText(x)} onPress={() => openSession(x)} />
  )

  const pausedSection = paused.length > 0 && (
    <section aria-labelledby="paused">
      <SectionTitle id="paused" title="Paused" count={paused.length} />
      <div className={screen.stack}>{paused.map((x) => row(x, elapsed(x, now)))}</div>
    </section>
  )

  return (
    <>
    <Screen ref={scroller} scrollKey="home">
      <div
        className={s.pullArea}
        style={{ transform: pull ? `translateY(${pull}px)` : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={s.pullSpinner} style={{ opacity: pull ? Math.min(1, pull / PULL_TRIGGER) : 0 }} aria-hidden={!refreshing}>
          <Spinner size={22} />
        </div>

        <HomeHeader onSettings={() => navigate('/settings')} onLongPressMark={openDemoMenu} />
        <div ref={pill} className={s.pill}>
          <ComputerSwitcher
            name={status.computer.name}
            state={status.state}
            tone={status.tone}
            expanded={menu}
            controls="computer-menu"
            onPress={() => setMenu((m) => !m)}
          />
        </div>

        {alerts.length > 0 && (
          <div className={s.alerts}>
            {alerts.map((a) => (
              <InlineAlert key={a.text} kind={a.kind} action={a.action}>
                {a.text}
              </InlineAlert>
            ))}
          </div>
        )}

        {/* HomeWarnings shows the alerts in place of the summary card. */}
        {!(offline && currentComputer === 'win') && (
          <div className={s.summary}>
            <SummaryCard waiting={needs.length} working={working.length + paused.length} completed={completed.length} />
          </div>
        )}

        {empty ? (
          <EmptyState
            title="No sessions yet"
            body="Start a task here, or start one on your computer and it will show up."
            action={
              <Button icon={<Plus size={20} {...ICON} />} onClick={() => navigate('/new')}>
                New task
              </Button>
            }
          />
        ) : (
          <>
            {/* HomeWarnings: while the computer is offline, what is paused comes first. */}
            {offline && pausedSection}
            {(needs.length > 0 || !offline) && (
              <section aria-labelledby="needs-you">
                <SectionTitle id="needs-you" title="Needs you" count={needs.length} />
                {needs.length === 0 ? (
                  <EmptyLine>You’re all caught up</EmptyLine>
                ) : (
                  <div className={screen.stack}>
                    {lowRisk.length >= 2 && (
                      <ApproveAllBar count={lowRisk.length} onApprove={() => actions.approveAll(lowRisk)} />
                    )}
                    {needs.map((r) => (
                      <Collapse
                        key={r.id}
                        leaving={!!leaving[r.id]}
                        onDone={() => {
                          leaving[r.id]?.()
                          setLeaving(({ [r.id]: _, ...rest }) => rest)
                        }}
                      >
                        {card(r)}
                      </Collapse>
                    ))}
                  </div>
                )}
              </section>
            )}

            {working.length > 0 && (
              <section aria-labelledby="working">
                <SectionTitle id="working" title="Working" count={working.length} />
                <div className={screen.stack}>{working.map((x) => row(x, elapsed(x, now)))}</div>
              </section>
            )}

            {!offline && pausedSection}
            {completed.length > 0 && (
              <section aria-labelledby="completed">
                <SectionTitle id="completed" title="Completed today" count={completed.length} />
                <div className={screen.stack}>{completed.map((x) => row(x, clockTime(x)))}</div>
                <p className={s.clears}>Completed sessions clear after 24 hours</p>
              </section>
            )}
          </>
        )}
        <TabSpacer />
      </div>
    </Screen>
      {/* Outside the scrolling screen so it stays put while content scrolls under it. */}
      <TabBar />
      <ComputerMenu
        open={menu}
        onClose={() => setMenu(false)}
        anchor={pill}
        id="computer-menu"
        computers={computers}
        currentId={currentComputer}
        onPick={(id) => st.setComputer(id as ComputerId)}
        onAdd={() => navigate('/computers/add')}
      />
      {/* KeepAwake (01-onboarding.md): once, right after setup. Either button closes it. */}
      <Sheet
        open={st.showKeepAwake}
        onClose={() => st.answerKeepAwake(false)}
        icon={<Moon size={24} {...ICON} />}
        title="Keep Windows PC awake while agents work?"
        body="This stops your computer from going to sleep on its own, so sessions don’t drop."
        note="Closing the laptop lid or pressing the power button will still put it to sleep."
        actions={
          <>
            <Button size="l" block onClick={() => st.answerKeepAwake(true)}>
              Keep awake
            </Button>
            <Button size="l" block variant="secondary" onClick={() => st.answerKeepAwake(false)}>
              Not now
            </Button>
          </>
        }
        footnote="You can change this anytime in Agents."
      />
    </>
  )
}
