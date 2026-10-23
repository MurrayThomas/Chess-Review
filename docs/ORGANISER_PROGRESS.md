# Organiser task progress

Source: C:/Users/thoma/Desktop/Tid/Organiser.md. The user requested sequential
implementation, with 8.1 first and 8.2 second. Items 9 and 10 are report-only.
Keep local commits attributed to T-Julsgaard with the Codex co-author trailer;
never push. Preserve the pre-existing staged marketing/STORE_LISTING2.md change.

## Queue

- [x] 8.1 Separate the former live concept-analysis prototype into research;
  retain learning lessons, document reuse, exclude prototype from the extension.
  Implemented: prototype archived, production UI/worker imports removed,
  three bounded learning rule modules retained.
- [x] 8.2 Improve performance without sacrificing features. Report significant
  optimizations that require tradeoffs for the user to decide.
- [x] 1 Put a dot-grouped puzzle count beside Puzzle types. Show custom-filter
  warnings on every overview Play in Time attack/Knockout; skip only Play again.
- [x] 2 Keep Time attack replay on Run complete; remove the mode/death subtitle;
  align the heading with Back to puzzle overview, following Knockout. Fix puzzle
  box wrapping in both modes. Put side-to-move above the solved list/Puzzle x.
- [x] 3 Remove spurious green focus frames after opening arrow navigation; style
  and right-align Opening library like Back to puzzle overview. Order tabs
  Puzzles, Openings, Concepts.
- [ ] 4 Speed up Time attack piece animations. Show destinations and capture
  rings while picking up during opponent animation in all modes. In Time attack
  allow early solver drops and finish the opponent animation instantly.
- [ ] 5 Remove puzzle-statistics divider clutter; improve summary metrics; show
  all puzzle types, with zero correct/incorrect/percent for untried types.
- [ ] 6 Add proportional group resizing/multiselection to Reorganize panels and
  a temporary layout export button. Preserve the current bottom gap/defaults.
- [ ] 7 Add a Visual-settings debug option to inspect different screen states.
- [ ] 9 Inspect GitHub issues/PRs and report findings. Make no changes to them.
- [ ] 10 Report options for changing the extension link at the top safely.
  Make no link or identifier changes.
- [ ] 11 Rework the extension popup in the existing visual theme, with animated
  water-style buttons and a new action to open a blank Chess Review.

## Continuation

Check the five-hour usage window between tasks and during long work. When it is
getting low, create a continuation heartbeat for this same chat two minutes
after the actual reported reset, then preserve exact progress here. Do not
create a standalone scheduled chat. Continue in the existing repository, one
task at a time, and commit each completed logical change before moving on.

## Verification and local commits

- c3ff0514 — fix: exclude local scratch checkouts from source scans. Eight
  focused source/history tests and the complete maintained-source scan pass.
- 8.1: module-isolation regression passes. Archived prototype checks: 52 passed
  in the first run; the two corrected archive-path checks and both timing checks
  passed on focused rerun, followed by all five moved coach-insight tests.
- Maintained suite: 611/613 pass. Both failures reproduce with the pre-task
  workspace at 9841869a: learning-skip-feedback final-loss display, and
  puzzle-analysis alternative-mate step handling. These are pre-existing.
- Lint: zero errors, two existing warnings (Firefox service-worker property and
  dynamic innerHTML assignment).
- 8.1 Chrome and Firefox packages build successfully; package staging contains
  no research folder, live concept runtime, coach-insights or fast-coach module.

- 8.2: deferred learning entry and cached library queries implemented. See
  [performance measurements and larger options](PERFORMANCE_REVIEW.md).
  Focused run/input/transition/isolation checks: 64/64 pass. Wider learning,
  review and settings run: 76/77 pass; its loading-test timing was updated for
  deferred entry and the complete UI/performance rerun passes 31/31.
  Source verification and lint pass (the same two warnings).
  Headless Chrome loads the deferred module and exercises learning, then the
  existing return-scroll assertion fails. The unchanged prior package fails
  the exact same assertion, so this is a pre-existing audit limitation.

- Completed local commits: 4de6c0a8 (8.1 separation), dc1ff399 (8.2 performance).
- Item 1: count moved into the Puzzle types legend with Danish dot grouping.
  Warning acceptance is no longer stored; only result-screen Play again skips
  it. Updated migration and lifecycle checks: 58 passing plus all six corrected
  re-entry/reload cases passing. Chrome notice audit passes at 1920/390/320,
  and the desktop count screenshot was visually inspected. Source/diff checks pass.

- Item 1 committed as e939582e.
- Item 2: result summaries and selectable history remain visible during replay
  in both modes, with equal grid cells and turn cues preceding history/current
  puzzle labels. Mode/reason subtitles removed and result headings share the
  overview-button row. 33 run checks and Chrome layout/replay checks at
  1920/1280/390/320 pass; desktop and phone screenshots inspected.

- Item 2 committed as 8915f809.
- Item 3: reordered learning tabs, right-aligned/styled Opening library, and
  prevented shortcut-driven focus restoration on opening arrows. 39 focused
  checks pass. Chrome verifies real key events and retains normal focus-visible
  support across 10 opening views (five widths, both colors). Source/diff checks
  pass; desktop and phone screenshots inspected.
