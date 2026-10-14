# Dayweave — Product guide

Status: proposed build baseline · Version 0.1 · 8 October 2026

**Implementation checkpoint:** [Working local prototype 0.1](PROTOTYPE.md) now exists. That guide records shipped behavior, local-only security boundaries, validation results, and explicit P0 gaps. The remaining requirements below are still beta targets, not claims that the first prototype implements them all.

Dayweave is a private, mobile-first planner that connects what you want to do, when you want to do it, and the notes and files that support it. It should feel like a personal place to think and act, with the clarity of a task manager and the flexibility of a notebook.

Read alongside [technical specification](tech-spec.md), [architecture](architecture.md), and [design](design.md). This document owns product intent and release scope; the technical specification owns exact behavior.

## 1. Working name and positioning

**Recommended working name: Dayweave.** It suggests bringing the different parts of a day and life together. Suggested line: **“Your life, brought together.”**

Other directions: **Little Orbit** (life revolving around what matters), **Daynest** (a comfortable home for plans), and **Life Loom** (connecting plans and progress). These are creative suggestions; trademark, domain, and app-store availability have not been checked. Use `dayweave` as the project folder until a name is chosen.

Audience: individuals managing work alongside household tasks, personal projects, learning, hobbies, and everyday responsibilities. An account owns one private workspace; many people can use the service, but they cannot see each other's workspace.

## 2. What success feels like

- “I can capture this before I forget it.”
- “I know what I planned for today, what is overdue, and what is waiting.”
- “My recurring chores come back without me rebuilding a checklist.”
- “When I finish the first step, I can see what is ready next.”
- “My notes, photos, and progress are beside the thing they belong to.”
- “This looks and works like my own planner.”

The app should help a person return after an unproductive week without feeling punished. Missed tasks stay manageable; there is no public score, compulsory streak, or guilt-driven notification system.

## 3. Concepts and vocabulary

| Concept | Meaning | Example |
|---|---|---|
| Life area | User-facing name for a project; an ongoing part of life | Home, Work, Learning, Hobbies |
| Task | A concrete action with a completion state | Book a dentist appointment |
| Checklist | Small steps inside a task; no independent schedule | Find number; call; save confirmation |
| Plan date | Day the person intends to do a task | Work on the application on Tuesday |
| Due date | Deadline, separate from the intended work day | Submit the application by Friday |
| Time block | Optional reserved time attached to a task | Tuesday, 18:00–18:45 |
| Event | Calendar commitment without a task lifecycle | Dentist appointment |
| Routine | A recurring task template that generates individual occurrences | Clean bathroom every Saturday |
| Dependency | A task waits until another task is completed | Buy paint, then paint the shelf |
| Goal | Something with a measurable outcome and progress | Read 12 books; finish a course |
| Note | Independent writing, optionally linked to tasks or an area | Reading notes, project ideas |
| Tracker | A small typed table for structured personal records | Books, practice sessions, plants |
| Delivery | Optional completion note and files attached when finishing | Photo of the finished shelf |

Inbox holds tasks without an area. Templates create editable starting content; they never remain a live connection to a central template.

## 4. Core experience

### Capture and organize

A persistent Add action creates a task with only a title. Save immediately to Inbox; optional fields include area, date, time, deadline, checklist, priority, notes, and files. Provide a separate Note and Event choice. Do not require AI or natural-language date parsing to create tasks.

People can create, rename, reorder, color, iconize, and archive life areas. Starter templates include Everyday life, Home & chores, Work, Learning, Health & wellbeing, and Hobbies. Show exactly what a template creates before applying it. Dates and routines require confirmation so onboarding never creates a surprise overdue list.

### Plan the day

Today groups planned work, overdue deadlines, waiting work, and completed items. A calendar offers agenda, week, and month views; on a phone, agenda is the default. Planning a task on a day makes it appear in that day's list. A task with only a deadline appears as “Due today” on the deadline date. Display a task once even when both conditions apply.

