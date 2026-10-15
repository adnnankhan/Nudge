import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'
import { LockNotification } from '../../components/LockNotification'
import { ICON } from '../../components/icons'
import { useFaceId } from '../../app/feedback'
import { useStore } from '../../data/store'
import s from './Demo.module.css'

type Kind = 'approvals' | 'questions' | 'alerts'

/**
 * Lock-screen previews — /demo/lock/:kind (08-lock-screens-and-helper.md). They imitate the
 * phone's own lock screen, so they look the same in Dark and Light. Tapping a notification opens
 * the app at the matching screen; Approve runs Face ID, then a small "Approved" banner.
 */
export function LockScreen() {
  const { kind = 'approvals' } = useParams() as { kind?: Kind }
  const navigate = useNavigate()
  const faceId = useFaceId()
  const st = useStore.getState
  const [gone, setGone] = useState<string[]>([])
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 2200)
    return () => window.clearTimeout(t)
  }, [banner])

  const done = (key: string, text: string) => {
    setGone((g) => [...g, key])
    setBanner(text)
  }
  const openRequest = (lib: number, age = 0) => navigate(`/request/${st().ensureRequest(lib, age)}`)
  const show = (key: string) => !gone.includes(key)

  return (
    <div className={s.lock}>
      <button type="button" className={s.lockBack} aria-label="Back" onClick={() => navigate(-1)}>
        <ChevronLeft size={28} {...ICON} />
      </button>
      <p className={s.lockDate}>Monday 13 October</p>
      <p className={s.lockTime} aria-label="9:41">
        9:41
      </p>
      <h1 className="sr-only">Lock screen</h1>

      <div className={s.lockList}>
        {kind === 'approvals' && (
          <>
            {show('low') && (
              <LockNotification
                time="now"
                title="Claude Code · my-app"
                body="Wants to delete old build files"
                chip="low"
                hint="Approve needs Face ID"
                onOpen={() => openRequest(0)}
                buttons={[
                  {
                    label: 'Approve',
                    primary: true,
                    fingerprint: true,
                    onPress: async () => {
                      if (!(await faceId())) return
                      st().approve(st().ensureRequest(0))
                      done('low', 'Approved')
                    },
                  },
                  { label: 'Deny', onPress: () => (st().deny(st().ensureRequest(0)), done('low', 'Denied')) },
                  { label: 'Open', onPress: () => openRequest(0) },
                ]}
              />
            )}
            {show('high') && (
              // High risk: no Approve on the lock screen.
              <LockNotification
                time="1m"
                title="Claude Code · portfolio"
                body="Wants to force-push to main"
                chip="high"
                hint="git push --force origin main"
                monoHint
                onOpen={() => openRequest(2, 1)}
                buttons={[
                  { label: 'Open', onPress: () => openRequest(2, 1) },
                  { label: 'Deny', onPress: () => (st().deny(st().ensureRequest(2, 1)), done('high', 'Denied')) },
                ]}
              />
            )}
            <LockNotification
              time="3m"
              title="Codex · api"
              body="3 requests waiting"
              hint="Tap to review them one by one."
              onOpen={() => {
                ;[3, 4, 5].forEach((lib) => st().ensureRequest(lib, 3))
                navigate('/queue/codex')
              }}
            />
          </>
        )}

        {kind === 'questions' && (
          <>
            {show('q1') && (
              <LockNotification
                time="now"
                title="Codex · api asks"
                body="Which login method should I add?"
                onOpen={() => openRequest(6)}
                buttons={['Email and password', 'Google sign-in'].map((a) => ({
                  label: a,
                  onPress: () => {
                    st().answer(st().ensureRequest(6), a)
                    done('q1', 'Answer sent to Codex')
                  },
                }))}
              />
            )}
            <LockNotification
              time="2m"
              title="Claude Code · my-app asks"
              body="How should errors be shown on the login page?"
              hint="Tap to answer in the app."
              onOpen={() => openRequest(7, 2)}
            />
            <LockNotification time="6m" title="Claude Code · portfolio" body="Has a plan ready for review" hint="Tap to read the summary." onOpen={() => openRequest(8, 6)} />
          </>
        )}

        {kind === 'alerts' && (
          <>
            <LockNotification
              time="now"
              title="Cursor · site"
              body="Finished: contact form added"
              hint="Tap to see what changed."
              onOpen={() => {
                st().endSessionAs('s2', 'done')
                navigate('/session/s2')
              }}
            />
            <LockNotification
              time="2m"
              title="Codex · docs"
              body="Failed: tests didn’t pass"
              hint="Tap to see why and reply."
              onOpen={() => {
                st().endSessionAs('s3', 'failed')
                navigate('/session/s3')
              }}
            />
            <LockNotification
              time="5m"
              title="Windows PC"
              body="Went offline. Claude Code is paused."
              hint="It continues when the computer is back."
              onOpen={() => {
                st().setComputer('win')
                st().setOffline(true)
                navigate('/')
              }}
            />
            <LockNotification time="8m" title="Codex" body="Disconnected after an update" hint="Reconnect it in the helper on your computer." onOpen={() => navigate('/agents')} />
          </>
        )}
      </div>

      <div className={s.lockBannerLayer} role="status" aria-live="polite">
        {banner && (
          <span className={s.lockBanner}>
            <Check size={18} {...ICON} />
            {banner}
          </span>
        )}
      </div>
    </div>
  )
}
