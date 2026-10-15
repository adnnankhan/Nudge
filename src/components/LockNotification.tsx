import { Fingerprint } from 'lucide-react'
import { Button } from './Button'
import { Chip, type ChipKind } from './Chip'
import { ICON } from './icons'
import s from './LockNotification.module.css'

type NotifButton = { label: string; onPress: () => void; primary?: boolean; fingerprint?: boolean }

type Props = {
  /** "lock": lock-screen preview (light frosted). "app": in-app preview card (dark). */
  surface?: 'lock' | 'app'
  time: string
  title: string
  body: string
  chip?: ChipKind
  /** Small line next to the chip ("Approve needs Face ID") or under the body ("Tap to answer in the app."). */
  hint?: string
  /** Show the hint in mono (a command). */
  monoHint?: boolean
  buttons?: NotifButton[]
  /** Tapping the notification opens the app at the matching screen. */
  onOpen?: () => void
  /** A picture of a notification (Notifications setup): the buttons are shown but not usable. */
  preview?: boolean
}

/** Notification card: approval · question · info. */
export function LockNotification({ surface = 'lock', time, title, body, chip, hint, monoHint, buttons, onOpen, preview }: Props) {
  const content = (
    <>
      <span className={s.head}>
        <img className={s.appIcon} src={`${import.meta.env.BASE_URL}brand/app-icon.svg`} alt="" width={20} height={20} />
        <span className={s.appName}>NUDGE</span>
        <span className={s.time}>{time}</span>
      </span>
      <span className={s.title}>{title}</span>
      <span className={s.body}>{body}</span>
      {(chip || hint) && (
        <span className={s.row}>
          {chip && <Chip kind={chip} />}
          {hint && <span className={[s.hint, monoHint && s.mono].filter(Boolean).join(' ')}>{hint}</span>}
        </span>
      )}
    </>
  )

  return (
    // The lock screen looks the same in both modes, so its chips use the light tokens.
    <div className={[s.card, s[surface]].join(' ')} data-theme={surface === 'lock' ? 'light' : undefined}>
      {onOpen ? (
        <button type="button" className={s.open} onClick={onOpen}>
          {content}
        </button>
      ) : (
        <div className={s.open}>{content}</div>
      )}
      {buttons && (
        <div
          className={[s.buttons, preview && s.previewButtons].filter(Boolean).join(' ')}
          aria-hidden={preview || undefined}
          ref={(n) => {
            if (n && preview) n.setAttribute('inert', '')
          }}
        >
          {buttons.map((b) =>
            surface === 'app' ? (
              <Button
                key={b.label}
                variant={b.primary ? 'primary' : 'secondary'}
                onClick={b.onPress}
                icon={b.fingerprint ? <Fingerprint size={18} {...ICON} /> : undefined}
              >
                {b.label}
              </Button>
            ) : (
              <button key={b.label} type="button" className={s.lockButton} onClick={b.onPress}>
                {b.fingerprint && <Fingerprint size={18} {...ICON} />}
                {b.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
