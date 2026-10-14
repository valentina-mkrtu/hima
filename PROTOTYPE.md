# hima local-first implementation — 0.2

The current prototype is a static app with persistent **on-device IndexedDB storage** and an offline app shell. It replaces the previous local-server storage architecture while preserving the approved interface and core planning flows.

## Implemented in this conversion

- Removed active Fastify, PostgreSQL, session/CSRF/HTTP API and backend dependencies. The preview serves public files only; it cannot read planner content from the browser.
- Native IndexedDB transactions for entities, version/conflict checks, task/dependency rules, attachments, activity and recent retry receipts.
- Blob attachment bytes stored separately from metadata; file downloads, removal, count/byte limits, and a storage-usage display.
- Complete JSON backups with attachments and checksums; strict schema/reference validation; replacement preview; atomic restore with a revision guard.
- Recoverable Trash and explicit space recovery, retaining necessary recurring-task tombstones.
- Browser persistent-storage request and honest messages about clearing site data and unencrypted backups.
- Cached offline HTML/JS/CSS/icons/manifest; edits and reloads work without a server. Explicit update activation preserves open editors.
- Existing calendar, tasks, dependencies, notes, goals, routines and customization use the local adapter without HTTP requests.
- Date-only recurrence checks on open/focus, bounded catch-up checkpoints, and deduplicated 90-day materialization.

## Migration and preservation

The previous PostgreSQL workspace was exported read-only to `.runtime/device-migration-backup.json` (private file permissions, outside `dist/web`) and validated/restored through the browser UI: 30 items, no attachments. PostgreSQL was stopped; `.runtime/postgres` was preserved unchanged. The original mockup and the historical server code/docs remain available separately. No cloud destination was used.

The new database belongs to **http://127.0.0.1:8787 in this browser profile**. A different address, browser or device has different storage. Use a complete backup to move data. Nothing automatically imports from the previous mockup's localStorage.

## Verification

- Strict TypeScript/Vite production build passes. Initial JS approximately **142 KB gzip**, CSS approximately **14 KB gzip**; eight public shell resources are precached. No external fonts or media downloads.
- `npm test`: **12 tests pass**. Local IndexedDB and domain tests verify persistence after reopening, stale/concurrent writes, validation/graph rules, creation retries, complete byte-identical attachment restore, corrupt backup refusal, revision conflict refusal, invalid-reference refusal, file removal/Trash access, recurrence deduplication and aborted transaction rollback.
- Browser migration restore completed through the same file-picker and confirmation flow users receive.
- **Offline browser test:** both PostgreSQL and static preview stopped; reloaded the app, created “Try hima offline,” saved it, and reloaded again. The task remained visible from device storage.
- Browser attachment check: attached a small text file to the offline test task, reloaded, and reopened the task; the attachment remained available. No browser console errors were reported in the final check.
- No public deployment was performed. The Node process, when running, only previews static release files. Normal planner actions use no network request.

## Remaining practical limits

This is not a passphrase-encrypted vault. Device/browser access and disk protections remain relevant; downloaded JSON backups are plaintext. Browser persistence permission is not guaranteed, and manual clearing/profile loss still removes the only local copy without a backup.

There is no cross-device sync, closed-app reminder delivery, server recovery, malware scanner, automatic video/image processing, inline media preview, native app-store package, or cloud account. Date-only routines and month/agenda calendar remain the implemented scope; advanced series editing, task time blocks, autosave comparisons and more layout settings are optional later work. Recurrence catches up when the app runs, not while the device/app is closed.

Export/restore is bounded in memory (150 MB backup limit, 100 MB attachment limit); constrained phones may need smaller backups. Metadata is bounded to 20 MB and currently written as one transaction envelope. Optimize into per-entity object stores only if measured real-device performance requires it. Physical-device install/eviction, quota behavior, assistive technology, and an independent security review remain checks before a broad consumer release.

## Operation

Run `npm run prototype`; it builds and serves `dist/web` at 127.0.0.1:8787. `npm start` serves an already built release. Stop the static preview with Ctrl+C: already cached browsers continue working. Restart it when distributing updated code. `npm run dev` uses a separate origin/workspace and has no production offline worker.

For hosting, publish only `dist/web` over HTTPS and configure the supplied security response headers. Never host the repository root or `.runtime`. Keep hosting access controlled: a compromised update can read data within the app origin even though there is no data server.

## Goal planning and AI import — 2026-10-12

Profile → AI plan import now provides a copyable/downloadable prompt with a shared JSON Schema, JSON file/paste validation, an item-by-item preview and atomic add-only import. The same entry is available inside Library → Goals. Imported goals open a workspace with milestones, next actions, research notes, supporting routines, application tracker/CSV and currency-separated budgets. Today links to missed-plan/goal review. No cloud AI integration or additional dependency was added.

The university starter was imported through the browser file-picker flow: 1 life area, 1 goal, 4 milestones, 14 tasks and 3 notes. It uses the agreed November 12 exam and December 1 application-readiness targets, with explicitly unverified external deadlines and costs. Its first scheduled task is visible in Today.

Production build and 17 automated tests pass, including import/backup roundtrip, preserving existing data, duplicate prevention, invalid references/dates/URLs/cycles, milestone membership, stale linked-task rollback and safe CSV cells. The browser Copy prompt button and imported goal workspace were checked. Code size is about 155 KB gzipped JavaScript and 14 KB CSS. The format is add-only: changed plan files create new plans, and old backups remain readable. Closed-app reminders and automatic external deadline verification are not implemented.

## Task handoff and completion

Drag/drop now has a pointer-following card and landing feedback. Hold/completion dialogs stage notes, checklist changes and files without changing status until confirmation. Task editors expose completion conditions. Production build and 20 tests pass, including required-reason, required evidence, atomic rollback, stale edits and blocked prerequisites.
