# Dayweave — Design guide

Status: proposed build baseline · Version 0.1 · 8 October 2026

**Implementation checkpoint:** [Working local prototype 0.1](PROTOTYPE.md) now exists. That guide records shipped behavior, local-only security boundaries, validation results, and explicit P0 gaps. The remaining requirements below are still beta targets, not claims that the first prototype implements them all.

A calm, tactile personal planner with clear actions and restrained color. Design for one-handed phone use first, then expand the same concepts for tablets and desktop. Read [product](product.md) for scope and [technical specification](tech-spec.md) for behavior.

## 1. Experience principles

1. **Capture quickly.** Title-first task creation, one persistent Add action, progressive disclosure.
2. **Show the next useful thing.** Today distinguishes planned, due, waiting, and completed work.
3. **Make state visible.** Saved, saving, failed, waiting, checking upload, and offline must look different.
4. **Keep the person in control.** Moving dates, bulk skipping, and replacing a routine show consequences before saving.
5. **Personal, but legible.** Customization cannot remove core navigation or destroy contrast and focus indicators.
6. **Progress without pressure.** Neutral copy, optional celebration, no shame language or default streaks.

## 2. Information architecture

Phone defaults: **Today · Calendar · Areas · Library**, with a separate persistent Add button. Library contains Notes, Goals, completed work, and later Trackers. Inbox is a visible Today entry; search is available from every main destination. Settings opens from the profile button.

Allow people to replace two of the four tab destinations with Inbox, Notes, or Goals. Today and Calendar remain anchored in P0. All destinations remain reachable through Library/More. Persist choices per account; retain separate layout arrangements for phone and desktop.

Desktop uses a collapsible sidebar with the same destinations, pinned areas, and Add. Selected task/note detail opens alongside the list when space permits. Deep links point to stable item IDs and work in the browser and installed PWA.

| Screen | First visible content | Main action | Secondary controls |
|---|---|---|---|
| Today | Date, Inbox count, planned tasks and due items | Add task | Replan, filters, customize |
| Calendar | Selected date and agenda; view selector | Add at selected date | Today, date picker, area filter |
| Area | Name/icon, task list, pinned notes/goals | Add task in area | List/table/board, archive/settings |
| Task detail | Title, status, area, plan/deadline | Start / Mark done | Checklist, dependencies, note, files |
| Notes | Recent and pinned notes; search | New note | Area filter, sort |
| Goal | Outcome, progress label, linked work or entries | Add entry / Link task | History, edit target |
| Appearance | Live example of current theme and layout | Save changes | Presets, reset, cancel |

## 3. Today layout

```text
┌────────────────────────────────┐
│ Thu, 8 October        Search ○ │
│ Good morning                   │
│ Inbox · 3 items                │
│                                │
│ Today's plan            Edit   │
│ ○ Buy shelf supplies  Hobbies  │
│   17:30–18:00                  │
│ ◐ Write portfolio      Work    │
│   Due tomorrow                 │
│                                │
│ Due today                  1   │
│ ○ Submit form                  │
│                                │
│ Waiting                    1   │
│ ▣ Build shelf                  │
│   Waiting for Buy supplies     │
│                                │
│ Needs replanning           2   │
│ Done                       3   │
│                        (+ Add) │
│ Today Calendar Areas Library   │
└────────────────────────────────┘
```

Wireframes are conceptual, not pixel-perfect mockups. Do not depend on these symbols for final icon choices.

Task rows show title, status control, and at most two useful metadata lines. Area color appears as a small icon/chip, never a full saturated row background. Completed rows collapse under Done; do not instantly remove the row while someone is interacting with it. Announce completion and offer Undo.

Default section order: Today's plan, Due today, Overdue deadlines, Waiting, Needs replanning, Done. Deduplicate by task ID; a single row can carry both plan and due labels. Waiting tasks planned/due today move to Waiting with those labels preserved. Overdue tasks already in Today's plan retain an overdue badge. Home customization changes section order/visibility, with a visible count/link for hidden attention items.

