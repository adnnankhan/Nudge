# Nudge — case study content (FULL version — trim while building, keep every decision + reason)

Rules this content follows: every section opens with its key visual and the decision behind it. Every line is either a decision and its reason, or a fact that a decision rests on. Quotes marked **[draft — confirm]** must be confirmed or replaced before publishing.

---

## 1 · Idea
**Visual:** Home and an approval in the chat, side by side.

# Never miss what your coding agent needs.
Nudge is a phone app for people who run AI coding agents — Claude Code, Codex and Cursor. When an agent stops to ask for permission or a question, Nudge brings it to your phone, explains it in plain words, and lets you answer safely from wherever you are. Each agent's own app shows only that agent, so Nudge puts all of them in one place — and makes every request safe to answer, not just quick.

Product Designer · solo · concept + live prototype · iOS & Android · 2026
**[Open the prototype]**

---

## 2 · Key screens
**Visual:** 5 screens in a row, each with a one-line caption.

| Screen | Caption (decision — why) |
|---|---|
| **Home** | What needs you comes first — it's the only thing that can't wait. |
| **Approval** | Plain words + risk level — nobody should approve a command they can't read. |
| **Hold to approve** | High risk needs a deliberate hold — dangerous commands shouldn't be one tap. |
| **Chat** | Opens from any card, works like Claude and ChatGPT — nothing new to learn. |
| **Tasks** | Every agent in one list — each agent's own app shows only itself. |

---

## 3 · Problem statement
**Visual:** four problem cards and the "How might we" line.

**The agent doesn't fail. It waits — and nobody's there to answer.**

People who run AI coding agents, from professional developers to non-coders, step away while the agent works — a short break, a class or meeting, an overnight run. While they're away, the agent stops to ask for permission or a question, and they don't see it.

1. **Work stops.** The agent waits until the person comes back.
2. **The session can drop.** On Windows laptops, the computer goes to sleep and the connection is lost.
3. **Rushed decisions.** Faced with a pile of waiting prompts, people approve without reading and answer half-way. The agent builds the wrong thing, work is redone, and time and usage limits are wasted.
4. **Juggling agents.** People running more than one agent have no single place to see which one is waiting.

**How might we** make sure people never miss what their coding agents need, and can answer correctly and safely from wherever they are?

---

## 4 · Research
**Before designing anything, I checked two things — can this be built, and is the problem real? — because a great design for an impossible or imaginary product is wasted work.**

### a) Can it be built?
**Visual:** connection diagram — computer helper → encrypted relay → phone.

- **I chose a helper on the computer + a relay + the phone app**, because a phone can't reach a laptop directly on most networks; a relay passes messages in both directions without the user setting anything up.
- **I chose end-to-end encryption with QR pairing**, because a phone that can approve commands is effectively a remote control for someone's computer. The relay only carries locked messages it can't read.
- **I checked the cost before committing:** the relay can start on a free tier, so the idea doesn't depend on a big server bill. The real fixed costs are the app store accounts.
- **Each agent allows different things, so the app shows only what each one supports:** Claude Code and Codex allow approvals, questions and control; Cursor allows approvals only. A button that can't work is worse than no button.
- **Undo restores files only**, because commands an agent already ran (installs, deletes) can't be reversed. Saying so up front avoids false confidence.
- **I listed every technical constraint with its real-world solution before drawing a screen**, because each one is a design decision in disguise: what the user sees when the phone is offline, when the computer sleeps, when a request times out.

### b) Is the problem real?
**Visual:** the brief I gave Claude, next to the facts-vs-hypotheses table.

**I didn't want to design for a problem I'd only imagined, so I tested the idea against facts first.**
When I had the idea, I gave it to Claude with a strict brief:
- find, using **facts only**, whether this problem is real — what developers report across platforms when they leave agents running and step away — so I wouldn't build on a hunch;
- keep **facts** and **my hypotheses** in separate columns, so my assumptions couldn't pass as evidence;
- list **only the features the facts support**, so every feature in Nudge traces back to a real problem.

**What the facts showed — and how it changed the idea:**
- **Agents stall for long stretches on a single permission or question** → the core problem is real.
- **All three big agents already have official phone apps for basic approvals** → a plain "approve from your phone" app wouldn't be enough. Nudge had to solve what's still missing.
- **Laptops sleeping drop the session**, and Windows users asked for a fix → keep-awake and a clear "offline" state became features.
- **Approving on the move leads to approving quickly** → every request needed a plain-language explanation and a risk level.
- **An approval tapped on a phone sometimes never reached the computer, with no error shown** → the app confirms delivery: Sent → Reached your computer → Running.
- **Each official app shows only its own agent, and many developers use more than one** → one place for all agents became Nudge's core.

### c) What people told me
**Visual:** quote cards.

**The facts said the problem existed; I wanted to hear it from people before building on it**, because online posts show what's loud, not always what's common. I talked to **14 people** who use coding agents. They face this problem, and said an app like this would help them.

