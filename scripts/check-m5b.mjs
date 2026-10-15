// M5b: chat, New task, Tasks (09-chat-and-tasks.md, build-order.md "Done when").
// Usage: node scripts/check-m5b.mjs   (BROWSER=webkit for Safari's engine)
import * as engines from 'playwright'
import { seedOnce } from './testState.mjs'
const chromium = engines[process.env.BROWSER ?? 'chromium']

const BASE = 'http://localhost:4173/Nudge/app/'
const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail })
const step = async (name, fn) => {
  try {
    await fn()
  } catch (e) {
    ok(name, false, e.message.split('\n').filter((l) => /waiting for|Timeout|Error|expect/.test(l)).slice(0, 2).join(' ¦ '))
  }
}

const b = await chromium.launch()
const errors = []
// No arrivals during the test (a banner would sit over the top bar).
const STATE = JSON.stringify({ state: { signedIn: true, onboarded: true, nextArrivalAt: Date.now() + 1e9 }, version: 5 })

/** A fresh tab with the starting data (Face ID not yet verified). */
async function fresh() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/preloaded using link preload/.test(m.text()) && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await seedOnce(page, STATE)
  await page.goto(BASE + '#/')
  await page.getByRole('heading', { name: 'Needs you' }).waitFor()
  return page
}

