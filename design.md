# hima — design guide

Current implementation: **local-first 0.2**, preserving the approved mockup revisions 0.3–0.5. Earlier explorations are archived under `legacy/postgres/guides`.

## Main screens

Mobile navigation: Today, Calendar, Areas, Library. The selected tab has a solid accent rectangle with a background-colored icon/text when readable, otherwise a derived contrasting foreground.

Today contains its heading, upper week/calendar strip, life-area filter and a single task rectangle. The rectangle is a 2×2 grid: To do / In progress above On hold / Done. All four sections stay visible above bottom navigation; task lists scroll inside their own section. No horizontal board scrolling or supplementary cards below it. Desktop uses the same quadrants and a sidebar.

Task titles open details. The dotted handle supports pointer dragging and a click/keyboard move menu. Server wording is removed: changes are saved on this device. Use a real persisted Undo; blocked transitions explain their prerequisites.

Calendar has a month selector/grid and selected-day agenda. Areas are customizable ongoing life containers. Library holds only Notes, Goals, and Routines. The profile icon opens a keyboard-accessible Your space dialog with Settings and Customize, plus shortcuts to Inbox, Missed plans, and Trash. Settings opens device storage and backups; Customize opens appearance controls.

## Editing and customization

Quick task capture emphasizes title, area and dates; More details reveals notes, checklist, prerequisites and result context. Inputs survive save errors. Forms and appearance dialogs provide Cancel; saved data is never inferred from merely closing a dialog.

Appearance has Themes, Colors, Fonts & size. Themes: Linen, Cozy warm, Focus, Daylight, Garden, After hours. Background and accent support swatches, native pickers and hex input; text has eight swatches. Fonts: Basic, Typewriter, Bookish, Rounded, using local font fallbacks. Small/Medium/Large scale the UI; density is separate. Focus uses neutral colors and straighter corners. Preview instantly, persist only on Save, restore previous appearance on Cancel. Keep settings controls readable while previewing low-contrast choices.

Notes render Markdown without active HTML or remote images. Files show local filename/size and explicit Download/Remove actions; there is no upload progress, cloud state, or false “scanned” status. Large media stays optional and bounded.

## Device storage settings

The opening screen states that data stays on this device and no account is required. Preserve the distinction between a local workspace and an encrypted vault; do not show a cosmetic password/login screen.

Profile icon → Settings shows:

- Planner text size, attachment count/bytes and limits.
- Persistent-storage state and an explicit “Ask browser to keep my data” action.
- “Download complete backup,” including notes, tasks, settings, Trash and attachments.
- “Choose backup to restore,” then validation and a replacement preview with counts.
- Restore confirmation labeled “Replace with this backup,” plus Cancel restore. Explain that current contents will be replaced and suggest a current backup first.
- Explicit space recovery, with a confirmation before emptying eligible Trash permanently.

State plainly that clearing browser data can erase the planner and that backup files are not encrypted. No alarmist messaging or claims of zero risk. Failed backup/import/save messages name the action and retain existing data.

## Offline and updates

After cache installation, display “Ready offline · data stays on this device.” Offline mode does not disable saving or task movement. An update banner offers an explicit Update app action outside open editors; activation/reload only follows that action. Do not silently reload unsaved writing.

The established Today screen remains uncluttered; detailed storage status belongs in Settings. Offline status can remain subtle. If installation/setup fails, provide a visible retry explanation rather than implying the app is cached.

## Accessibility and acceptance

Semantic dialogs, labels, keyboard alternatives, reduced motion, usable focus indicators, safe-area padding and readable themes remain requirements. Validate at 320px, common mobile widths, desktop and large text. Recheck physical phone installation, keyboard/file pickers, screen-reader behavior and browser storage denial before calling this a finished consumer release.

## Goal workspace and AI handoff

Library still has exactly Notes, Goals and Routines. Goals open their own workspace: target/review dates, motivation, work progress and tabs for Plan, Notes, Tracker and Budget. Milestones group real dated tasks; next actions respect prerequisites. Actual outcome is explicit rather than inferred from task completion. The Today filter row includes a compact Review entry for missed work; profile also links Weekly review.

