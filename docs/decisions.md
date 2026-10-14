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
