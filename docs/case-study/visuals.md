# Visuals — every diagram is built in code, in the case study's dark style

**Rule:** no white "paper" images, no screenshots of documents. Every diagram, table, flow and chart below is built natively in HTML/CSS/SVG with the tokens in `style.md`, so it matches the page. Only **app screens** are images (`case-study/assets/`), shown in phone frames.

**Diagram style (use everywhere):**
- Nodes: `--surface` fill (white 6.5%), radius 18–22, 0.5px inner edge `rgba(255,255,255,0.06)`, title 16/600 `--ink`, subtitle 13–14 `--ink-2`.
- Connectors: 1.5px lines `rgba(255,255,255,0.18)`, rounded corners, small arrowheads. Animate a soft dash flow on scroll-in (respect reduced motion).
- **Edge cases:** amber `#FFC46B` text/icon and a 1px amber edge `rgba(255,196,107,0.35)` — the ONE colour allowed in flowcharts (matches the original rule: neutral main path, one colour for edge cases).
- **Alternative paths:** dashed node border.
- Labels/legends: mono 12–13 `--ink-2`.
- Must work at 390px wide: diagrams become vertical stacks; wide flows scroll horizontally inside their own container (never the page).

---

## 1 · Idea (hero)
Two phones: `final-chat-approval.png` (rotated −4°, behind) and `final-home.png` (front). Buttons: **Open the prototype** (→ `/Nudge/app/`) · **Read the story ↓**.

## 2 · Key screens
Five phones in a row (horizontal scroll on mobile), each with a caption from `content.md`:
`final-home.png` · `final-approval-detail.png` · `final-highrisk.png` · `final-chat-approval.png` · `final-tasks.png`

## 3 · Problem
Four cards (01–04): **Work stops** · **The session drops** · **Rushed decisions** · **Juggling agents** (one line each, from content). "How might we" as a large pull line under them. No colours on the cards.

## 4 · Research
**a) Connection diagram** (horizontal; vertical on mobile):
`Coding agent` (asks permission · on your computer) → `Helper` (catches requests · on your computer) ⇄ `Relay` (passes sealed messages · on the internet; lock icon) ⇄ `Nudge` (you decide · in your pocket).
Caption (mono): "QR pairing · end-to-end encrypted · the relay can't read anything".
Optional detail toggle "One approval, step by step" → 7-step vertical flow:
1 Agent stops to ask permission → 2 Hook hands the request to the helper → 3 Helper sends it to the relay → 4 Relay pushes it to your phone → 5 You tap Approve → 6 The answer returns via the relay → 7 Helper tells the agent: allow.

**b) Facts → assumptions → what it changed** (3-column table, last column in `--ink` 600):
| What people report (facts) | What I assumed | What it changed |
|---|---|---|
| Agents stall for long stretches on one permission | Single-agent users are covered by official apps | The core problem is real |
| Official phone apps already handle basic approvals | — | Nudge must solve what's missing |
| Laptops sleeping drop the session | Maybe the biggest unsolved pain | Keep-awake + a clear "offline" state |
| Approving on the move = approving quickly | Nobody can judge a command in seconds | Plain words + risk level |
| A phone approval once never reached the computer, with no error | One silent failure breaks trust | Sent → Reached → Running |
| Each official app shows only its own agent | The pain sits with multi-agent users | One place for every agent |
Also show the brief given to Claude as a small "prompt card" (mono, like a chat bubble): facts only · facts and hypotheses in separate columns · only features the facts support.

**c) Quotes:** cards. Load from `quotes.json`; **only render quotes with `"confirmed": true`.** If none are confirmed, show only the "10–12 people" line.

## 5 · Concept thinking
**Feature map** built as cards in 4 groups (+ Later), then a "Cut" strip:
- **Setup:** Pair by QR · See and remove paired phones · Claude Code, Codex, Cursor
- **Home (the hub):** All sessions on one screen · One-line live status · Computer status + keep-awake
- **Approvals and questions:** Approve / deny from the lock screen · Plain explanation + risk · Summary of what the agent did · Answer questions · Delivery confirmation · Timeout back to the computer
- **Control:** Stop → Continue / Redirect / Undo · Model and intensity · Voice · Start a new task (badge: "questioned, then kept")
- **Later:** Approval history · Trust rules
- **Cut** (struck-through style, `--ink-2`): Commit and push buttons — approvals already cover them · Editing code on the phone — clutters a quick tool
**Concept sketches** rebuilt as 6 tiny dark wireframe cards (grey blocks + labels only), titled: 1 Setup · 2 Home (the hub) · 3 Lock screen notification · 4 Approval detail · 5 Answer a question · 6 Session control. Content per card:
1. Connect your computer · "Scan code shown on computer" · Agents found: Claude Code · Codex · Cursor · Settings › paired phones
2. Your computer — Awake · Claude Code · app — Waiting for you · Codex · api — Working "Editing login.js…" · Cursor · site — Done · + New task · Voice
3. Claude Code · app · "Wants to delete old build files" · Low risk · Approve / Deny / Open
4. What it did so far · It wants to run `rm -rf dist` · plain explanation · Low risk · Approve / Deny · Sent → reached computer → running
5. "Which login method should I add?" · Email and password · Google sign-in · Type your answer · Voice
6. Codex · api · "Editing login.js…" · Model: default · Intensity: medium · Stop · After stop: Continue / Redirect / Undo

