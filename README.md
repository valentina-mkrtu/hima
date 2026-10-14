# hima

**Your life, brought together.** A lightweight personal planner that keeps its data on your device.

A crossover between task management and life productivity: turn life goals into small daily tasks, add deadlines, and track your progress. Built for me, open for everyone.

hima now runs as a static React/TypeScript app. Tasks, notes, calendar events, routines, goals, settings, and attachment bytes live in IndexedDB in your browser profile. There are no accounts, API, PostgreSQL dependency, analytics, or cloud synchronization in the active app.

## Run or build

```sh
npm ci
npm run prototype
```

Open **http://127.0.0.1:8787**. The command builds the app and serves only public static files. Once “Ready offline” appears, it can reload, read, and save even after this preview server is stopped. The same browser profile and exact origin must be used. Changing hostname, port, browser, or device opens a separate workspace.

```sh
npm run dev      # development at 127.0.0.1:5173 (separate device workspace, no offline worker)
npm run build    # static release files in dist/web, including generated offline worker
npm start        # preview the existing build on 127.0.0.1:8787
npm test         # local database and domain tests; no running server/database needed
```

Deploy **only `dist/web`** to an HTTPS static host. Never publish the repository root, `.runtime`, backups, or `legacy`. No database provisioning or application server is needed. The local Node preview serves code, not planner data. Node is a build/development tool, not an installed-app runtime requirement.

## Your data

Profile icon → Settings shows text/file usage, a persistent-storage request, complete backup download, and validated restore. Backups include attachments and Trash. Restore has an explicit replacement preview and commits atomically; it is not a merge. Download a current backup before replacing your planner.

Storage and JSON backups are **not an encrypted vault**. Protect the device/browser profile and keep backup files somewhere private. Clearing site data or deleting the browser profile can erase the planner. Persistent storage reduces automatic eviction where granted but does not prevent manual clearing. There is no server copy or password recovery.

## Project guides

- [Product](product.md): scope and simple local-first experience.
- [Design](design.md): approved mobile UI and storage/backup interactions.
- [Technical specification](tech-spec.md): data rules, limits, and offline behavior.
- [Architecture](architecture.md): local boundaries, privacy model, and deployment.
- [Implementation and verification](PROTOTYPE.md): what works and what remains.

The approved [HTML mockup](mockup/Dayweave.html) is retained for reference. The earlier server prototype and its old plans are archived in `legacy/postgres`; they are not part of the active build. Its data remains untouched in `.runtime/postgres`, and its private migration backup is `.runtime/device-migration-backup.json`. PostgreSQL has been stopped. The existing 30-item workspace was restored through the new backup UI on the current browser profile.

## Plan with an LLM

Open **Profile icon → AI plan import** (also available inside Library → Goals). Copy the planning prompt, describe your goal to your preferred LLM, and ask for `dayweave-plan.json`. Choose that file or paste raw JSON, review the preview, then add the plan. This is separate from full-backup restore: it only adds new content. No LLM API, account, key, automatic upload, or network dependency is involved.

The prompt embeds the same versioned schema the importer validates. Plans can contain areas, goals, milestones, tasks and dependencies, routines, research notes, calendar events, application tracking and budgets. IDs are readable aliases within the file; the importer resolves them to device IDs. Invalid plans fail without saving; repeat imports of the same content are refused while their records remain on the device. A changed file is a new plan, not an update.

Goals open a dedicated workspace with next actions, milestone tasks, linked notes/routines, application tracker CSV export, and budgets grouped by currency. Edit goal changes details and tracking rows. Use Today → Review or Profile → Weekly review to find missed plans and goals needing a check-in. Closed-app notifications are not implemented.

An editable starter is included in `examples/university-2027.dayweave-plan.json`: 1 goal, 4 milestones, 14 tasks and 3 notes, with the November 12 exam target and December 1 readiness target. No universities, fees, scholarship coverage or external deadlines have been verified; January submissions and the autumn intake must be checked against official sources. Import it only once. The file is not automatically installed into every user's workspace.


### Optional Google Calendar connection
Settings → Connections provides an explicit Google Identity Services connection using a public web OAuth client ID and `calendar.readonly`. Google scripts load only after Connect is pressed. Short-lived access tokens remain in memory; never saved in IndexedDB, backups, browser storage, or service-worker caches. Only Google authentication and Calendar API hosts are permitted in the app CSP; the core planner still works offline.

Select a readable calendar and press Sync now. Sync pulls expanded recurring instances from 30 days ago through one year ahead (maximum 2,500 events), validates all pages, then commits atomically with a workspace revision check. Copies are keyed by actual calendar ID plus Google event ID. Events missing from the fetched window move to recoverable Trash; other calendars, native events and dates outside the window remain unchanged. Imported events are read-only and included in local backups. Disconnect revokes the in-memory token and retains copies; a separate action moves copies to Trash. Reconnect after reload/expiry. No background or two-way sync.

Google setup: enable Calendar API; keep External audience in Testing with each tester’s email; allow calendar.readonly; register the exact preview origin and eventual HTTPS deployment origin under the web client’s Authorized JavaScript origins. No client secret or redirect URI is used by this popup flow. Hosting and live account authorization remain external setup steps; automated tests do not verify Google consent.
