import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import n$ from './NewTask.module.css'
import { TabBar, TabSpacer, TopBar } from '../../components/Bars'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { TextArea, TextField } from '../../components/TextField'
import { InlineAlert } from '../../components/InlineAlert'
import { ListGroup, ListRow } from '../../components/List'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { AgentLogo, AGENT_NAMES, ICON, type AgentId } from '../../components/icons'
import { Folder } from 'lucide-react'
import { useToast } from '../../app/feedback'
import { useStore } from '../../data/store'
import { computerStatus } from '../../data/selectors'
import type { ComputerId } from '../../data/types'

/* The form is kept while you pick a folder on its own screen, and cleared after Start. */
type Draft = { computer: ComputerId | null; agent: AgentId; folder: string | null; instruction: string; safety: number }
const EMPTY: Draft = { computer: null, agent: 'claude', folder: null, instruction: '', safety: 0 }
const useDraft = create<Draft & { set: (d: Partial<Draft>) => void; reset: () => void }>((set) => ({
  ...EMPTY,
  set: (d) => set(d),
  reset: () => set(EMPTY),
}))

// 06-new-task.md
const SAFETY = [
  ['Ask me before every action', 'Safest when you’re away'],
  ['Allow file edits', 'Asks only before running commands'],
  ['Plan only', 'Makes a plan, changes nothing'],
] as const

const FOLDERS = [
  { name: 'my-app', path: 'C:\\Users\\you\\projects\\my-app' },
  { name: 'portfolio', path: 'C:\\Users\\you\\projects\\portfolio' },
  { name: 'api-server', path: 'C:\\Users\\you\\work\\api-server' },
]

const NO_PROJECT = 'No project found. Check the name, or open the project once on your computer.'
const CURSOR_NOTE = 'Cursor can’t start tasks from the phone'

/** NewTask — /new (tab: New task) */
export function NewTask() {
  const navigate = useNavigate()
  const toast = useToast()
  const location = useLocation()
  const st = useStore()
  const d = useDraft()
  const [sheet, setSheet] = useState<null | 'computer' | 'agent' | 'safety'>(null)
  const close = () => setSheet(null)
  const choose = (fn: () => void) => {
    fn()
    window.setTimeout(close, 180)
  }

  // Follow-up from SessionDone: same project; Cursor can't start tasks, so Claude Code.
  const followUp = (location.state as { followUp?: { agent: AgentId; project: string } } | null)?.followUp
  useEffect(() => {
    if (!followUp) return
    d.set({ agent: followUp.agent === 'cursor' ? 'claude' : followUp.agent, folder: followUp.project })
    navigate('.', { replace: true, state: null })
  }, [followUp]) // eslint-disable-line react-hooks/exhaustive-deps

  const computerId = d.computer ?? st.currentComputer
  const status = computerStatus(st, computerId)
  const offline = status.state === 'offline'
  const ready = !!d.folder && d.instruction.trim().length > 0

  const stateWord = { awake: 'Awake', asleep: 'Asleep', offline: 'Offline' }[status.state]

  return (
    <>
      <Screen>
        <h1 className={n$.title}>New task</h1>
        <div className={n$.form}>
          <FormField label="Computer" value={`${status.computer.name} · ${stateWord}`} onPress={() => setSheet('computer')} />
          <FormField label="Agent" value={AGENT_NAMES[d.agent]} note={CURSOR_NOTE} onPress={() => setSheet('agent')} />
          <FormField label="Project folder" value={d.folder ?? undefined} placeholder="Choose a folder" onPress={() => navigate('/new/folder')} />
          <TextArea label="Instruction" placeholder="What should the agent do?" value={d.instruction} onChange={(e) => d.set({ instruction: e.target.value })} />
          <FormField label="Safety" value={SAFETY[d.safety][0]} onPress={() => setSheet('safety')} />
        </div>
        <div className={n$.start}>
          {offline ? (
            // NewTaskStates: what you see instead of Start.
            <InlineAlert kind="error" live>{`${status.computer.name} is offline. Start a task when it’s back online.`}</InlineAlert>
          ) : (
            <Button
              size="l"
              block
              disabled={!ready}
              onClick={() => {
                st.startTask({ computerId, agent: d.agent, project: d.folder!, instruction: d.instruction.trim() })
                if (computerId !== st.currentComputer) st.setComputer(computerId)
                d.reset()
                toast({ text: 'Task started', success: true })
                navigate('/')
              }}
            >
              Start
            </Button>
          )}
        </div>
        <TabSpacer />
      </Screen>
      <TabBar />

      <Sheet open={sheet === 'computer'} onClose={close} title="Choose computer">
        <OptionGroup label="Choose computer">
          {st.computers.map((c) => {
            const cs = computerStatus(st, c.id)
            const desc = cs.state === 'awake' ? 'Awake' : cs.state === 'asleep' ? 'Asleep · wakes when the lid opens' : cs.menu
            return (
              <OptionRow
                key={c.id}
                title={c.name}
                description={desc}
                selected={computerId === c.id}
                disabled={c.id === 'mac2'}
                onSelect={() => choose(() => d.set({ computer: c.id }))}
              />
            )
          })}
        </OptionGroup>
      </Sheet>

      <Sheet open={sheet === 'agent'} onClose={close} title="Choose agent">
        <OptionGroup label="Choose agent">
          {(['claude', 'codex', 'cursor'] as const).map((a) => (
            <OptionRow
              key={a}
              title={AGENT_NAMES[a]}
              description={a === 'cursor' ? 'Can’t start tasks from the phone' : 'Ready'}
              leading={<AgentLogo agent={a} size={24} />}
              selected={d.agent === a}
              disabled={a === 'cursor'}
              onSelect={() => choose(() => d.set({ agent: a }))}
            />
          ))}
        </OptionGroup>
      </Sheet>

      <Sheet open={sheet === 'safety'} onClose={close} title="Safety" description="How much the agent can do without asking.">
        <OptionGroup label="Safety">
          {SAFETY.map(([t, desc], i) => (
            <OptionRow key={t} title={t} description={desc} selected={d.safety === i} onSelect={() => choose(() => d.set({ safety: i }))} />
          ))}
        </OptionGroup>
      </Sheet>
    </>
  )
}

/** FolderPicker — /new/folder */
export function FolderPicker() {
  const navigate = useNavigate()
  const set = useDraft((x) => x.set)
  const [q, setQ] = useState('')
  const found = FOLDERS.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <Screen>
      <TopBar title="Choose a folder" onBack={() => navigate(-1)} heading />
      <div className={n$.search}>
        <TextField
          label="Search projects"
          hideLabel
          placeholder="Search projects"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          trailing={<Search size={20} {...ICON} className={n$.searchIcon} />}
        />
      </div>
      <div className={s.section}>
        {found.length ? (
          <ListGroup header="Recent">
            {found.map((f) => (
              <ListRow
                key={f.name}
                title={f.name}
                subtitle={f.path}
                leading={<Folder size={22} {...ICON} />}
                onPress={() => {
                  set({ folder: f.name })
                  navigate(-1)
                }}
              />
            ))}
          </ListGroup>
        ) : (
          <InlineAlert kind="warning" live>
            {NO_PROJECT}
          </InlineAlert>
        )}
      </div>
    </Screen>
  )
}
