# Onboarding

Reference images: `docs/reference/dark/<Name>.jpg`. Copy below is final (references may show placeholders). **Sentence case everywhere** — the dark references show "Create Account" and "Log In"; use "Create account" and "Sign in instead" as written here.
In the prototype any email/password works; Google signs in instantly.

## SignIn — `/signin`
Ref: `SignIn.jpg` (centred brand block, as designed)
- Nudge mark (48) · "Nudge" · "Approve and answer your coding agents from anywhere."
- Title: **Sign in**
- Email field (placeholder `you@email.com`) · Password field (placeholder `Password`, eye toggle)
- Text link right-aligned: **Forgot password?** → ForgotPassword
- Divider "or" · Secondary button with Google logo: **Continue with Google** → SetupIntro
- "New here? **Create account**" → CreateAccount
- Bottom primary L: **Sign in** — disabled until both fields have text → SetupIntro (first time) or Home (if already set up in this browser)
- Wrong password demo: if password is `wrong`, show **SignInError** state.

## SignInError — state of `/signin`
Ref: `SignInError.jpg`
- Password field in error ring, message below: "Wrong email or password."
- Everything else as SignIn.

## CreateAccount — `/signup`
Ref: `CreateAccount.jpg`
- Same brand block · Title **Create account** · "Use Google, or your email and a password."
- Email (`you@email.com`) · Password (placeholder `At least 8 characters`, eye)
- "or" · **Continue with Google**
- "Already have an account? **Sign in instead**" → SignIn
- Bottom primary: **Create account** (disabled until valid: email has @, password ≥ 8) → SetupIntro

## ForgotPassword — `/forgot`
Ref: `ForgotPassword.jpg`
- Top bar: back · no title
- Title **Reset your password** · "Enter your email and we'll send a reset link."
- Email field · Primary L: **Send reset link**
- After tap: info alert "Link sent to you@email.com. Check your inbox and spam folder." with link **Resend**.

## SetupIntro — `/setup`
Ref: `SetupIntro.jpg`
- Top bar: back (to SignIn) · no title
- Title **Set up your computer first** · "It takes about two minutes. Your phone connects once the helper is running."
- Card with numbered steps:
  1. **Install the helper on your computer** — A small app that talks to your agents
  2. **Connect your agents** — Claude Code, Codex, Cursor
  3. **Scan the code with this phone** — Pairs your phone securely
- Footnote: "The email has an installer and a terminal command. Use either."
- Bottom primary L with mail icon: **Email me the link** → LinkSent

## LinkSent — `/setup/link-sent`
Ref: `LinkSent.jpg`
- Title **Check your email on your computer** · "We sent the download link to you@email.com."
- List "On your computer": 1 Open the email · 2 Install the helper (Installer or terminal command) · 3 The helper shows a QR code
- "Didn't get it? **Resend link**"
- Bottom primary L with QR icon: **Scan the code** → Scan

## Scan — `/setup/scan`
Ref: `Scan.jpg`
- Title **Scan the code** · "Point your camera at the code on your computer."
- Camera area (dark rounded box with square frame). In the prototype: after 2.5 s show success → Connecting. A small text link under it: **Simulate a failed scan** shows the error state.
- Error state: alert (error) "Couldn't read the code." with action **Try again**.
- Bottom secondary L: **Can't scan? Enter code** → EnterCode

## EnterCode — `/setup/code`
Ref: `EnterCode.jpg`
- Title **Enter the code** · "Type the 6-digit code shown in the helper on your computer."
- 6 code cells. Any 6 digits → Connecting. Code `000000` → error: cells red + "This code has expired. Use the new code on your computer."
- Bottom primary L: **Connect** (disabled until 6 digits)

## Connecting — `/setup/connecting`
Ref: `Connecting.jpg`
- Centred spinner · **Connecting to your computer…** · "Keep the helper open on your computer." · text link **Cancel** (→ Scan)
- After 1.8 s → AgentsFound

## AgentsFound — `/setup/agents`
Ref: `AgentsFound.jpg`
- Chip **Connected** + "Windows PC"
- Title **Agents on this computer** · "Tap Yes on your computer to connect each one."
- List: Claude Code (Approvals, questions, full control) → chip Connected · Codex (same) → chip Connected · Cursor (Approvals only) → "Not connected"
- Footnote: "You said No for Cursor on your computer. Connect it later from Agents."
- Bottom primary L: **Continue** → Notifications
- Demo variant **NoAgents** reachable from the demo menu (see flows).

## NoAgents — `/setup/no-agents`
Ref: `NoAgents.jpg`
- Chip **Connected** + "Windows PC" · Title **No coding agents found on this computer** · "Install one, then scan again. You can finish setup now and add agents later."
- List with logos + chevron: How to install Claude Code · How to install Codex · How to install Cursor
- Bottom stacked: primary **Scan again** (→ Scan) · secondary **Continue without agents** (→ Notifications)

## Notifications — `/setup/notifications`
Ref: `Notifications.jpg`
- Title **Turn on notifications** · "So you never miss a request from your agents, even when the app is closed."
- Preview card (looks like a notification): app icon · NUDGE · now · "Claude Code · my-app" · "Wants to delete old build files" · chip Low risk · buttons Approve (with fingerprint) / Deny / Open
- Bottom stacked: primary with bell icon **Turn on notifications** · secondary **Not now** → both → Home with KeepAwake sheet open.
- (Prototype: "Turn on" may call the browser Notification permission; if denied or unsupported, just continue.)

## KeepAwake — sheet over Home
Ref: `KeepAwake.jpg`
- Sheet: moon icon + **Keep Windows PC awake while agents work?**
- "This stops your computer from going to sleep on its own, so sessions don't drop."
- Footnote: "Closing the laptop lid or pressing the power button will still put it to sleep."
- Primary **Keep awake** · Secondary **Not now** · footnote "You can change this anytime in Agents."
- Either button closes the sheet. Save choice (Agents → Windows PC toggle reflects it).
