# New task (tab: New task)

> **Changed:** the form below is replaced by the **chat-style composer** in `09-chat-and-tasks.md`. Keep using the sheets and states from this file: ChooseComputer, FolderPicker, NewTaskStates. ChooseAgent becomes the agent chips; SafetyPicker becomes the **Ask me** sheet (new options in 09).

## NewTask — `/new`
Ref: `NewTask.jpg` (dark shows "Agent" on every field — use these labels)
- Title **New task**
- Form fields (each opens a sheet):
  - **Computer** — "Windows PC · Awake" → ChooseComputer
  - **Agent** — "Claude Code"; note under it: "Cursor can't start tasks from the phone" → ChooseAgent
  - **Project folder** — placeholder "Choose a folder" → FolderPicker
  - **Instruction** — multi-line field, placeholder "What should the agent do?"
  - **Safety** — "Ask me before every action" → SafetyPicker
- Primary L **Start** — disabled until folder and instruction are filled → toast "Task started" → Home, new session at the top of Working.
- Tab bar visible (no tab active; New task pill is the current action).

## ChooseComputer — sheet
Ref: `ChooseComputer.jpg`
**Choose computer** · **Windows PC** (Awake, selected) · **MacBook** (Asleep · wakes when the lid opens) · **Mac 2** (Offline · last seen 1 day ago, disabled)

## ChooseAgent — sheet
Ref: `ChooseAgent.jpg`
**Choose agent** · Claude Code (Ready, selected, logo) · Codex (Ready, logo) · Cursor (Can't start tasks from the phone, disabled 50%, logo)

## FolderPicker — `/new/folder`
Ref: `FolderPicker.jpg` (dark shows placeholders — use this copy)
- Top bar **Choose a folder**
- Search field "Search projects" (filters the list)
- **Recent** list (folder icon, chevron): **my-app** `C:\Users\you\projects\my-app` · **portfolio** `C:\Users\you\projects\portfolio` · **api-server** `C:\Users\you\work\api-server`
- Tap → back to NewTask with the folder filled.
- Search with no match → "No project found. Check the name, or open the project once on your computer."

## SafetyPicker — sheet
Ref: `SafetyPicker.jpg`
**Safety** · "How much the agent can do without asking." · **Ask me before every action** (Safest when you're away, selected) · **Allow file edits** (Asks only before running commands) · **Plan only** (Makes a plan, changes nothing)

## NewTaskStates — demo screen `/demo/new-task-states`
Ref: `NewTaskStates.jpg` (use this copy)
Title **When a task can't start** · "What you see instead of Start."
- error · "Windows PC is offline. Start a task when it's back online."
- info · "Cursor can't start tasks from the phone. Start Cursor tasks in the Cursor editor."
- warning · "No project found. Check the name, or open the project once on your computer."
In context: picking Mac 2 (offline) replaces Start with the first alert.
