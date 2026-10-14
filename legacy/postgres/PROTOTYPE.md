# Dayweave — working local prototype 0.1

This is the first implementation based on the product, technical, architecture, and design guides and the approved 0.5 mockup. It is a working web application with a TypeScript/React client, Fastify API, and PostgreSQL storage. It is **not the completed P0 personal beta** described in the original guides.

## Open and run

Open **http://127.0.0.1:8787** while the local server is running. The original HTML mockup remains unchanged at `mockup/Dayweave.html`.

Requirements: Node 24.8 or newer, npm, and PostgreSQL binaries (`initdb`, `pg_ctl`, `postgres`) on PATH. This computer already has them. From this directory:

```sh
npm ci
npm run prototype
```

The launcher initializes/starts an isolated database, applies the migration, builds the web client, and starts the API bound only to `127.0.0.1:8787`. It never connects to another existing PostgreSQL database or listens on a network interface. PostgreSQL uses a private Unix socket in `.runtime` and port 55439; TCP connections are disabled. The app uses a non-superuser role without BYPASSRLS.

Ctrl+C stops the web server. `npm run db:stop` stops this database. Restart with `npm run prototype`; records survive restarts. Do not delete `.runtime` to refresh the design.

For source iteration, run the API with `LOCAL_PROTOTYPE=1 npm start`, and `npm run dev` in another terminal (Vite on 127.0.0.1:5173). `npm run build` produces `dist/web`. The API serves that build. `npm run check` typechecks; `npm test` runs domain tests and integration tests against the isolated database after `npm run db:migrate`.

## What works

- Open/close a **local workspace session**. Cookie-backed sessions expire after seven days. First visit starts empty; an explicit “Try an example planner” action adds editable examples only when the workspace has no content.
- Create life areas or choose a starter template. Edit their emoji, color, description, and archive state.
- Capture and edit tasks with plan date, separate deadline, priority, notes, checklist, prerequisites, and delivery/result text.
- Four-section mobile board: To do, In progress, On hold, Done. Pointer drag between sections, click/keyboard move menu, and a real versioned Undo. Cancelled remains available in the editor/menu and search.
- Dependency readiness is server-validated, including cycle detection under a per-owner transaction lock. Reopening a prerequisite blocks unfinished dependents without rewriting completed tasks.
- Calendar month grid and selected-day agenda, task/deadline markers, and one-off all-day or timed events. Event forms label their timezone; all-day dates are civil dates.
- Date-only daily/weekly/monthly/yearly routines, intervals, selected weekdays, month-end rules, next-date preview, pause/resume, and 90-day generation. Each occurrence is an independent task, with a database uniqueness constraint. Cancel/trash an occurrence without regenerating it. The server refreshes the horizon at startup and hourly.
- Plain Markdown notes and safe previews: React renders allowlisted token types. Raw HTML stays text; remote images are not loaded; links allow only HTTP, HTTPS, and mailto.
- Goals with numeric entries, linked tasks, or checklist progress. Correct/remove entries, retain real totals above target, clamp the bar, and reflect task reopening.
- Six themes, custom background/accent colors, eight text colors, four font families, three text sizes, and density. Live preview, Cancel, Reset, and server-persisted Save.
- Search over the loaded private workspace; Inbox and missed plans in Library; recoverable Trash; activity for saved entities; JSON export of entity data and attachment metadata.
- Real local attachment bytes: 10 MB/file, 10 files/item, 100 MB/account. Task/note association, session-authorized download, cross-owner checks, checksummed upload retries, no public file route. Supported extensions: PNG/JPEG/WebP, MP4/WebM, PDF/TXT/CSV/MD.
- PWA manifest, PNG icons, standalone display, public-asset service worker, and generic offline page. API/content requests are network-only. Installation is browser-dependent and the local server must remain reachable.

## Security boundaries of this prototype

Local access is intentionally not consumer authentication. Anyone who can access this computer's loopback server can open its local workspace. `LOCAL_PROTOTYPE=1` must be explicitly set; production mode refuses startup and local sign-in. The listener is hardcoded to loopback and checks Host and Origin. There are no cloud credentials or remote services.

API writes validate authored TypeBox schemas, refuse unknown fields, require a session-bound CSRF header, and (for entity mutations) require UUID operation IDs. Repeated identical operations return receipts; edits require `If-Match`; stale edits return 412 and the editor retains input. Data changes, operation receipts, and activity commit in one transaction. Runtime PostgreSQL access uses forced row-level security, including operations, activity, and files. Two synthetic owners are exercised in integration tests; the UI exposes only one local workspace.

Cookies are HttpOnly and SameSite=Strict. Local HTTP intentionally has no Secure cookie or HSTS; those become mandatory with managed HTTPS and OIDC. Headers block framing, MIME sniffing, external scripts, objects, and unnecessary device permissions. Inline styles remain allowed because the chosen appearance system uses React style properties and CSS variables. No tokens or planner content are stored in browser localStorage. Application logs do not contain planner content.

