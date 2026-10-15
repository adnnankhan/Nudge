// M3 behaviour test: the living app on a fake clock. Usage: node scripts/check-sim.mjs
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))

await page.clock.install({ time: new Date('2026-10-15T11:00:00') })
await page.goto(BASE + '#/dev/state')
await page.evaluate(() => localStorage.clear())
await page.reload()
await page.waitForSelector('[data-testid=needs]')

const read = () =>
  page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('nudge-proto-v1')).state
    const by = (st) => s.sessions.filter((x) => x.status === st).length
    return {
      requests: s.requests.map((r) => r.title),
      working: by('working'),
      paused: by('paused'),
      done: by('done'),
      failed: by('failed'),
      denied: by('denied'),
      expired: by('expired'),
      recent: s.sessions.find((x) => x.id === 's1')?.recent ?? [],
      events: s.events.map((e) => e.kind),
      offline: s.offline,
      nextArrivalAt: s.nextArrivalAt,
    }
  })

let s = await read()
ok('starting state: 2 waiting, 1 working, 1 done, 1 failed', s.requests.length === 2 && s.working === 1 && s.done === 1 && s.failed === 1, JSON.stringify(s.requests))

await page.clock.runFor(7_000)
s = await read()
ok('working session adds a Recent line after ~6 s', s.recent.length >= 1, s.recent.join(', '))

await page.clock.runFor(20_000) // 27 s after reaching Home
s = await read()
ok('a request arrives on its own ~25 s after Home', s.requests.length === 3 && s.events.includes('request'), JSON.stringify(s.requests))

await page.clock.runFor(70_000) // ~97 s
s = await read()
ok('working session finishes after 60–90 s (Done + event)', s.done >= 2 && s.events.includes('finished'), JSON.stringify({ done: s.done, events: s.events }))
ok('requests past Time to answer go back to the computer (1 real min = 10 min)', s.expired >= 2, `expired ${s.expired}`)

// Refresh keeps state
const before = await read()
await page.reload()
await page.waitForSelector('[data-testid=needs]')
const after = await read()
ok('refresh keeps state', JSON.stringify(before.requests) === JSON.stringify(after.requests) && before.done === after.done && before.expired === after.expired)

// Demo menu: D opens it; arrival timer holds while open
await page.keyboard.press('d')
const dialog = page.getByRole('dialog', { name: 'Demo' })
await dialog.waitFor()
ok('D opens the demo menu', await dialog.isVisible())
const reqsBefore = (await read()).requests.length
await page.clock.runFor(120_000)
const held = (await read()).requests.length
ok('arrival timer and time to answer hold while the demo menu is open', held === reqsBefore, `${reqsBefore} → ${held}`)

await dialog.getByRole('button', { name: 'Send a high-risk request' }).click()
await page.clock.runFor(1_000)
s = await read()
ok('Send a high-risk request adds one and closes the menu', s.requests.some((t) => t === 'Force-push to main' || t === 'Delete a folder') && !(await dialog.isVisible()))

await page.keyboard.press('d')
await dialog.waitFor()
await dialog.getByRole('switch', { name: 'Computer offline' }).click()
s = await read()
ok('Computer offline: on → offline, sessions paused', s.offline && s.paused >= 1, `paused ${s.paused}`)
await dialog.getByRole('switch', { name: 'Computer offline' }).click()
s = await read()
ok('Computer offline: off → back to working', !s.offline && s.paused === 0)
await page.keyboard.press('Escape')
await page.clock.runFor(1_000)
ok('Esc closes the demo menu', !(await dialog.isVisible()))

// Approve and deny from the cards
const firstCard = page.locator('[data-testid=needs] article').first()
const title = await firstCard.locator('h3').innerText()
const hasDeny = await firstCard.getByRole('button', { name: 'Deny' }).count()
if (hasDeny) {
  await firstCard.getByRole('button', { name: 'Deny' }).click()
  s = await read()
  ok('Deny removes the request and adds a Denied row', !s.requests.includes(title) && s.denied >= 1, title)
}

// Reset demo
await page.keyboard.press('d')
await dialog.waitFor()
await dialog.getByRole('button', { name: 'Reset demo' }).click()
await page.waitForSelector('h1')
await page.goto(BASE + '#/dev/state')
await page.waitForSelector('[data-testid=needs]')
s = await read()
ok('Reset demo starts again from the starting state', s.requests.length === 2 && s.denied === 0 && s.expired === 0, JSON.stringify(s.requests))

ok('no console errors or warnings', errors.length === 0, errors.join(' | '))
await b.close()

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
