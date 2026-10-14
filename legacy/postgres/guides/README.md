# Dayweave

**Your life, brought together.**

Working project name for a private, mobile-first life planner: tasks, calendar, routines, dependencies, notes, files, goals, and personal customization.

This folder contains the planning guides, the approved browser-only design mockup, and a working local React/TypeScript + Fastify/PostgreSQL prototype. No production service has been deployed. The working name can be changed later; availability has not been checked.

## Working prototype

Open **http://127.0.0.1:8787** while the server is running. Start it from this folder with `npm run prototype` (after `npm ci` on a fresh checkout). Read [the prototype guide](PROTOTYPE.md) for setup, implemented features, verification, data storage, and the remaining beta work.

The prototype preserves the four-section mobile board and appearance controls. It adds real server-backed persistence and validation. Local workspace access is a development adapter; managed cloud accounts are not connected.

## Interactive mockup

Open [Dayweave.html](mockup/Dayweave.html) in a browser to try the current design. See the [mockup guide](mockup/README.md) for working interactions, limitations, and editing instructions.

## Read in this order

1. [Product guide](product.md) — purpose, concepts, full scope, examples, release milestones, and name alternatives.
2. [Design guide](design.md) — mobile navigation, screen behavior, visual foundations, customization, and accessibility.
3. [Technical specification](tech-spec.md) — stack, data model, exact scheduling rules, API, media, limits, and acceptance tests.
4. [Architecture](architecture.md) — components, security boundaries, deployment, background jobs, data lifecycle, and expansion paths.

## Baseline decisions

- TypeScript + React + Vite, HTML/CSS, Node/Fastify, PostgreSQL, private object storage.
- One private workspace per person; shared/team work is outside the initial scope.
- Web and installable PWA first, app-store packaging through Capacitor later.
- Core beta includes all daily planning flows, notes/media, goals, recurrence/dependencies, and meaningful customization.
- Online-first beta; offline edits and general spreadsheet-style trackers are explicit later phases.
- The server is authoritative; requests are owner-scoped, writes are versioned, uploads are quarantined, and jobs are durable.

The stack is a proposed engineering choice, not a performance or security guarantee. Version selection, identity/hosting setup, implementation testing, and security review remain build work.

## First build slice

Start with M0, then one complete M1 journey: sign in → create a life area → capture a task → plan its date → see it in Today/calendar → start → complete → reopen. Establish account-isolation tests before adding personal content. Add notes and events within M1; use the remaining milestones in the product guide to finish the beta.

## Keeping the guides aligned

Product owns what/why and release scope; tech spec owns exact behavior and contracts; architecture owns boundaries and operational policy; design owns interaction and appearance. A change crossing those boundaries must update all affected guides in the same change. Record material new decisions and their tradeoffs in architecture.md.

Reference reviewed: local token-sharing/Wagglet source and documents on 8 October 2026. Adapted its useful planning concepts for individual use; no source code, private data, credentials, or deployment settings were copied. Public technical references are linked where used in the guides.
