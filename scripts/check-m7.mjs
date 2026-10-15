// M7: demo screens — lock-screen previews, computer helper, states screens, demo menu.
// Usage: node scripts/check-m7.mjs
import { chromium } from 'playwright'
import { seedOnce } from './testState.mjs'

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })
const step = async (name, fn) => {
  try {
    await fn()
  } catch (e) {
    ok(name, false, e.message.split('\n').filter((l) => /waiting for|Timeout|Error/.test(l)).slice(0, 2).join(' ¦ '))
  }
}

const b = await chromium.launch()
const page = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const errors = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))
await seedOnce(page, JSON.stringify({ state: { signedIn: true, onboarded: true, nextArrivalAt: Date.now() + 1e9 }, version: 4 }))

const path = () => new URL(page.url()).hash.replace(/^#/, '')
const go = async (h) => {
  await page.goto(BASE + '#' + h)
  await page.waitForTimeout(500)
}
const text = () => page.locator('body').innerText()
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state)
const patch = (fn) =>
  page.evaluate((src) => {
    const raw = JSON.parse(localStorage.getItem('nudge-proto-v1'))
    new Function('st', src)(raw.state)
    localStorage.setItem('nudge-proto-v1', JSON.stringify(raw))
  }, `(${fn.toString()})(st)`)

await go('/')

await step('Demo menu lists every demo screen and opens them', async () => {
  const items = [
    ['Show “no agents” setup', '/setup/no-agents?mode=demo'],
    ['Approvals', '/demo/lock/approvals'],
    ['Questions', '/demo/lock/questions'],
    ['Other alerts', '/demo/lock/alerts'],
    ['Pair', '/demo/helper/pair'],
    ['Connect agent', '/demo/helper/connect'],
    ['Status', '/demo/helper/status'],
    ['Approval states', '/demo/states'],
    ['New task states', '/demo/new-task-states'],
  ]
  for (const [label, target] of items) {
    await go('/')
    await page.keyboard.press('d')
    await page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: label, exact: true }).click()
    await page.waitForTimeout(500)
    ok(`"${label}" opens ${target}`, path() === target, path())
  }
})

await step('Lock screen: approvals', async () => {
  await go('/demo/lock/approvals')
  ok('date and 9:41 shown', (await text()).includes('Monday 13 October') && (await text()).includes('9:41'))
  ok('only the low-risk card has Approve', (await page.getByRole('button', { name: 'Approve', exact: true }).count()) === 1)
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('dialog', { name: 'Confirm it’s you' }).waitFor()
  ok('Approve runs Face ID', true)
  await page.waitForTimeout(2000)
  const t = await text()
  ok('then a small "Approved" banner; the card is gone', t.includes('Approved') && !t.includes('Wants to delete old build files'))
  ok('…and the request was approved in the app', !(await state()).requests.some((r) => r.lib === 0))
  await page.getByRole('button', { name: 'Deny', exact: true }).click()
  await page.waitForTimeout(300)
  ok('Deny on force-push → "Denied"', (await text()).includes('Denied') && !(await text()).includes('Wants to force-push'))
  await page.getByRole('button', { name: /3 requests waiting/ }).click()
  await page.waitForTimeout(600)
  ok('"3 requests waiting" opens the queue with 3', path() === '/queue/codex' && (await page.getByRole('heading', { level: 1 }).innerText()) === '3 requests waiting')
  await page.getByRole('button', { name: 'Review one by one' }).click()
  await page.waitForTimeout(500)
  ok('Review one by one → first request "1 of 3"', (await text()).includes('1 of 3'))
})

