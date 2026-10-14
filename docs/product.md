# Product

## What Nudge is
Coding agents (Claude Code, Codex, Cursor) often stop and wait: they need **approval** to run a command, or they ask a **question**. If you're away from your computer, they sit idle. Nudge sends those moments to your phone so you can answer correctly and safely from anywhere.

**Problem statement:** How might we make sure people never miss what their coding agents need, and can answer correctly and safely from anywhere?

## Who it's for
Developers and "vibe coders" who run coding agents on their own computer (Windows or Mac) and step away while the agent works.

## How it works (real product — simulated in this prototype)
- A small **helper** app on the computer talks to the agents.
- The phone pairs with the helper by **scanning a QR code** (or typing a 6-digit code).
- Requests travel through a relay, **end-to-end encrypted**.
- In this prototype all of that is **fake**: no network, no helper. `docs/fake-data.md` describes the simulation.

## Product rules (apply everywhere)
1. **Requests:** two kinds — *approvals* (run this command?) and *questions* (which option?). Both show "x min ago" and "Goes back to your computer after 10 min". No countdown rings.
2. **Risk decides friction:**
   - Low and medium: tap **Approve** → Face ID step → sent.
   - High: Home shows **Review** (not Approve). The opened request uses **Hold to approve** (press and hold ~1.2 s) → Face ID → sent.
3. **If time runs out**, the request goes back to the computer (the agent asks there instead).
4. **Undo restores files only** (edits the agent made). Commands it ran (installs, deletes) can't be undone.
5. **Cursor is limited:** approvals only — it can't be stopped, can't start tasks, model/intensity are set in Cursor.
6. **Colour = risk/status only.** UI is black and white otherwise.
7. **Status is never colour alone:** chips have icon + word; dots have words next to them.

## Agents and what they support
| | Approvals | Questions | Stop / redirect / undo | Model & intensity | Start a task |
|---|---|---|---|---|---|
| Claude Code | ✓ | ✓ | ✓ | ✓ | ✓ |
| Codex | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cursor | ✓ | — | — | Set in Cursor | — |

## Main features in the prototype
Sign in / create account · setup (helper intro, scan or enter code, agents found, notifications, keep awake) · Home (summary, Needs you, Working, Completed today, warnings, empty) · computer switcher · approvals (low/medium/high, queue, sent states, error states) · questions (answer, voice, plan review) · session control (stop, model, intensity, stopped, undo) · new task · agents · settings (time to answer, AI explanation, notifications, paired phones, sign out) · lock-screen notification previews · Light/Dark switch.
