// Milestone check: screenshots, console errors/warnings, axe, theme-token swap, JS budget.
// Usage: node scripts/check.mjs <milestone> [baseUrl]   (run `npm run build` + preview first)
import { chromium } from 'playwright'
import { SETUP_DONE, ONBOARDING } from './testState.mjs'
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
  m7: [
    ['lock-approvals', '#/demo/lock/approvals'],
    ['lock-questions', '#/demo/lock/questions'],
    ['lock-alerts', '#/demo/lock/alerts'],
    ['lock-approved', '#/demo/lock/approvals', async (p) => {
      await p.getByRole('button', { name: 'Approve', exact: true }).click()
      await p.waitForTimeout(1700)
    }],
    ['helper-pair', '#/demo/helper/pair'],
    ['helper-connect', '#/demo/helper/connect'],
    ['helper-status', '#/demo/helper/status'],
    ['approval-states', '#/demo/states'],
    ['new-task-states', '#/demo/new-task-states'],
    ['demo-menu', '#/', async (p) => {
      await p.keyboard.press('d')
      await p.getByRole('dialog', { name: 'Demo' }).waitFor()
      await p.getByRole('dialog').evaluate((d) => d.scrollTo(0, 9999))
    }],
  ],
  m6: [
    ['signin', '#/signin'],
    ['signin-error', '#/signin', async (p) => {
      await p.getByLabel('Email').fill('you@email.com')
      await p.getByLabel('Password', { exact: true }).fill('wrong')
      await p.getByRole('button', { name: 'Sign in', exact: true }).click()
    }],
    ['signin-focus', '#/signin', async (p) => { for (let i = 0; i < 3; i++) await p.keyboard.press('Tab') }],
    ['signup', '#/signup'],
    ['forgot', '#/forgot'],
    ['forgot-sent', '#/forgot', async (p) => {
      await p.getByLabel('Email').fill('you@email.com')
      await p.getByRole('button', { name: 'Send reset link' }).click()
      await p.waitForTimeout(900)
    }],
    ['setup-intro', '#/setup'],
    ['link-sent', '#/setup/link-sent'],
    ['scan', '#/setup/scan'],
    ['scan-failed', '#/setup/scan', async (p) => p.getByRole('button', { name: 'Simulate a failed scan' }).click()],
    ['code', '#/setup/code'],
    ['code-expired', '#/setup/code', async (p) => {
      await p.getByLabel('Enter the code').fill('000000')
      await p.getByRole('button', { name: 'Connect' }).click()
    }],
    ['connecting', '#/setup/connecting'],
    ['agents-found', '#/setup/agents'],
    ['no-agents', '#/setup/no-agents?mode=demo'],
    ['notifications', '#/setup/notifications'],
    ['keep-awake', '#/', async (p) => {
      await p.evaluate(() => {
        const raw = JSON.parse(localStorage.getItem('nudge-proto-v1'))
        raw.state.showKeepAwake = true
        localStorage.setItem('nudge-proto-v1', JSON.stringify(raw))
      })
      await p.reload()
      await p.waitForTimeout(800)
    }],
  ],
  m5: (() => {
    const tap = (name) => async (p) => {
      await p.getByRole('button', { name, exact: typeof name === 'string' }).first().click()
      await p.waitForTimeout(500)
    }
    // Session control lives in the thread's Task menu now (05-session-control.md).
    const menu = (row) => async (p) => {
      await tap('Task menu')(p)
      if (row) await p.getByRole('dialog', { name: 'Task' }).getByRole('button', { name: row }).first().click()
      await p.waitForTimeout(500)
    }
    const terminal = async (p) => {
      await p.keyboard.press('d')
      await p.getByRole('dialog', { name: 'Demo' }).getByRole('button', { name: 'Send a medium-risk request' }).click()
      await p.waitForTimeout(500)
      await p.locator('main article').filter({ hasText: 'Install a new package' }).getByRole('button', { name: 'Approve' }).click()
      await p.waitForTimeout(2600)
      const id = await p.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.sessions.find((s) => s.origin === 'terminal' && s.status === 'working')?.id)
      await p.goto(`http://localhost:4173/Nudge/app/#/task/${id}`)
      await p.waitForTimeout(600)
    }
    const stop = async (p) => { await menu('Stop task')(p); await tap('Stop session')(p) }
    return [
      ['session-working', '#/task/s1'],
      ['model-picker', '#/task/s1', menu(/^Model/)],
      ['intensity-picker', '#/task/s1', menu(/^Intensity/)],
      ['stop-confirm', '#/task/s1', menu('Stop task')],
      ['stopped', '#/task/s1', stop],
      ['redirect', '#/task/s1', async (p) => { await stop(p); await tap(/^Redirect/)(p) }],
      ['undo-further', '#/session/s1/undo'],
      ['session-terminal', '#/', terminal],
      ['take-over', '#/', async (p) => { await terminal(p); await menu('Stop task')(p) }],
      ['cursor', '#/task/s2'],
      ['session-failed', '#/task/s3'],
      ['agents', '#/agents'],
      ['settings', '#/settings'],
      ['timeout', '#/settings', tap(/^Time to answer/)],
      ['sign-out', '#/settings', tap('Sign out')],
      ['phones', '#/settings/phones'],
      ['remove-phone', '#/settings/phones', tap('Remove Old Android')],
    ]
  })(),
  m5b: (() => {
    const tap = (name) => async (p) => {
      await p.getByRole('button', { name, exact: typeof name === 'string' }).first().click()
      await p.waitForTimeout(500)
    }
    const demo = (label) => async (p) => {
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
      await p.keyboard.press('d')
      await p.getByRole('dialog', { name: 'Demo' }).getByRole(label === 'Computer offline' ? 'switch' : 'button', { name: label }).click()
      if (label === 'Computer offline') await p.keyboard.press('Escape')
      await p.waitForTimeout(500)
    }
    const thread = async (p, pick) => {
      const id = await p.evaluate(pick)
      await p.goto(`http://localhost:4173/Nudge/app/#/task/${id}`)
      await p.waitForTimeout(700)
    }
    const bottom = (p) => p.evaluate(() => document.querySelector('#app-content > div')?.scrollTo(0, 9999))
    return [
      ['home-approve-all', '#/', demo('Send a low-risk request')],
      ['tasks', '#/tasks'],
      ['tasks-scrolled', '#/tasks', bottom],
      ['tasks-earlier', '#/tasks', async (p) => { await tap('Show 12')(p); await bottom(p) }],
      ['tasks-codex', '#/tasks', tap('Codex, 3')],
      ['tasks-empty', '#/tasks', async (p) => { await p.getByRole('searchbox').fill('zzz'); await p.waitForTimeout(300) }],
      ['new-task', '#/new'],
      ['new-task-chat', '#/new/claude'],
      ['new-task-typed', '#/new/claude', tap('Add a dark mode')],
      ['ask-me', '#/new/claude', tap(/Ask every action/)],
      ['change-project', '#/new/claude', tap(/my-app · Windows PC/)],
      ['choose-agent', '#/new/claude', tap(/^Claude Code, new task/)],
      ['new-task-offline', '#/', async (p) => {
        await demo('Computer offline')(p)
        await p.goto('http://localhost:4173/Nudge/app/#/new/codex')
        await p.waitForTimeout(600)
        await p.getByRole('textbox').fill('Add rate limiting')
        await tap('Send')(p)
      }],
      ['chat-approval', '#/task/s4'],
      ['chat-tools-open', '#/task/s4', tap('Read 5 files, edited 3')],
      ['chat-after-approve', '#/task/s4', async (p) => {
        await tap('Approve')(p)
        await p.waitForTimeout(2200)
        await demo('Finish a session')(p)
        await tap('Read 5 files, edited 3')(p)
        await bottom(p)
      }],
      ['chat-question', '#/task/s5'],
      ['chat-listening', '#/task/s5', tap('Answer by voice')],
      ['chat-high-risk', '#/', async (p) => { await demo('Send a high-risk request')(p); await thread(p, () => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.find((r) => r.risk === 'high').taskId) }],
      ['chat-plan', '#/', async (p) => { await demo('Send a plan')(p); await thread(p, () => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.find((r) => r.kind === 'plan').taskId) }],
      ['task-menu', '#/task/s4', tap('Task menu')],
      ['task-ask-me', '#/task/s4', async (p) => { await tap('Task menu')(p); await p.getByRole('dialog', { name: 'Task' }).getByRole('button', { name: /^Ask me/ }).click(); await p.waitForTimeout(500) }],
      ['chat-cursor', '#/task/s2'],
      ['chat-failed', '#/task/s3'],
      ['chat-paused', '#/task/s6'],
    ]
  })(),
  m4: (() => {
    const demo = (label) => async (p) => {
      await p.keyboard.press('d')
      await p.getByRole('dialog', { name: 'Demo' }).getByRole(label === 'Computer offline' ? 'switch' : 'button', { name: label }).click()
      if (label === 'Computer offline') await p.keyboard.press('Escape')
      await p.waitForTimeout(500)
    }
    // Cards open the thread now; the request screens open directly.
    const open = (label) => async (p) => {
      await demo(label)(p)
      const id = await p.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state.requests.at(-1).id)
      await p.goto(`http://localhost:4173/Nudge/app/#/request/${id}`)
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
      // Inline voice (04-questions.md): the transcript drops into the input.
      ['question-voice', '#/request/r2', async (p) => { await p.getByRole('button', { name: 'Answer by voice' }).click(); await p.waitForTimeout(2300) }],
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
        // Seed once per screen (window.name is set on about:blank), so a reload inside a setup keeps its state.
        if (window.name !== 'fresh') return
        window.name = ''
        // Onboarding routes start before setup; everything else as a set-up user.
        const h = location.hash
        const onboarding = /^#\/(signin|signup|forgot|setup)/.test(h) && !/mode=/.test(h)
        const state = onboarding ? { theme: t, signedIn: h.startsWith('#/setup'), onboarded: false } : { theme: t, signedIn: true, onboarded: true }
        localStorage.setItem('nudge-proto-v1', JSON.stringify({ state, version: 5 }))
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
      await page.evaluate(() => (window.name = 'fresh'))
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
        // Live data on buttons (09-chat-and-tasks.md): "project · computer", a weekday, a tool line made of progress steps.
        const DATA = [/^[\w-]+ · (Windows PC|MacBook|Mac 2)( · offline)?$/, /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/, /^(Read|Updated|Created|Ran|Rewrote|Added|Fixed|Set up)\b.*(,| and )/]
        const bad = [...new Set(labels)].filter((l) => !DOC_COPY.includes(norm(l)) && !DATA.some((re) => re.test(l)))
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
