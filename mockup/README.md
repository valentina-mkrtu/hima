# Dayweave — interactive mockup 0.5

Open **Dayweave.html** in a browser. It is a self-contained file: no installation, build step, external fonts, libraries, or network requests are needed. A local preview server is optional. The mockup fits phones, tablets, and desktop screens.

## Try these flows

- Add a task with a name, life area, and date. Open **More details** for time, deadline, recurrence, checklist, dependency, result note, and files.
- Today and each life area now use one **2×2 rectangle: To do, In progress, On hold, Done**. All four sections stay visible on phones. Drag a card by its dotted handle to move or reorder it; drop targets highlight.
- Use **Start** and **Finish** for a quick alternative. Click the dotted handle (or use Enter on it) to choose a status. Finished cards stay in Done. Every board move offers **Undo**.
- On phones there is no sideways board scrolling. Each section has a compact task list that scrolls vertically only when it fills up. Tap a title for details or its dotted handle to move it. On hold is a manual pause; Resume returns it to In progress. It is distinct from waiting on a prerequisite.
- Finish **Pick up supplies for the bookshelf** and watch **Give the bookshelf a fresh coat** become ready. Reopen the prerequisite to see it become blocked again.
- Open **Calendar**, select a date, and add a task or event. On a phone, choosing a date scrolls to its agenda.
- Create or edit a life area; try a template, icon, and color.
- Open **Library** to write a note or log progress toward a goal.
- Open **Make it yours** or the profile circle for Themes, Colors, and Fonts & size. Cancel discards the live preview; **Save my style** stores it in this browser.
- Search with the magnifying glass or `/` / `Cmd+K` / `Ctrl+K` when not editing text.
- Use **About this mockup → Reset sample data** to start over in the current browser.

## What is real in this mockup

Local task/note/event/area/goal edits, task state and dependency checks, checklist edits, four-week recurrence previews, calendar dates, search, customization, and browser storage work. Data persists when browser storage is available. Opening the file directly and opening it on localhost may use different browser storage; these are separate demo copies.

This is a design sandbox with sample data, not the production service. There is no authentication, backend, account isolation, cloud sync, notification delivery, or upload scanning. Use sample content.

Images of at most 1 MB can retain a local preview; other files store only their name, size, and type. Nothing is uploaded. Notes use plain text. Goals demonstrate numeric entry progress. Recurrence demonstrates daily/weekday/weekly occurrences over 28 days; editing affects the selected occurrence only. Full routine management, richer notes, secure media, offline sync, and production persistence remain governed by the project guides.

Unsaved form edits require Save; closing the form discards them. Deletion is immediate in this mockup with confirmation; the production specification requires trash/recovery. These shortcuts are for visual and interaction review, not production architecture.

## Files for iteration

- `index.html`: app shell used by the optional local preview server.
- `styles.css`: responsive layout, components, themes, and spacing.
- `app.js`: seed content, view renderers, dialogs, local state, and interactions.
- `build.mjs`: rebuilds the self-contained `Dayweave.html` after editing the source files. Run `node build.mjs` from this folder, then reopen/refresh the HTML.

No package installation is necessary. To serve the editable version locally, run `python3 -m http.server 8765 --bind 127.0.0.1` from this folder and open `http://127.0.0.1:8765`. Refresh the browser after source changes.

## Review next

Start by reviewing the Today screen: tone, information density, colors, navigation, and where progress/notes should live. Then review the add/edit flow and calendar. Changes here can be made independently of the production build; once agreed, record the chosen behavior in the design/product guides before implementation.

## Checks completed

Browser review covered desktop at 1280px, mobile at 390px, and narrow mobile at 320px. Checked task creation and persistence after reload; prerequisite completion/reopening; rejection of cyclic dependencies; weekly recurrence generating four occurrences; note saving; goal progress; template-based area creation; appearance preview/cancel; and calendar rendering. The tested views had no horizontal page overflow, and the browser reported no JavaScript errors. These are mockup checks, not a production security or accessibility certification.

## Board revision checks

Verified a real pointer drag from To do into In progress, Finish moving the card into Done, dependency readiness updating, and Undo restoring the previous state. Verified status-picker movement on mobile, 320px layout without page overflow, and saved status after reload. Touch dragging uses Pointer Events; a physical-phone touch test is still recommended before treating it as production behavior.

## Four-section revision checks

Verified a pointer drag into On hold, Resume via the status picker, Undo restoring On hold, and the Resume action in task details. At a 320×740 viewport, the entire board ends above bottom navigation and the page has no horizontal overflow. The compact rectangle keeps all status sections visible; longer lists scroll inside their own section.

## Focused Today — revision 0.4

Today ends at the task rectangle. The calendar strip and area filters remain above it; notes, goals, upcoming-event cards, the replanning panel, and the demo footer no longer appear below it. Use Library for notes/goals and Calendar for events. The separate floating Add button is hidden on Today; the heading and To do section retain their Add controls. Appearance controls for removed Today cards have also been removed.

## Appearance — revision 0.5

- Six coordinated themes: Linen, Cozy warm, Focus, Daylight, Garden, and After hours. Themes set background, accent, text, font, size, and spacing. Focus adds straight corners and neutral status colors.
- Background and accent each support preset swatches, a native color picker, and six-digit hex input. Text has eight palette choices. A contrast hint flags hard-to-read combinations; settings controls remain readable while you adjust them.
- Basic, Typewriter, Bookish, and Rounded fonts apply throughout the app. They use local system fonts with fallbacks, without downloads. Small/Medium/Large scale text to 88%/100%/116%; comfortable/compact spacing is separate.
- Changes preview immediately. Save persists; Cancel, Escape, or closing restores the previous preferences. Reset previews the defaults. Selected bottom navigation retains its inverted treatment, with a readable foreground fallback when needed.

Verified custom hex colors, contrast feedback, font/size application, Focus styling, dark theme rendering, cancel restoration, and saved customization after reload. A 320px phone viewport with Large Typewriter text has no horizontal page or dialog overflow. No JavaScript errors were reported during these checks.