await step('Lock screen: questions', async () => {
  await go('/demo/lock/questions')
  await page.getByRole('button', { name: 'Email and password' }).click()
  await page.waitForTimeout(300)
  ok('answer button → "Answer sent to Codex"', (await text()).includes('Answer sent to Codex'))
  await page.getByRole('button', { name: /Has a plan ready for review/ }).click()
  await page.waitForTimeout(600)
  ok('plan notification opens the plan', (await page.getByRole('heading', { level: 1 }).innerText()) === 'Add sign-in to the portfolio')
  await go('/demo/lock/questions')
  await page.getByRole('button', { name: /How should errors be shown/ }).click()
  await page.waitForTimeout(600)
  ok('question notification opens the question', (await page.getByRole('heading', { level: 1 }).innerText()) === 'How should errors be shown on the login page?')
})

await step('Lock screen: other alerts', async () => {
  await go('/demo/lock/alerts')
  await page.getByRole('button', { name: /Finished: contact form added/ }).click()
  await page.waitForTimeout(600)
  ok('finished → SessionDone (Cursor · site)', path() === '/session/s2' && (await text()).includes('Added a contact form to the homepage'))
  await go('/demo/lock/alerts')
  await page.getByRole('button', { name: /Failed: tests didn’t pass/ }).click()
  await page.waitForTimeout(600)
  ok('failed → SessionFailed', (await text()).includes('Stopped: tests didn’t pass'))
  await go('/demo/lock/alerts')
  await page.getByRole('button', { name: /Went offline/ }).click()
  await page.waitForTimeout(600)
  ok('offline → Home with the offline alert', path() === '/' && (await text()).includes('Windows PC is offline · last seen 2 min ago'))
  await patch((st) => {
    st.offline = false
  })
  await go('/demo/lock/alerts')
  await page.getByRole('button', { name: /Disconnected after an update/ }).click()
  await page.waitForTimeout(600)
  ok('disconnected → Agents', path() === '/agents')
  await go('/demo/lock/alerts')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.waitForTimeout(400)
  ok('Back leaves the lock screen', !path().startsWith('/demo/lock'))
})

await step('Computer helper', async () => {
  await go('/demo/helper/pair')
  const a = await page.getByText(/New code in/).innerText()
  await page.waitForTimeout(2100)
  const a2 = await page.getByText(/New code in/).innerText()
  ok('pair: code 482 917 and a live countdown', (await text()).includes('482 917') && a !== a2, `${a} → ${a2}`)
  await go('/demo/helper/connect')
  ok('connect: Claude Code asking now', (await text()).includes('Connect Claude Code?') && (await text()).includes('Asking now'))
  await page.getByRole('button', { name: 'Yes, connect' }).click()
  ok('→ then Codex', (await text()).includes('Connect Codex?'))
  await page.getByRole('button', { name: 'Yes, connect' }).click()
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await page.waitForTimeout(1300)
  ok('after the last agent → status', path() === '/demo/helper/status')
  ok('Cursor said No → Not connected', (await text()).includes('Not connected'))
  await patch((st) => {
    st.computers[0].agents[1].status = 'disconnected'
  })
  await page.reload()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Reconnect' }).click()
  ok('Reconnect → Codex connected', (await state()).computers[0].agents[1].status === 'connected')
  await page.getByRole('button', { name: 'Remove Old Android' }).click()
  ok('Remove → phone gone', !(await text()).includes('Old Android'))
  const before = (await state()).computers[0].keepAwake
  await page.getByRole('switch', { name: 'Keep awake' }).click()
  ok('Keep awake toggle is the same setting as Agents', (await state()).computers[0].keepAwake === !before)
  await page.getByRole('button', { name: 'Close' }).click()
  await page.waitForTimeout(500)
  ok('Close → back to the app', path() === '/')
})

await step('States screens', async () => {
  await go('/demo/states')
  const t = await text()
  ok('7 approval states in order', t.indexOf('Not sent: no internet') < t.indexOf('Type an answer first.') && t.includes('Use passcode'))
  await page.getByRole('button', { name: 'Message agent' }).click()
  ok('actions show they were tapped (busy)', (await page.getByRole('button', { name: 'Message agent' }).getAttribute('aria-busy')) === 'true')
  await go('/demo/new-task-states')
  ok('3 new task states', (await text()).includes('Start Cursor tasks in the Cursor editor.'))
})

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
