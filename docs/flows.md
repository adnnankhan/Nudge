# Flows

## First visit
SignIn → (Create account / Google / Sign in) → SetupIntro → LinkSent → Scan → Connecting → AgentsFound → Notifications → Home + KeepAwake sheet.
Second visit (same browser): open straight on Home. Progress is saved in `localStorage`; "Reset demo" clears it.

## Main loop on Home
1. A fake request arrives (see `fake-data.md`) → in-app banner "Claude Code needs your approval · Review" → card appears at the top of Needs you, summary "Waiting" +1.
2. **Approve (low/medium)** → Face ID sheet → card collapses → Working gets a session → summary updates.
3. **Review (high)** → ApprovalHighRisk → Hold to approve → Face ID → ApprovalSent → Back to Home.
4. **Deny** → card collapses → toast with Undo → Completed today: "Denied".
5. **Answer a question** → tap option (sends) or open it → AnswerQuestion → Send answer.
6. A working session finishes after a while → moves to Completed today (Done) → banner "Cursor finished · View".
7. Nothing left → "You're all caught up".

## Navigation map
| From | Action | To |
|---|---|---|
| Home header | Settings button | Settings |
| Home | Computer pill | Computer menu → switch / Add a computer |
| Home card | Tap (not on a button) | Task thread (chat) |
| Task thread | Review on a high-risk card | ApprovalHighRisk (Hold to approve) |
| Task thread | ⋯ | Task menu: Model · Intensity · Ask me · Stop task |
| Home Working row | Tap | Task thread |
| Home Completed row | Tap | Task thread (Done / Failed summary) |
| Tasks tab | Row tap | Task thread |
| New task | Agent tile | New task chat → Send → Task chat |
| New task | Recent row | That task's chat |
| New task chat | project · computer line | Change sheet (folder + computer) |
| Composer | Ask me chip | Ask me sheet |
| Task menu | Stop task | StopConfirm (or TakeOverConfirm for terminal sessions, NotSupported for Cursor) |
| StopConfirm | Stop session | Stopped → Continue / Redirect / Undo / Go back further |
| Tab bar | Home · Tasks · New task · Agents | — |
| Agents | Add a computer | AddComputer |
| Settings | rows | PairedPhones / TimeoutPicker / SignOutConfirm / Dark mode toggle |

Back gestures: browser back and an edge swipe (from the left 24 px) both go back. Sheets close with a downward drag, scrim tap, or Esc.

## Demo menu (for testers and the case study)
A small, unobtrusive way to show every state without real agents:
- **Open:** long-press the Nudge mark in the Home header (or press `D` on a keyboard).
- **Items:**
  - Send a low-risk request · Send a medium-risk request · Send a high-risk request · Send a question · Send a plan
  - Finish a session · Fail a session
  - Computer offline (on/off) — shows HomeWarnings and the "Not sent" behaviour
  - Show "no agents" setup · Show empty Home
  - Lock screen: approvals · questions · other alerts
  - Computer helper: pair · connect agent · status
  - Approval states · New task states
  - Reset demo (back to Sign in)
- The demo menu is a bottom sheet in the same design system, titled **Demo**, with a footnote "Only in the prototype."

## On a computer (desktop browser)
Show the app inside a centred phone frame (390×844, rounded 48, subtle shadow) on a `--bg`-coloured page, with a small caption under it: "Nudge prototype · works best on a phone — scan to open" + a QR code of the URL. On phones (width < 500 px) the app fills the screen with no frame.
