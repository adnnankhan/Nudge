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
await p.goto('http://localhost:4173/Nudge/app/#/')
await p.evaluate(() => localStorage.clear())
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
// Reference screens that need a state first (demo menu, a tap, a wait).
const demo = (label) => async () => {
  await p.keyboard.press('d')
  const d = p.getByRole('dialog', { name: 'Demo' })
  if (label === 'Computer offline') {
    await d.getByRole('switch', { name: label }).click()
    await p.keyboard.press('Escape')
  } else await d.getByRole('button', { name: label }).click()
  await p.waitForTimeout(500)
}
const openCard = (title) => async () => {
  await p.locator('main article').filter({ hasText: title }).first().locator('h3 button').click()
  await p.waitForTimeout(700)
}
const SETUPS = {
  HomeWarnings: demo('Computer offline'),
  HomeEmpty: demo('Show empty Home'),
  ComputerSwitcher: async () => p.getByRole('button', { name: /Windows PC/ }).first().click(),
  ApprovalHighRisk: async () => { await demo('Send a high-risk request')(); await openCard('Force-push to main')() },
  ApprovalMedium: async () => { await demo('Send a medium-risk request')(); await openCard('Install a new package')() },
  PlanReview: async () => { await demo('Send a plan')(); await openCard('Add sign-in to the portfolio')() },
  VoiceAnswer: async () => p.waitForTimeout(2300),
  ApprovalSent: async () => { await p.getByRole('button', { name: 'Approve' }).click(); await p.waitForTimeout(2600) },
  ApprovalQueue: async () => { for (const l of ['Send a low-risk request', 'Send a medium-risk request', 'Send a high-risk request']) await demo(l)() ; await p.goto('http://localhost:4173/Nudge/app/#/queue/codex'); await p.waitForTimeout(600) },
}
const list = names.length ? names : ['Home', 'ComputerSwitcher', 'HomeScrolled', 'Settings', 'TimeoutPicker', 'ModelPicker', 'Agents', 'ApprovalSent', 'EnterCode']
for (const n of list) {
  // "Ref=route" compares a real app route; a bare name uses the /dev/ref composition.
  const [refName, route] = n.includes('=') ? n.split('=') : [n, `/dev/ref/${n}`]
  await p.goto('about:blank')
  await p.goto(`http://localhost:4173/Nudge/app/#${route}`, { waitUntil: 'networkidle' })
  if (route.startsWith('/') && !route.startsWith('/dev')) await p.evaluate(() => { localStorage.removeItem('nudge-proto-v1') })
  await p.goto('about:blank')
  await p.goto(`http://localhost:4173/Nudge/app/#${route}`, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(500)
  if (SETUPS[refName]) await SETUPS[refName]()
  const shot = await p.locator('#device').screenshot()
  const ours = 'data:image/png;base64,' + shot.toString('base64')
  const ref = 'data:image/jpeg;base64,' + readFileSync(`docs/reference/dark/${refName}.jpg`).toString('base64')
  const q = await b.newPage({ viewport: { width: 596 * 3 + 40, height: 1290 + 40 } })
  await q.setContent(`<body style="margin:0;background:#333;display:flex;gap:10px;padding:10px;font:14px sans-serif;color:#fff">
    <div><img src="${ref}" width="596"></div>
    <div><img src="${ours}" width="596" height="1290"></div>
    <div style="position:relative;width:596px;height:1290px"><img src="${ref}" width="596" style="position:absolute;inset:0">
      <img src="${ours}" width="596" height="1290" style="position:absolute;inset:0;mix-blend-mode:difference"></div></body>`)
  await q.waitForTimeout(150)
  await q.screenshot({ path: `${out}/${refName}.png` })
  await q.close()
}
console.log(errors.length ? errors.join('\n') : 'no console errors')
await b.close()
