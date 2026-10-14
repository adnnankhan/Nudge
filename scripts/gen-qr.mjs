// Generates the static QR code shown under the desktop phone frame (flows.md).
// Run once with `npm run qr` — the URL is fixed, so nothing ships a QR library.
import QRCode from 'qrcode'
import { writeFileSync } from 'node:fs'

const URL = 'https://adnnankhan.github.io/Nudge/app/'
const svg = await QRCode.toString(URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0a0a0a', light: '#ffffff' },
})
writeFileSync(new globalThis.URL('../src/app/qr-app.svg', import.meta.url), svg)
console.log('QR written for', URL)
