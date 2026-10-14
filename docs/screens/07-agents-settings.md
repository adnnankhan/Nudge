# Agents and Settings

## Agents — `/agents` (tab: Agents)
Ref: `Agents.jpg` (dark shows Claude logo and same name on every row — use this copy)
- Title **Agents**
- Card row: computer icon · **Windows PC** · "Awake · keep awake" · toggle (keep awake, on)
- Group **Windows PC · agents**:
  - Claude logo · **Claude Code** · "Approvals, questions, full control" · green dot **Connected**
  - Codex logo · **Codex** · "Reconnect on your computer" · red dot **Disconnected**
  - Cursor logo · **Cursor** · "Approvals only" · green dot **Connected**
- Group **MacBook · asleep**: Claude Code · "Approvals, questions, full control" · **Connected**
- Secondary button with plus: **Add a computer** → AddComputer

## Settings — `/settings` (from the Home header button)
Ref: `Settings.jpg` (dark shows placeholder rows and a wrong top-bar title — use this copy)
- Top bar: back · **Settings**
- **Devices**: Paired phones — 2 › (→ PairedPhones)
- **Approvals**: Time to answer — 10 min › (→ TimeoutPicker) · AI explanation — toggle (on)
- **Notifications**: Task finished — toggle (on) · Task failed — toggle (on)
- **Appearance**: Dark mode — toggle (on). Turning it off switches the whole app to Light instantly (no reload). *(Not in the references — style it like the other toggle rows.)*
- **Account**: you@email.com (plain row) · **Sign out** (destructive) → SignOutConfirm
- "AI explanation" off → request screens hide "What this does" and show the info alert "AI explanation is off. Showing the risk level and command only."

## TimeoutPicker — sheet
Ref: `TimeoutPicker.jpg`
**Time to answer** · "If you don't answer in time, the request goes back to your computer." · 5 minutes · **10 minutes** (Default, selected) · 15 minutes · 30 minutes
Changing it updates every "Goes back to your computer after X min" line.

## SignOutConfirm — sheet
Ref: `SignOutConfirm.jpg`
**Sign out?** · "You won't get requests on this phone until you sign in again. Your agents keep working." · destructive **Sign out** (→ SignIn, clears prototype state) · secondary **Cancel**

## PairedPhones — `/settings/phones`
Ref: `PairedPhones.jpg`
- Top bar: back · **Paired phones**
- List: phone icon · **This phone** · "iPhone · active now" — phone icon · **Old Android** · "Last used yesterday" · text link **Remove**
- Footnote: "Lost a phone? Remove it here, or from the helper on your computer. It stops working straight away."

## RemovePhoneConfirm — sheet
Ref: `RemovePhoneConfirm.jpg`
**Remove Old Android?** · "It stops working straight away and can't approve anything. To use it again, pair it again." · destructive **Remove phone** · secondary **Cancel** → row disappears, toast "Old Android removed".
