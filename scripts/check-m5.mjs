// M5 behaviour: sessions, new task, agents, settings — every row and button goes somewhere.
// Usage: node scripts/check-m5.mjs
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
    ok(name, false, e.message.split('\n').filter((l) => /waiting for|Timeout|Error/.test(l)).slice(0, 2).join(' ¦ '))
  }
}

const b = await chromium.launch()
const page = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const errors = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))

const go = async (hash) => {
  await page.goto(BASE + '#' + hash)
  await page.waitForTimeout(500)
}
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state)
const tap = async (name, opts = {}) => {
  await page.getByRole(opts.role ?? 'button', { name, exact: typeof name === 'string' }).first().click()
  await page.waitForTimeout(opts.wait ?? 450)
}
const text = () => page.locator('main').innerText()
const toasts = () => page.locator('[role=status]').allInnerTexts().then((t) => t.join(' | '))

// Fresh state, no arrivals during the test (banners would sit over the top bar).
await seedOnce(page, JSON.stringify({ state: { signedIn: true, onboarded: true, nextArrivalAt: Date.now() + 1e9 }, version: 4 }))
await go('/')

await step('Home links: settings, tabs, session rows', async () => {
  await tap('Settings')
  ok('Settings button opens Settings', page.url().endsWith('#/settings'))
  await go('/')
  await page.getByRole('link', { name: 'New task' }).click()
  await page.waitForTimeout(400)
  ok('New task tab opens New task', page.url().endsWith('#/new'))
  await page.getByRole('link', { name: 'Agents' }).click()
  await page.waitForTimeout(400)
  ok('Agents tab opens Agents', page.url().endsWith('#/agents'))
  await page.getByRole('link', { name: 'Home' }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Claude Code portfolio/ }).click()
  await page.waitForTimeout(400)
  ok('Working row opens the session', page.url().endsWith('#/session/s1'))
})

await step('Model and intensity pickers update the rows', async () => {
  await go('/session/s1')
  await tap(/^Model/)
  await page.getByRole('radio').nth(1).click()
  await page.waitForTimeout(500)
  ok('Model shows the picked value', (await text()).includes('[Model name]'))
  await tap(/^Intensity/)
  await page.getByRole('radio', { name: /High/ }).click()
  await page.waitForTimeout(500)
  ok('Intensity shows High', (await page.getByRole('button', { name: /^Intensity/ }).innerText()).includes('High'))
})

await step('Stop → Stopped → Continue / Redirect / Undo / Go back further', async () => {
  await tap('Stop')
  ok('StopConfirm sheet', (await page.getByRole('dialog', { name: 'Stop this session?' }).innerText()).includes('5 files were already changed'))
  await tap('Stop session')
  ok('Stopped: What next?', page.url().includes('/stopped') && (await text()).includes('What next?'))
  await tap(/^Undo file changes/)
  ok('Undo → "Files restored"', (await toasts()).includes('Files restored'))
  await tap(/^Continue/)
  ok('Continue → working again', (await state()).sessions.find((s) => s.id === 's1').status === 'working')
  await tap('Stop')
  await tap('Stop session')
  await tap(/^Redirect/)
  await page.getByPlaceholder('Tell the agent what to do next').fill('Add a logout button')
  await page.getByRole('button', { name: 'Send answer' }).click()
  await page.waitForTimeout(500)
  const s1 = (await state()).sessions.find((s) => s.id === 's1')
  ok('Redirect → working with the new instruction', s1.status === 'working' && s1.text === 'Add a logout button')
  await tap('Stop')
  await tap('Stop session')
  await tap('Go back further')
  ok('Go back further opens Choose a point', (await text()).includes('Choose a point'))
  await page.getByRole('radio', { name: /Before this session started/ }).click()
  await tap('Restore files to this point')
  ok('Restore → toast and back to Stopped', (await toasts()).includes('Files restored') && page.url().includes('/stopped'))
})

await step('Terminal session: Stop asks to take over; Cursor can’t be stopped', async () => {
  await go('/')
  await page.locator('main article').filter({ hasText: 'Delete the old build folder' }).getByRole('button', { name: 'Approve' }).click()
  await page.waitForTimeout(2600)
  const id = (await state()).sessions.find((s) => s.origin === 'terminal').id
  await go('/session/' + id)
  ok('"Started in terminal" with the info alert', (await text()).includes('Started in terminal') && (await text()).includes('This session runs in your terminal'))
  await tap('Stop')
  ok('TakeOverConfirm sheet', (await page.getByRole('dialog').innerText()).includes('It stops in your terminal'))
  await page.getByRole('dialog').getByRole('button', { name: 'Stop', exact: true }).click()
  await page.waitForTimeout(500)
  ok('→ Stopped, now on the phone', page.url().includes('/stopped') && (await state()).sessions.find((s) => s.id === id).origin === 'phone')
  await go('/session/s2')
  ok('Cursor: Model/Intensity "Set in Cursor"', (await text()).includes('Set in Cursor'))
  await tap('Stop')
  ok('Cursor Stop → "Can’t stop Cursor from the phone"', (await page.getByRole('dialog').innerText()).includes('Can’t stop Cursor'))
  await tap('OK')
  ok('OK closes the sheet', (await page.getByRole('dialog').count()) === 0)
})

