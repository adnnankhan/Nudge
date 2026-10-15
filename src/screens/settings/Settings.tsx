import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import g$ from './Settings.module.css'
import { TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { ListGroup, ListRow } from '../../components/List'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { Sheet } from '../../components/Sheet'
import { ICON } from '../../components/icons'
import { useToast } from '../../app/feedback'
import { resetDemo, useStore } from '../../data/store'
import type { Settings as S } from '../../data/types'

const TIMEOUTS: S['timeoutMin'][] = [5, 10, 15, 30]

/** Settings — /settings (07-agents-settings.md) */
export function Settings() {
  const navigate = useNavigate()
  const st = useStore()
  const [sheet, setSheet] = useState<null | 'timeout' | 'signout'>(null)
  const close = () => setSheet(null)
  const set = st.setSettings

  return (
    <Screen>
      <TopBar title="Settings" onBack={() => navigate(-1)} heading />
      <div className={g$.groups}>
        <ListGroup header="Devices">
          <ListRow title="Paired phones" value={String(st.phones.length)} onPress={() => navigate('/settings/phones')} />
        </ListGroup>
        <ListGroup header="Approvals">
          <ListRow title="Time to answer" value={`${st.settings.timeoutMin} min`} onPress={() => setSheet('timeout')} />
          <ListRow title="AI explanation" toggle={{ checked: st.settings.aiExplanation, onChange: (v) => set({ aiExplanation: v }) }} />
        </ListGroup>
        <ListGroup header="Notifications">
          <ListRow title="Task finished" toggle={{ checked: st.settings.notifyFinished, onChange: (v) => set({ notifyFinished: v }) }} />
          <ListRow title="Task failed" toggle={{ checked: st.settings.notifyFailed, onChange: (v) => set({ notifyFailed: v }) }} />
        </ListGroup>
        <ListGroup header="Appearance">
          {/* Decision 3: off switches the whole app to Light instantly. */}
          <ListRow title="Dark mode" toggle={{ checked: st.theme === 'dark', onChange: (v) => st.setTheme(v ? 'dark' : 'light') }} />
        </ListGroup>
        <ListGroup header="Account">
          <ListRow title={st.email} />
          <ListRow title="Sign out" destructive onPress={() => setSheet('signout')} />
        </ListGroup>
      </div>
      <div className={g$.bottom} />

      <Sheet open={sheet === 'timeout'} onClose={close} title="Time to answer" description="If you don’t answer in time, the request goes back to your computer.">
        <OptionGroup label="Time to answer">
          {TIMEOUTS.map((m) => (
            <OptionRow
              key={m}
              title={`${m} minutes`}
              description={m === 10 ? 'Default' : undefined}
              selected={st.settings.timeoutMin === m}
              onSelect={() => {
                set({ timeoutMin: m })
                window.setTimeout(close, 180)
              }}
            />
          ))}
        </OptionGroup>
      </Sheet>

      <Sheet
        open={sheet === 'signout'}
        onClose={close}
        title="Sign out?"
        body="You won’t get requests on this phone until you sign in again. Your agents keep working."
        actions={
          <>
            {/* Signing out clears the prototype's saved state and starts again. */}
            <Button size="l" block variant="destructive" onClick={resetDemo}>
              Sign out
            </Button>
            <Button size="l" block variant="secondary" onClick={close}>
              Cancel
            </Button>
          </>
        }
      />
    </Screen>
  )
}

/** PairedPhones — /settings/phones */
export function PairedPhones() {
  const navigate = useNavigate()
  const toast = useToast()
  const st = useStore()
  const [removing, setRemoving] = useState<string | null>(null)
  const phone = st.phones.find((p) => p.id === removing)

  return (
    <Screen>
      <TopBar title="Paired phones" onBack={() => navigate(-1)} heading />
      <div className={g$.groups}>
        <ListGroup>
          {st.phones.map((p) => (
            <ListRow
              key={p.id}
              title={p.name}
              subtitle={p.detail}
              leading={<Smartphone size={24} {...ICON} />}
              trailing={
                p.current ? undefined : (
                  <TextButton aria-label={`Remove ${p.name}`} onClick={() => setRemoving(p.id)}>
                    Remove
                  </TextButton>
                )
              }
            />
          ))}
        </ListGroup>
      </div>
      <p className={s.foot}>Lost a phone? Remove it here, or from the helper on your computer. It stops working straight away.</p>

      <Sheet
        open={!!phone}
        onClose={() => setRemoving(null)}
        title={phone ? `Remove ${phone.name}?` : ''}
        body="It stops working straight away and can’t approve anything. To use it again, pair it again."
        actions={
          <>
            <Button
              size="l"
              block
              variant="destructive"
              onClick={() => {
                if (!phone) return
                st.removePhone(phone.id)
                setRemoving(null)
                toast({ text: `${phone.name} removed`, success: true })
              }}
            >
              Remove phone
            </Button>
            <Button size="l" block variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
          </>
        }
      />
    </Screen>
  )
}
