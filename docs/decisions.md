# Decisions (made by Adnan — follow these)

1. **Home header shows the Nudge mark and the name "Nudge"** next to it (Title 3), even though the dark reference shows the mark only.
2. **Sentence case everywhere**: "Create account", "Sign in instead", "Send reset link" — not the Title Case seen in some dark references.
3. **Light/Dark switch** lives in Settings → **Appearance** → **Dark mode** toggle (on by default). Turning it off switches to Light instantly.
4. **Sample copy written for the prototype is approved as written** (extra fake requests, second question's options, the full plan steps, toasts, Face ID sheet text, hold hint). Use it as is; don't ask about it.
5. **Onboarding top bars show the title "Nudge"** (centred, as in the dark references), with the back arrow.
6. **Session rows**: the chip holds the status word with its icon (Working, Paused, Done, Failed); the one-line status text ("Editing login.js") follows in grey.
7. **Needs you order**: high risk first, then oldest first.
8. **Every request lives on Home**: each card (approval, question, plan) opens its detailed view. ApprovalQueue is not a separate entry from Home; it is only the target of the lock-screen "3 requests waiting" notification.
9. **"x of y"** on request screens counts across everything waiting in Needs you, in Needs you order.
10. **Desktop phone frame shows a Dynamic Island**; layouts keep the same safe area as the references (top 54, bottom 34).
11. **GitHub repo `Nudge` doesn't exist yet** (as of M1). Create it before M8's deploy.

## Defaults in use (Adnan can change these later)
- Demo menu: long-press the header logo or press `D` (see `flows.md`).
- Desktop: phone frame + caption "Nudge prototype · works best on a phone — scan to open" + QR code.
- Model picker keeps the "[Model name]" placeholders until real names are chosen.
- Accelerated time for "goes back to your computer" (1 real minute = 10 app minutes).
- Demo menu stays (Adnan, after M3).

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
