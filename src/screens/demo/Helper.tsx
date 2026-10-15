import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Minus, Smartphone, X } from 'lucide-react'
import { Button, TextButton } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { InlineAlert } from '../../components/InlineAlert'
import { ListGroup, ListRow } from '../../components/List'
import { Toggle } from '../../components/Toggle'
import { AgentLogo, AGENT_NAMES, ICON, NudgeMark, type AgentId } from '../../components/icons'
import { useStore } from '../../data/store'
import qrUrl from '../../app/qr-app.svg'
import h from './Helper.module.css'

const W = 560
const H = 680
const CODE_SECONDS = 4 * 60 + 32

/** Scale the 560×680 window down to fit small screens (08-…: "On phones show it scaled to fit"). */
function useFit() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 24) / W, (window.innerHeight - 24) / H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

/**
 * Computer helper (desktop) — /demo/helper/:step (pair · connect · status). A demo of the small app
 * on the computer, so people testing the prototype can see the whole story.
 */
export function Helper() {
  const { step = 'pair' } = useParams()
  const navigate = useNavigate()
  const scale = useFit()

  return (
    <main className={h.desk}>
      <div className={h.fit} style={{ width: W * scale, height: H * scale }}>
        <section className={h.window} style={{ transform: `scale(${scale})` }} aria-label="Nudge helper · Windows PC">
          <header className={h.titlebar}>
            <NudgeMark size={18} />
            <span className={h.appName}>Nudge helper</span>
            <span className={h.machine}>· Windows PC</span>
            <span className={h.winButtons}>
              <Minus size={18} {...ICON} className={h.minimize} />
              <button type="button" className={h.close} aria-label="Close" onClick={() => navigate('/')}>
                <X size={18} {...ICON} />
              </button>
            </span>
          </header>
          <div className={h.body}>
            {step === 'connect' ? <Connect /> : step === 'status' ? <Status /> : <Pair />}
          </div>
        </section>
      </div>
    </main>
  )
}

function Pair() {
  const [left, setLeft] = useState(CODE_SECONDS)
  const [code, setCode] = useState('482 917')
  useEffect(() => {
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1
        // Time's up: a new code, and the clock starts again.
        const n = String(Math.floor(100000 + Math.random() * 900000))
        setCode(`${n.slice(0, 3)} ${n.slice(3)}`)
        return 5 * 60
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [])
  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  return (
    <>
      <h1 className={h.title}>Pair your phone</h1>
      <p className={h.lead}>Open the app on your phone and scan this code.</p>
      <div className={h.pairRow}>
        <img className={h.qr} src={qrUrl} width={168} height={168} alt="QR code to pair your phone" />
        <div className={h.codeBlock}>
          <p className={h.codeLabel}>Can’t scan? Enter this code:</p>
          <p className={h.code}>{code}</p>
          <p className={h.newCode} aria-live="off">{`New code in ${mm}:${ss}`}</p>
        </div>
      </div>
      <InlineAlert kind="info" className={h.section}>
        Pairing gives your phone a secret key. Messages are locked before they leave this computer.
      </InlineAlert>
    </>
  )
}

const ORDER: AgentId[] = ['claude', 'codex', 'cursor']

function Connect() {
  const navigate = useNavigate()
  const setAgentStatus = useStore((x) => x.setAgentStatus)
  const [answers, setAnswers] = useState<Partial<Record<AgentId, boolean>>>({})
  const asking = ORDER.find((a) => answers[a] === undefined)

  useEffect(() => {
    if (asking) return
    const t = window.setTimeout(() => navigate('/demo/helper/status', { replace: true }), 900)
    return () => window.clearTimeout(t)
  }, [asking, navigate])

  const answer = (yes: boolean) => {
    if (!asking) return
    setAnswers((a) => ({ ...a, [asking]: yes }))
    setAgentStatus('win', asking, yes ? 'connected' : 'not-connected')
  }

  const word = (a: AgentId) => (answers[a] === undefined ? (a === asking ? 'Asking now' : 'Next') : answers[a] ? 'Connected' : 'Not connected')

  return (
    <>
      <p className={h.statusRow}>
        <Chip kind="connected" />
        Phone paired · iPhone
      </p>
      {asking && (
        <div className={h.card} role="group" aria-labelledby="connect-title">
          <h1 id="connect-title" className={h.cardTitle}>
            <AgentLogo agent={asking} size={28} />
            {`Connect ${AGENT_NAMES[asking]}?`}
          </h1>
          <p className={h.cardBody}>Your phone will be able to approve its requests and answer its questions.</p>
          <div className={h.cardButtons}>
            <Button size="l" variant="secondary" onClick={() => answer(false)}>
              No
            </Button>
            <Button size="l" onClick={() => answer(true)}>
              Yes, connect
            </Button>
          </div>
        </div>
      )}
      {!asking && <h1 className="sr-only">Agents on this computer</h1>}
      <ListGroup header="Agents on this computer" className={h.section}>
        {ORDER.map((a) => (
          <ListRow key={a} title={AGENT_NAMES[a]} leading={<AgentLogo agent={a} size={20} />} value={word(a)} />
        ))}
      </ListGroup>
    </>
  )
}

function Status() {
  const st = useStore()
  const win = st.computers.find((c) => c.id === 'win')!
  const statusOf = (a: AgentId) => win.agents.find((x) => x.agent === a)?.status ?? 'not-connected'
  return (
    <>
      <div className={h.statusTop}>
        <p className={h.statusRow}>
          <Chip kind="connected" />
          Running
        </p>
        <label className={h.keepAwake}>
          <span id="keep-awake">Keep awake</span>
          <Toggle checked={win.keepAwake} onChange={(v) => st.setKeepAwake('win', v)} labelledBy="keep-awake" />
        </label>
      </div>
      <h1 className="sr-only">Nudge helper</h1>
      <ListGroup header="Agents" className={h.section}>
        {ORDER.map((a) => {
          const s = statusOf(a)
          return s === 'disconnected' ? (
            <ListRow
              key={a}
              title={AGENT_NAMES[a]}
              subtitle="Disconnected after an update"
              leading={<AgentLogo agent={a} size={20} />}
              trailing={<TextButton onClick={() => st.setAgentStatus('win', a, 'connected')}>Reconnect</TextButton>}
            />
          ) : (
            <ListRow key={a} title={AGENT_NAMES[a]} leading={<AgentLogo agent={a} size={20} />} value={s === 'connected' ? 'Connected' : 'Not connected'} />
          )
        })}
      </ListGroup>
      <ListGroup header="Paired phones" className={h.section}>
        {st.phones.map((p) =>
          p.current ? (
            <ListRow key={p.id} title="iPhone" subtitle="Active now" leading={<Smartphone size={22} {...ICON} />} />
          ) : (
            <ListRow
              key={p.id}
              title={p.name}
              subtitle={p.detail}
              leading={<Smartphone size={22} {...ICON} />}
              trailing={
                <TextButton aria-label={`Remove ${p.name}`} onClick={() => st.removePhone(p.id)}>
                  Remove
                </TextButton>
              }
            />
          ),
        )}
      </ListGroup>
    </>
  )
}
