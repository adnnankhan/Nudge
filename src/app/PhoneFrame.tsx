import type { ReactNode } from 'react'
import qrUrl from './qr-app.svg'
import s from './PhoneFrame.module.css'

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={s.stage}>
      <div className={s.device} id="device">
        {/* One <main> for the app: screens plus the overlay layer, so everything sits in a landmark. */}
        <main className={s.content}>
          <div className={s.content} id="app-content">
            {children}
          </div>
          {/* Sheets, menus, banners and toasts render here (components/Overlay.tsx). */}
          <div className={s.overlays} id="overlays" />
        </main>
        <div className={s.island} aria-hidden="true" />
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