## 6 · User flow
A vertical **flow with edge-case branches** (main path left, amber edge cases branching right). Use the **Approvals** flow:
Main: Agent asks permission → Notify: explanation + risk → (optional) Open full detail → Approve (fingerprint) or Deny → Answer sent → Reached computer, running.
Edge cases (amber): Several requests → grouped per session, queue · High risk → full command shown · Answered on computer → notification removed · No answer in 10 min → goes back to computer · AI explanation off → risk and command only · Fingerprint fails → use phone PIN · Tapped too late → explain + message agent · Phone offline → not sent, retry · Didn't reach computer → show failure, retry.

## 7 · Flowcharts
Tabs or a horizontal carousel of native flowcharts — **Overview · Onboarding · Home · Questions · Control · New task · While work runs** (legend: Main path · Edge case (amber) · Alternative path (dashed)):
- **Overview:** Onboarding → Home (the hub) → Approvals · Questions · Control · New task; side branches: While work runs (background alerts) · Settings (phones, computers, alerts).
- **Onboarding:** Install the app → Sign in (Google or email) → Read short setup steps → Tap "Email me the link" → Install helper on computer → Scan QR code with phone → Confirm detected agents → Connect each agent (Yes) → Choose keep-awake → Allow notifications → Home. Edge: Forgot password → reset link · Email not received → resend · Install fails → retry / other method · Scan fails → retry or type 6-digit code · Code expired → helper shows a new code · No agents found → install links, scan again · User taps No → shown as not connected · Keep-awake declined → change later · Notifications denied → warning on Home, Turn on.
- **Home:** Open app → Computer switcher + status → Waiting for you, first → Working · one-line status → Done · clears in 24 h → Tap session or New task. Edge: Notifications off → warning + Turn on · Computer offline → notify once + banner · Agent disconnected → one-tap reconnect · No sessions yet → empty state + New task.
- **Questions:** Agent asks a question → Notification shows it → Open answer screen → Pick, type or speak → Voice: check and edit text → Sent, reached computer. Alt (dashed): up to 3 short options → tap one + fingerprint · plan to review → summary + read full plan. Edge: empty answer → "type an answer first" · words misheard → fix before sending · timeout / offline / too late → same as approvals.
- **Control:** Open a session → Status, model, intensity → Tap Stop → Files changed: confirm → Session stopped → Continue, Redirect or Undo. Edge: agent can't do this → button shown, explains why · no files changed → stops right away. Alt: Undo → last step, or go back further.
- **New task (as first designed — label it "before feedback"):** Tap New task → Choose computer → Choose agent → Folder: recent + search → Type or speak instruction → Safety: ask every action → Start, appears in Working. Edge: computer offline → can't start, explains why · agent can't start tasks → shown, explains why · search finds nothing → no project found. Alt: change safety before Start.
- **While work runs:** Usage limit reached → paused, continues at 3:45 (session line only, no alert) · Task finished → notification (can turn off) · Task failed → notification (can turn off) · Session done → fades, gone after 24 h.

## 8 · Wireframes
Grey wireframe screens are images (they ARE screens): `wf-home.png`, `wf-approval.png` in phone frames, `wf-helper.png` in a desktop-window frame (dark chrome). Caption the decisions: floating nav, 4 items.

## 9 · Moodboard
Phones: `mood-liquid.png` (Liquid glass — rejected), `mood-lime.png` (Neon accent — rejected), `mood-warm.png` (Warm editorial — rejected), `ds-first-home.png` (Chosen base: minimal). Rejected ones get a small "Rejected" label (not red — `--ink-2` with a strike line).

## 10 · Design system
Native board, 3 columns (see the reference mockup): **Type** (big "Aa" in IBM Plex + the scale: Large title 28 · Title 22 · Headline 17 · Body 17 · Footnote 13 · Mono 15) · **Colour** (swatches: Background #0E0F12 · Surface white 6.5% · Ink #F5F5F7 · Secondary #A1A1A6 + the 4 risk chips) · **Components** (Deny/Approve buttons, two answer options with one selected, the reply input, a toggle). All real HTML, not an image.

## 11 · Design
Before → after row: `design-before.png` (Before: first design) → `rejected-grey.png` (Grey background — rejected) → `final-home.png` (After). Optional second row: `explore-signal.png`, `explore-night.png` (directions explored in the critique). Then the **logo** built in SVG from `nudge-mark.svg`: in-app mark · app icon (dark tile) · app icon (light tile) · lockup "Nudge".

## 12 · Prototype
**Embed the live prototype** (`/Nudge/app/`) in a phone frame on desktop (iframe, lazy-loaded) + **Open the prototype** button; on phones show the button and 3 screenshots (`final-newchat.png`, `final-highrisk.png`, `final-question.png`) instead of the iframe.

## 13 · Feedback and iteration
Before → after: `before-newtask-dark.png` (Before: New task form) → arrow → `final-newtask.png` (After: pick an agent) → `final-newchat.png` (Then a normal chat) → `final-chat-approval.png` (Card → its chat). Then the 4 changes as short cards. Feedback quotes from `quotes.json` (confirmed only).
