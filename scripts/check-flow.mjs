// M4 end-to-end: the Main loop in docs/flows.md on a fake clock. Usage: node scripts/check-flow.mjs
import * as engines from 'playwright'
// BROWSER=webkit|firefox runs the same checks in Safari's and Firefox's engines.
const chromium = engines[process.env.BROWSER ?? 'chromium']
import { seedOnce } from './testState.mjs'

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })
const step = async (name, fn) => {
  try {
    await fn()
  } catch (e) {
    ok(name, false, e.message.split('\n').filter((l) => /waiting for|intercepts|Timeout/.test(l)).slice(0, 3).join(' ¦ '))
  }
}

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))

await page.clock.install({ time: new Date('2026-10-15T11:00:00') })
await seedOnce(page)
await page.goto(BASE + '#/')
await page.getByRole('heading', { name: 'Needs you' }).waitFor()

const run = (ms) => page.clock.runFor(ms)
// Advance the fake clock in steps until a condition holds (engines differ in how fast work lands).
const until = async (cond, step = 250, max = 24) => {
  for (let i = 0; i < max; i++) {
    if (await cond()) return true
    await run(step)
  }
  return cond()
}
const store = (fn) => page.evaluate(fn)
const demo = async (label) => {
  await page.keyboard.press('d')
  const btn = page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: label })
  if (await btn.isDisabled()) await page.keyboard.press('Escape') // every one of that kind is already waiting
  else await btn.click()
  await run(500)
}
// The fake clock also holds animation frames, so advance it after a screen change.
const screenTitled = async (t) => {
  await run(400)
  await page.getByRole('heading', { level: 1, name: t }).waitFor()
  await run(400)
}
const waitingOf = (kind) => page.evaluate((k) => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.filter((r) => r.kind === k).map((r) => r.title), kind)
const toast = () => page.locator('[role=status]').filter({ hasText: /./ }).allInnerTexts()
const cards = () => page.locator('main article')
const card = (title) => cards().filter({ has: page.getByRole('heading', { name: title }) })
const waiting = () => store(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.map((r) => r.title))

await step('Approve (low) → Face ID → collapses → toast → Working', async () => {
  const c = card('Delete the old build folder')
  await c.getByRole('button', { name: 'Approve' }).click()
  await page.getByRole('dialog', { name: 'Confirm it’s you' }).waitFor()
  ok('Approve opens the Face ID sheet', true)
  await run(2000)
  const t = (await toast()).join(' | ')
  ok('toast "Approved · running"', t.includes('Approved · running'), t)
  ok('card left Needs you', !(await waiting()).includes('Delete the old build folder'))
  const working = await page.getByRole('heading', { name: /Working/ }).innerText()
  ok('session appears in Working', /Working\s+3/.test(working), working) // Claude portfolio + Cursor site + the approved one
})

await step('Deny → toast with Undo → Undo restores', async () => {
  await demo('Send a medium-risk request')
  const title = (await waiting()).find((t) => t === 'Install a new package' || t === 'Change config file')
  await card(title).getByRole('button', { name: 'Deny' }).click()
  await run(400)
  const t = (await toast()).join(' | ')
  ok('toast "Denied" with Undo', t.includes('Denied') && t.includes('Undo'), t)
  ok('Denied row in Completed today', (await page.locator('main').innerText()).includes('Denied'))
  await page.getByRole('button', { name: 'Undo' }).click()
  await run(300)
  ok('Undo puts the request back', (await waiting()).includes(title))
})

await step('High risk: Review only, Hold to approve, Face ID, Sent', async () => {
  await demo('Send a high-risk request')
  const title = (await waiting()).find((t) => t === 'Force-push to main' || t === 'Delete a folder')
  const c = card(title)
  ok('high-risk card has no Approve button', (await c.getByRole('button', { name: 'Approve' }).count()) === 0)
  ok('high-risk card shows Review', (await c.getByRole('button', { name: 'Review' }).count()) === 1)
  ok('high risk sorts first in Needs you', (await cards().first().innerText()).includes(title))
  await c.getByRole('button', { name: 'Review' }).click()
  await screenTitled(title)
  ok('detail screen has no one-tap Approve', (await page.getByRole('button', { name: 'Approve', exact: true }).count()) === 0)
  const hold = page.getByRole('button', { name: 'Hold to approve' })
  const box = await hold.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await run(400)
  await page.mouse.up()
  await run(300)
  ok('releasing early cancels with the hint', (await page.getByText('Keep holding to approve').count()) === 1 && (await page.getByRole('dialog').count()) === 0)
  await page.mouse.down()
  await run(1300)
  await page.mouse.up()
  await page.getByRole('dialog', { name: 'Confirm it’s you' }).waitFor()
  ok('holding 1.2 s opens Face ID', true)
  await until(async () => page.url().includes('/sent'))
  await until(async () => (await page.getByText('Approved', { exact: true }).count()) >= 1)
  ok('ApprovalSent shows Approved', (await page.getByText('Approved', { exact: true }).count()) >= 1 && page.url().includes('/sent'), page.url())
  await until(async () => /Running ?, in progress/.test(await page.getByRole('list', { name: 'Progress' }).innerText()))
  const steps = (await page.getByRole('list', { name: 'Progress' }).innerText()).replace(/\s*\n\s*/g, ' ')
  ok('progress: Sent → Reached your computer → Running', /Reached your computer ?, done/.test(steps) && /Running ?, in progress/.test(steps), steps)
  await page.getByRole('button', { name: 'Back to Home' }).click()
  await run(400)
})

