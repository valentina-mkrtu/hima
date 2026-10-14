# hima — technical specification

Current baseline: **device-local version 0.2**. Earlier server contracts are historical, not deployment requirements for this version.

## Stack and budgets

TypeScript strict mode, React/Vite, native HTML/CSS, Luxon for civil dates, Marked tokens rendered as safe React elements, authored TypeBox schemas with interpreted validation, and native IndexedDB. No runtime Fastify, PostgreSQL, identity library, upload service, analytics, external fonts, or synchronization SDK. `fake-indexeddb` is a development-only test dependency.

Exact versions and integrity hashes are in package-lock.json. Initial JS is approximately 142 KB gzip and CSS 14 KB gzip, below the original 180 KB JS budget. Hosting transfers public code/assets; ordinary content changes make no network request. No `unsafe-eval` is needed. A build generates the offline worker from the final hashed files.

## Entity model

Entity envelope: UUID `id`, kind, integer `version`, `createdAt`, `updatedAt`, nullable `deletedAt`, schema-validated `data`.

Kinds: area, task, note, event, goal, routine, preferences. The detailed field schemas in `packages/contracts/index.ts` are executable source of truth. IDs are independent of display names. There is one active preferences record. No account/owner fields, tokens, sessions, or credentials are needed in the active database.

The workspace metadata envelope additionally contains `schemaVersion`, revision, timezone, initialization state, bounded activity/retry history, file metadata and recurrence checkpoints. Blobs reside in a separate IndexedDB store, referenced by file UUID and parent task/note UUID.

## Task and progress rules

Statuses: `todo`, `in_progress`, `on_hold`, `done`, `cancelled`. To do/In progress/On hold/Done are the visible 2×2 lanes. A manual hold differs from derived dependency blocking. Starting or completing requires every prerequisite Done. Cancellation does not satisfy dependencies. Reopening a prerequisite never rewrites downstream completed history.

Refuse self-dependencies, missing active prerequisites, cycles, more than 20 direct prerequisites, and graph traversals beyond 1,000 visited nodes. Validate and save in the same serialized transaction. A prerequisite cannot move to Trash while an active dependent still references it. All existing entity updates compare versions. A repeated creation save with the same recent operation ID and payload reuses its receipt.

Numeric goal progress sums dated entries and permits totals above the target, while clamping only the displayed bar. Task goals exclude Cancelled/trashed items and count Done. Checklist goals count checked steps. One task can belong to one active goal. Changing units/mode with numeric entries requires clearing/re-entering entries. Existing decimal calculation uses six-place scaled arithmetic; arbitrary-precision accounting is not a feature.

## Dates and recurrence

Floating plan and due dates remain distinct `YYYY-MM-DD` fields. Invalid dates are rejected. Today uses the stored workspace timezone, refreshing on open/focus and once per minute while visible. No automatic rescheduling of missed plans.

Calendar currently provides month grid plus selected-day agenda. Events use inclusive all-day date ranges or local start/end wall times plus IANA timezone; timed events validate positive duration and nonexistent DST times. Travel conversion, week view and dedicated task time blocks remain future enhancements.

Routines are date-only: daily/weekly/monthly/yearly, intervals, chosen weekdays, optional end, monthly day or last-day selection. Missing calendar dates are skipped. Creation previews the next five dates. Materialization retains the routine ID and original occurrence date and generates 90 days ahead. Existing occurrence IDs are reused by slot, including retained deleted slots. Bounded catch-up checkpoints persist with their generated tasks. Pausing stops generation; resuming starts at the current day without recreating paused dates. Schedule fields lock after creation; create a replacement series to change its schedule. No closed-app reminders are implemented.

## Files and storage

- Metadata: 20 MB maximum, 10,000 entities, 500 recent activities, 16 recent operation receipts.
- Attachment: maximum 10 MB, 10 per parent, 100 MB per workspace. The storage UI reports actual metadata and attachment sizes.
- Extensions: PNG/JPEG/WebP, MP4/WebM, PDF/TXT/CSV/MD. SVG, HTML, executables and office containers are not accepted.
- Store original bytes once as a binary Blob, with safe filename, size, parent ID and SHA-256 checksum. No uploads or remote preview requests.
- Downloads use object URLs, forced file download and later URL revocation. Files are not malware-scanned or claimed safe to open externally.
- Trash is recoverable without automatic expiry. Explicit permanent removal frees eligible records/attachments. Retain recurrence identity tombstones while needed to prevent resurrection.