await step('Failed → Send to agent', async () => {
  await go('/session/s3')
  await tap('Send to agent')
  ok('empty → "Type an answer first."', (await text()).includes('Type an answer first.'))
  await page.getByPlaceholder('Tell the agent what to do next').fill('Fix the two failing tests')
  await tap('Send to agent')
  ok('"Sent to Codex" and the session is working', (await toasts()).includes('Sent to Codex') && (await state()).sessions.find((s) => s.id === 's3').status === 'working')
})

await step('Done → Start a follow-up task (Cursor → Claude Code)', async () => {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('nudge-proto-v1'))
    Object.assign(raw.state.sessions.find((s) => s.id === 's2'), { status: 'done', finishedAt: Date.now() - 600000, finishAt: null })
    localStorage.setItem('nudge-proto-v1', JSON.stringify(raw))
  })
  await go('/session/s2')
  await page.reload()
  await page.waitForTimeout(500)
  await tap('Start a follow-up task')
  const t = await text()
  ok('New task prefilled: Claude Code + site', page.url().endsWith('#/new') && t.includes('Claude Code') && t.includes('site'), t.slice(0, 120))
})

await step('New task: Start enables, starts a session', async () => {
  ok('Start disabled until instruction', await page.getByRole('button', { name: 'Start', exact: true }).isDisabled())
  await page.getByLabel('Instruction').fill('Add a dark mode toggle')
  await tap('Start')
  const st = await state()
  ok('"Task started" → Home with a new working session', page.url().endsWith('#/') && st.sessions[0].text === 'Add a dark mode toggle' && (await toasts()).includes('Task started'))
  await go('/new')
  await tap(/^Project folder/)
  ok('folder field opens Choose a folder', page.url().endsWith('#/new/folder'))
  await page.getByLabel('Search projects').fill('nope')
  ok('no match → the warning', (await text()).includes('No project found.'))
  await page.getByLabel('Search projects').fill('api')
  await page.getByRole('button', { name: /api-server/ }).click()
  await page.waitForTimeout(400)
  ok('picking a folder fills it', (await text()).includes('api-server'))
  await tap(/^Agent/)
  ok('Cursor is disabled in Choose agent', (await page.getByRole('radio', { name: /Cursor/ }).getAttribute('aria-disabled')) === 'true')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
})

await step('Agents: keep-awake toggle', async () => {
  await go('/agents')
  await page.getByRole('switch', { name: 'Windows PC' }).click()
  await page.waitForTimeout(200)
  ok('keep awake off → "Awake"', !(await text()).includes('Awake · keep awake'))
  await page.getByRole('switch', { name: 'Windows PC' }).click()
  await tap('Add a computer')
  ok('Add a computer opens', page.url().endsWith('#/computers/add'))
})

await step('Settings: time to answer, AI explanation, dark mode, phones, sign out', async () => {
  await go('/settings')
  await tap(/^Time to answer/)
  await page.getByRole('radio', { name: /^5 minutes/ }).click()
  await page.waitForTimeout(500)
  await go('/request/r2')
  ok('time to answer 5 → "after 5 min"', (await text()).includes('Goes back to your computer after 5 min'))
  await go('/settings')
  await page.getByRole('switch', { name: 'AI explanation' }).click()
  await go('/request/r1')
  const t = await text()
  ok('AI explanation off → info alert, no "What this does"', !t.includes('What this does') || t.includes('AI explanation is off'))
  await go('/settings')
  await page.getByRole('switch', { name: 'Dark mode' }).click()
  ok('Dark mode off → Light instantly', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light')
  await page.getByRole('switch', { name: 'Dark mode' }).click()
  ok('Dark mode on → Dark', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark')
  await tap(/^Paired phones/)
  await tap('Remove Old Android')
  ok('RemovePhoneConfirm', (await page.getByRole('dialog').innerText()).includes('Remove Old Android?'))
  await tap('Remove phone')
  ok('"Old Android removed", row gone', (await toasts()).includes('Old Android removed') && !(await page.locator('main ul').innerText()).includes('Old Android'))
  await go('/settings')
  ok('Paired phones now 1', (await page.getByRole('button', { name: /^Paired phones/ }).innerText()).includes('1'))
  await tap('Sign out')
  ok('SignOutConfirm', (await page.getByRole('dialog').innerText()).includes('Sign out?'))
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out' }).click()
  await page.waitForTimeout(1200)
  const st = await state()
  ok('Sign out clears saved state', st.phones.length === 2 && st.requests.length === 2)
})

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