## 4. Task interactions

**Quick add:** bottom sheet with autofocus on title, area chip, date chip, and Save. More details expands optional fields. On-screen keyboard must not cover Save. Input survives validation and network errors while the screen remains open; unsaved text must be identified clearly.

**Task detail:** full-screen on narrow phones, side panel on larger displays. Place title/status first, scheduling second, then description, checklist, dependencies, links, files, and activity. Show Plan for and Due by as different fields. Avoid “Date” as an ambiguous label.

**Start:** changes To do to In progress. A blocked task shows “Waiting for 2 tasks,” with links and a disabled primary action plus explanation. Offer “Edit dependencies” without suggesting that a cancelled prerequisite counts as completed.

**Complete:** quick tap marks Done; optional “Add a result” accepts text or files afterwards. A result-first completion sheet is also available from the overflow menu. Attachment failure does not reverse an acknowledged task completion; show the pending/failed file separately and allow retry.

**Reopen:** explain that downstream unfinished tasks may become blocked. Already completed downstream tasks retain their history.

**Delete/archive:** archive areas without deleting their contents. Trash items with a 30-day recovery window. Permanent delete and account deletion require a clear confirmation naming the consequence. A successful operation has a visible result; “Undo” performs a real server action and may itself report failure.

Swipe actions and drag/drop are optional accelerators. Every action has a button/menu and keyboard alternative. Long press never becomes the only way to discover editing.

## 5. Calendar and routines

- Agenda is the default on phones. Week view scrolls horizontally without shrinking touch targets; month view shows a small bounded number of markers and opens the day's agenda.
- Give tasks, deadlines, and events distinct icons plus text labels. A time block is visually separate from a due marker.
- Tap empty calendar space to add with a date/time prefilled. Moving an event updates its time; moving a task's plan never changes its deadline.
- Show overlaps as a warning, not an error. Do not auto-resolve conflicts by moving unrelated items.
- Every time editor exposes the applicable timezone. All-day items stay date-only.
- Routine editor uses readable presets and an advanced interval field; never expose raw recurrence syntax.
- Preview the next five dates. Show the consequence of the 29th/30th/31st in short months and offer Last day of month explicitly.
- Editing an occurrence offers “Only this one” or “This and future ones.” Historic completed work is never rewritten.
- Pausing shows the date from which new occurrences stop. Resuming previews the next one; it does not backfill the paused period.

## 6. Notes, files, goals, and tables

Notes use a small toolbar, a generous writing area, autosave status, and an explicit preview. Markdown source is stored; pasted HTML does not become active content. Links to tasks are searchable pickers, not a complex page graph. Conflicting edits show the saved and local versions with Keep mine / Use saved / Copy both; never silently overwrite.

Files show type, size, name, and state: Uploading → Checking → Ready or Rejected/Failed. Image thumbnails open an accessible viewer. Videos have a poster and explicit Play; no autoplay or background preload. Other files show a Download action. Explain size/type rejection before upload where possible, then enforce it again on the server. Removing an attachment does not delete its parent task/note.

Goals display “7 of 12 books” or “6 of 10 tasks,” not a bare 58%. Show target, unit, progress mode, and period where relevant. Numeric totals may exceed the target, while the visual bar stops at 100%. Distinguish manual entries from linked task completion. An empty goal says “Add a target or link tasks” rather than showing NaN or a fictional 0/0 result.

Task table view uses a few configurable columns. On phones it opens as cards with an optional horizontal table; core actions remain visible. P1 trackers use one row-edit sheet, typed cell controls, and a mobile card summary. No tiny spreadsheet grid is required for basic use.

## 7. Visual foundations

Suggested default theme: **Linen** — warm neutral backgrounds, deep ink text, and a muted violet accent. Alternatives: **Moss**, **Ocean**, **Rose**, and **Midnight**. Each preset must include light/dark tokens and pass contrast checks before shipping.

Starter tokens below are design proposals, not accessibility certification:

