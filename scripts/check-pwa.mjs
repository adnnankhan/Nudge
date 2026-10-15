// M8: installable, works offline, deep links survive refresh. Usage: node scripts/check-pwa.mjs
import { chromium } from 'playwright'
import { SETUP_DONE } from './testState.mjs'

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
await ctx.addInitScript((s) => {
  if (!sessionStorage.getItem('seeded')) {
    localStorage.setItem('nudge-proto-v1', s)
    sessionStorage.setItem('seeded', '1')
  }
}, SETUP_DONE)
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(BASE, { waitUntil: 'networkidle' })

// Manifest
const manifestHref = await page.locator('link[rel=manifest]').getAttribute('href')
const manifestUrl = new URL(manifestHref, page.url()).href
const manifest = await (await page.request.get(manifestUrl)).json()
ok('manifest linked and valid', manifest.name === 'Nudge' && manifest.display === 'standalone' && manifest.start_url === '/Nudge/app/' && manifest.scope === '/Nudge/app/', manifestUrl)
ok('theme and background #0E0F12', manifest.theme_color === '#0E0F12' && manifest.background_color === '#0E0F12')
for (const icon of manifest.icons) {
  const r = await page.request.get(new URL(icon.src, manifestUrl).href)
  ok(`icon ${icon.src} (${icon.sizes}, ${icon.purpose}) loads`, r.ok())
}
ok('has a maskable icon and a 512 icon', manifest.icons.some((i) => i.purpose === 'maskable') && manifest.icons.some((i) => i.sizes === '512x512'))
const touch = await page.locator('link[rel=apple-touch-icon]').getAttribute('href')
ok('apple-touch-icon (180) loads', (await page.request.get(new URL(touch, page.url()).href)).ok())
ok('iOS status bar: black-translucent', (await page.locator('meta[name=apple-mobile-web-app-status-bar-style]').getAttribute('content')) === 'black-translucent')
ok('viewport-fit=cover', (await page.locator('meta[name=viewport]').getAttribute('content')).includes('viewport-fit=cover'))

// Service worker
const swReady = await page.evaluate(async () => {
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 10000))])
  return reg ? reg.scope : null
})
ok('service worker active with scope /Nudge/app/', swReady?.endsWith('/Nudge/app/'), swReady)
await page.reload({ waitUntil: 'networkidle' })
ok('page controlled by the service worker', await page.evaluate(() => !!navigator.serviceWorker.controller))

// Chrome's own installability check
const cdp = await ctx.newCDPSession(page)
const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
ok('Chrome says it is installable (no installability errors)', installabilityErrors.length === 0, JSON.stringify(installabilityErrors))

// Offline
await ctx.setOffline(true)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
ok('opens offline (Home renders)', (await page.getByRole('heading', { name: 'Needs you' }).count()) === 1)
await page.goto(BASE + '#/settings')
await page.waitForTimeout(800)
ok('lazy screens work offline (Settings)', (await page.getByRole('heading', { name: 'Settings' }).count()) === 1)
await page.goto(BASE + '#/demo/lock/approvals')
await page.waitForTimeout(800)
ok('demo screens work offline (lock screen)', (await page.locator('body').innerText()).includes('9:41'))
const fontsOk = await page.evaluate(async () => {
  await document.fonts.ready
  return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight)
})
ok('fonts load offline', fontsOk.some((f) => f.includes('IBM Plex Sans')), fontsOk.join(', '))
await ctx.setOffline(false)

// Deep links survive refresh
for (const [route, heading] of [['#/settings', 'Settings'], ['#/agents', 'Agents'], ['#/new', 'New task'], ['#/session/s3', 'Stopped: tests didn’t pass']]) {
  await page.goto(BASE + route)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  ok(`deep link ${route} survives refresh`, (await page.getByRole('heading', { level: 1, name: heading }).count()) === 1)
}

const offlineNoise = (t) => /ERR_INTERNET_DISCONNECTED|Failed to fetch|net::ERR/.test(t)
const real = errors.filter((e) => !offlineNoise(e))
ok('no console errors or warnings', real.length === 0, real.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
