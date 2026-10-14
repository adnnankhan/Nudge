import type { ReactNode } from 'react'
import qrUrl from './qr-app.svg'
import s from './PhoneFrame.module.css'

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={s.stage}>
      <div className={s.device} id="device">
        {children}
      </div>
      <footer className={s.caption}>
        {/* Hidden on phones; loading="lazy" keeps it from downloading there. */}
        <img
          className={s.qr}
          src={qrUrl}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          alt="QR code that opens adnnankhan.github.io/Nudge/app"
        />
        <span>Nudge prototype · works best on a phone — scan to open</span>
      </footer>
    </div>
  )
}