| Token | Light proposal | Dark proposal |
|---|---|---|
| Canvas | `#F7F6F2` | `#16181D` |
| Surface | `#FFFFFF` | `#20232A` |
| Primary text | `#20232A` | `#F3F4F6` |
| Secondary text | `#626873` | `#B4BAC5` |
| Accent | `#6750A4` | `#CBB8FA` |
| Border | `#D9DDE4` | `#454B58` |
| Focus | `#155EEF` | `#8CB4FF` |

Use semantic CSS custom properties for surfaces, text, borders, focus, status, and accent. Derive accent foreground independently for each theme. Error, success, waiting, and deadline meaning stays consistent across appearance choices.

Typography: system sans-serif by default; 16px body and input text, 14px metadata, 22–28px screen headings, line-height around 1.5. Optional system serif and monospace apply to note reading; navigation keeps predictable metrics. Avoid external font requests.

Spacing scale: 4, 8, 12, 16, 24, 32px. Phone side padding: 16px. Card radius: 12px; control radius: 8px. Borders do most separation work; shadows are subtle and reserved for overlays. Use one small, tree-shaken icon set plus emoji. Icons always have accessible names where interactive.

## 8. Customization contract

| Setting | P0 controls | Guardrail |
|---|---|---|
| Appearance | System / light / dark; five coordinated presets | System changes apply without reload |
| Accent | Presets and a custom hex color | Generate readable paired colors; show adjustments |
| Area identity | Emoji or built-in icon; color; order | Never depend on color alone |
| Reading | Text size, note reading style | Support OS/browser text scaling |
| Density | Comfortable / compact | Touch actions remain at least 44 × 44 CSS px |
| Home | Reorder/hide sections; pin goals/areas, maximum six cards | Core controls remain reachable; hidden task counts visible |
| Navigation | Replace two optional tabs; reorder pinned areas | Today, Calendar, Add, settings/search remain accessible |
| Calendar | Default view, week start, 12/24h | Locale-aware labels and explicit timezone |
| Motion | System / reduced; optional celebrations | No flashing or mandatory animation |

Appearance is structured validated data, never user CSS or HTML. Users preview changes, save, cancel, or reset a single category/all appearance. Reset never deletes tasks or notes. Reordering supports Move up/down buttons as well as drag handles. P1 background images use the same private upload pipeline and must preserve text contrast.

## 9. Responsive and accessible behavior

Use content-driven breakpoints near 640px and 1024px. Support 320px-wide viewports through desktop, phone landscape, safe-area insets, and dynamic viewport height (`dvh` with fallback). Avoid page-wide horizontal scrolling except deliberately contained calendar/table surfaces.

Target WCAG 2.2 AA: text contrast at least 4.5:1 for normal text and 3:1 for large text; meaningful controls and focus indicators remain perceptible. These are implementation targets, verified per theme. Preserve 200% text zoom and reflow at 400% zoom, semantic headings/landmarks, visible keyboard focus, accessible form errors, and programmatic labels.

Sheets/dialogs trap focus correctly, restore it on close, support Escape where appropriate, and announce titles. Screen readers receive polite status updates for saving/completion without a stream of redundant announcements. Dates, progress, status, and color-coded categories have text equivalents. Reduced motion removes sliding and confetti.

## 10. Required states and copy

| Situation | Example copy / behavior |
|---|---|
| Empty Today | “Nothing planned yet. Add a task or choose from your Inbox.” |
| Waiting | “Ready after ‘Buy supplies’ is done.” |
| Missing deadline | “No deadline”; do not invent urgency |
| Failed save | “Couldn't save. Your changes are still here. Retry.” |
| Offline P0 | “You're offline. Connect to load or save changes.” |
| Session expired | “Sign in again to continue.” Keep unsaved text in memory while possible |
| Upload scanning | “Checking this file. You can keep working.” |
| Reminder unavailable | “Notifications aren't enabled here. Reminders still appear in the app.” |
| Conflict | “This changed on another device. Review both versions.” |
| Goal over target | “22 of 20 hours”; bar stays full |