Attachments are **unscanned original files**, always forced to download as `application/octet-stream` under a sandbox CSP. No image/video/document parser runs in the server, and there is no inline preview. They are not “Ready/scanned” production uploads. The files directory is outside the web root. Use the specified S3/quarantine/scanner/immutable-promotion architecture before allowing cloud uploads. Local files and PostgreSQL are not application-encrypted or end-to-end encrypted; their privacy depends on the computer's account and disk protections.

## Deliberate prototype simplifications and beta backlog

These are scope gaps, not completed requirements:

| Guide requirement | Prototype implementation / remaining work |
|---|---|
| Managed OIDC, private cloud accounts, session management | Local-session adapter only; select identity/hosting provider and implement OIDC/PKCE, revocation UI, secure cookies, recovery, and reauthentication |
| Normalized relational model, Drizzle, pagination | Owner-keyed PostgreSQL entity envelopes with validated JSONB and SQL migration; normalize into the specified domain tables, add composite relationship FKs/indexes, Drizzle repositories, cursor reads, and scale testing |
| Query-level reads | One workspace snapshot, locally filtered; intended for small prototype workspaces, not 10,000-task scale; nominal 4,000-item creation guard |
| Durable worker queue | In-process hourly date-only recurrence refresh, idempotent occurrence identity; no reminder queue, leases, push, or durable catch-up checkpoint; downtime beyond the generated horizon requires the beta catch-up design |
| Complete routine lifecycle | Schedule fields lock after creation. Pause suppresses untouched future occurrences in daily views and stops generation; existing tasks remain. Resume starts from today. No series split, projection beyond horizon, timed/DST routines, or exception-management UI |
| Task time blocks / week calendar | Date planning and month+agenda only; time blocks, week view, overlap flags and travel conversion are still open. Events store local wall times + zone and use an inclusive end-date UI |
| Note autosave and conflict resolution | Explicit Save with version conflict protection and retained editor text; no background autosave or compare/copy-both UI |
| Secure cloud media | Local forced downloads only; no scanner, object storage, preview, office-container support, thumbnails, or video streaming |
| Full settings | Approved appearance controls and area identity are implemented; no nav placement, week-start, system-mode or other P0 layout controls yet |
| Full export/erasure lifecycle | JSON entities + file metadata export; download attachments individually. No ZIP snapshot, CSV, reauthentication, account deletion, purge jobs, or automatic 30-day trash expiry |
| Production PWA / native | Manifest and generic offline shell present. No offline private edits; no service-worker update prompt, native shell, signing, store delivery, or physical-device certification |
| Production operations | No public deployment, backups service, restore drill, field performance/accessibility assessment, independent security review, or production encryption configuration |

The small JSONB prototype adapter is a deliberate local-build tradeoff, not a replacement for the normalized beta model. Server contracts and domain functions are separated from React to support that migration. Prototype endpoints use `/api/v1/{kind}` singular resource names and whole-entity versioned updates; freeze the documented granular beta API only after its normalization milestone.

## Data and backups

The database, private file bytes, and logs live under `.runtime`, excluded from version control. For a complete local copy, stop the server and run `npm run db:stop`, then copy `.runtime` along with the project. A raw PostgreSQL directory requires the same compatible PostgreSQL major version to restore. The JSON export is readable/portable but is not a full attachment backup and there is no import UI. Do not copy a live PostgreSQL data directory as a backup.

The mockup's browser-only data is intentionally separate and was not imported. Example records and a few clearly illustrative browser-test entries populate the local prototype for review.

## Verification recorded

- `npm run build`: strict TypeScript and optimized Vite build passed. Initial JS approximately **132 KB gzip**; CSS approximately **13.4 KB gzip**, under the guide's 180 KB initial-JS target. These are build sizes, not device performance measurements.
- `npm test`: **11 passing tests** against real PostgreSQL/domain logic. Covers session/Origin/CSRF refusal, unknown fields, forced RLS without context, two-account isolation, identical retry receipts, conflicting versions, graph cycles, blocked transitions, concurrent inverse edges, prerequisite deletion guard, trash/restore, recurrence uniqueness, month-end/leap/DST dates, numeric progress, private file access, upload checksum retry, active-format rejection, and missing asset 404 responses.
- Browser: create task → move → reload; real pointer drag into On hold and Undo; dark-theme save/reload and Linen restoration; safe Markdown preview and note save; goal entry save; routine preview/create and future calendar markers; calendar event save. At 320px and 390px the board ends above bottom navigation with no horizontal overflow; Large Typewriter controls also fit at 320px. Desktop 2×2 layout and browser console were checked. Screenshots: `prototype-mobile.png` and `prototype-desktop.png`.
- Registry audit at install: zero known vulnerabilities reported by npm. Dependency versions are exact and a lockfile is included. This is not an independent security certification.

## Source map

- `apps/web/src`: React screens, editors, themes, API client, CSS.
- `apps/web/public`: manifest, icons, public-only service worker/offline page.
- `apps/server`: Fastify API, local session composition, illustrative seed data.
- `packages/contracts`: strict input schemas and shared TypeScript contracts.
- `packages/domain`: dependency, civil-date recurrence, and progress rules.
- `packages/db`: private local PostgreSQL configuration, owner transactions, migration.
- `tests`: domain and actual-database security/invariant tests.
- `scripts`: isolated database and application launcher.
