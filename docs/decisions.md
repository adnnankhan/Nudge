# Decisions (made by Adnan — follow these)

1. **Home header shows the Nudge mark and the name "Nudge"** next to it (Title 3), even though the dark reference shows the mark only.
2. **Sentence case everywhere**: "Create account", "Sign in instead", "Send reset link" — not the Title Case seen in some dark references.
3. **Light/Dark switch** lives in Settings → **Appearance** → **Dark mode** toggle (on by default). Turning it off switches to Light instantly.
4. **Sample copy written for the prototype is approved as written** (extra fake requests, second question's options, the full plan steps, toasts, Face ID sheet text, hold hint). Use it as is; don't ask about it.
5. **Onboarding top bars show the title "Nudge"** (centred, as in the dark references), with the back arrow.
6. **Session rows**: the chip holds the status word with its icon (Working, Paused, Done, Failed); the one-line status text ("Editing login.js") follows in grey.
7. **Needs you order**: high risk first, then oldest first.
8. ~~**Every request lives on Home**: each card (approval, question, plan) opens its detailed view.~~ *Replaced by 13: a card now opens its chat thread.* ApprovalQueue is not a separate entry from Home; it is only the target of the lock-screen "3 requests waiting" notification.
9. **"x of y"** on request screens counts across everything waiting in Needs you, in Needs you order.
10. **Desktop phone frame shows a Dynamic Island**; layouts keep the same safe area as the references (top 54, bottom 34).
11. ~~**GitHub repo `Nudge` doesn't exist yet** (as of M1).~~ Created and live since 2026-10-15: https://adnnankhan.github.io/Nudge/app/

## Approved design changes: chat, New task, Tasks (added after M8; numbered 5–11 in Adnan's updated pack)
12. **Chat in two places only** (approved designs in `docs/reference/new/`): starting a task (chat-style composer) and following a task (thread). Home stays the approval hub, **unchanged**.
13. **Tapping a Home card opens its chat thread** (its buttons/options still act directly).
14. **Tab bar: Home · Tasks · New task · Agents.**
15. **"Ask me" options** replace Safety: Ask me before every action · Ask me only before commands · Just tell me when it's done. Shown as a chip in the new-task composer.
16. **Chat looks like the Claude / ChatGPT apps** (familiar patterns — Jakob's Law): right bubbles for you, plain text for the agent, collapsible tool line, rounded composer.
17. **New task = agent tiles in one card + Recent.** No folder/computer/safety fields: last used project + computer are defaults, shown as one tappable line in the new task chat.
18. **Don't ask twice** (all approved):
    - New task remembers last agent, project, computer and Ask-me setting.
    - Cards inside a chat drop the agent/project/time row (the top bar has it).
    - The Ask-me setting shows only under the first message.
    - Voice: transcript drops into the input (no separate confirm screen).
    - App open → only the in-app banner, no phone notification too.
    - Returning to Home keeps the scroll position.
    - **Approve all** low-risk requests with one Face ID (medium/high never included).
    - **Face ID once covers low/medium approvals for 5 minutes; high risk always asks** (Hold + Face ID).

## Defaults in use (Adnan can change these later)
- Demo menu: long-press the header logo or press `D` (see `flows.md`).
- Desktop: phone frame + caption "Nudge prototype · works best on a phone — scan to open" + QR code.
- Model picker keeps the "[Model name]" placeholders until real names are chosen.
- Accelerated time for "goes back to your computer" (1 real minute = 10 app minutes).
- Demo menu stays (Adnan, after M3).
- The chat’s ••• menu holds Model · Intensity · Ask me · Stop task (replaces the old Session screen’s settings and Stop button).

## Small calls Claude made (Adnan asked Claude to decide these; change any time)
- **Denied / timed-out rows** in Completed today: chip **Stopped**, status text **Denied** or **Went back to your computer**.
- **What a Done row says**: what the session was for. A session started by approving a request shows the request's title ("Delete the old build folder"). The seeded "Claude Code · portfolio" session shows "Edited login.js" when it finishes.
- **Answering a question** or approving a plan: the agent carries on, so a Working session appears ("Read 3 files" for answers, the plan title for plans).
- **Banners** (only the approval and finished banners have copy in the docs):
  - question → "Codex asked you a question" · **Answer**
  - plan → "Claude Code has a plan ready for review" · **Review**
  - failed → "Codex failed" · **View** (mirrors "Cursor finished · View")
- **MacBook (asleep) and Mac 2 (offline)** have no requests or sessions, so Home shows the empty state. Mac 2 adds the error alert "Mac 2 is offline · last seen 1 day ago" above it.
- **Computer offline (demo)** = the full HomeWarnings state: the three alerts, switcher "· offline", and the Paused section with both paused sessions.
- **M4 small calls:**
  - Plan requests get their own Home card: summary ticks, **Ask for changes** / **Approve plan**. Approving a plan also needs Face ID.
  - Deny from a request screen goes back to Home with the "Denied · Undo" toast (ApprovalSent is only for approvals).
  - "x of y" and "Next request (2 of 3)" stay steady while you review a batch opened from Home; a deep link counts what is waiting now.
  - "Send answer" looks disabled until there's an answer; tapping it then shows "Type an answer first."
  - Offline Home shows Paused before Needs you, as in HomeWarnings; the alerts take the summary card's place.
  - A request answered or timed out before it was opened shows "Too late. This request went back to your computer." with **Back to Home**.
  - No banner for a request you're already looking at; banners queue, newest first.
  - The queue title says "1 request waiting" when there's only one.
- **M5 small calls:**
  - **Cursor · site** starts as Working ("Building the contact form…", the NotSupported screen) and finishes about a minute in, so "Cursor finished · View" shows up and SessionDone has a real session behind it.
  - Sessions that start from an approved request **run in the terminal** (Claude Code, Codex): they show "Started in terminal", and Stop asks TakeOverConfirm. Sessions started from the phone (New task, Redirect) use StopConfirm.
  - Changing model or intensity on a terminal session moves it to the phone (per the info alert's wording).
  - Redirect opens a small sheet titled **Redirect** · "Give a new instruction." with the answer field ("Tell the agent what to do next").
  - Undo and Restore are fake: they show "Files restored" and nothing else changes.
  - The mic on SessionFailed and Redirect opens the same voice screen as questions ("Your answer").
  - Done / Failed rows for sessions the docs don't describe show their own title and Recent lines; "Clears from Home in X h." counts from when they finished.
  - Denied / timed-out rows open a short screen: chip Stopped, "Denied" or "Went back to your computer", the request and command, **Back to Home**.
  - Sign out clears the saved prototype state (same as Reset demo); it lands on Sign in once M6 exists.
  - Turning off "Task finished" / "Task failed" also stops those in-app banners.
  - New task keeps what you typed while you pick a folder; a follow-up from a Cursor session starts with Claude Code and the same project.
- **M6 small calls:**
  - The email you sign in with is used everywhere ("We sent the download link to …", Settings → Account). Google sign-in uses you@email.com.
  - The fake data starts when setup finishes, so nothing has happened "while you were signing in".
  - A refresh mid-setup resumes setup; once set up, Sign in and setup screens go straight to Home (browser back can't land on them).
  - Forgot password: **Send reset link** sits under the field (as in the reference) and is enabled once the email has an @; it shows the info alert with the typed email, and **Resend** sends it again.
  - "Resend link" on LinkSent shows the toast "Link sent to you@email.com." (wording taken from the ForgotPassword alert).
  - Scan: the camera box shows a slow scanning line; on success the frame turns green with a tick, then Connecting. The reference's "Camera view" label and offline alert are Figma placeholders and aren't shown.
  - NoAgents: "How to install …" rows open each agent's own install guide in a new tab (Claude Code docs, the Codex GitHub page, Cursor downloads).
  - The notification preview on "Turn on notifications" is a picture: its Approve / Deny / Open buttons can't be tapped.
  - Choosing **Not now** for notifications leaves the "Notifications are off. You'll miss requests." alert on Home, with **Turn on**.
  - Add a computer: Scan → Connecting → back to Home (no agents step, since that screen describes Windows PC).
  - The demo menu's "no agents" setup walks NoAgents → Notifications and returns to Home without changing anything.
  - Sheets now focus themselves when they open (the title is announced; no ring on a button you didn't choose).
- **M7 small calls:**
  - Lock screens have a small white back arrow (top left), so they're never a dead end; they look the same in Dark and Light.
  - Notifications act on the app: Approve (Face ID) / Deny / an answer button handle the request and show a small banner ("Approved", "Denied", "Answer sent to Codex") under the clock; the card disappears. Tapping a notification opens the matching screen (request, queue with Codex's 3 requests, plan, SessionDone, SessionFailed, offline Home, Agents).
  - Computer helper: its own page outside the phone frame; on screens under 600 px wide the window fits the width (rather than shrinking) so every control stays 44 pt. The close (×) returns to the app; minimise is decorative. Connect asks Claude Code → Codex → Cursor in turn, then shows Status. Reconnect, Remove and Keep awake change the same data as the app (Agents tab, Paired phones).
  - Pairing code counts down from 4:32; at 0:00 a new random code appears and it restarts at 5:00.
  - States screens: the alert actions (Retry, Message agent, Use passcode) show a short spinner when tapped — they're a catalogue, so the state stays.
  - Demo menu groups the demo screens under "Lock screen" (Approvals · Questions · Other alerts) and "Computer helper" (Pair · Connect agent · Status).
- **M8 small calls:**
  - App icons exported from `public/brand` to `public/icons` (192, 512, maskable 512, Apple touch 180 from the full-bleed maskable art, favicon 32).
  - The Google "G" is now the official four-colour vector (`public/brand/google-g.svg`); the 16 px PNG looked soft on phone screens.
  - Offline: app shell, all app screens, demo screens, fonts (woff2) and brand art are precached (≈530 KB); the hidden `/dev/…` pages aren't.
  - The first screen after the app opens appears at once; later screens keep the slide / fade.
  - Deploy: GitHub Action on push to `main`; `/Nudge/` (the case study's place) has no page yet.
  - A page left open across a deploy can ask for code files that no longer exist: the app reloads once to get the new version instead of going blank, and never loops (`src/app/staleReload.ts`, `scripts/check-stale.mjs`).
  - In-app banners show the newest event only; once one closes, older events that piled up meanwhile are dropped, not replayed one after another.
- **M5b small calls (chat, New task, Tasks):**
  - **Cursor · site starts Done at 10:42** (fake-data's starting Home, threads and Tasks list all say so). This replaces the M5 call that had it finish a minute in; Home's Working count is back to 1.
  - **The Tasks list's extra tasks are real data**, so Home shows them too: Claude Code · shop · MacBook "Fix the checkout bug" (Paused, status line "Paused · MacBook went to sleep") and Codex · api "Delete old migrations" (Denied, 08:50). MacBook's Home shows the Paused row instead of the empty state; Windows PC's Completed today has 3 rows.
  - **Filter chip counts are live** and leave out Earlier: All 7 · Claude 3 · Codex 3 · Cursor 1 at the start (the image's "8 / 4" is one more than its rows).
  - **Seeded agent messages** in the my-app thread are the approved designs' words where the docs are silent ("On it. I'll update the login page first, then clean up the old build.", "The login page is updated. Next I need to delete the old build folder.", "Done. The old build folder is gone and the login page is ready. Want me to run the tests?").
  - **A request joins its agent/project's running task** if that task isn't already waiting on you; otherwise it starts a new task ("Started in terminal" / "Started in Cursor") named after the request. An approval brings its "Before this" line as the agent's words.
  - **Approving inside a running task** keeps one Home row (its text changes to "Running: …"). **Denying** a task that was only waiting ends it as Denied (as before); denying inside a running task lets it carry on, and the thread says "You denied · …".
  - While a task waits on you, it doesn't finish or add progress lines, and the typing indicator is hidden.
  - **Plans in chat** (no design): a card like the permission card — "Claude Code has a plan ready for review", a **Plan** chip with "back to PC in N min", title, summary ticks, **Read full plan**, **Ask for changes** / **Approve plan**. The Tasks row chip is **Plan**.
  - **Questions in chat:** the agent's words are the question; typing in the composer while it waits answers it.
  - **+ in the composer:** in the new task chat it opens the project · computer sheet; in a task chat it shows "Adding files isn’t in the prototype".
  - **The agent name + chevron** in the top bar opens the Task menu in a task chat and Choose agent in a new task chat. ••• in a new task chat opens a "Task" sheet with Project folder · Computer · Ask me.
  - **Ask me labels:** composer chip "Ask every action" · "Ask before commands" · "Tell me when done"; Task menu value "Every action" · "Only commands" · "When done".
  - **Face ID · still verified** shows as a short toast (0.9 s) instead of the sheet.
  - **Finished tasks** add "Finished · 10:42" unless the agent has a closing message (my-app). The first suggested reply gets the agent's reply; "Not now" just sends.
  - **Approve in chat** has no toast (the "You approved" line confirms it); Deny keeps its Undo toast. Home's high-risk **Review** still opens the request (Hold to approve); in chat Hold to approve is on the card, as in Chat-high-risk.jpg. Banners open the thread.
  - **The mic** drops the VoiceAnswer transcript into the input everywhere.
  - A tool line without the agent's own summary joins its steps ("Read 3 files, updated LoginForm.tsx and 2 more").
  - A message in a finished task picks it up again ("Ask a follow-up…").
  - The demo's usage-limit task is "Update the login page" ("Paused · usage limit · continues at 3:45 pm").
  - Tasks times: waiting = minutes waited, running = minutes since it started (4m for portfolio, as on Home), done = finish time, Earlier = weekday.
  - **Earlier (12 older tasks):** Add form validation · Add rate limiting · Fix the mobile menu · Update the footer links · Fix broken links · Rename the user model · Write tests for sign-up · Compress the images · Add a newsletter form · Upgrade the router · Add an FAQ page · Set up deploys.
  - **One stylesheet** (`cssCodeSplit: false`): shared components no longer arrive as four extra render-blocking CSS files (13.8 KB gzipped in all).
  - **Lighthouse harness fix:** the Home and Settings runs had been landing on Sign in (the open app saved its signed-out state over the seed), so the M8 "100 on Home/Settings" scores were Sign in's. The script now seeds from a page that runs no app code and records where each run landed. Measured properly, Home on mobile scores 86–87 — the same on the pre-M5b build — so it isn't from M5b; it's open (see the M5b report).