const helpers = (page) => {
  const path = () => new URL(page.url()).hash.replace(/^#/, '')
  const waitPath = async (re, ms = 5000) => {
    for (let t = 0; t < ms; t += 100) {
      if (re.test(path())) {
        await page.waitForTimeout(500)
        return true
      }
      await page.waitForTimeout(100)
    }
    throw new Error('Timeout waiting for ' + re + ' — at ' + path())
  }
  return {
    path,
    waitPath,
    go: async (hash) => {
      await page.goto(BASE + '#' + hash)
      await page.waitForTimeout(500)
    },
    state: () => page.evaluate(() => JSON.parse(localStorage.getItem('nudge-proto-v1')).state),
    text: () => page.locator('#app-content').innerText(),
    toasts: () => page.locator('[role=status]').allInnerTexts().then((t) => t.join(' | ')),
    dialog: (name) => page.getByRole('dialog', { name }),
    demo: async (label) => {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
      await page.keyboard.press('d')
      await page.getByRole('dialog', { name: 'Demo' }).getByRole(label === 'Computer offline' ? 'switch' : 'button', { name: label }).click()
      if (label === 'Computer offline') await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    },
  }
}

/* ---------- 1. Threads open from Home, act on Home ---------- */
{
  const page = await fresh()
  const h = helpers(page)

  await step('Tab bar: Home · Tasks · New task · Agents, dot on Tasks', async () => {
    const nav = page.getByRole('navigation', { name: 'Tabs' })
    const names = await nav.getByRole('link').allInnerTexts()
    ok('four tabs in order', names.map((n) => n.trim()).join(',') === 'Home,Tasks,New task,Agents', names.join(','))
    ok('red dot on Tasks while something needs you', (await nav.getByRole('link', { name: 'Tasks, something needs you' }).count()) === 1)
    const w = await nav.evaluate((el) => el.getBoundingClientRect().width)
    ok('tab bar ≈340 wide', Math.abs(w - 340) <= 2, w)
  })

  await step('Home card body → its task thread', async () => {
    await page.locator('main article').filter({ hasText: 'Delete the old build folder' }).getByRole('button', { name: 'Delete the old build folder' }).click()
    await h.waitPath(/^\/task\/s4$/)
    const t = await h.text()
    ok('opens /task/s4 with your first message', t.includes('Clean up the build and get the login page ready.'))
    ok('Ask-me line only under the first message', t.includes('Ask me before every action'))
    ok('top bar: Claude Code · my-app · Windows PC', t.includes('my-app · Windows PC'))
    ok('permission card header, no meta row', t.includes('Claude Code wants to run a command') && !t.includes('2 min ago'))
    ok('"back to PC in 8 min"', /back to PC in 8 min/.test(t), t.match(/back to PC in \d+ min/)?.[0])
    const scrolled = await page.locator('#app-content > div').first().evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)
    ok('opens scrolled to the bottom', scrolled < 40, scrolled)
    const tool = page.getByRole('button', { name: 'Read 5 files, edited 3' })
    ok('tool line collapsed by default', (await tool.getAttribute('aria-expanded')) === 'false')
    await tool.click()
    ok('tap expands the steps', (await h.text()).includes('Updated login.css'))
  })

  await step('Approve in the thread → Face ID → one quiet line; Home updates', async () => {
    await page.getByRole('button', { name: 'Approve', exact: true }).click()
    await h.dialog('Confirm it’s you').waitFor()
    await page.waitForTimeout(1800)
    const t = await h.text()
    ok('card replaced by "You approved · rm -rf dist"', t.includes('You approved · rm -rf dist') && !t.includes('wants to run a command'))
    ok('typing indicator while it works', t.includes('Working…'))
    const st = await h.state()
    ok('task working, request gone', st.sessions.find((s) => s.id === 's4').status === 'working' && !st.requests.some((r) => r.id === 'r1'))
    await page.getByRole('button', { name: 'Back' }).click()
    await h.waitPath(/^\/$/)
    ok('Home: card gone, my-app in Working', !(await h.text()).includes('Delete the old build folder') && /Working\s*2/.test(await page.getByRole('heading', { name: /Working/ }).innerText()))
  })

  await step('Face ID covers low/medium for 5 minutes', async () => {
    await h.demo('Send a medium-risk request')
    const card = page.locator('main article').filter({ hasText: 'Install a new package' })
    await card.getByRole('button', { name: 'Approve' }).click()
    await page.waitForTimeout(250)
    ok('no Face ID sheet the second time', (await h.dialog('Confirm it’s you').count()) === 0)
    ok('"Face ID · still verified" instead', (await h.toasts()).includes('Face ID · still verified'))
    await page.waitForTimeout(1200)
    const st = await h.state()
    ok('approved (joined the running my-app task: one Home row)', !st.requests.length || !st.requests.some((r) => r.title === 'Install a new package'))
    await h.go('/task/s4')
    ok('thread shows its "before" line and the approval', (await h.text()).includes('Set up the login form and wrote two tests.') && (await h.text()).includes('You approved · npm install jsonwebtoken@9'))
  })

  await step('High risk in chat: Hold to approve + Face ID every time', async () => {
    await h.go('/')
    await h.demo('Send a high-risk request')
    const st = await h.state()
    const r = st.requests.find((x) => x.title === 'Force-push to main')
    ok('force-push joins the running portfolio task', r?.taskId === 's1', r?.taskId)
    await h.go('/task/s1')
    const t = await h.text()
    ok('no Approve, Hold to approve on the card', (await page.getByRole('button', { name: 'Approve', exact: true }).count()) === 0 && t.includes('Hold to approve'))
    ok('risk sentence under the card', t.includes('Other people’s recent changes on main could be lost.'))
    ok('no typing indicator while it waits on you', !t.includes('Working…'))
    const hold = page.getByRole('button', { name: 'Hold to approve' })
    const box = await hold.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(1500)
    await page.mouse.up()
    await h.dialog('Confirm it’s you').waitFor({ timeout: 3000 })
    ok('Face ID asked even though verified', true)
    await page.waitForTimeout(1800)
    ok('"You approved · git push --force origin main"', (await h.text()).includes('You approved · git push --force origin main'))
    const s = await h.state()
    ok('still one portfolio row on Home', s.sessions.filter((x) => x.project === 'portfolio' && x.status === 'working').length === 1)
  })

  await step('Question in chat: tap a choice sends it', async () => {
    await h.go('/task/s5')
    const t = await h.text()
    ok('"Or type your own answer below · back to PC in …"', /Or type your own answer below · back to PC in \d+ min/.test(t))
    await page.getByRole('button', { name: /Google sign-in/ }).click()
    await page.waitForTimeout(1000)
    ok('your answer as a bubble; choices gone', (await page.locator('p', { hasText: /^Google sign-in$/ }).count()) === 1 && (await page.getByRole('button', { name: /Email and password/ }).count()) === 0)
    ok('toast "Answer sent to Codex"', (await h.toasts()).includes('Answer sent to Codex'))
    ok('Home and Tasks: no longer waiting', !(await h.state()).requests.some((r) => r.id === 'r2'))
  })

  await step('Send a message → fake reply', async () => {
    const box = page.getByRole('textbox', { name: 'Reply to Codex…' })
    await box.fill('Also add a logout button')
    await page.getByRole('button', { name: 'Send', exact: true }).click()
    await page.waitForTimeout(300)
    ok('your message shows', (await h.text()).includes('Also add a logout button'))
    // The reply comes 1.2 s after sending, on the next 1 s tick.
    await page.waitForTimeout(2600)
    ok('"Got it — I’ll do that next."', (await h.text()).includes('Got it — I’ll do that next.'))
  })

  await step('Composer mic: Listening… then the transcript in the box', async () => {
    await page.getByRole('button', { name: 'Answer by voice' }).click()
    await page.waitForTimeout(300)
    ok('"Listening…" in the composer', (await h.text()).includes('Listening…'))
    await page.waitForTimeout(2200)
    ok('transcript dropped into the input', (await page.getByRole('textbox', { name: 'Reply to Codex…' }).inputValue()).startsWith('Use email and password'))
  })

  await step('Task menu: Model · Intensity · Ask me · Stop task', async () => {
    await h.go('/task/s1')
    await page.getByRole('button', { name: 'Task menu', exact: true }).click()
    const menu = h.dialog('Task')
    const t = await menu.innerText()
    ok('rows and Stop task', ['Model', 'Default', 'Intensity', 'Medium', 'Ask me', 'Every action', 'Stop task'].every((w) => t.includes(w)), t.replace(/\n/g, ' · '))
    await menu.getByRole('button', { name: /^Ask me/ }).click()
    await h.dialog('Ask me').getByRole('radio', { name: /Ask me only before commands/ }).click()
    await page.waitForTimeout(500)
    ok('Ask me → "Only commands"', (await h.dialog('Task').innerText()).includes('Only commands'))
    await h.dialog('Task').getByRole('button', { name: 'Stop task' }).click()
    await h.dialog('Stop this session?').getByRole('button', { name: 'Stop session' }).click()
    await h.waitPath(/\/session\/s1\/stopped/)
    ok('Stop → Stopped (What next?)', (await h.text()).includes('What next?'))
    await page.getByRole('radio', { name: /^Continue/ }).or(page.getByRole('button', { name: /^Continue/ })).first().click()
    await h.waitPath(/^\/task\/s1$/)
    ok('Continue → back to the thread, "Stopped by you" line', (await h.text()).includes('Stopped by you'))
  })

  await step('Cursor and finished threads', async () => {
    await h.go('/task/s2')
    const t = await h.text()
    ok('Cursor: info line instead of the composer', t.includes('Cursor runs in its editor. You can approve its requests here.') && (await page.getByRole('textbox').count()) === 0)
    ok('Cursor: "Finished · 10:42"', t.includes('Finished · 10:42'))
    await page.getByRole('button', { name: 'Task menu', exact: true }).click()
    const m = await h.dialog('Task').innerText()
    ok('Cursor menu: Set in Cursor, no Stop (finished)', m.includes('Set in Cursor') && !m.includes('Stop task'))
    await page.keyboard.press('Escape')
    await h.go('/task/s3')
    ok('Failed: "Stopped · 2 tests failing in docs.test.js"', (await h.text()).includes('Stopped · 2 tests failing in docs.test.js'))
    const box = page.getByRole('textbox', { name: 'Ask a follow-up…' })
    await box.fill('Fix the two failing tests')
    await box.press('Enter')
    await page.waitForTimeout(400)
    ok('follow-up picks the task up again', (await h.state()).sessions.find((s) => s.id === 's3').status === 'working')
  })

  await step('Home rows open threads; Home keeps its scroll', async () => {
    await h.go('/')
    await page.getByRole('button', { name: /Cursor\s*site/ }).first().click()
    await h.waitPath(/^\/task\/s2$/)
    ok('Completed row → thread', true)
    await h.go('/')
    const scroller = page.locator('#app-content > div').first()
    await scroller.evaluate((el) => (el.scrollTop = 300))
    await page.waitForTimeout(200)
    const before = await scroller.evaluate((el) => el.scrollTop)
    await page.getByRole('button', { name: /Claude Code\s*portfolio/ }).first().click()
    await h.waitPath(/^\/task\//)
    await page.getByRole('button', { name: 'Back' }).click()
    await h.waitPath(/^\/$/)
    await page.waitForTimeout(300)
    const after = await page.locator('#app-content > div').first().evaluate((el) => el.scrollTop)
    ok('back to Home at the same scroll position', before > 0 && Math.abs(after - before) < 4, `${before} → ${after}`)
  })
  await page.context().close()
}

/* ---------- 2. Tasks tab ---------- */
{
  const page = await fresh()
  const h = helpers(page)
  await step('Tasks: groups, counts, filters, search, Earlier', async () => {
    await page.getByRole('link', { name: /^Tasks/ }).click()
    await h.waitPath(/^\/tasks$/)
    const t = await h.text()
    ok('Needs you 2 · Running 2 · Done today 3', /Needs you\s*2/.test(t) && /Running\s*2/.test(t) && /Done today\s*3/.test(t))
    ok('chips: All 7 · Claude 3 · Codex 3 · Cursor 1', (await page.getByRole('button', { name: 'All, 7' }).count()) === 1 && (await page.getByRole('button', { name: 'Claude Code, 3' }).count()) === 1 && (await page.getByRole('button', { name: 'Codex, 3' }).count()) === 1 && (await page.getByRole('button', { name: 'Cursor, 1' }).count()) === 1)
    ok('rows as in the Tasks list', ['Clean up the build and login page', 'Add sign-in to the API', 'Build the login page', 'Fix the checkout bug', 'Add the contact form', 'Rewrite the setup guide', 'Delete old migrations'].every((w) => t.includes(w)))
    ok('chips: Question, Paused · MacBook, Denied', t.includes('Question') && /shop\s*·\s*MacBook/.test(t) && t.includes('Denied'))
    await page.getByRole('button', { name: 'Codex, 3' }).click()
    const codex = await h.text()
    ok('Codex filter shows only Codex', codex.includes('Add sign-in to the API') && !codex.includes('Build the login page'))
    await page.getByRole('button', { name: 'All, 7' }).click()
    await page.getByRole('searchbox', { name: 'Search tasks or projects' }).fill('shop')
    await page.waitForTimeout(200)
    ok('search "shop" → Fix the checkout bug only', (await page.locator('main ul li').count()) === 1 && (await h.text()).includes('Fix the checkout bug'))
    await page.getByRole('searchbox', { name: 'Search tasks or projects' }).fill('')
    await page.getByRole('button', { name: 'Show 12' }).click()
    ok('Earlier: Show 12 → 12 older tasks', (await h.text()).includes('Set up deploys') && (await page.locator('main ul li').count()) === 19)
    await page.getByRole('button', { name: /Fix the checkout bug/ }).click()
    await h.waitPath(/^\/task\/s6$/)
    ok('row → thread (Paused · MacBook went to sleep)', (await h.text()).includes('Paused · MacBook went to sleep'))
  })
  await page.context().close()
}

/* ---------- 3. New task ---------- */
{
  const page = await fresh()
  const h = helpers(page)
  await step('New task: tiles, Cursor, Recent', async () => {
    await page.getByRole('link', { name: 'New task' }).click()
    await h.waitPath(/^\/new$/)
    const t = await h.text()
    ok('"Who should do it?" with three tiles', t.includes('Who should do it?') && (await page.getByRole('button', { name: /Ready/ }).count()) === 2)
    ok('Recent: Build the login page · Add sign-in to the API', /Build the login page[\s\S]*Add sign-in to the API/.test(t))
    await page.getByRole('button', { name: /Start in Cursor/ }).click({ force: true })
    await page.waitForTimeout(200)
    ok('Cursor tile → "Cursor can’t start tasks from the phone"', (await h.toasts()).includes('Cursor can’t start tasks from the phone') && h.path() === '/new')
    await page.getByRole('button', { name: /Add sign-in to the API/ }).click()
    await h.waitPath(/^\/task\/s5$/)
    ok('Recent row → that task’s chat', true)
  })

  await step('New task chat: suggestion, Ask me, change, Send', async () => {
    await h.go('/new')
    await page.getByRole('button', { name: /Claude Code\s*Ready/ }).click()
    await h.waitPath(/^\/new\/claude$/)
    ok('"What should Claude Code do?" · my-app · Windows PC', (await page.getByRole('heading', { level: 1 }).innerText()) === 'What should Claude Code do?' && (await h.text()).includes('my-app · Windows PC'))
    await page.getByRole('button', { name: 'Add a dark mode' }).click()
    ok('suggestion fills the composer', (await page.getByRole('textbox', { name: 'Message Claude Code…' }).inputValue()) === 'Add a dark mode')
    await page.getByRole('button', { name: /Ask every action/ }).click()
    await h.dialog('Ask me').getByRole('radio', { name: /Just tell me when it’s done/ }).click()
    await page.waitForTimeout(500)
    ok('chip → "Tell me when done"', (await page.getByRole('button', { name: /Tell me when done/ }).count()) === 1)
    await page.getByRole('button', { name: /my-app · Windows PC/ }).click()
    await h.dialog('Choose a folder').getByRole('radio', { name: /^portfolio/ }).click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    ok('project changed → portfolio · Windows PC', (await h.text()).includes('portfolio · Windows PC'))
    await page.getByRole('button', { name: 'Send', exact: true }).click()
    await h.waitPath(/^\/task\/s\d+$/)
    ok('toast "Task started"', (await h.toasts()).includes('Task started'))
    const t = await h.text()
    ok('the task chat: your message first, Ask-me line', t.includes('Add a dark mode') && t.includes('Just tell me when it’s done') && t.includes('portfolio · Windows PC'))
    await page.waitForTimeout(2600)
    ok('agent replies', (await h.text()).includes('Got it — I’ll do that next.'))
    await h.go('/new')
    ok('Recent starts with the new task', /Recent[\s\S]*Add a dark mode[\s\S]*Build the login page/.test(await h.text()))
    await page.getByRole('button', { name: /Claude Code\s*Ready/ }).click()
    await h.waitPath(/^\/new\/claude$/)
    ok('remembers project + Ask me for Claude Code', (await h.text()).includes('portfolio · Windows PC') && (await page.getByRole('button', { name: /Tell me when done/ }).count()) === 1)
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: /Codex\s*Ready/ }).click()
    await h.waitPath(/^\/new\/codex$/)
    ok('Codex keeps the first-time defaults', (await h.text()).includes('my-app · Windows PC') && (await page.getByRole('button', { name: /Ask every action/ }).count()) === 1)
  })

  await step('New task while the computer is offline', async () => {
    await h.demo('Computer offline')
    ok('sub-line "· offline"', (await h.text()).includes('my-app · Windows PC · offline'))
    await page.getByRole('textbox', { name: 'Message Codex…' }).fill('Add rate limiting')
    await page.getByRole('button', { name: 'Send', exact: true }).click()
    await page.waitForTimeout(300)
    ok('"Windows PC is offline. Start a task when it’s back online."', (await page.getByRole('alert').innerText()).includes('Windows PC is offline. Start a task when it’s back online.') && h.path() === '/new/codex')
    await h.demo('Computer offline')
  })
  await page.context().close()
}

