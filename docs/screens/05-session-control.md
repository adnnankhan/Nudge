# Session control

## Session (working) — `/session/:id`
Ref: `SessionDetail.jpg` (dark shows placeholder rows — use this copy)
- Top bar: Claude logo · **Claude Code · portfolio**
- Chip **Working** · title **Editing login.js…**
- **Recent** (list, file icons, updates live every ~6 s from fake data): Read 6 files · Created LoginForm.tsx · Updated 4 more files
- **Settings** list: **Model** — Default › (→ ModelPicker) · **Intensity** — Medium › (→ IntensityPicker)
- Bottom: secondary with stop icon **Stop** (→ StopConfirm)

## Session started in terminal — `/session/:id` (terminal session)
Ref: `SessionFollowed.jpg`
- Top bar: **Claude Code · my-app** · chip **Working** + grey "Started in terminal" · title **Editing api.ts…**
- Recent: Read 4 files · Updated routes.ts
- Settings: Model · Intensity
- Info alert: "This session runs in your terminal. Stopping it, undoing or changing the model moves control to your phone first."
- Bottom: **Stop** → TakeOverConfirm

## TakeOverConfirm — sheet
Ref: `TakeOverConfirm.jpg`
**Stop this session?** · "It stops in your terminal and continues from your phone, in the same conversation." · primary **Stop** · secondary **Cancel**

## ModelPicker — sheet
Ref: `ModelPicker.jpg`
**Model** · "Applies from the agent's next step." · options: **Default** (Set on your computer, selected) · **[Model name]** ([Short description]) · **[Model name]** ([Short description])
⚠ Model names are not decided — keep these exact placeholders. Picking one updates the Session row value.

## IntensityPicker — sheet
Ref: `IntensityPicker.jpg`
**Intensity** · "How much the agent thinks before acting." · **Low** (Faster, uses less) · **Medium** (Balanced, selected) · **High** (Slower, more careful)

## StopConfirm — sheet
Ref: `StopConfirm.jpg`
**Stop this session?** · "5 files were already changed. They'll stay changed until you undo them." · primary **Stop session** · secondary **Keep going**
Stop session → Stopped.

## Stopped — `/session/:id/stopped`
Ref: `Stopped.jpg`
- Chip **Stopped** · title **What next?**
- Option rows: **Continue** (Pick up where it left off.) · **Redirect** (Give a new instruction.) · **Undo file changes from the last step** (Restores files only. Commands it ran, like installing or deleting, can't be undone.)
- Text link **Go back further** → UndoFurther
- Continue → session Working again. Redirect → answer input sheet → Working. Undo → toast "Files restored" → stays Stopped.

## UndoFurther — `/session/:id/undo`
Ref: `UndoFurther.jpg`
- Top bar **Go back further** · title **Choose a point** · "Files go back to how they were then."
- Info alert: "Restores files only. Commands it ran can't be undone. The conversation stays as it is."
- Options: **Before: update 4 files** (Last step, selected) · **Before: create LoginForm.tsx** (2 steps back) · **Before this session started** (All changes undone)
- Bottom primary with undo icon: **Restore files to this point** → toast "Files restored" → back to Stopped.

## NotSupported (Cursor) — `/session/:id` (Cursor) + sheet
Ref: `NotSupported.jpg`
- Top bar: Cursor logo · **Cursor · site** · chip **Working** + "Running in Cursor" · title **Building the contact form…**
- Settings list (values, no chevrons): Model — Set in Cursor · Intensity — Set in Cursor
- Bottom **Stop** → sheet: info icon + **Can't stop Cursor from the phone** · "Cursor runs inside its own editor, so it can only be stopped there. You can still approve its requests here." · primary **OK**
