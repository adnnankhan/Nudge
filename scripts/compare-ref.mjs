// Side-by-side + difference overlay of /#/dev/ref/<Name> against docs/reference/dark/<Name>.jpg.
// Shoots the device in the desktop frame (simulated safe areas) at the references' scale (1290/844).
// Usage: node scripts/compare-ref.mjs <outDir> [Name ...]
import { chromium } from 'playwright'
import { SETUP_DONE, ONBOARDING } from './testState.mjs'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
const [out, ...names] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const S = 1290 / 844
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: S, reducedMotion: 'reduce' })
const errors = []
await p.goto('http://localhost:4173/Nudge/app/#/')
await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('nudge-proto-v1', s) }, SETUP_DONE)
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
  // M6
  SignInError: async () => {
    await p.getByLabel('Email').fill('you@email.com')
    await p.getByLabel('Password', { exact: true }).fill('wrong')
    await p.getByRole('button', { name: 'Sign in', exact: true }).click()
    await p.waitForTimeout(300)
  },
  EnterCode: async () => {
    await p.getByLabel('Enter the code').fill('000000')
    await p.getByRole('button', { name: 'Connect' }).click()
    await p.locator('input').blur()
    await p.waitForTimeout(300)
  },
  Connecting: async () => p.waitForTimeout(100),
  KeepAwake: async () => {
    await patch((st) => {
      st.showKeepAwake = true
    })
    await p.reload()
    await p.waitForTimeout(800)
  },
  // M5
  ModelPicker: tap(/^Model/),
  IntensityPicker: tap(/^Intensity/),
  StopConfirm: tap('Stop'),
  Stopped: async () => { await tap('Stop')(); await tap('Stop session')() },
  NotSupported: tap('Stop'),
  SessionFollowed: terminalSession,
  TakeOverConfirm: async () => { await terminalSession(); await tap('Stop')() },
  SessionDone: async () => {
    await patch((st) => {
      const x = st.sessions.find((s) => s.id === 's2')
      Object.assign(x, { status: 'done', text: 'Added the contact form', finishedAt: Date.now() - 10 * 60_000, finishAt: null, nextRecentAt: null })
    })
    await p.goto('http://localhost:4173/Nudge/app/#/session/s2')
    await p.reload()
    await p.waitForTimeout(700)
  },
  ChooseComputer: tap(/^Computer/),
  ChooseAgent: tap(/^Agent/),
  SafetyPicker: tap(/^Safety/),
  TimeoutPicker: tap(/^Time to answer/),
  SignOutConfirm: tap('Sign out'),
  RemovePhoneConfirm: tap('Remove Old Android'),
  // M5b — docs/reference/new (approved designs for the chat, New task, Tasks and the tab bar)
  'Home-with-tasks-tab': demo('Send a low-risk request'),
  'Chat-after-approve': async () => {
    await p.getByRole('button', { name: 'Approve', exact: true }).click()
    await p.waitForTimeout(2600)
    await demo('Finish a session')()
    await tap('Read 5 files, edited 3')()
  },
  'Chat-high-risk': async () => {
    await demo('Send a high-risk request')()
    const id = await p.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.find((r) => r.risk === 'high').taskId)
    await p.goto(`http://localhost:4173/Nudge/app/#/task/${id}`)
    await p.waitForTimeout(800)
  },
  'Chat-task-menu': tap('Task menu'),
  'AskMe-sheet': tap(/Ask every action/),
}
function tap(name) {
  return async () => {
    await p.getByRole('button', { name, exact: typeof name === 'string' }).first().click()
    await p.waitForTimeout(600)
  }
}
async function patch(fn) {
  await p.evaluate((src) => {
    const raw = JSON.parse(localStorage.getItem('nudge-proto-v1'))
    new Function('st', src)(raw.state)
    localStorage.setItem('nudge-proto-v1', JSON.stringify(raw))
  }, `(${fn.toString()})(st)`)
}
// A session started in the terminal: approve a request from Home, then open its session.
async function terminalSession() {
  await p.locator('main article').filter({ hasText: 'Delete the old build folder' }).getByRole('button', { name: 'Approve' }).click()
  await p.waitForTimeout(2600)
  const id = await p.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.sessions.find((s) => s.origin === 'terminal')?.id)
  await p.goto(`http://localhost:4173/Nudge/app/#/session/${id}`)
  await p.waitForTimeout(700)
}
const list = names.length ? names : ['Home', 'ComputerSwitcher', 'HomeScrolled', 'Settings', 'TimeoutPicker', 'ModelPicker', 'Agents', 'ApprovalSent', 'EnterCode']
for (const n of list) {
  // "Ref=route" compares a real app route; a bare name uses the /dev/ref composition.
  const [refName, route] = n.includes('=') ? n.split('=') : [n, `/dev/ref/${n}`]
  await p.goto('about:blank')
  await p.goto(`http://localhost:4173/Nudge/app/#${route}`, { waitUntil: 'networkidle' })
  if (route.startsWith('/') && !route.startsWith('/dev')) {
    const onboarding = /^\/(signin|signup|forgot|setup)/.test(route) && !/mode=/.test(route)
    await p.evaluate((s) => localStorage.setItem('nudge-proto-v1', s), onboarding ? ONBOARDING(route.startsWith('/setup')) : SETUP_DONE)
  }
  await p.goto('about:blank')
  await p.goto(`http://localhost:4173/Nudge/app/#${route}`, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(500)
  if (SETUPS[refName]) await SETUPS[refName]()
  const shot = await p.locator('#device').screenshot()
  const ours = 'data:image/png;base64,' + shot.toString('base64')
  const refPath = existsSync(`docs/reference/new/${refName}.jpg`)
    ? `docs/reference/new/${refName}.jpg`
    : refName.startsWith('Lock')
      ? `docs/reference/light/${refName}.jpg`
      : `docs/reference/dark/${refName}.jpg`
  const ref = 'data:image/jpeg;base64,' + readFileSync(refPath).toString('base64')
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
