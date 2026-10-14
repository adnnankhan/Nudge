// Side-by-side + difference overlay of /#/dev/ref/<Name> against docs/reference/dark/<Name>.jpg.
// Shoots the device in the desktop frame (simulated safe areas) at the references' scale (1290/844).
// Usage: node scripts/compare-ref.mjs <outDir> [Name ...]
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
const [out, ...names] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const S = 1290 / 844
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: S, reducedMotion: 'reduce' })
const errors = []
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
const list = names.length ? names : ['Home', 'ComputerSwitcher', 'HomeScrolled', 'Settings', 'TimeoutPicker', 'ModelPicker', 'Agents', 'ApprovalSent', 'EnterCode']
for (const n of list) {
  await p.goto(`http://localhost:4173/Nudge/app/#/dev/ref/${n}`, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(500)
  const shot = await p.locator('#device').screenshot()
  const ours = 'data:image/png;base64,' + shot.toString('base64')
  const ref = 'data:image/jpeg;base64,' + readFileSync(`docs/reference/dark/${n}.jpg`).toString('base64')
  const q = await b.newPage({ viewport: { width: 596 * 3 + 40, height: 1290 + 40 } })
  await q.setContent(`<body style="margin:0;background:#333;display:flex;gap:10px;padding:10px;font:14px sans-serif;color:#fff">
    <div><img src="${ref}" width="596"></div>
    <div><img src="${ours}" width="596" height="1290"></div>
    <div style="position:relative;width:596px;height:1290px"><img src="${ref}" width="596" style="position:absolute;inset:0">
      <img src="${ours}" width="596" height="1290" style="position:absolute;inset:0;mix-blend-mode:difference"></div></body>`)
  await q.waitForTimeout(150)
  await q.screenshot({ path: `${out}/${n}.png` })
  await q.close()
}
console.log(errors.length ? errors.join('\n') : 'no console errors')
await b.close()
