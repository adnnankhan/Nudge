// M6: fresh browser → sign in → setup → Home, with every error state and no dead ends.
// Usage: node scripts/check-m6.mjs
import { chromium } from 'playwright'

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

const path = () => new URL(page.url()).hash.replace(/^#/, '')
const h1 = () => page.getByRole('heading', { level: 1 }).first().innerText()
const tap = async (name, wait = 400) => {
  await page.getByRole('button', { name, exact: typeof name === 'string' }).first().click()
  await page.waitForTimeout(wait)
}
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state)
const toasts = () => page.locator('[role=status]').allInnerTexts().then((t) => t.join(' | '))

await page.goto(BASE + '#/')
await page.evaluate(() => localStorage.clear())
await page.goto('about:blank')
await page.goto(BASE + '#/')
await page.waitForTimeout(600)

await step('First visit starts at Sign in', async () => {
  ok('fresh browser → /signin', path() === '/signin' && (await h1()) === 'Sign in', path())
})

await step('Sign in: disabled, wrong password, then in', async () => {
  const btn = page.getByRole('button', { name: 'Sign in', exact: true })
  ok('Sign in disabled until both fields have text', await btn.isDisabled())
  await page.getByLabel('Email').fill('adnan@example.com')
  await page.getByLabel('Password', { exact: true }).fill('wrong')
  ok('enabled once both have text', !(await btn.isDisabled()))
  await btn.click()
  await page.waitForTimeout(300)
  ok('password "wrong" → "Wrong email or password."', (await page.getByRole('alert').innerText()).includes('Wrong email or password.'))
  ok('password field marked invalid', (await page.getByLabel('Password', { exact: true }).getAttribute('aria-invalid')) === 'true')
  await tap('Show password', 200)
  ok('eye toggle shows the password', (await page.getByLabel('Password', { exact: true }).getAttribute('type')) === 'text')
  await page.getByLabel('Password', { exact: true }).fill('secret')
  ok('editing clears the error', (await page.getByRole('alert').count()) === 0)
})

await step('Create account and Forgot password', async () => {
  await tap('Create account')
  ok('"Create account" link opens /signup', path() === '/signup')
  const create = page.getByRole('button', { name: 'Create account', exact: true })
  await page.getByLabel('Email').fill('adnan@example.com')
  await page.getByLabel('Password', { exact: true }).fill('short')
  ok('disabled until password ≥ 8', await create.isDisabled())
  await page.getByLabel('Password', { exact: true }).fill('longenough')
  ok('enabled when valid', !(await create.isDisabled()))
  await tap('Sign in instead')
  ok('"Sign in instead" → /signin', path() === '/signin')
  await tap('Forgot password?')
  ok('"Forgot password?" → /forgot', path() === '/forgot' && (await h1()) === 'Reset your password')
  await page.getByLabel('Email').fill('adnan@example.com')
  await tap('Send reset link', 1000)
  const alert = await page.locator('main').innerText()
  ok('info alert "Link sent to … Check your inbox and spam folder."', alert.includes('Link sent to adnan@example.com. Check your inbox and spam folder.'))
  await tap('Resend', 1000)
  ok('Resend shows it again', (await page.locator('main').innerText()).includes('Link sent to adnan@example.com.'))
  await tap('Back')
  ok('back returns to Sign in', path() === '/signin')
})

await step('Sign in → Setup intro → Link sent → Scan', async () => {
  await page.getByLabel('Email').fill('adnan@example.com')
  await page.getByLabel('Password', { exact: true }).fill('secret')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  ok('Enter submits → Set up your computer first', path() === '/setup' && (await h1()) === 'Set up your computer first')
  await page.reload()
  await page.waitForTimeout(500)
  ok('refresh mid-setup stays in setup', path() === '/setup')
  await tap('Email me the link')
  ok('Link sent shows the email', (await page.locator('main').innerText()).includes('We sent the download link to adnan@example.com.'))
  await tap('Resend link')
  ok('Resend link → toast', (await toasts()).includes('Link sent to adnan@example.com.'))
  await tap('Scan the code')
  ok('Scan the code → /setup/scan', path() === '/setup/scan')
})

await step('Scan: failed scan, try again, success → connecting → agents', async () => {
  await tap('Simulate a failed scan')
  ok('"Couldn’t read the code." with Try again', (await page.locator('main').innerText()).includes('Couldn’t read the code.'))
  await page.waitForTimeout(3000)
  ok('a failed scan stays failed', path() === '/setup/scan')
  await tap('Try again', 100)
  await page.waitForURL(/setup\/connecting/, { timeout: 5000 })
  ok('after 2.5 s → Connecting', (await h1()) === 'Connecting to your computer…')
  await page.waitForURL(/setup\/agents/, { timeout: 5000 })
  ok('after 1.8 s → Agents on this computer', (await h1()) === 'Agents on this computer')
  const t = await page.locator('main').innerText()
  ok('Claude Code + Codex Connected, Cursor Not connected', /Codex[\s\S]*Connected/.test(t) && t.includes('Not connected'))
})

