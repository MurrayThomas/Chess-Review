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
- [x] 4 Speed up Time attack piece animations. Show destinations and capture
  rings while picking up during opponent animation in all modes. In Time attack
  allow early solver drops and finish the opponent animation instantly.
- [x] 5 Remove puzzle-statistics divider clutter; improve summary metrics; show
  all puzzle types, with zero correct/incorrect/percent for untried types.
- [x] 6 Add proportional group resizing/multiselection to Reorganize panels and
  a temporary layout export button. Preserve the current bottom gap/defaults.
- [x] 7 Add a Visual-settings debug option to inspect different screen states.
- [x] 9 Inspect GitHub issues/PRs and report findings. Make no changes to them.
- [x] 10 Report options for changing the extension link at the top safely.
  Make no link or identifier changes.
- [x] 11 Rework the extension popup in the existing visual theme, with animated
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

- Item 3 committed as c123bdec.
- Item 4: Time attack piece moves take 24–100 ms (64 ms at default speed),
  reply pauses cap at 80 ms and loss feedback at 180 ms. Board assembly is
  unchanged. All puzzle modes show future-position legal destinations during
  opponent motion. Time attack early drops finish the opponent slide, await the
  stable turn, then accept one solver move. Promotion stays explicit; close and
  expiry cancel queued moves. 83 focused tests, source/diff checks and real Chrome
  pointer capture/continuation checks pass. Capture-marker screenshot inspected.

- Item 4 committed as a4417994.
- Item 5: rebuilt the four metrics as semantic summary cards; removed separator
  and track clutter; all puzzle types stay in one list with zero values for
  untried types. 28 checks passed plus the corrected always-visible-types case
  passing on focused rerun. Chrome checks at 1920/1280/390/320, screenshot review,
  source verification and diff checks pass.

- Item 5 committed as 3ff2ffcb.
- Item 6: added per-panel selection, select-right/all/clear controls, group movement
  and proportional resizing including content. Scales persist with existing
  layouts; Accuracy collapse offsets and engine content floors scale correctly.
  Export layout downloads geometry/visibility/viewport JSON without game data.
  Current defaults and bottom spacing remain unchanged. 39 focused layout/board
  checks pass, as does real Chrome pointer scaling/movement, unchanged-board
  verification, content scaling, export download parsing and reload checks.
  Selected-panel screenshot inspected.

- Item 6 committed as fdfb5d8c.
- Item 7: 36 isolated sample views, real review/learning components, popup
  action guards and a collapsible view selector. Four isolation tests and 18
  related regressions pass. All 36 actual Chrome views and popup guards pass;
  the complete real extension storage remains unchanged. Source verification
  and lint pass (same two warnings); review/statistics/popup screenshots inspected.
  Chrome audits require sandbox escalation to load the local extension.
- Continuation heartbeat continue-organiser-tasks resumed this same chat at
  2026-10-23 21:57:57 Europe/Copenhagen, after the five-hour reset. The queue
  is now complete; no further scheduled continuation is needed.

- Item 7 committed as 90738fd4.
- Item 9: reviewed all three open issues and both open PRs, their patches, CI
  jobs and research failure logs. Recommendations and limitations are saved in
  ORGANISER_REPORTS.md. No GitHub mutations or dependency changes were made.

- Item 9 committed as b09424e3.
- Item 10: address-bar assumption, current job/reload dependencies and safe
  naming options documented in EXTENSION_URL_OPTIONS.md using official Chrome
  and Mozilla sources. No routes, identity or links changed.

- Final broad verification found one stale assertion from item 5 in the solving-
  time test: it still expected the old value-before-label text. The test now
  checks the semantic Time spent label and 3s value separately, preserving its
  timing/storage checks. The other two failures match the recorded baseline.

- Item 10 committed as 54d030a9; the final statistics-test correction is
  cbb967a2 (test: align solving-time assertions with statistics cards).
- Item 11: rebuilt the popup with the learning tabs’ flowing liquid highlight,
  two clear primary actions, visible keyboard focus and reduced-motion support.
  Manual setup retains username saving and URL/PGN imports and fits the native
  600px popup height without scrolling. The menu now waits for an explicit
  choice on chess sites so Open Chess Review is always reachable. Shortcuts
  and in-page review buttons retain direct game launch.
- The new no-game entry opens a welcome screen with learning and saved games;
  it creates no game job and starts no engine, opening-book or calibration work.
  Saved-game selection restores the review, keeps reload recovery per tab, and
  leaves independently opened blank tabs empty. The new welcome state is also
  available in the debug catalogue (now 37 views). Preview launch actions stay
  isolated. Existing position-only PGN rejection remains intact.
- Final maintained suite: 649/651 pass. Only the two previously proven baseline
  failures remain: learning-skip-feedback final-loss display and puzzle-analysis
  alternative-mate handling. All eight new blank-workspace checks pass, as do
  the popup/import checks and all 29 storage/settings/release regressions.
- Final source verification, history verification (8,759 retained blobs before
  the final commits), engine hashes and lint pass; lint retains the same two
  warnings. Both final browser packages build under
  web-ext-artifacts/release-0.3.0-j2a5E4/.
- The packaged Chrome audit passes actual liquid pointer animation, native Tab
  navigation, reduced motion, expanded-popup size, empty startup, 1280/390/320
  layouts, learning return/focus, saved-game reload, independent blank tabs, PGN
  imports and preview guards. Final popup and welcome screenshots inspected.
