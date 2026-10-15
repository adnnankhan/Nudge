import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import n$ from './NewTask.module.css'
import { TabBar, TabSpacer } from '../../components/Bars'
import { AgentTile, AskMeChip, ChatTopBar, Composer } from '../../components/Chat'
import { SectionTitle } from '../../components/Summary'
import { InlineAlert } from '../../components/InlineAlert'
import { ListGroup, ListRow } from '../../components/List'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { AgentLogo, AGENT_NAMES, ICON, type AgentId } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { FIRST_DEFAULTS, useStore } from '../../data/store'
import { computerStatus } from '../../data/selectors'
import { ASK_ME, FOLDERS, SUGGESTIONS } from '../../data/library'
import type { AskMe, ComputerId } from '../../data/types'
import { AskMeSheet } from '../task/TaskMenu'
import { useBack } from '../requests/RequestScreens'
import t$ from '../task/Task.module.css'

const AGENTS: AgentId[] = ['claude', 'codex', 'cursor']
const CURSOR_NOTE = 'Cursor can’t start tasks from the phone'

/** NewTask — /new (tab: New task). Agent tiles in one card + Recent (ref NewTask-agents.jpg). */
export function NewTask() {
  const navigate = useNavigate()
  const toast = useToast()
  const sessions = useStore((x) => x.sessions)
  const recentIds = useStore((x) => x.recentTasks)
  const recent = recentIds.flatMap((id) => sessions.filter((t) => t.id === id)).slice(0, 3)

  return (
    <>
      <Screen>
        <h1 className={n$.title}>New task</h1>
        <section className={n$.who} aria-labelledby="who">
          <h2 id="who" className={n$.whoTitle}>
            Who should do it?
          </h2>
          <div className={n$.tiles}>
            {AGENTS.map((a) => (
              <AgentTile
                key={a}
                agent={a}
                status={a === 'cursor' ? 'Start in Cursor' : 'Ready'}
                disabled={a === 'cursor'}
                onPress={() => (a === 'cursor' ? toast({ text: CURSOR_NOTE }) : navigate(`/new/${a}`))}
              />
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent" className={n$.recent}>
            <SectionTitle id="recent" title="Recent" />
            <div className={n$.rows}>
              {recent.map((t) => (
                <button key={t.id} type="button" className={n$.row} onClick={() => navigate(`/task/${t.id}`)}>
                  <AgentLogo agent={t.agent} size={22} />
                  <span className={n$.rowText}>
                    <span className={n$.rowTitle}>{t.taskTitle}</span>
                    <span className={n$.rowProject}>{t.project}</span>
                  </span>
                  <ChevronRight size={20} className={n$.chevron} {...ICON} />
                </button>
              ))}
            </div>
          </section>
        )}
        <TabSpacer />
      </Screen>
      <TabBar />
    </>
  )
}

/** New task chat — /new/:agent (refs NewTask-chat.jpg, AskMe-sheet.jpg). */
export function NewTaskChat() {
  const { agent } = useParams()
  if (agent !== 'claude' && agent !== 'codex') return <Navigate to="/new" replace />
  return <NewChat key={agent} agent={agent} />
}

function NewChat({ agent }: { agent: AgentId }) {
  const navigate = useNavigate()
  const back = useBack()
  const toast = useToast()
  const st = useStore()
  // Defaults: this agent's last project, computer and Ask-me setting (first time: my-app · Windows PC · every action).
  const start = st.taskDefaults[agent] ?? FIRST_DEFAULTS
  const [project, setProject] = useState(start.project)
  const [computerId, setComputerId] = useState<ComputerId>(start.computerId)
  const [askMe, setAskMe] = useState<AskMe>(start.askMe)
  const [text, setText] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [sheet, setSheet] = useState<null | 'context' | 'askme' | 'agent' | 'menu'>(null)
  const close = () => setSheet(null)
  const name = AGENT_NAMES[agent]

  const status = computerStatus(st, computerId)
  const offline = status.state === 'offline'
  const where = `${project} · ${status.computer.name}${offline ? ' · offline' : ''}`

  const send = () => {
    const instruction = text.trim()
    if (!instruction) return
    if (offline) return setBlocked(true)
    const t = st.startTask({ computerId, agent, project, instruction, askMe })
    if (computerId !== st.currentComputer) st.setComputer(computerId)
    toast({ text: 'Task started', success: true })
    navigate(`/task/${t.id}`, { replace: true })
  }

  return (
    <>
      <Screen className={t$.chat}>
        <ChatTopBar
          agent={agent}
          sub="New task"
          agentLabel={`${name}, new task. Choose agent`}
          onBack={back}
          onAgent={() => setSheet('agent')}
          onMore={() => setSheet('menu')}
        />
        <div className={n$.empty}>
          <AgentLogo agent={agent} size={40} />
          <h1 className={n$.ask}>What should {name} do?</h1>
          <button type="button" className={n$.where} onClick={() => setSheet('context')}>
            {where}
            <ChevronDown size={16} {...ICON} />
          </button>
          <p className={n$.whereNote}>Last used project. Tap to change.</p>
        </div>
        <div className={n$.suggestions}>
          {SUGGESTIONS.map((t) => (
            <button key={t} type="button" className={n$.suggestion} onClick={() => setText(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className={s.fill} />
        <Composer
          placeholder={`Message ${name}…`}
          value={text}
          onChange={(v) => {
            setText(v)
            setBlocked(false)
          }}
          onSend={send}
          onPlus={() => setSheet('context')}
          chip={<AskMeChip label={ASK_ME[askMe].chip} onPress={() => setSheet('askme')} />}
          alert={
            blocked && (
              <InlineAlert kind="error" live>
                {`${status.computer.name} is offline. Start a task when it’s back online.`}
              </InlineAlert>
            )
          }
        />
      </Screen>

      <AskMeSheet open={sheet === 'askme'} onClose={close} agent={agent} value={askMe} onPick={setAskMe} />

      <Sheet open={sheet === 'menu'} onClose={close} title="Task">
        <ListGroup>
          <ListRow title="Project folder" value={project} onPress={() => setSheet('context')} />
          <ListRow title="Computer" value={status.computer.name} onPress={() => setSheet('context')} />
          <ListRow title="Ask me" value={ASK_ME[askMe].short} onPress={() => setSheet('askme')} />
        </ListGroup>
      </Sheet>

      <Sheet open={sheet === 'agent'} onClose={close} title="Choose agent">
        <OptionGroup label="Choose agent">
          {AGENTS.map((a) => (
            <OptionRow
              key={a}
              title={AGENT_NAMES[a]}
              description={a === 'cursor' ? 'Can’t start tasks from the phone' : 'Ready'}
              leading={<AgentLogo agent={a} size={24} />}
              selected={agent === a}
              disabled={a === 'cursor'}
              onSelect={() => {
                close()
                if (a !== agent) window.setTimeout(() => navigate(`/new/${a}`, { replace: true }), 180)
              }}
            />
          ))}
        </OptionGroup>
      </Sheet>

      {/* Change sheet: FolderPicker list + ChooseComputer (06-new-task.md). */}
      <Sheet open={sheet === 'context'} onClose={close} title="Choose a folder">
        <OptionGroup label="Choose a folder">
          {FOLDERS.map((f) => (
            <OptionRow
              key={f.name}
              title={f.name}
              description={f.path}
              leading={<Folder size={22} {...ICON} />}
              selected={project === f.name}
              onSelect={() => setProject(f.name)}
            />
          ))}
        </OptionGroup>
        <h3 className={n$.sheetLabel}>Choose computer</h3>
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
                onSelect={() => {
                  setComputerId(c.id)
                  setBlocked(false)
                  window.setTimeout(close, 180)
                }}
              />
            )
          })}
        </OptionGroup>
      </Sheet>
    </>
  )
}