await step('Enter code: expired, then connect; Cancel on connecting', async () => {
  await page.goto(BASE + '#/setup/code')
  await page.waitForTimeout(400)
  const connect = page.getByRole('button', { name: 'Connect', exact: true })
  ok('Connect disabled until 6 digits', await connect.isDisabled())
  await page.getByLabel('Enter the code').fill('000000')
  await connect.click()
  await page.waitForTimeout(200)
  ok('000000 → "This code has expired…"', (await page.getByRole('alert').innerText()).includes('This code has expired. Use the new code on your computer.'))
  await page.getByLabel('Enter the code').fill('482917')
  await connect.click()
  await page.waitForTimeout(400)
  ok('any other code → Connecting', path() === '/setup/connecting')
  await tap('Cancel')
  ok('Cancel → Scan', path() === '/setup/scan')
})

await step('Agents → Notifications → Not now → Home + KeepAwake', async () => {
  await page.goto(BASE + '#/setup/agents')
  await page.waitForTimeout(400)
  await tap('Continue')
  ok('Continue → Turn on notifications', (await h1()) === 'Turn on notifications')
  ok('preview buttons are not focusable', (await page.getByRole('button', { name: 'Deny' }).count()) === 0)
  await tap('Not now', 800)
  ok('Not now → Home', path() === '/' && (await page.getByRole('heading', { name: 'Needs you' }).count()) === 1)
  ok('KeepAwake sheet is open', (await page.getByRole('dialog').innerText()).includes('Keep Windows PC awake while agents work?'))
  await tap('Keep awake')
  const st = await state()
  ok('Keep awake saved; sheet gone', st.computers.find((c) => c.id === 'win').keepAwake === true && (await page.getByRole('dialog').count()) === 0 && !st.showKeepAwake)
  ok('"Not now" on notifications shows the warning on Home', (await page.locator('main').innerText()).includes('Notifications are off. You’ll miss requests.'))
})

await step('Later visits skip to Home; back to Sign in is not possible', async () => {
  await page.goto('about:blank')
  await page.goto(BASE + '#/')
  await page.waitForTimeout(500)
  ok('second visit opens on Home', path() === '/')
  await page.goto(BASE + '#/signin')
  await page.waitForTimeout(400)
  ok('/signin when set up → Home', path() === '/')
  await page.goto(BASE + '#/setup/scan')
  await page.waitForTimeout(400)
  ok('setup screens when set up → Home', path() === '/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.waitForTimeout(300)
  ok('account row shows the signed-in email', (await page.locator('main').innerText()).includes('adnan@example.com'))
})

await step('Add a computer: scan → connecting → Home', async () => {
  await page.goto(BASE + '#/computers/add')
  await page.waitForTimeout(400)
  await tap('Scan the code', 100)
  ok('opens Scan', path().startsWith('/setup/scan'))
  await page.waitForURL(/connecting/, { timeout: 5000 })
  await page.waitForURL((u) => u.hash === '#/', { timeout: 5000 })
  ok('then back to Home', path() === '/')
})

await step('Demo: "no agents" setup', async () => {
  await page.keyboard.press('d')
  await page.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: /no agents/ }).click()
  await page.waitForTimeout(500)
  ok('NoAgents screen', (await h1()) === 'No coding agents found on this computer')
  const popup = page.waitForEvent('popup', { timeout: 3000 }).catch(() => null)
  await page.getByRole('button', { name: /How to install Claude Code/ }).click()
  const pop = await popup
  ok('"How to install Claude Code" opens its guide', !!pop)
  await pop?.close()
  await tap('Continue without agents')
  ok('Continue without agents → notifications', (await h1()) === 'Turn on notifications')
  await tap('Not now', 600)
  const st = await state()
  ok('ends on Home, still set up, no KeepAwake', path() === '/' && st.onboarded && !st.showKeepAwake)
})

await step('Sign out → Sign in', async () => {
  await page.goto(BASE + '#/settings')
  await page.waitForTimeout(400)
  await tap('Sign out')
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out' }).click()
  await page.waitForTimeout(1200)
  ok('back at Sign in with nothing saved', path() === '/signin' && !(await state()).signedIn)
})

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
