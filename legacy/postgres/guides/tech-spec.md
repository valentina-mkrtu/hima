# Dayweave — Technical specification

Status: proposed build baseline · Version 0.1 · 8 October 2026

**Implementation checkpoint:** [Working local prototype 0.1](PROTOTYPE.md) now exists. That guide records shipped behavior, local-only security boundaries, validation results, and explicit P0 gaps. The remaining requirements below are still beta targets, not claims that the first prototype implements them all.

This is an implementation contract, not a claim of implemented or tested software. [Product](product.md) defines release scope, [architecture](architecture.md) defines system boundaries, and [design](design.md) defines interaction and appearance.

## 1. Stack and constraints

| Layer | Proposed choice | Reason |
|---|---|---|
| Language | TypeScript, strict mode, browser HTML/CSS | Shared contracts and fewer ambiguous data shapes |
| Web client | React + Vite, small router, native CSS variables/modules | Familiar ecosystem, static build, route-level splitting |
| Server | Supported Node.js LTS + Fastify, REST JSON | Small modular API and static web host in one deployable |
| Validation | Authored JSON Schemas with TypeBox types | Reuse request/response contracts; reject unknown fields |
| Database | PostgreSQL + Drizzle migrations/query builder | Relational constraints, transactions, explicit queries |
| Identity | Managed OIDC provider through a maintained server library | Outsource identity verification; keep app sessions server-side |
| Files | Private S3-compatible storage, quarantine and malware scanning | Keep binary data outside the database and web process |
| Async work | PostgreSQL-backed job queue, worker from same repository | Durable retries without Redis or a message broker |
| Dates | One maintained IANA-timezone-aware library; Luxon is the initial candidate | Explicit local date/instant conversion; test recurrence adapter |
| Tests | Vitest, real PostgreSQL integration tests, Playwright journeys | Prove rules, isolation, and end-user behavior |
| Installed app | PWA first; Capacitor in P1 | Reuse the web UI before taking on store/native maintenance |

Pin exact compatible stable versions and a lockfile during M0; verify support/security advisories then. No version in the reference Wagglet repository is an instruction to inherit it. Use only the libraries needed by a shipped feature. No microservices, GraphQL, live collaboration, Redis, search cluster, or global state framework in P0.

