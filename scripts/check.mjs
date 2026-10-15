// Milestone check: screenshots, console errors/warnings, axe, theme-token swap, JS budget.
// Usage: node scripts/check.mjs <milestone> [baseUrl]   (run `npm run build` + preview first)
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const milestone = process.argv[2] ?? 'm1'
const base = process.argv[3] ?? 'http://localhost:4173/Nudge/app/'
const out = join('.shots', milestone)
mkdirSync(out, { recursive: true })

// Screens per milestone: [name, hash route, optional setup(page)]
const SCREENS = {
  m1: [
    ['blank', '#/'],
    ['tokens', '#/dev/tokens'],
    ['tokens-focus', '#/dev/tokens', async (p) => { await p.keyboard.press('Tab') }],
    ['unknown-route', '#/nope'],
  ],
  m4: (() => {
    const demo = (label) => async (p) => {
      await p.keyboard.press('d')
      await p.getByRole('dialog', { name: 'Demo' }).getByRole(label === 'Computer offline' ? 'switch' : 'button', { name: label }).click()
      if (label === 'Computer offline') await p.keyboard.press('Escape')
      await p.waitForTimeout(500)
    }
    const open = (label) => async (p) => {
      await demo(label)(p)
      await p.locator('main article').first().locator('h3 button').click()
      await p.waitForTimeout(600)
    }
    return [
      ['home', '#/'],
      ['home-scrolled', '#/', async (p) => p.evaluate(() => document.querySelector('#app-content > div')?.scrollTo(0, 9999))],
      ['computer-menu', '#/', async (p) => p.getByRole('button', { name: /Windows PC/ }).first().click()],
      ['home-offline', '#/', demo('Computer offline')],
      ['home-empty', '#/', demo('Show empty Home')],
      ['approval-low', '#/request/r1'],
      ['approval-high', '#/', open('Send a high-risk request')],
      ['question', '#/request/r2'],
      ['voice', '#/request/r2/voice', async (p) => p.waitForTimeout(2300)],
      ['plan', '#/', open('Send a plan')],
      ['faceid', '#/', async (p) => { await p.locator('main article').filter({ hasText: 'Delete the old build folder' }).getByRole('button', { name: 'Approve' }).click(); await p.waitForTimeout(350) }],
      ['add-computer', '#/computers/add'],
      ['gone', '#/request/nope'],
    ]
  })(),
  m3: [
    ['state', '#/dev/state'],
    ['demo-menu', '#/dev/state', async (p) => { await p.keyboard.press('d'); await p.getByRole('dialog').waitFor() }],
  ],
  m2: [
    ['gallery', '#/dev/components'],
    ['gallery-focus', '#/dev/components', async (p) => { for (let i = 0; i < 4; i++) await p.keyboard.press('Tab') }],
    ...['Home', 'ComputerSwitcher', 'HomeScrolled', 'Settings', 'TimeoutPicker', 'ModelPicker', 'Agents', 'ApprovalSent', 'EnterCode'].map((n) => [`ref-${n}`, `#/dev/ref/${n}`]),
  ],
}

const VIEWPORTS = [
  ['phone', { width: 390, height: 844 }, true],
  ['desktop', { width: 1280, height: 800 }, false],
]