> "I start a long task, go make tea, come back, and it's been stuck on one permission prompt the whole time." **[draft — confirm]**
> "My laptop slept overnight, and in the morning the session was just gone." **[draft — confirm]**
> "When five prompts are waiting, I just press yes on all of them. I know I shouldn't." **[draft — confirm]**
> "I run Claude Code and Cursor together, and I never know which one is waiting for me." **[draft — confirm]**

---

## 5 · Concept thinking
**Visual:** the feature map — "a hub, a TV remote" — with kept, cut and later.

**I didn't want just a way to say yes. I wanted a remote for all your agents** — one hub that shows what's working, what's waiting and what's done — because people running agents need the whole picture, not one prompt at a time.

- **Built on the gaps the facts showed, not on what official apps already do**, because basic alerts and approvals already exist: one place for every agent, plain-language risk, proof that an answer arrived, and a computer that stays awake.
- **Kept, because each one answers a fact from the research:** pairing by QR · all sessions on one screen with a one-line live status · computer status with keep-awake · lock-screen Approve / Deny · plain-language explanation and risk · a short summary of what the agent did before asking · answering questions by tapping or typing · delivery confirmation · requests returning to the computer if unanswered · stop, then continue / redirect / undo · model and intensity · voice replies.
- **Questioned, then kept: starting a new task from the phone.** I first thought people would start tasks at their desk. I kept it because a task often finishes while you're away, and you want to start the next step without going back.
- **Cut: editing code and separate commit/push buttons.** A phone is the wrong place to write code, and commits already arrive as approvals — extra buttons would only add clutter.
- **Later: history and trust rules** ("always allow this in this project"), because they need real usage before they can be designed well.

---

## 6 · User flow
**Visual:** the full flow, edge cases highlighted.

**I mapped every path from sign-in to every feature, including what happens when things go wrong — because that's where trust is won or lost.** I made each call myself:

- **Sign-in:** Google or email + password — the two most familiar options.
- **Setup starts with a short explanation**, because the first step happens on the computer, not the phone; people need to know why before they install anything.
- **The helper finds agents automatically and the user confirms each one**, so nothing connects without a yes.
- **Notifications are asked for right after pairing, with a reason** — the moment the value is obvious.
- **Keep-awake is offered as soon as Home opens**, so the session doesn't drop on the first use.
- **Home shows what's waiting first**, because that's the only thing that needs you.
- **Approve from anywhere, protected by Face ID or fingerprint.** Typing needs the app open, because a typed answer deserves a full screen.
- **Several requests from one session are grouped into a queue**, so you review them in order instead of hunting.
- **You always know what happened to your answer**, so you never wonder whether a tap counted: answered on the computer first → the phone says so · phone offline → "Not sent" with Retry · tapped too late → it explains what happened and what to do next.
- **Stop asks for confirmation only when files have changed** — asking every time teaches people to tap through confirmations.
- **Undo goes back one step, with "Go back further"** for more, so the common case is one tap and bigger rollbacks are a deliberate choice.
- **Cursor's Stop button is shown with an explanation** instead of hidden, so people understand the limit rather than wondering where the control went.
- **Every failure gets one clear message and one next step, so nothing fails silently.** Computer offline → one notification + a banner · lost phone → remove it from the new phone or the computer · broken agent connection → notify + one-tap fix · notifications off → warning + fix · usage limit → shown on the session line only · QR fails → retry, or enter a code · no agents found → explain + install links + scan again · task finished or failed → notify for both.
- **Taking control of a session started in the terminal is merged into the action itself** — tapping Stop asks once ("This stops it in your terminal and continues from your phone") instead of adding a separate "Take over" button.

---

## 7 · Flowcharts
**Visual:** the flowcharts.

**I turned the flow into charts anyone could follow without me explaining them**, because a flow only I understand can't guide the design.
- **Neutral colours, with one colour reserved for edge cases**, so the happy path reads first and the failure paths stand out.
- **Clean and precise, not sketchy**, because the charts became the reference for every screen that followed.

---

## 8 · Wireframes
**Visual:** key wireframes + the navigation decision.

**53 mid-fidelity wireframes covered every screen in the flow before any visual design**, so structure and flow were settled before style could distract from them.
- **A floating bottom navigation, like iOS apps use today**, because it keeps content visible and is reachable with one thumb.
- **Four items, not three**, because three looked unfinished at the bottom of the screen.
- **"Add a computer" lives in the computer dropdown**, because that's where people look for their computers.
- **I reviewed every screen and asked for one more check for anything missing before moving on**, because a missing screen costs minutes now and days after visual design.
- **I then re-checked technical feasibility against Happier**, an app built on the same idea, so the design wouldn't promise anything impossible. It confirmed the limits — Undo restores files only, Cursor can't be controlled — and how to handle sessions started in the terminal.

---

## 9 · Moodboard
**Visual:** the directions explored — kept and rejected.

**I explored colour and type directions with Claude, and rejected most of them on purpose**, because the first options were rarely good enough to build a product on.
- **Rejected the first set as dated — styles from 2020**, because a tool for AI agents has to feel current.
- **Asked for a mix of two directions**, held to HCI and Google guidelines, contrast and spacing, so a style choice couldn't turn into a usability problem later.
- **Chose minimalism with modern effects and strong typography**, because a screen you decide on in seconds has to stay calm; Dribbble references set the quality bar.
- **Rejected directions that looked "lacking"**, even when they followed the rules. Correct isn't enough; it has to feel premium.

