# Fake data and simulation

Everything lives in one in-memory store (Zustand or React context + reducer), saved to `localStorage` so a refresh keeps state. No network calls.

## Computers
| id | name | status | agents |
|---|---|---|---|
| `win` | Windows PC | awake (green) · 3 sessions | Claude Code (connected), Codex (disconnected after an update), Cursor (connected) |
| `mac` | MacBook | asleep (amber) | Claude Code (connected) |
| `mac2` | Mac 2 | offline (grey) · last seen 1 day ago | — |

User: `you@email.com`. Phones: This phone (iPhone · active now), Old Android (last used yesterday).

## Starting state on Home (Windows PC)
**Needs you (2)**
1. Approval · Claude Code · `my-app` · 2 min ago · Low risk · "Delete the old build folder" · `rm -rf dist` · what: "Deletes the old build folder. Your code isn't touched." · before: "Updated 3 files for the login page."
2. Question · Codex · `api` · 5 min ago · "Which login method should I add?" · options Email and password / Google sign-in · why: "It's adding sign-in to the login page. Both options work with the current setup."

**Working (1)** · Claude Code · `portfolio` · 4m · "Editing login.js"
**Completed today (2)** · Cursor · `site` · 10:42 · Done · "Added the contact form" — Codex · `docs` · 09:15 · Failed · "2 tests failed, so it stopped"

## Request library (used by the demo menu and the timer)
| Kind | Agent · project | Risk | Title | Command | What this does | Before this |
|---|---|---|---|---|---|---|
| approval | Claude Code · my-app | Low | Delete the old build folder | `rm -rf dist` | Deletes the old build folder. Your code isn't touched. | Updated 3 files for the login page. |
| approval | Claude Code · my-app | Medium | Install a new package | `npm install jsonwebtoken@9` | Adds a library to the project and changes package.json. It downloads code from the internet. | Set up the login form and wrote two tests. |
| approval | Claude Code · portfolio | High | Force-push to main | `git push --force origin main` | Replaces the main branch on GitHub with your local version. Other people's recent changes on main could be lost. | Finished the login page and committed it. |
| approval | Codex · api | Low | Install a package | `npm install zod` | Adds a small library for checking data. | Started the sign-up form. |
| approval | Codex · api | Medium | Change config file | `edit .env.example` | Changes an example settings file. Real secrets aren't touched. | Added the database settings. |
| approval | Codex · api | High | Delete a folder | `rm -rf migrations/old` | Deletes old database migration files. They can't be restored from here. | Wrote new migrations. |
| question | Codex · api | — | Which login method should I add? | — | options: Email and password · Google sign-in | — |
| question | Claude Code · my-app | — | How should errors be shown on the login page? | — | options: Under each field · One message at the top | — |
| plan | Claude Code · portfolio | — | Add sign-in to the portfolio | — | see `04-questions.md` | — |

## Living app (makes it feel real)
- **Arrival timer:** 25 s after reaching Home, then every 40–70 s (random), add the next request from the library (cycle; skip ones already waiting). Max 4 waiting at once. Pause the timer while a sheet or the demo menu is open.
- **Times tick:** "x min ago" updates every 30 s. Working sessions show elapsed minutes.
- **Working sessions:** every ~6 s add a line to Recent ("Read 3 files", "Updated LoginForm.tsx", "Ran the tests"). After 60–90 s a session finishes → Completed today (Done) → banner.
- **After approving:** the request becomes a Working session for that agent/project ("Running: `rm -rf dist`").
- **Time to answer:** if a request is older than the setting (default 10 min — use **accelerated time** in the prototype: 1 real minute = 10 app minutes, only for this rule), it leaves Needs you and shows in Completed as "Went back to your computer".
- **Offline mode** (demo menu): Approve/Send show the "Not sent" alert with Retry; turning it off and tapping Retry succeeds.

## Persistence
`localStorage` key `nudge-proto-v1`: onboarding done, theme, settings, store snapshot. "Reset demo" deletes it.