// All doc copy (screens + flows + fake data + decisions), normalised, for the label check.
const DOC_COPY = ["docs/flows.md", "docs/fake-data.md", "docs/decisions.md", ...readdirSync("docs/screens").map((f) => "docs/screens/" + f)]
  .map((f) => readFileSync(f, "utf8"))
  .join(' ')
  .replace(/[’‘]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[*`]/g, "")
  .replace(/\d+/g, '#') // numbers are live data ("Next request (2 of 3)")
  .toLowerCase()

const report = { milestone, console: [], axe: [], tokens: null, budget: null, shots: [] }

const browser = await chromium.launch()

for (const theme of ['dark', 'light']) {
  for (const [vpName, viewport, isMobile] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      isMobile,
      hasTouch: isMobile,
      reducedMotion: 'reduce',
    })
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('nudge-proto-v1', JSON.stringify({ state: { theme: t }, version: 1 }))
      } catch {
        /* about:blank has no storage */
      }
    }, theme)
    const page = await ctx.newPage()
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning')
        report.console.push({ theme, vp: vpName, url: page.url(), type: m.type(), text: m.text() })
    })
    page.on('pageerror', (e) => report.console.push({ theme, vp: vpName, type: 'pageerror', text: e.message }))

    for (const [name, route, setup] of SCREENS[milestone.split('-')[0]]) {
      await page.goto('about:blank') // full load each time: every screen starts from the seeded state
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      if (setup) await setup(page)
      await page.waitForTimeout(450) // let sheet/menu entrance transitions finish before measuring
      const file = join(out, `${name}-${vpName}-${theme}.png`)
      await page.screenshot({ path: file })
      report.shots.push(file)
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
      for (const v of axe.violations)
        report.axe.push({ theme, vp: vpName, screen: name, id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5) })
      // Touch targets: every visible control at least 44×44 (switches enlarge their hit area with ::before).
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('button, a[href], input:not([type=hidden]), textarea, [role=switch], [role=radio], [role^=menuitem]')]
          // Switches enlarge their hit area with ::before; stretched card links cover the whole card.
          .filter((el) => !el.closest('[aria-hidden=true]') && el.getAttribute('role') !== 'switch' && !el.hasAttribute('data-stretched'))
          .map((el) => [el, el.getBoundingClientRect()])
          .filter(([, r]) => r.width > 0 && r.height > 0 && (r.width < 43.5 || r.height < 43.5))
          .map(([el, r]) => `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`),
      )
      if (small.length) (report.smallTargets ??= []).push({ theme, vp: vpName, screen: name, small: small.slice(0, 12) })
      // Copy check: every visible button/link label must be copy from the docs (the reference images
      // carry Figma placeholders such as "Approve" on every button — those must never reach the app).
      if (!name.startsWith('gallery')) {
        const labels = await page.evaluate(() =>
          [...document.querySelectorAll('button, a[href], [role=button], [role=menuitem], [role=menuitemradio], [role=radio]')]
            .filter((el) => !el.closest('[aria-hidden=true]') && el.getBoundingClientRect().width > 0)
            // Rows that hold several pieces (agent · project · time · status) are checked piece by piece.
            .flatMap((el) => (el.innerText || '').split('\n'))
            .map((t) => t.trim().replace(/\s+/g, ' '))
            .filter(Boolean),
        )
        const norm = (t) => t.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\d+/g, '#').toLowerCase()
        const bad = [...new Set(labels)].filter((l) => !DOC_COPY.includes(norm(l)))
        if (bad.length) (report.copy ??= []).push({ theme, vp: vpName, screen: name, notInDocs: bad })
      }
      if (name === 'blank') {
        const info = await page.evaluate(() => {
          const r = document.documentElement
          const dev = document.getElementById('device').getBoundingClientRect()
          return {
            dataTheme: r.dataset.theme,
            metaThemeColor: document.querySelector('meta[name="theme-color"]').content,
            device: { x: dev.x, y: dev.y, w: dev.width, h: dev.height },
            scrollW: document.documentElement.scrollWidth,
            fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`),
          }
        })
        report[`blank-${vpName}-${theme}`] = info
      }
    }
    await ctx.close()
  }
}

// Theme switch: instant (no reload) and remembered after refresh.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(base + '#/dev/tokens', { waitUntil: 'networkidle' })
  const before = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.getByRole('button').click()
  const after = await page.evaluate(() => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor])
  await page.reload({ waitUntil: 'networkidle' })
  const reloaded = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('nudge-proto-v1')])
  report.themeSwitch = { before, after, reloaded }
  await ctx.close()
}

// Every colour/depth token must change between dark and light.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(base + '#/', { waitUntil: 'networkidle' })
  const read = () =>
    page.evaluate(() => {
      const names = new Set()
      for (const sheet of document.styleSheets)
        for (const rule of sheet.cssRules)
          if (rule.selectorText?.includes("[data-theme='light']") || rule.selectorText?.includes('[data-theme="light"]'))
            for (const p of rule.style) if (p.startsWith('--')) names.add(p)
      const cs = getComputedStyle(document.documentElement)
      return Object.fromEntries([...names].map((n) => [n, cs.getPropertyValue(n).trim()]))
    })
  await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'))
  const dark = await read()
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'))
  const light = await read()
  const same = Object.keys(light).filter((k) => dark[k] === light[k])
  report.tokens = { themedTokens: Object.keys(light).length, unchanged: same }
  await ctx.close()
}

await browser.close()

// No hard-coded colours outside the token file.
{
  const hits = []
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name)
      if (f.isDirectory()) walk(p)
      else if (/\.(css|tsx?)$/.test(f.name) && !p.endsWith('tokens.css'))
        readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
          const colour = /#[0-9a-fA-F]{3,8}\b(?![\w-])|rgba?\(|hsla?\(/.test(line)
          const comment = /^\s*(\/\/|\*|\/\*)/.test(line)
          if (colour && !comment) hits.push(`${p}:${i + 1}: ${line.trim()}`)
        })
    }
  }
  walk('src')
  report.hardCodedColours = hits
}

// First-load JS: entry chunk + its static imports, gzipped (index.html <script>/<link rel=modulepreload>).
{
  const dir = 'site/app'
  const html = readFileSync(join(dir, 'index.html'), 'utf8')
  const files = [...html.matchAll(/(?:src|href)="\/Nudge\/app\/(assets\/[^"]+\.js)"/g)].map((m) => m[1])
  const sizes = files.map((f) => [f, gzipSync(readFileSync(join(dir, f)), { level: 9 }).length])
  const allJs = readdirSync(join(dir, 'assets')).filter((f) => f.endsWith('.js'))
  report.budget = {
    firstLoadGzBytes: sizes.reduce((a, [, n]) => a + n, 0),
    firstLoad: sizes,
    lazyChunks: allJs.filter((f) => !files.includes('assets/' + f)),
  }
}

writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ ...report, shots: report.shots.length }, null, 2))