---

## 10 · Design system
**Visual:** type, colour, spacing, glass and components.

**I built the system one decision at a time, each option checked against platform guidelines**, so no visual choice could break usability later.
- **Type: IBM Plex Sans and Plex Mono** — chosen after comparing options on real screens. Mono only for commands, project names and times, so code reads as code.
- **Colour left until last**, so it couldn't hide weak layout or hierarchy.
- **Soft, rounded shapes on an 8-point grid with 16px side margins**, so spacing stays consistent on every screen; **44 × 44 pt minimum touch targets**, Apple's minimum, so every tap lands.
- **Glass only on buttons and floating bars, never as decoration.** The tab bar gets stronger blur so content behind it turns to haze instead of fighting the labels.
- **Colour means risk or status — nothing else** (green low, amber medium, red high, grey working), so one glance tells you how careful to be. **Status is never colour alone** — always an icon and a word — so it works for colour-blind people too.
- **Answers always in the same order** — numbered options from top to bottom, typed answer last — so every question works the same way.
- **Text sizes follow Apple's type ramp**, with nothing below 12px except Apple's own 10px tab labels, so text stays legible and the app feels native.

---

## 11 · Design
**Visual:** final screens, with the key changes called out.

**The first full design got a hard review, and most of the changes came from removing things**, because every extra element competes with the one decision on screen.
- **Home order kept: Needs you → Working → Completed**, because what needs you must always come first.
- **Settings moved to the top-right; New task moved to the centre of the tab bar**, where the most-used action belongs.
- **No countdown rings or timer pills**, because a ticking clock pushes people to approve without reading — the exact problem Nudge exists to fix. Each request shows "x min ago" and "Goes back to your computer after 10 min" instead.
- **Alerts colour only the icon**, never the text, so warnings stay readable and the screen stays calm.
- **Rejected a grey background**, because it made the whole app look unfinished.
- **The summary boxes are black and white with icons**, because colour is reserved for risk.
- **Friction matches risk**, because a dangerous command deserves a deliberate action and a safe one shouldn't slow you down. Low and medium: tap Approve, then Face ID or fingerprint. High: Home shows **Review**, and the opened request needs **Hold to approve**.
- **Named it Nudge**, with a logo of rings opening outward — a signal reaching you. **Blue was tried as an accent and dropped for black and white**, which also leaves colour free to mean risk.
- **Dark mode became the main mode** — the version I refined furthest in Figma — with every component built in both dark and light, so either mode stays consistent.

---

## 12 · Prototype
**Visual:** the live prototype, embedded.

**I built the prototype to feel like a real app, not a slideshow**, because people judge an experience by using it, not by looking at screenshots.
- **It opens fast and works on any device** — phone, laptop or desktop — so anyone can try it from one link. It installs to the home screen. **[confirm]**
- **Real interactions** — hold to approve, Face ID / fingerprint, answering by tapping, typing or voice, and requests arriving on their own — because a safety pattern like hold-to-approve can only be judged by doing it.
- **Built in Claude Code from detailed specs, tested and fixed in short rounds against the designs**, so the prototype matches what I designed instead of drifting from it.
**[Open the prototype]** · adnnankhan.github.io/Nudge/app

---

## 13 · Feedback and iteration
**Visual:** before → after: New task form → agent tiles + chat; a Home card → its chat.

**I put the prototype in front of a few people who use Claude Code and other agents every day**, because the people who'd use Nudge are the ones who can tell what's missing. In short: a chat-based way to work with the agent was missing, and adding a new task felt complicated.

> "It's great for approving, but when I want to start something, I expect a chat, like Claude." **[draft — confirm]**
> "Adding a new task felt like filling in a form." **[draft — confirm]**

**I added chat without turning Nudge into a chat app**, because its job is still to get you the right decision fast.
- **Chat appears in only three places, so Home stays the approval hub:** tapping a card on Home opens that task's chat · New task is now "pick an agent," then a chat opens · a Tasks tab lists every task from every agent.
- **The chat follows the patterns people already know from Claude and ChatGPT** (Jakob's Law), so there's nothing new to learn: your messages on the right, the agent's as plain text, tool activity as one collapsible line, the same rounded message box.
- **New task lost its form**, because filling fields was exactly the friction people described: your last project and computer are used automatically, shown as one line you can tap to change.
- **"Ask me" replaces showing everything**, so the agent comes to you only when you want it to: before every action, only before commands, or just when it's done.
- **Then I walked the flows as a frustrated user and removed everything that asked twice**, because every repeated question is a moment someone gives up: New task remembers your choices · cards inside a chat don't repeat who and where · voice drops straight into the message box · an open app shows one banner, not a notification too · coming back to Home keeps your place · low-risk requests can be approved together with one Face ID or fingerprint check · one check covers low and medium approvals for 5 minutes — high risk always asks.