Moving a task to tomorrow changes its plan date, not its deadline. Missed plan dates appear in a “Needs replanning” section; they do not silently move or become deadline violations. Today offers explicit reschedule and skip actions.

### Work and finish

Use **To do → In progress → Done**, with **On hold** for a deliberate pause and **Cancelled** for work intentionally abandoned. Simple tasks may go directly to Done. “Mark done” offers an optional result note and attachments; no reviewer or acceptance queue is required. A completed task can be reopened. A waiting indicator is derived from dependencies, not an extra status the person must maintain.

### Repeat and sequence

Support daily, selected weekdays, weekly, monthly by day number, monthly on the last day, and yearly routines, with intervals and optional end dates. Let a person skip one occurrence or pause the routine. Completed occurrences remain history.

A task may depend on several other tasks, including across life areas. All prerequisites must be Done before the dependent task can start or finish. Completing prerequisites makes the next task Ready; it does not start it or move its dates. For the first release, dependencies connect concrete tasks; “every occurrence of routine A triggers routine B” is a later workflow feature.

### Keep context and see progress

Notes support headings, emphasis, links, lists, and checkboxes through a small Markdown toolbar. They can stand alone or link to an area and tasks. Tasks and notes accept pictures, short videos, and supported document files.

Goals have one explicit progress mode: linked task completion, a checklist, or a numeric target with dated entries. Show the numerator, denominator, and unit beside the bar. A life area is ongoing and has no misleading lifetime completion percentage.

The first release includes task table views, goal entries, and Markdown tables. A later release adds general trackers with text, number, date, checkbox, and single-select columns. This provides the useful part of a spreadsheet without building a formula engine.

### Make it personal

Offer light, dark, and system appearance; coordinated themes; custom accent colors; area icons and colors; comfortable or compact spacing; a few reading styles; default calendar view; start-of-week preference; home section order and visibility; and a choice of pinned navigation destinations. Keep changes reversible with preview, cancel, and reset.

Customization is a core feature. Arbitrary CSS, JavaScript, plugin execution, and freely positioned overlapping windows are outside scope.

## 5. Release scope

**P0 means required before calling the personal-planner beta complete.** Internal milestones are usable checkpoints, not a reason to drop the remaining requirements.

| Capability | P0: personal beta | P1: expansion | Later, only with evidence |
|---|---|---|---|
| Access | Private accounts; web; installable PWA | App-store shells with Capacitor | Dedicated desktop wrapper |
| Planning | Inbox, Today, tasks, checklists, areas, templates, agenda/week/month, events | Saved views and time-block refinements | Two-way external calendar sync |
| Work | Statuses, completion results, dependencies, task history | Completion-triggered relative scheduling | General automation builder |
| Routines | Calendar-based rules, exceptions, pause, history | Repeat N days after completion | Chained recurring workflows |
| Knowledge | Markdown notes, internal links, private attachments, search | Richer editor if needed | Live collaborative documents |
| Progress | Goals, three progress modes, entry history, task table view | General typed trackers, CSV import/export | Spreadsheet formulas and scripting |
| Personalization | Themes, icons, colors, density, reading style, home layout, pinned navigation | Saved theme presets, background images | Community theme marketplace |
| Reminders | In-app reminders, optional web push, quiet hours | Native notifications | Other delivery channels |
| Offline | App shell; honest offline state; no promised offline edits | Opt-in local data and queued edits | Full local-first sync |
| Data control | Account export, deletion, session revocation, recovery procedures | Validated restore/import UI | Public sharing or household workspaces |

P0 is online-first. Installing it does not imply full offline functionality or app-store distribution. Background reminders depend on device support, permissions, network, and OS delivery; the app is not suitable as a safety-critical alarm.

## 6. Primary journeys and acceptance examples

