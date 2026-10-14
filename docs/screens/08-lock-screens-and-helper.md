# Lock-screen previews and the computer helper

These aren't part of the app itself. They're **demo screens** so people testing the prototype can see the whole story. Reach them from the demo menu (see `docs/flows.md`).

## Lock-screen previews — `/demo/lock/:kind`
Refs: `docs/reference/light/LockApproval.jpg`, `LockQuestion.jpg`, `LockAlerts.jpg` (same in both modes — they imitate the phone's own lock screen)
Phone wallpaper (dark grey gradient) · "Monday 13 October" · big **9:41** · notification cards (light frosted, radius 22, app icon + NUDGE + time):

**Approvals** (`/demo/lock/approvals`)
- Claude Code · my-app — "Wants to delete old build files" — chip Low risk + "Approve needs Face ID" — buttons **Approve** (fingerprint) / **Deny** / **Open**
- Claude Code · portfolio (1m) — "Wants to force-push to main" — chip High risk + `git push --force origin main` — buttons **Open** / **Deny** (no Approve for high risk)
- Codex · api (3m) — "3 requests waiting" — "Tap to review them one by one."

**Questions** (`/demo/lock/questions`)
- Codex · api asks (now) — "Which login method should I add?" — buttons **Email and password** / **Google sign-in**
- Claude Code · my-app asks (2m) — "How should errors be shown on the login page?" — "Tap to answer in the app."
- Claude Code · portfolio (6m) — "Has a plan ready for review" — "Tap to read the summary."

**Other alerts** (`/demo/lock/alerts`)
- Cursor · site — "Finished: contact form added" — "Tap to see what changed."
- Codex · docs (2m) — "Failed: tests didn't pass" — "Tap to see why and reply."
- Windows PC (5m) — "Went offline. Claude Code is paused." — "It continues when the computer is back."
- Codex (8m) — "Disconnected after an update" — "Reconnect it in the helper on your computer."

Tapping a notification "opens the app" at the matching screen. Approve on the lock screen runs the Face ID sheet, then shows a small "Approved" banner.

## Computer helper (desktop) — `/demo/helper/:step`
Refs: `HelperPair.jpg`, `HelperConnectAgent.jpg`, `HelperHome.jpg` (dark). The dark references are cropped and miss the QR code — use the light ones for full layout: `docs/reference/light/HelperPair.jpg` etc.
A desktop window (560×680, title bar "Nudge helper · Windows PC"). On phones show it scaled to fit.

**Pair** — **Pair your phone** · "Open the app on your phone and scan this code." · QR code (generate a real QR of the prototype URL with a tiny inline generator, or a static SVG) · "Can't scan? Enter this code:" · **482 917** (mono, large) · "New code in 4:32" (counts down) · info alert "Pairing gives your phone a secret key. Messages are locked before they leave this computer."

**Connect agent** — chip Connected + "Phone paired · iPhone" · card: Claude logo + **Connect Claude Code?** · "Your phone will be able to approve its requests and answer its questions." · **No** / **Yes, connect** · list "Agents on this computer": Claude Code — Asking now · Codex — Next · Cursor — Next

**Status** — chip Connected + "Running" · "Keep awake" toggle · list Agents: Claude Code — Connected · Codex — "Disconnected after an update" — **Reconnect** · Cursor — Connected · list Paired phones: iPhone — Active now · Old Android — Last used yesterday — **Remove**
