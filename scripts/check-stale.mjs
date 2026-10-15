// A page left open across a deploy asks for code files that no longer exist. The app should reload
// once and show the screen, and never loop if the file stays missing. Usage: node scripts/check-stale.mjs
import * as engines from 'playwright'
import { SETUP_DONE } from './testState.mjs'
const chromium = engines[process.env.BROWSER ?? 'chromium']

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })

const b = await chromium.launch()
// gone: "until-reload" = missing until the page reloads (a new deploy), "always" = never comes back.
const run = async (gone) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
  await ctx.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('nudge-proto-v1', s)
      sessionStorage.setItem('seeded', '1')
    }
  }, SETUP_DONE)
  const page = await ctx.newPage()
  let missing = 0
  let loads = 0
  page.on('load', () => loads++)
  // The Agents screen's code file is missing.
  await page.route(/\/assets\/Agents-[^/]+\.js$/, (route) => {
    missing++
    return route.fulfill({ status: 404, body: '' })
  })
  // After a deploy the reloaded page asks for the file under its new name (WebKit never re-fetches
  // an address that failed, so reusing the old name wouldn't be a real deploy).
  if (gone === 'until-reload') {
    await page.route(/\/assets\/index-[^/]+\.js$/, async (route) => {
      if (loads === 0) return route.continue()
      const res = await route.fetch()
      const body = (await res.text()).replace(/(Agents-[\w-]+\.js)/g, '$1?deploy=2')
      return route.fulfill({ response: res, body })
    })
  }
  await page.goto(BASE + '#/')
  await page.getByRole('heading', { name: 'Needs you' }).waitFor()
  await page.evaluate(() => (location.hash = '#/agents'))
  await page.waitForTimeout(2500)
  const heading = await page.getByRole('heading', { level: 1 }).allInnerTexts()
  await ctx.close()
  return { heading, loads, missing }
}

const once = await run('until-reload')
ok('file missing after a deploy → reloads once and shows Agents', once.heading.includes('Agents') && once.loads === 2, JSON.stringify(once))
const always = await run('always')
ok('file stays missing → reloads only once, no loop', always.loads === 2, JSON.stringify(always))

await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
