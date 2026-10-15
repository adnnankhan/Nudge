import { useNavigate } from 'react-router-dom'
import { Info, Square } from 'lucide-react'
import { Button } from '../../components/Button'
import { ListGroup, ListRow } from '../../components/List'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { AGENT_NAMES, ICON, type AgentId } from '../../components/icons'
import { useStore } from '../../data/store'
import { ASK_ME, MODELS } from '../../data/library'
import type { AskMe, Session } from '../../data/types'
import t$ from './Task.module.css'

export type TaskSheet = null | 'menu' | 'model' | 'intensity' | 'askme' | 'stop' | 'takeover' | 'cursor'

const ASK_KEYS = Object.keys(ASK_ME) as AskMe[]

/** Ask me sheet (09-chat-and-tasks.md): when the agent checks with you. */
export function AskMeSheet({ open, onClose, agent, value, onPick }: { open: boolean; onClose: () => void; agent: AgentId; value: AskMe; onPick: (v: AskMe) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Ask me" description={`When should ${AGENT_NAMES[agent]} check with you?`}>
      <OptionGroup label="Ask me">
        {ASK_KEYS.map((k) => (
          <OptionRow
            key={k}
            title={ASK_ME[k].title}
            description={ASK_ME[k].description}
            selected={value === k}
            onSelect={() => {
              onPick(k)
              window.setTimeout(onClose, 180)
            }}
          />
        ))}
      </OptionGroup>
    </Sheet>
  )
}

/**
 * The thread's ••• Task menu (Chat-task-menu.jpg): Model · Intensity · Ask me · Stop task, and the
 * sheets from 05-session-control.md that it opens (StopConfirm, TakeOverConfirm, the Cursor sheet).
 */
export function TaskMenu({ x, sheet, setSheet }: { x: Session; sheet: TaskSheet; setSheet: (s: TaskSheet) => void }) {
  const navigate = useNavigate()
  const st = useStore()
  const cursor = x.origin === 'cursor'
  const terminal = x.origin === 'terminal'
  const running = x.status === 'working' || x.status === 'paused' || x.status === 'waiting'
  const close = () => setSheet(null)
  const back = () => setSheet('menu')

  // Changing model or intensity on a terminal session moves control to the phone first.
  const pick = (fn: () => void) => {
    if (terminal) st.takeOver(x.id)
    fn()
    window.setTimeout(back, 180)
  }
  const stop = () => {
    st.stopSession(x.id)
    close()
    navigate(`/session/${x.id}/stopped`)
  }

  return (
    <>
      <Sheet open={sheet === 'menu'} onClose={close} title="Task">
        <ListGroup className={t$.menuList}>
          {cursor ? (
            <>
              <ListRow title="Model" value="Set in Cursor" />
              <ListRow title="Intensity" value="Set in Cursor" />
            </>
          ) : (
            <>
              <ListRow title="Model" value={MODELS[x.model]} onPress={() => setSheet('model')} />
              <ListRow title="Intensity" value={x.intensity} onPress={() => setSheet('intensity')} />
              <ListRow title="Ask me" value={ASK_ME[x.askMe].short} onPress={() => setSheet('askme')} />
            </>
          )}
        </ListGroup>
        {running && (
          <Button
            size="l"
            block
            variant="destructive"
            className={t$.stop}
            icon={<Square size={14} {...ICON} strokeWidth={2.25} />}
            onClick={() => setSheet(cursor ? 'cursor' : terminal ? 'takeover' : 'stop')}
          >
            Stop task
          </Button>
        )}
      </Sheet>

      <Sheet open={sheet === 'model'} onClose={back} title="Model" description="Applies from the agent’s next step.">
        <OptionGroup label="Model">
          <OptionRow title="Default" description="Set on your computer" selected={x.model === 0} onSelect={() => pick(() => st.setModel(x.id, 0))} />
          <OptionRow title="[Model name]" description="[Short description]" selected={x.model === 1} onSelect={() => pick(() => st.setModel(x.id, 1))} />
          <OptionRow title="[Model name]" description="[Short description]" selected={x.model === 2} onSelect={() => pick(() => st.setModel(x.id, 2))} />
        </OptionGroup>
      </Sheet>

      <Sheet open={sheet === 'intensity'} onClose={back} title="Intensity" description="How much the agent thinks before acting.">
        <OptionGroup label="Intensity">
          {(
            [
              ['Low', 'Faster, uses less'],
              ['Medium', 'Balanced'],
              ['High', 'Slower, more careful'],
            ] as const
          ).map(([v, d]) => (
            <OptionRow key={v} title={v} description={d} selected={x.intensity === v} onSelect={() => pick(() => st.setIntensity(x.id, v))} />
          ))}
        </OptionGroup>
      </Sheet>

      <AskMeSheet open={sheet === 'askme'} onClose={back} agent={x.agent} value={x.askMe} onPick={(v) => st.setAskMe(x.id, v)} />

      <Sheet
        open={sheet === 'stop'}
        onClose={close}
        title="Stop this session?"
        body="5 files were already changed. They’ll stay changed until you undo them."
        actions={
          <>
            <Button size="l" block onClick={stop}>
              Stop session
            </Button>
            <Button size="l" block variant="secondary" onClick={close}>
              Keep going
            </Button>
          </>
        }
      />

      <Sheet
        open={sheet === 'takeover'}
        onClose={close}
        title="Stop this session?"
        body="It stops in your terminal and continues from your phone, in the same conversation."
        actions={
          <>
            <Button size="l" block onClick={stop}>
              Stop
            </Button>
            <Button size="l" block variant="secondary" onClick={close}>
              Cancel
            </Button>
          </>
        }
      />

      <Sheet
        open={sheet === 'cursor'}
        onClose={close}
        icon={<Info size={24} {...ICON} />}
        title="Can’t stop Cursor from the phone"
        body="Cursor runs inside its own editor, so it can only be stopped there. You can still approve its requests here."
        actions={
          <Button size="l" block onClick={close}>
            OK
          </Button>
        }
      />
    </>
  )
}