Vite produces deployable static assets; the authenticated UI does not need server rendering. Fastify supports route validation and response schemas; schemas are developer-authored code, never accepted from users. [Vite build guide](https://vite.dev/guide/build), [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).

## 2. Shared data conventions

- UUID identifiers; timestamps use UTC `timestamptz`; calendar days use SQL `date`; local wall times are separate from instants. IANA timezone names, never numeric offsets alone.
- Owner-derived `ownerId` on every private row, including join tables. Clients never choose it. Composite foreign keys `(ownerId, referencedId)` prevent cross-account links.
- Mutable records carry integer `version`, `createdAt`, `updatedAt`, and nullable `deletedAt` where trash applies. Every successful edit increments `version`.
- Separate `archivedAt` (hidden, still retained) from `deletedAt` (trash pending purge).
- Enumerations have stable machine values and independently translatable UI labels. Server validation is authoritative.
- Plain text titles: 1–200 characters. Area names: 1–80. Task description/result: 50 KB each. Note body: 200 KB UTF-8. JSON request body limit: 512 KB. P0 limits are configurable server constants surfaced to clients.
- List endpoints use stable cursor pagination, default 50 and maximum 100 rows. Calendar query maximum 93 days. Search query maximum 200 characters. Bound all graph traversal and expansion work.

## 3. Logical data model

The tables below are the required logical model, not copy/paste DDL. Create executable migrations in M0 with constraints and isolation tests.

| Entity | Key fields and invariants |
|---|---|
| Account | OIDC issuer + subject unique; locale; timezone; weekStart; state active/deleting; no identity inferred from email alone |
| Session | accountId; hashed opaque token; created/lastUsed/expires/revoked timestamps; device label; tokens never logged |
| Area | ownerId; name; description; iconKey/emoji; color; sortOrder; archivedAt |
| Task | areaId nullable; title; description; status; planDate nullable; dueDate nullable; dueZone; priority normal/high; completedAt; resultText; routineId/occurrenceKey nullable |
| TaskBlock | ownerId; taskId unique in P0; startsAt; endsAt; timezone; positive duration; block's local start date equals task planDate |
| ChecklistItem | ownerId; exactly one of taskId/goalId; text; checked; sortOrder |
| TaskDependency | ownerId; dependentId; prerequisiteId; unique pair; no self-edge; no cycles |
| Routine | ownerId; areaId; title/description/checklist defaults; scheduleSpec; timezone; localStart; localTime nullable; durationMinutes nullable; dueOffsetDays nullable; active intervals; version; generatedThrough |
| RoutineException | ownerId; routineId; occurrenceKey; kind skipped/deleted/overridden; unique occurrence identity |
| Event | ownerId; areaId nullable; title; description; either startDate/endDateExclusive or startsAt/endsAt/timezone; no task status |
| Note | ownerId; areaId nullable; title; markdownBody; pinned; version |
| NoteTaskLink | ownerId; noteId; taskId; unique pair |
| Goal | ownerId; areaId nullable; title; mode tasks/checklist/numeric; target decimal > 0 for numeric; unit; startDate/endDate optional; archivedAt |
| GoalTask | ownerId; goalId; taskId; unique pair; task belongs to at most one goal in P0 |
| GoalEntry | ownerId; goalId; date; amount decimal >= 0; note; version; deletedAt |
| Attachment | ownerId; exactly one taskId/noteId; purpose context/result; objectKey; safeName; detectedType; size; checksum; uploadState; version |
| Reminder | ownerId; exactly one taskId/eventId; trigger spec; nextFireAt; scheduleVersion; enabled |
| Notification | ownerId; reminderId; fireKey; readAt; target reference; unique reminder/fireKey |
| PushSubscription | ownerId; endpoint and keys encrypted at rest; unique endpoint; revokedAt |
| Preferences | ownerId unique; schemaVersion; validated appearance/navigation/layout JSON; version |
| Activity | ownerId; entity reference; event type; timestamp; allowlisted structured changes; operationId |
| Job | kind; ownerId; entityId; dedupeKey; dueAt; state; attempts; leaseUntil; payloadVersion |
| Operation | ownerId; operationId unique; requestHash; response/status; createdAt; expiresAt |

Every lifecycle operation also covers owned child rows: task trash hides its checklist/links/files and cancels reminders; restore restores visibility but does not replay reminders. Permanent purge removes children and schedules immutable-object deletion. Notes follow the same file/link rule. Area archive hides its active views and pauses its routines/reminders; restoring an area asks which schedules to resume. Area deletion requires an explicit choice to move contents to Inbox/unassigned or trash them, with a count preview. Built-in template application is versioned and idempotent, creates independent records, and lets users omit example tasks/routines.

Start with one-off Events; repeating tasks cover routines. Repeating standalone events are a separately scoped P1 calendar enhancement. General tracker tables arrive in P1: Tracker, ColumnDefinition, Row, and validated typed values. Do not add arbitrary executable formulas to a JSON cell model.

Indexes: tasks `(ownerId, planDate, id)` and `(ownerId, dueDate, id)` for active rows; `(ownerId, areaId, status, updatedAt, id)`; both dependency directions; routine occurrence unique key; job `(state, dueAt)`; notes `(ownerId, updatedAt, id)`; GIN indexes for task/note search vectors. Index attachment parent IDs and every frequently used foreign key. Validate query plans on representative data.

## 4. Task lifecycle and dependency rules

Allowed task statuses: `todo`, `in_progress`, `on_hold`, `done`, `cancelled`. The approved four-section design adds `on_hold` as a deliberate manual pause, distinct from dependency blocking.

| Action | Preconditions | Effect |
|---|---|---|
| Start | To do; every prerequisite Done | In progress; append activity |
| Complete | To do, In progress, or On hold; every prerequisite Done | Done; set completedAt; optional result text; refresh dependent readiness |
| Hold | To do or In progress | On hold; preserve dates and context |
| Resume | On hold; every prerequisite Done | In progress |
| Reopen | Done or Cancelled | To do; clear completedAt; preserve prior completion activity/result |
| Cancel | To do, In progress, or On hold | Cancelled; cancel pending reminders; does not satisfy dependencies |
| Return to To do | In progress | To do; no date changes |

Blocked is derived: at least one prerequisite is not Done. Existing In progress tasks can become blocked if a prerequisite reopens; keep status and show “Paused by dependency,” refusing completion until resolved. A task already Done remains Done even if a prerequisite later reopens. Never cascade status rewrites.

Use a transaction-scoped advisory lock keyed by owner for dependency changes, status changes, and deletions that affect the graph. Under that lock, load current versions, validate both owners, detect cycles with a recursive query, and commit activity with the change. Maximum 20 direct prerequisites and 1,000 reachable nodes per validation; refuse oversized operations with a clear limit error. This modest serialization is acceptable for a single-person workspace and prevents concurrent inverse edges.

Cannot delete/trash a prerequisite with incoming dependent edges without explicitly removing those edges in the same operation. Completion never auto-starts another task. Optional relative scheduling and repeating dependency chains are P1, not implicit P0 behavior.

## 5. Calendar and date semantics

- `planDate` is a floating civil day chosen by the user. `dueDate` is an inclusive deadline day in `dueZone`, captured when set. A deadline becomes overdue at the beginning of the next local day, not after a hard-coded 24 hours.
- A time block stores actual start/end instants plus its IANA display zone. Creating/moving a block updates planDate to its local start date atomically. Changing planDate on a blocked-time task offers Move time block or Remove time block; reject an ambiguous write.
- One task has at most one block in P0. Multi-day work is split into tasks; standalone events may span days. All-day event intervals use an exclusive end date.
- Account timezone changes alter default entry/display behavior, not stored event instants, routine zones, due zones, or floating plan dates. Show a preview before explicitly changing existing schedules.
- Today uses the account timezone and refreshes at local midnight and app resume. Calendar converts timed events to the selected display zone and labels the zone. All-day entries do not drift with travel.
- No automatic movement of missed plans. Overdue deadlines, missed plans, waiting items, and Done sections are distinct. Deduplicate the Today union by task ID.
- Calendar overlaps are permitted and visually flagged. Calendar data comes from the server's canonical scheduling rules; the client does not implement a second recurrence engine.

## 6. Routine generation

P0 schedule JSON supports daily interval, weekly interval with selected ISO weekdays, monthly interval with day number or last-day flag, and yearly interval with month/day. Start is inclusive; optional end date is inclusive. Minimum frequency is daily; maximum interval 365. No arbitrary user-supplied RRULE strings.

A routine occurrence key is the original scheduled local date and optional local time within a stable routine ID. Its identity does not change when the person reschedules that occurrence. The task stores a snapshot of template content; later template edits do not overwrite completed work.

Daily worker and routine-write handling materialize 90 days ahead with a unique `(ownerId, routineId, occurrenceKey)` constraint. Catch-up resumes from generatedThrough in batches of at most 500 occurrences; no downtime silently drops history. The checkpoint advances only with a committed batch. Pending catch-up is observable; Today can request bounded repair for its window. Calendar ranges outside the materialized horizon show read-only projections using the same engine; an action materializes that exact occurrence before editing. Exception rows suppress skipped/deleted projections and prevent resurrection.

Rules:

- Missing month dates and February 29 in non-leap years are skipped. “Last day” is its own option. Preview the next five dates before saving.
- Date-only routines are the default. For timed routines, a nonexistent local time during spring DST is skipped; an ambiguous fall-back time uses its first occurrence. Show this policy near advanced time settings. Test the selected library rather than trusting defaults. Invalid recurrence dates/times are excluded according to [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).
- Unfinished occurrences remain individually actionable; they do not prevent the next occurrence. Show older ones collapsed, with explicit bulk reschedule/skip.
- Skip records an exception, sets the materialized task to Cancelled with reason `routine_skip`, and cancels that occurrence's reminders; it is excluded from completion statistics. It does not count as Done. A skipped prerequisite still blocks a dependent until the relationship is removed.
- “Only this one” updates the occurrence and records an override. “This and future ones” closes the old series just before the selected original occurrence and creates a replacement series transactionally. Preserve past history and individually edited future tasks; show retained exceptions and require explicit choices where replacement would duplicate them. For each retained future task, the preview maps its original slot to a replacement slot; suppress that replacement slot with an exception. If no unambiguous mapping exists, require the user to keep both or remove one before committing. Tombstone superseded unmodified future tasks and cancel their jobs. The split and new series creation use one operation ID.
- Pause records a non-generating interval and suppresses unmodified future materialized occurrences; explicitly edited occurrences remain with a notice. Resume starts with the next valid date from the chosen resume day and never backfills the pause interval.
- Deleting a routine stops future work; completed occurrences remain unless separately deleted. Deleting an occurrence writes a retained exception even after its task is purged.

## 7. Progress, notes, and search

Goal progress modes are mutually exclusive. Task mode = Done linked tasks / eligible linked tasks, excluding Cancelled, skipped, and trashed items. Reopening decreases progress. Changing the linked set changes the denominator and records activity. With zero eligible tasks show “No tasks linked.” Link individual routine occurrences, never an infinite series.

Checklist mode = checked / all checklist items. Numeric mode = sum of undeleted entries / positive target; support fractional decimals using database decimal arithmetic. Display the actual total even beyond target; clamp only the bar to 0–100%. Corrections edit/delete entries with versions and activity, not negative invisible adjustments. Changing units requires explicit conversion or clearing/re-entering entries; never relabel an existing total silently. Change progress mode only with an explicit preview of what will be reset/retained.

Notes store Markdown. Render through an allowlisted renderer with raw HTML disabled; permit only safe link protocols; remote images are not fetched automatically. Use uploaded attachments for images. No iframes, embeds, executable HTML, or link unfurling in P0.

Autosave notes after 800 ms idle, at most once per 2 seconds while editing, and on explicit Save. Serialize saves per editor; never send an old version while an earlier save is unresolved. Show saving/failed state; retain unsaved input in memory. P0 does not promise persistence after closing/reloading offline. On conflict, keep both versions for human resolution.

Search covers tasks, notes, goal titles, and area names with owner-scoped PostgreSQL full-text/title queries. Deleted content is excluded; archived content is opt-in. No attachment text extraction, external search service, or search analytics containing query text.

## 8. API contract

Prefix `/api/v1`. JSON responses use allowlisted output schemas. Dates are `YYYY-MM-DD`; instants are ISO 8601 with offset. Fields absent from PATCH remain unchanged; explicit null clears nullable values. Unknown fields and invalid combinations are rejected.

| Route family | Operations |
|---|---|
| `/session`, `/sessions` | Current account, logout, list/revoke sessions |
| `/areas` | List/create/update/archive; apply built-in template |
| `/tasks` | List/create/read/update/trash/restore; filters and cursor |
| `/tasks/:id/transitions` | Start, complete, reopen, cancel, return-to-do |
| `/tasks/:id/dependencies` | Add/remove prerequisites; readiness summary |
| `/tasks/:id/checklist` | Add/edit/check/reorder/remove steps |
| `/calendar`, `/events` | Bounded calendar read and event CRUD |
| `/routines`, `/routines/:id/occurrences` | CRUD, preview, pause/resume, materialize, skip, scoped edits |
| `/notes`, `/notes/:id/links` | CRUD, versioned save, link/unlink tasks |
| `/goals`, `/goals/:id/entries`, `/goals/:id/tasks`, `/goals/:id/checklist` | Progress and validated mutations |
| `/uploads`, `/uploads/:id/finalize`, `/attachments/:id/content` | Reserve, finalize, authorized content access/remove |
| `/reminders`, `/notifications`, `/push-subscriptions` | Manage schedules, inbox/read state, opt-in subscriptions |
| `/preferences`, `/search` | Versioned preferences and bounded search |
| `/exports`, `/exports/:id/content`, `/account` | Async export/status/download; reauthenticated deletion |

State-changing requests require session, CSRF proof, and an `Idempotency-Key` UUID. Existing-record edits also require `If-Match` with the expected version; missing precondition returns 428. Use 412 for stale versions, 409 for business conflicts or reused keys with different payloads, 422 for validation, 413 for body size, 429 with Retry-After for limits. Unowned resources return the same 404 shape as nonexistent ones. Error body: `{code, message, fieldErrors?, requestId}`; never stack traces.

Operations are unique by owner/key. Store a request hash and response atomically with successful mutations; return the same response on an exact retry. Keep receipts for seven days; before deleting a receipt, a stale retry is still constrained by resource IDs/versions and permanent domain uniqueness. P0 clients must not automatically retry mutations older than seven days. P1 offline queues need a separate durable-operation design before launch.

Example: `POST /tasks/{id}/transitions` with `If-Match: "7"`, an idempotency key, and `{ "action": "complete", "resultText": "Finished shelf" }` returns the task at version 8 and readiness changes. File uploads run separately and reference the completed task.

## 9. Upload contract

P0 server limits: 10 attachments per task/note; 10 MB/image; 25 MB/document; 100 MB/video; 1 GB/account including quarantined reservations. Accepted images JPEG/PNG/WebP; videos MP4/WebM (playback is codec-dependent; download fallback); documents PDF/TXT/CSV/MD/DOCX/XLSX. Reject SVG, HTML, executable files, arbitrary ZIPs, and macro-enabled office files. Office containers require bounded inspection; do not unpack untrusted content in the API process.

Reserve bytes/count atomically before issuing a short-lived upload authorization. Upload into a random immutable quarantine key. Finalization verifies object version, size, checksum, signatures/type, and ownership; it enqueues scanning and bounded media decoding. No user can fetch a file before Ready. Scan failure/timeouts stay unavailable. A successful scan promotes that exact verified object version to a fresh Ready key that the upload credential cannot modify. Re-encoding images strips metadata; provide a notice that video/document originals may retain metadata.

Abort/release incomplete reservations after 24 hours; clean orphans daily. Limit two concurrent uploads per account. Generate image thumbnails in an isolated worker with memory/time/pixel limits. No automatic video transcoding in P0. Serve browser-safe media through an authenticated same-origin streaming endpoint with range support, correct content type, `nosniff`, and private/no-store caching; force document downloads with sanitized filenames. The bucket is never public. Never serve active uploaded content as an app-origin page.

This pipeline follows defense-in-depth principles from the [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html); the formats and quotas above are Dayweave product decisions.

## 10. Reminders

One reminder per task/event in P0, relative to a time block/event start or an explicit local day/time for date-only tasks. Default reminder time for a selected all-day reminder: 09:00 in its stored zone. Date edits increment scheduleVersion, cancel old jobs, and create new ones transactionally. Completion/cancellation/trash disables future sends; reopening asks whether to restore a reminder rather than silently replaying old ones.

Durable job identity includes reminder ID, scheduleVersion, fire instant, and channel. Before sending, recheck current owner/account state, version, target state, and subscription. Create the in-app notification once; web push is opt-in and best-effort. Default push content is generic (“You have a reminder”) with authenticated target navigation. Quiet hours delay push until the next allowed window; suppress push more than 24 hours late but retain the in-app item. A crash after external send can duplicate a push; stable notification tags reduce duplicates but do not create an exactly-once guarantee.

No scheduler depends on a browser tab staying open. Remove invalid/expired subscriptions. Validate push endpoints as HTTPS and enforce network egress controls against private, loopback, link-local and metadata addresses, redirects, and DNS rebinding.

## 11. Performance and validation targets

These are release budgets to measure, not benchmark results:

| Metric | P0 target and conditions |
|---|---|
| Initial Today JS | ≤180 KB gzip; CI reports dependency/chunk sizes |
| First-screen transfer | ≤350 KB compressed excluding user media; no remote fonts |
| User experience | LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75 when field data exists |
| API metadata reads/writes | p95 ≤300 ms excluding network, uploads and async jobs |
| Lists | Paginate 50 rows; virtualize only when measured need justifies it |
| Reminder queue | Healthy infrastructure starts due jobs within 60 s; no promise of device arrival |
| Scale fixture | 10,000 tasks, 1,000 notes, 100 active routines/account; load test 50 concurrent active users |

Test with a documented midrange Android device and throttled mobile network, then actual iPhone Safari/installed PWA. Lazy-load calendar/editor/media/appearance tools. Never download every note or attachment at login.

Required automated tests: owner isolation for every route and join; missing RLS context; session/CSRF denial; conflicting note saves; concurrent cycle insertion; duplicate completion/progress entries; recurrence retries, pause/resume and splits; DST gaps/overlaps, leap years, last-day rules and local midnight; quota races and upload replacement attacks; reminder cancellation and retry; trash/restore and account deletion; export completeness and CSV formula neutralization.

Browser journeys prove capture → plan → complete, recurrence edits, blocked task behavior, appearance reset, file rejection, and interrupted saves. Accessibility requires manual assistive-technology review as well as automated checks. Release only after documented security review, migration test, restore drill, and measured performance results.
