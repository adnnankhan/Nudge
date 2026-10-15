// Quick screenshots of routes in the desktop frame at reference scale: node scripts/shoot.mjs <outDir> <route>...
import { chromium } from 'playwright'
import { SETUP_DONE, ONBOARDING } from './testState.mjs'
import { mkdirSync } from 'node:fs'
const [out, ...routes] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1290 / 844, reducedMotion: 'reduce' })
const errs = []
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errs.push(m.text()))
p.on('pageerror', (e) => errs.push(e.message))
await p.goto('http://localhost:4173/Nudge/app/#/')
await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('nudge-proto-v1', s) }, SETUP_DONE)
for (const r of routes) {
  await p.goto('http://localhost:4173/Nudge/app/#' + r, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(500)
  await p.locator('#device').screenshot({ path: `${out}/${r.replace(/[^\w]+/g, '_') || 'home'}.png` })
}
console.log(errs.length ? errs.join('\n') : 'no console errors')
await b.close()
