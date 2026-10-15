// M5 behaviour: session control (now from the thread's Task menu), agents, settings — every row and
// button goes somewhere. New task is checked in check-m5b.mjs. Usage: node scripts/check-m5.mjs
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
const path = () => new URL(page.url()).hash.replace(/^#/, '')
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state)
const tap = async (name, opts = {}) => {
  await page.getByRole(opts.role ?? 'button', { name, exact: typeof name === 'string' }).first().click()
  await page.waitForTimeout(opts.wait ?? 450)
}
const text = () => page.locator('#app-content').innerText()
const toasts = () => page.locator('[role=status]').allInnerTexts().then((t) => t.join(' | '))
const menu = () => page.getByRole('dialog', { name: 'Task' })
const openMenu = async () => {
  await page.getByRole('button', { name: 'Task menu', exact: true }).click()
  await menu().waitFor()
}

// Fresh state, no arrivals during the test (banners would sit over the top bar).
await seedOnce(page, JSON.stringify({ state: { signedIn: true, onboarded: true, nextArrivalAt: Date.now() + 1e9 }, version: 5 }))
await go('/')

await step('Home links: settings, tabs, session rows', async () => {
  await tap('Settings')
  ok('Settings button opens Settings', page.url().endsWith('#/settings'))
  await go('/')
  await page.getByRole('link', { name: 'New task' }).click()
  await page.waitForTimeout(400)
  ok('New task tab opens New task', page.url().endsWith('#/new'))
  await page.getByRole('link', { name: /^Tasks/ }).click()
  await page.waitForTimeout(400)
  ok('Tasks tab opens Tasks', page.url().endsWith('#/tasks'))
  await page.getByRole('link', { name: 'Agents' }).click()
  await page.waitForTimeout(400)
  ok('Agents tab opens Agents', page.url().endsWith('#/agents'))
  await page.getByRole('link', { name: 'Home' }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Claude Code\s*portfolio/ }).click()
  await page.waitForTimeout(500)
  ok('Working row opens its thread', page.url().endsWith('#/task/s1'))
})

await step('Model and intensity pickers (Task menu)', async () => {
  await go('/task/s1')
  await openMenu()
  await menu().getByRole('button', { name: /^Model/ }).click()
  await page.getByRole('dialog', { name: 'Model' }).getByRole('radio').nth(1).click()
  await page.waitForTimeout(500)
  ok('Model shows the picked value', (await menu().innerText()).includes('[Model name]'))
  await menu().getByRole('button', { name: /^Intensity/ }).click()
  await page.getByRole('radio', { name: /High/ }).click()
  await page.waitForTimeout(500)
  ok('Intensity shows High', (await menu().getByRole('button', { name: /^Intensity/ }).innerText()).includes('High'))
})

await step('Stop → Stopped → Continue / Redirect / Undo / Go back further', async () => {
  await menu().getByRole('button', { name: 'Stop task' }).click()
  ok('StopConfirm sheet', (await page.getByRole('dialog', { name: 'Stop this session?' }).innerText()).includes('5 files were already changed'))
  await tap('Stop session')
  ok('Stopped: What next?', path().includes('/stopped') && (await text()).includes('What next?'))
  await tap(/^Undo file changes/)
  ok('Undo → "Files restored"', (await toasts()).includes('Files restored'))
  await tap(/^Continue/)
  ok('Continue → working again, back in the thread', (await state()).sessions.find((s) => s.id === 's1').status === 'working' && path() === '/task/s1')
  await openMenu()
  await menu().getByRole('button', { name: 'Stop task' }).click()
  await tap('Stop session')
  await tap(/^Redirect/)
  await page.getByPlaceholder('Tell the agent what to do next').fill('Add a logout button')
  await page.getByRole('button', { name: 'Send answer' }).click()
  await page.waitForTimeout(600)
  const s1 = (await state()).sessions.find((s) => s.id === 's1')
  ok('Redirect → working with the new instruction, in the thread', s1.status === 'working' && s1.text === 'Add a logout button' && (await text()).includes('Add a logout button'))
  await openMenu()
  await menu().getByRole('button', { name: 'Stop task' }).click()
  await tap('Stop session')
  await tap('Go back further')
  ok('Go back further opens Choose a point', (await text()).includes('Choose a point'))
  await page.getByRole('radio', { name: /Before this session started/ }).click()
  await tap('Restore files to this point')
  ok('Restore → toast and back to Stopped', (await toasts()).includes('Files restored') && path().includes('/stopped'))
})

await step('Terminal task: Stop asks to take over; Cursor is set in Cursor', async () => {
  await go('/')
  // my-app is waiting on you already, so a second my-app request starts its own task in the terminal.
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: 'Send a medium-risk request' }).click()
  await page.waitForTimeout(500)
  const st = await state()
  const r = st.requests.find((x) => x.title === 'Install a new package')
  const task = st.sessions.find((s) => s.id === r.taskId)
  ok('new task "Started in terminal"', task.origin === 'terminal' && task.thread[0].text === 'Started in terminal')
  await page.locator('main article').filter({ hasText: 'Install a new package' }).getByRole('button', { name: 'Approve' }).click()
  await page.waitForTimeout(2600)
  await go('/task/' + task.id)
  await openMenu()
  await menu().getByRole('button', { name: 'Stop task' }).click()
  ok('TakeOverConfirm sheet', (await page.getByRole('dialog', { name: 'Stop this session?' }).innerText()).includes('It stops in your terminal'))
  await page.getByRole('dialog', { name: 'Stop this session?' }).getByRole('button', { name: 'Stop', exact: true }).click()
  await page.waitForTimeout(500)
  ok('→ Stopped, now on the phone', path().includes('/stopped') && (await state()).sessions.find((s) => s.id === task.id).origin === 'phone')
  await go('/task/s2')
  await openMenu()
  ok('Cursor: Model/Intensity "Set in Cursor"', (await menu().innerText()).includes('Set in Cursor'))
  await page.keyboard.press('Escape')
})

await step('Failed task: a follow-up picks it up again', async () => {
  await go('/task/s3')
  ok('"Stopped · 2 tests failing in docs.test.js"', (await text()).includes('Stopped · 2 tests failing in docs.test.js'))
  await page.getByRole('textbox', { name: 'Ask a follow-up…' }).fill('Fix the two failing tests')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await page.waitForTimeout(400)
  ok('working again with your message', (await state()).sessions.find((s) => s.id === 's3').status === 'working' && (await text()).includes('Fix the two failing tests'))
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
  // A fresh request (the seeded ones would already be past 5 minutes).
  await go('/')
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: 'Send a question' }).click()
  await page.waitForTimeout(400)
  const q = (await state()).requests.find((r) => r.kind === 'question')
  await go('/request/' + q.id)
  ok('time to answer 5 → "after 5 min"', (await text()).includes('Goes back to your computer after 5 min'))
  await go('/settings')
  await page.getByRole('switch', { name: 'AI explanation' }).click()
  await go('/')
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: 'Send a low-risk request' }).click()
  await page.waitForTimeout(400)
  const low = (await state()).requests.find((r) => r.kind === 'approval')
  await go('/request/' + low.id)
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