/* ---------- 4. Approve all, inline voice, banners ---------- */
{
  const page = await fresh()
  const h = helpers(page)
  await step('Approve all: one Face ID for the low-risk ones', async () => {
    ok('no bar with one low-risk request', (await page.getByRole('button', { name: 'Approve all' }).count()) === 0)
    await h.demo('Send a low-risk request')
    ok('"2 low-risk requests" bar', (await h.text()).includes('2 low-risk requests'))
    await page.getByRole('button', { name: 'Approve all' }).click()
    await h.dialog('Confirm it’s you').waitFor()
    await page.waitForTimeout(2400)
    ok('toast "2 approved · running"', (await h.toasts()).includes('2 approved · running'), await h.toasts())
    const st = await h.state()
    ok('both approved, the question still waits', !st.requests.some((r) => r.kind === 'approval' && r.risk === 'low') && st.requests.some((r) => r.kind === 'question'))
  })

  await step('Inline voice on the Home question card', async () => {
    const card = page.locator('main article').filter({ hasText: 'Which login method should I add?' })
    await card.getByRole('button', { name: 'Answer by voice' }).click()
    await page.waitForTimeout(300)
    ok('"Listening…" in the input', (await card.innerText()).includes('Listening…'))
    await page.waitForTimeout(2200)
    ok('transcript in the input, still on Home', (await card.getByRole('textbox').inputValue()).startsWith('Use email and password') && h.path() === '/')
  })

  await step('Banner opens the thread', async () => {
    await h.demo('Send a plan')
    const banner = page.locator('[role=status]').filter({ hasText: 'has a plan ready for review' })
    await banner.getByRole('button', { name: 'Review' }).click()
    await h.waitPath(/^\/task\//)
    const t = await h.text()
    ok('plan card in the thread', t.includes('Claude Code has a plan ready for review') && t.includes('Read full plan'))
  })
  await page.context().close()
}

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '))
await b.close()
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail !== '' ? `  — ${r.detail}` : ''}`)
process.exitCode = results.every((r) => r.pass) ? 0 : 1