await step('Question: tap an option sends it', async () => {
  const c = card('Which login method should I add?')
  await c.getByRole('button', { name: /Email and password/ }).click()
  await run(200)
  ok('option shows a short "Sent" tick', (await c.innerText()).includes('Sent'))
  await run(1200)
  const t = (await toast()).join(' | ')
  ok('toast "Answer sent to Codex"', t.includes('Answer sent to Codex'), t)
})

await step('AnswerQuestion: empty send explains, then sends', async () => {
  await demo('Send a question')
  const q = (await waitingOf('question'))[0]
  await card(q).getByRole('button', { name: q }).click()
  await screenTitled(q)
  // aria-disabled until there's an answer, but a tap still explains why (04-questions.md).
  await page.getByRole('button', { name: 'Send answer' }).click({ force: true })
  await run(200)
  ok('"Type an answer first." when nothing is chosen', (await page.getByText('Type an answer first.').count()) === 1)
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Send answer' }).click()
  await run(600)
  ok('Send answer returns Home with the toast', page.url().endsWith('#/') && (await toast()).join(' ').includes('Answer sent to'))
})

await step('VoiceAnswer: Listening… then transcript, Send', async () => {
  await demo('Send a question')
  const q = (await waitingOf('question'))[0]
  await card(q).getByRole('button', { name: 'Answer by voice' }).click()
  await run(300)
  await page.getByText('Listening…').waitFor()
  ok('shows "Listening…"', true)
  await run(2200)
  ok('then the editable transcript', (await page.getByLabel('Transcript').inputValue()).startsWith('Use email and password'))
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await run(600)
  ok('Send returns Home', page.url().endsWith('#/'))
})

await step('Plan: read full plan, approve with Face ID', async () => {
  await demo('Send a plan')
  await card('Add sign-in to the portfolio').getByRole('button', { name: 'Add sign-in to the portfolio' }).click()
  await screenTitled('Add sign-in to the portfolio')
  await page.getByRole('button', { name: 'Read full plan' }).click()
  ok('full plan shows 5 steps', (await page.locator('main ol li').count()) === 5)
  await page.getByRole('button', { name: 'Approve plan' }).click()
  await page.getByRole('dialog', { name: 'Confirm it’s you' }).waitFor()
  await run(2000)
  ok('plan approved → Home', page.url().endsWith('#/') && !(await waiting()).includes('Add sign-in to the portfolio'))
})

await step('Offline: Not sent with Retry, then Retry succeeds', async () => {
  await demo('Send a low-risk request')
  const title = (await store(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.filter((r) => r.risk === 'low').map((r) => r.title)))[0]
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('switch', { name: 'Computer offline' }).click()
  await page.keyboard.press('Escape')
  await run(500)
  ok('HomeWarnings: offline alert shows', (await page.getByText('Windows PC is offline · last seen 2 min ago').count()) === 1)
  ok('HomeWarnings: Paused section', (await page.getByRole('heading', { name: /Paused/ }).count()) === 1)
  await card(title).getByRole('button', { name: 'Approve' }).click()
  await run(2000)
  ok('Approve offline shows "Not sent" in place of the buttons', (await card(title).innerText()).includes('Not sent: no internet connection'))
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('switch', { name: 'Computer offline' }).click()
  await page.keyboard.press('Escape')
  await run(500)
  await card(title).getByRole('button', { name: 'Retry' }).click()
  await run(800)
  ok('Retry sends once the computer is back', !(await waiting()).includes(title))
})

await step('Banners: a request arrives, a session finishes', async () => {
  await run(75_000)
  const banners = await page.locator('[role=status]').allInnerTexts()
  ok('a banner appeared on its own', banners.some((t) => /needs your approval|asked you a question|plan ready|finished|failed/.test(t)), banners.join(' | '))
})

await step('Computer menu: switch to MacBook and Mac 2', async () => {
  await page.getByRole('button', { name: /Windows PC/ }).first().click()
  await page.getByRole('menuitemradio', { name: /MacBook/ }).click()
  await run(400)
  ok('MacBook: empty Home "No sessions yet"', (await page.getByText('No sessions yet').count()) === 1)
  await page.getByRole('button', { name: /MacBook/ }).first().click()
  await page.getByRole('menuitemradio', { name: /Mac 2/ }).click()
  await run(400)
  ok('Mac 2: offline alert', (await page.getByText('Mac 2 is offline · last seen 1 day ago').count()) === 1)
  await page.getByRole('button', { name: /Mac 2/ }).first().click()
  await page.getByRole('menuitemradio', { name: /Windows PC/ }).click()
  await run(400)
})

await step('Refresh keeps state; deep link to a request survives refresh', async () => {
  const before = await waiting()
  await page.reload()
  await page.getByRole('heading', { name: 'Needs you' }).waitFor()
  ok('refresh keeps Needs you', JSON.stringify(before) === JSON.stringify(await waiting()))
  const id = await store(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests[0]?.id)
  if (id) {
    await page.goto(BASE + '#/request/' + id)
    await page.reload()
    await until(async () => (await page.getByRole('heading', { level: 1 }).count()) >= 1)
    ok('deep link to a request loads after refresh', (await page.getByRole('heading', { level: 1 }).count()) >= 1 && page.url().includes(id))
  }
})

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