Profile → AI plan import offers three steps: copy the prompt, describe the goal to a chosen LLM, then preview/import a JSON file or pasted JSON. Show schema errors without writing anything. Preview counts and every proposed item before adding. Explain duplicate handling, unverified external facts, and add-only behavior. Prompt copying never includes stored planner content. Do not add a fourth Library tab or an AI chat/network dependency.

Button feedback: enabled buttons and file-picker controls shrink to 96% on press and return over 180 ms after activation, including keyboard activation. Drag handles are excluded so their geometry remains stable. Reduced-motion preferences disable the scaling animation. Actions run immediately.

## Task handoff and completion

Board cards follow the pointer as a floating preview; destination quadrants highlight. The original reserves its slot until the move commits. On hold opens a reason dialog; Done opens a delivery dialog. Cancelling or dropping outside returns to the original lane. Drag handles retain a tap/keyboard move menu. A task can require a completion note (default), image, any file, and/or all checklist steps. Reduced-motion users receive no landing scale animation.

Board sections use 15px rounded corners with a small gutter, 12px task-card corners, and a rounded inset drop highlight. All four quadrants stay visible.

Scrollable mobile pages reserve 112px plus the device safe-area inset below their content so the fixed navigation and offline status cannot cover the final items. Today retains its board-specific sizing.

Note cards in Library and goal workspaces show only title, first Markdown heading (with its # marker), and modified date. They omit body excerpts; notes without a heading omit that line. Cards grow to fit these fields without clipping. Full content stays inside the opened note.

Board status colors: To do light blue (#eaf3fc), In progress light orange (#ffead8), On hold light pink (#fcebec), Done light green (#eaf5e9). Dark backgrounds use subdued versions of the same hues with contrast-adjusted section text. Drop highlighting preserves the status color.

Note heading-to-date spacing is 12px (previously 24px), with no minimum card height or automatic spacer pushing dates down.

Status header bands use each section color with 4% black mixed in for subtle separation from the task area.

Status header backgrounds span the full section width and meet the rounded upper corners; content padding belongs to the task list, not the outer section.

Installed app icon: user-provided teal gradient white-star logo, preserved in assets/branding/dayweave-logo-original.png. PNG exports at 192px and 512px serve the web app manifest; a dedicated 180px apple-touch-icon serves iPhone home screens. Original artwork and margins are preserved.

App name: **hima · հիմա**, with **hima** as the short home-screen label. Internal database names, backup/plan format identifiers, and app manifest ID remain stable so existing device data and files stay compatible.

Existing tasks open in a read-first detail dialog. A pencil in the header enters edit mode; Save and Cancel return to the read view. New tasks begin in edit mode and show their saved detail view afterward. Task content is selectable, attachments download without modification controls, and checklist ticks save immediately through normal version and completion validation.

Your space is a scrollable list of matching navigation cards: profile, Settings, Customize, AI plan import, Weekly review, Inbox, Archive, Missed plans, Trash, and Saved on device. Profile settings store a name and a 256px locally resized image in preferences. Existing items expose Archive and Move to Trash in their details/editor; task read view exposes both directly. Archive restores items without deleting them. Areas retain linked content when archived or trashed, and those contents are hidden until the area returns. Trash remains recoverable; permanent cleanup retains area records still referenced by saved content.

All Your space destinations use rounded, scrollable modal overlays above the current tab. AI plan import, Weekly review, Inbox, Archive, Missed plans and Trash share the Settings/Profile presentation. Back returns to Your space; Close reveals the unchanged underlying tab. Editors opened from an overlay retain that overlay beneath them.

Calendar events create one linked attendance task on their start day (timed events use the workspace timezone). Google recurring instances count as separate events. Cards start in To do with no required completion note and can move directly to Done. Calendar updates refresh only title, notes, day and area fields that still match the last imported values; custom task edits and completion status survive. Archived/deleted events hide linked cards. Trashed cards keep tombstones to prevent duplicate regeneration. The calendar view shows the original event rather than counting the attendance task twice. Multi-day events create one start-day card, with their end date in the details.