Loading skeletons preserve layout. Optimistic actions show pending status until acknowledged; failures restore state and retain the user's input. Never say Saved before the server confirms.

## 11. Design validation checklist

Before beta: walk through capture, reschedule, recurrence edit, dependency completion, file rejection, note conflict, numeric progress correction, theme reset, export, and deletion. Test keyboard-only use, VoiceOver and TalkBack on supported devices, text scaling, reduced motion, high contrast, and every preset. Test a real narrow phone, a tablet, and desktop; do not rely only on simulator screenshots.

Use realistic long task titles, many areas, no content, large histories, interrupted connections, denied notification permission, and difficult timezone dates. Validate PWA standalone safe areas and keyboard behavior separately from browser tabs.

Reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines the accessibility standard used for the target; compliance requires implementation testing.

## Mockup direction — revision 0.2

The requested direction is now a board-first task flow: **To do → In progress → Done**. The interactive mockup replaces the earlier Today list/wireframe with three distinct lanes and draggable task cards. Done remains visible. Dependencies appear directly on waiting cards; blocked transitions are refused. Every move has Undo and a click/keyboard alternative. On phones, status tabs and horizontally scrollable lanes accompany Start/Finish buttons. Notes and goal summaries sit below the main task workflow. This is the current design exploration; review the mockup before treating its exact layout as the final production design.

## Mockup direction — revision 0.3 (supersedes 0.2 mobile lanes)

Use one rectangle divided into four visible sections: **To do / In progress** on the top row and **On hold / Done** on the bottom row. Mobile users must see every status without horizontal scrolling. Compact cards expose the title, essential metadata, and a move handle; extra details open on tap. Lists scroll within their section when they overflow. On hold is a deliberate user-controlled pause, separate from dependency blocking; Resume returns it to In progress. This adds an exploratory on_hold status to the mockup. Reconcile the production transition table/data model with the chosen final design before implementation.

## Mockup direction — revision 0.4

Keep Today focused on its upper calendar strip, filters, and task rectangle. Remove all supplementary content below the rectangle, including goal/note/event cards and the replanning panel. Notes and goals remain in Library; events remain in Calendar. This supersedes earlier Today recommendations for cards beneath the workflow.


## Mockup appearance update — 0.5

The current customization dialog has three sections: Themes, Colors, and Fonts & size. The two main editable colors are Background and Accent; surfaces, borders, and status tints derive from them. Text uses an eight-color palette. Background and accent accept swatches, native color selection, or six-digit hex codes. Preserve readable editing controls even when the previewed text/background combination has low contrast, and show a plain-language contrast hint.

Offer Linen, Cozy warm, Focus, Daylight, Garden, and After hours as starting presets. Each selects colors, font, size, and spacing. Focus uses minimal neutral colors and straighter corners. Users can customize any preset afterward.

Font choices are Basic (system sans), Typewriter (monospace), Bookish (serif), and Rounded (local rounded fonts with sans fallback). Small, Medium, and Large apply throughout the UI. Keep the four-section mobile board and avoid horizontal page overflow as text grows. Use local fonts to avoid network dependencies.

Preview immediately, commit with Save my style, and restore previous preferences on Cancel, Escape, or close. Reset previews defaults before saving. Settings persist locally in the mockup; production storage follows the architecture guide. Selected bottom tabs use solid accent with a background-colored icon/label where contrast permits, otherwise a readable derived foreground.


## Working prototype 0.1

The React implementation follows revisions 0.3–0.5: four visible board quadrants, the focused Today surface, inverted active navigation, and three-part appearance controls. Task creation reveals optional fields through More details. All persisted changes wait for a server response before reporting Saved; an editor keeps its input on failure. Files deliberately show downloads without previews until the scanner pipeline is available. Browser checks and the remaining design acceptance gates are listed in [PROTOTYPE.md](PROTOTYPE.md).
