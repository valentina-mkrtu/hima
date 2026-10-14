# hima — product guide

Current direction: **device-local planner · version 0.2**. This replaces the earlier account/server/cloud beta plan, preserved under `legacy/postgres/guides`.

hima combines a task board, calendar, notes, routines, and simple progress tracking in a small, personal workspace. It should be easy to use on a phone and pleasant to customize. There are no teams, points, accounts, subscriptions, AI features, analytics, or cloud requirements.

## Everyday experience

1. Open the app and start a device workspace; no sign-in.
2. Create life areas yourself or choose templates such as Home, Work, Learning, Hobbies, and Wellbeing.
3. Capture a task, optionally give it an area, plan date, deadline, checklist, prerequisites, or result note.
4. Move tasks around the 2×2 board: **To do / In progress** above **On hold / Done**. Drag is optional; the move menu works with keyboard and touch.
5. Plan tasks and events in the calendar. A plan date and a deadline remain different fields.
6. Keep Markdown notes, attach local files, and track goals using numbers, linked tasks, or a checklist.
7. Choose a theme or customize background, accent, text, font, text size, and density.
8. Use the same browser/profile offline. Make periodic complete backups through Profile icon → Settings.

Today contains only its heading/calendar strip, area filter, and the task rectangle. Library contains only Notes, Goals, and Routines. The profile icon opens Your space, with Settings, Customize, and shortcuts to Inbox, Missed plans, and Trash. There are no supplementary cards below the main board.

## Scope for this version

- Web/PWA with a fully cached public app shell and device-local data.
- Existing task, area, note, event, goal, search, customization, and dependency flows.
- Date-only daily, weekly, monthly, and yearly routines; bounded on-open catch-up and 90 days ahead; pause/resume and single-occurrence changes.
- Local attachment storage and downloads, bounded by count/size.
- Complete JSON backup/restore including original attachment bytes, recoverable Trash, explicit space recovery, and storage status.
- No automatic deletion of personal records. No automatic upload or remote image loading.

## Important expectations

Each origin/browser/profile/device has independent data. There is no sync or automatic recovery. Export/import can transfer a complete workspace manually; importing replaces rather than merges. Browser storage is durable but not guaranteed permanent—clearing site data can remove it.

The app does not encrypt its database or backup with a passphrase. A future optional encrypted vault would need a separate key/recovery design and review. Do not imply a cosmetic app lock encrypts anything or promise “no leaks.”

Routine generation runs when the app opens or refreshes, not through a server. Reminders while the app is closed are not provided. Installing the PWA does not create reliable background alarms or an app-store binary.

## Retained future options

Optional image resizing, inline safe-media previews, richer calendar views, full series-edit UI, note autosave/conflict comparison, and additional layout controls can build on this foundation. Cloud accounts, public media pipelines, a job server, and PostgreSQL are no longer prerequisites. Native packaging, synchronization, and an encrypted vault are separate opt-in projects if needed.

## Acceptance

An offline task can be created, moved, and reloaded; notes and settings survive refresh; a backup restores all records and file bytes; damaged or incompatible backups leave existing data untouched; concurrent tabs do not silently overwrite one another; no personal data is transmitted during ordinary use. See PROTOTYPE.md for evidence and outstanding device checks.

## From intention to action

A goal can have motivation, personal target and review dates, an explicit real-world outcome, milestone tasks, supporting routines, linked research/document notes, application tracking and costs/savings. Ready next actions and missed-plan review keep work discoverable. One-time tasks and calendar events remain first-class. Preparation progress must never be represented as guaranteed admission, funding or another external outcome.

AI planning is a manual, provider-independent handoff: copy a format prompt, discuss constraints with an LLM, bring its JSON back, preview and add. The app validates the format and relationships, not the truth of admissions facts or feasibility of health goals. Users verify sources and choose realistic schedules. Imported plans are additive; existing work is not replaced.

## Task handoff and completion

Task flow: grab a board card or its grip, drag to a highlighted quadrant, release. On hold requires a saved reason. Done requests a note and configured evidence; optional image/file and checklist rules are edited on the task. Confirm commits the move; cancel keeps the original status. Other acceptance criteria can be expressed as required checklist steps.


### Optional Google Calendar connection
Settings → Connections provides an explicit Google Identity Services connection using a public web OAuth client ID and `calendar.readonly`. Google scripts load only after Connect is pressed. Short-lived access tokens remain in memory; never saved in IndexedDB, backups, browser storage, or service-worker caches. Only Google authentication and Calendar API hosts are permitted in the app CSP; the core planner still works offline.

Select a readable calendar and press Sync now. Sync pulls expanded recurring instances from 30 days ago through one year ahead (maximum 2,500 events), validates all pages, then commits atomically with a workspace revision check. Copies are keyed by actual calendar ID plus Google event ID. Events missing from the fetched window move to recoverable Trash; other calendars, native events and dates outside the window remain unchanged. Imported events are read-only and included in local backups. Disconnect revokes the in-memory token and retains copies; a separate action moves copies to Trash. Reconnect after reload/expiry. No background or two-way sync.

Google setup: enable Calendar API; keep External audience in Testing with each tester’s email; allow calendar.readonly; register the exact preview origin and eventual HTTPS deployment origin under the web client’s Authorized JavaScript origins. No client secret or redirect URI is used by this popup flow. Hosting and live account authorization remain external setup steps; automated tests do not verify Google consent.
