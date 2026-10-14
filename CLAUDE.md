# Nudge — prototype (read this first, every session)

Nudge is a phone app that lets people approve and answer their coding agents (Claude Code, Codex, Cursor) when they're away from their computer. This repo is a **clickable, realistic prototype with fake data**. It must feel like a real app, open fast, and work on any device.

## Read these docs before building anything
| File | What it covers |
|---|---|
| `docs/product.md` | What Nudge is, who it's for, the rules the product follows |
| `docs/design-system.md` | Colours (Dark + Light), type, spacing, glass, every component |
| `docs/screens/*.md` | Every screen: layout, exact copy, states, what each tap does |
| `docs/flows.md` | How screens connect, and the demo story |
| `docs/fake-data.md` | The fake computers, agents, sessions, requests, and how they "live" |
| `docs/tech.md` | Stack, folder structure, performance budget, PWA, deploy to GitHub Pages |
| `docs/build-order.md` | Milestones in order, each with "done when" checks |
| `docs/decisions.md` | Decisions Adnan has made — follow them |
| `docs/reference/dark/*.jpg` | **The design.** Adnan's final dark screens. Match these. |
| `docs/reference/light/*.jpg` | Only for checking copy and flow. Not the visual source. |

## Non-negotiable rules
1. **Dark mode is the main design.** Match `docs/reference/dark/` for layout, spacing and look. Light mode is a switch in Settings, built from the Light tokens.
2. **Copy comes from `docs/screens/*.md`, never from the reference images.** Several dark reference images still show placeholder text (e.g. every button says "Approve", text links say "Forgot password?", rows say "Model · 10 min", options say "Ask me before every action"). Those are Figma placeholders — ignore them and use the copy in the screen docs.
3. **Never invent copy, features, numbers or screens.** If something is missing or unclear, stop and ask Adnan.
4. **Follow Apple HIG / Material basics**: touch targets ≥ 44×44, text ≥ 12px (tab labels 10px), WCAG AA contrast, consistent 16px side margins, safe areas (notch + home indicator).
5. **Colour means risk or status only.** Green = low risk / done, amber = medium, red = high / failed, grey = working. Everything else is black/white. Status is never colour alone (always icon + word).
6. **No countdown rings.** Requests show "x min ago" and "Goes back to your computer after 10 min".
7. **High risk is never one-tap.** Home shows **Review**; the opened request uses **Hold to approve**.
8. **Fast first.** Keep the performance budget in `docs/tech.md`. No heavy UI libraries.
9. **Use real components, not one-offs.** Build every component in `design-system.md` once and reuse it.
10. **Commit after each milestone** in `docs/build-order.md`, and check its "done when" list before moving on.

## Tone of copy
Short, plain, human. **Sentence case everywhere** ("Create account", "Sign in instead") — even where a reference image shows Title Case.

## Brand files
`public/brand/`: `nudge-mark.svg` (uses currentColor), `app-icon.svg`, `app-icon-maskable.svg`, `agent-claude.svg` (keeps orange #D97757), `agent-codex.svg` and `agent-cursor.svg` (currentColor), `google-16.png` (Google "G", 16×16 — fine at 18–20px; replace with the official vector before publishing).