1. **Set up a personal planner.** Sign in, choose timezone and week start, select optional areas, pick a theme, and create a first task. Every optional step can be skipped.
2. **Plan a hobby project.** Create Hobbies; create “Buy supplies” and “Build shelf”; connect the dependency; plan both dates. Finishing supplies makes building Ready. Attach a photo when the shelf is Done.
3. **Keep up with chores.** Create a Saturday cleaning routine. Saturday's occurrence appears once in Today. Skip this week without changing next week. Completed history survives a routine edit.
4. **Track learning.** Set “Study 20 hours” with unit hours. Add dated entries, correct a mistaken entry, and see a total and bounded progress bar. No entry may silently count twice on retry.
5. **Recover after time away.** See missed plans separately from deadlines. Reschedule selected tasks; skip selected routine occurrences; preserve history and confirm bulk changes.
6. **Find something later.** Search title and note text; filter by area or item type; open the original task/note and its files. Search is private and does not index file contents in P0.
7. **Personalize without breaking navigation.** Reorder Today sections, change a theme and area icons, undo or reset; retain access to Add, search, and settings.

## 7. Scope boundaries

Do not build team roles, assignment, approval chains, contribution points, agent execution, token management, public attachments, billing, AI planning, or a marketplace in P0. Do not migrate or clone Wagglet's data model wholesale. This app has a different trust boundary: private personal data from independent users.

No budget/banking integrations or health-device integrations are planned. A person can write personal entries, but the product makes no financial, clinical, or end-to-end-encryption claims.

## 8. Milestones and release gates

| Milestone | Deliverable | Exit evidence |
|---|---|---|
| M0 — foundation | App shell, schema, authentication, account isolation, base design tokens | Two accounts cannot read or mutate each other's data; responsive shell works |
| M1 — daily loop | Areas, Inbox, tasks, notes, Today, calendar, completion | Complete the capture → plan → finish journey on a real phone |
| M2 — reliable planning | Routines, dependencies, goals, reminder queue | Retry, concurrency, timezone, and DST scenarios pass |
| M3 — personal beta | Secure media, search, templates, full P0 customization, export/delete | Security review, accessibility review, performance budgets and restore drill pass |
| M4 — expansion | Offline editing, trackers, native shells in separately scoped increments | Each feature passes its specific migration, security, and device gates |

No time estimate is implied until team size, deployment provider, and implementation capacity are known. Choose hosting region and identity provider during M0; retain the same interfaces regardless of provider.

## 9. Evaluation

Product targets, to validate with people rather than present as measured results:

- At least four of five usability participants capture and schedule a task without help.
- Routine and dependency behavior is understood from the UI, without reading documentation.
- Users can explain what a progress bar measures.
- The daily screen remains usable with 50 planned items and after a month away.
- People can change appearance and recover defaults without losing content.

Collect content-free operational metrics first. Optional product analytics require an explicit choice; never record task titles, note bodies, file names, or session replay. Avoid measuring success solely as more tasks completed.

## 10. Inspiration reviewed

Local reference: `/Users/valentina/Desktop/token-sharing`, inspected 8 October 2026. Reviewed its README, product and technical specifications, current Prisma schema, dependency list, and notes/mobile planning documentation. Earlier specifications contain historical concepts; the current README and schema show a broader product. This was a source/document review, not a running-UI audit.

Adapt: projects as containers, explicit task state, separate notes, recurring occurrences, dependencies, completion context, and attachment provenance. Simplify: one owner, no team review step, no points, no agent handoffs, and no live collaborative editor. Inspiration is behavioral; reuse of source code would require a separate license and suitability review.


## First prototype checkpoint

The first working prototype preserves the approved focused Today screen: calendar strip, filters, and the four-section rectangle, with no supplementary cards below it. Notes, goals, routines, Inbox, missed plans, Trash, and settings live in Library. The initial implementation is local to one computer and does not mark M0–M3 beta gates complete. See [PROTOTYPE.md](PROTOTYPE.md) for exact capabilities and remaining work.