Ordinary edits load metadata only, not all file bytes. No image recompression is silently applied; attachment limits keep growth bounded. An optional image optimization step may follow once quality choices are designed.

## Backup format and restore

Format identifier `dayweave-device`, version 1. Export includes all entities/preferences/Trash, timezone, routine checkpoints and base64 attachment bytes/checksums. The export is a consistent snapshot across stores. A backup is limited to 150 MB; attachment bytes remain capped at 100 MB and metadata at 20 MB.

Import validates every entity schema, UUID uniqueness, timestamp/version envelope, relationship, recurrence identity, dependency graph, attachment parent/count/type/size and checksum. Unsupported/corrupt backups are refused before mutation. A preview names record/file counts and explains replacement. Restore checks the current workspace revision then replaces both stores in one transaction. No partial imports or silent merge. Imported versions advance above live versions so stale tabs cannot overwrite restored content.

Backups and IndexedDB contents are not passphrase-encrypted. User-selected storage persistence and complete backups are complementary safeguards, not a secrecy guarantee.

## Errors and verification

Wait for transaction completion before reporting Saved. On quota failure, validation failure, stale version or interrupted transaction, preserve the editor text and previous committed data. A failed restore must leave current records/files intact. Initial storage access errors show actionable copy rather than falling back to ephemeral unsaved mode.

Automated tests cover date rules, cycles, dependencies, local persistence/reopening, serialized conflicting writes, duplicate operations, failed transactions, attachment lifecycle, complete backup roundtrip, hash rejection, invalid references, restore revision conflicts and recurrence deduplication. Browser tests cover offline reload/create/save with the preview server stopped, migration restore, responsive board, and appearance. Physical-device install/eviction and independent accessibility/security review remain release checks.

## Goal planning and AI plan exchange — October 2026

`dayweave-plan` v1 is an add-only exchange format, distinct from `dayweave-device` backups. A local TypeBox schema limits files to 1 MB / 300 items and only permits area/task/goal/note/routine/event records. Goals accept an optional backwards-compatible plan with motivation, target/review dates, explicit outcome, milestone task membership, note/routine references, application records and budget rows. Tasks optionally accept estimated minutes. Existing backups without these fields still validate.

Prompt generation and import validation share the same schema. Readable aliases resolve only inside the imported file. Canonical content hashing produces deterministic IDs; repeated imports cannot collide silently or overwrite existing records. All rows are revalidated and committed in one IndexedDB transaction, including total storage and projected routine-generation limits. Changed plans are independent imports; there is no merge/update protocol yet. Alias references, dates, dependency cycles, unique milestone membership and http(s)-only tracker sources are checked. CSV cells neutralize formula prefixes.


### Optional Google Calendar connection
Settings → Connections provides an explicit Google Identity Services connection using a public web OAuth client ID and `calendar.readonly`. Google scripts load only after Connect is pressed. Short-lived access tokens remain in memory; never saved in IndexedDB, backups, browser storage, or service-worker caches. Only Google authentication and Calendar API hosts are permitted in the app CSP; the core planner still works offline.

Select a readable calendar and press Sync now. Sync pulls expanded recurring instances from 30 days ago through one year ahead (maximum 2,500 events), validates all pages, then commits atomically with a workspace revision check. Copies are keyed by actual calendar ID plus Google event ID. Events missing from the fetched window move to recoverable Trash; other calendars, native events and dates outside the window remain unchanged. Imported events are read-only and included in local backups. Disconnect revokes the in-memory token and retains copies; a separate action moves copies to Trash. Reconnect after reload/expiry. No background or two-way sync.

Google setup: enable Calendar API; keep External audience in Testing with each tester’s email; allow calendar.readonly; register the exact preview origin and eventual HTTPS deployment origin under the web client’s Authorized JavaScript origins. No client secret or redirect URI is used by this popup flow. Hosting and live account authorization remain external setup steps; automated tests do not verify Google consent.
