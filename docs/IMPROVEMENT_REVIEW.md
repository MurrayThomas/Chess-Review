# Extension improvement review

Review-only backlog requested by Thomas. Started 2026-10-14 (Europe/Copenhagen).

Implementation of the relevant confirmed items was authorized by Thomas on 2026-10-15. Notify Thomas before adding or substantially changing UI. The findings below retain their pre-implementation evidence against baseline `e8cda39`; implementation status and validation are tracked separately below. Temporary diagnostics and raw results belong in ignored `scratch/improvement-review/`. Preserve all existing user work, including staged files.

## Pending-change review — 2026-10-18

Thomas requested an explanation and cleanup of the pending Git changes on
2026-10-17, then a review of their commit readiness on2026-10-18. These changes
come from the extension-improvement implementation and the separate learning
transition work. They are not uncommitted numerical-research experiments.
The staged marketing video was committed separately as`f3787997`, as requested.
The remaining46 files comprise17 runtime files,25 test files, one browser-check
script and three documentation files. All46 matched the prior cleanup's saved
SHA-256 inventory before this review's documentation corrections.

| Pending scope | Behavior and recommendation |
| --- | --- |
| Import flow, background, Chess.com/Lichess adapters, popup, cache and new `lib/import-request.js` | Keep. Bound and cancel imports, coalesce duplicate requests, preserve failed share handoffs, recover cached archives and coordinate cache writes. The new helper is required by the changed imports. |
| Shared `analysis.js` and `styles.css` | Keep. Preserve unrelated settings edits, immutable failed saves and saved identities; discard obsolete helpers/results; support promotion choices, bounded practice verification and the requested Concepts visibility control. Preserve Thomas's later removal of typed move entry and review-section Tab traversal. |
| Five `lib/learning/` files, including new `centered-morph.js` | Keep. Add the requested Morph2/3 layouts and transition cleanup, shared board dragging/annotations/promotion, retained unsaved progress and exact challenge deadlines. The new module is imported by the workspace. |
|25 test files and `scripts/learning-browser.mjs` | Keep with their runtime changes. Add recovery, race, promotion, layout and input regressions; existing assertions now await deliberate asynchronous settings writes. No performance threshold was relaxed. |
| README and learning/review documentation | Keep. Record the features, original findings and verification limits. This review also adds Morph3 to the README's option list. |

**Current verification.** `node --test --test-concurrency=2 tests/*.test.mjs`
finished all485 tests:484 passed and one failed. The unchanged coach timing test
at`tests/fast-coach.test.mjs:118` took3396.7ms against its3000ms threshold; its
isolated rerun passed at610.7ms. Preserve the full-run failure rather than claiming
an entirely green suite. `npm run verify:source` passed. Root `npm run lint`
finished with five errors and64 warnings: four errors concern unchanged research
evidence (one malformed guard fixture and three oversized results files), and
one concerns the unchanged oversized`data/learning/puzzles.json`. None of those
error files is part of this pending batch. Frozen evidence and lint configuration
were not changed to hide the failures. Prior incomplete cleanup logs are not
counted as passed checks. Current logs are ignored
`scratch/improvement-review/pending-audit-*.log`.

**Decision.** Retain and commit the reviewed batch together because the shared
analysis, learning and style files contain overlapping earlier work. No runtime
code was added or altered during this review. Keep the existing browser/runtime
limits below: this review did not repeat installed-extension or Firefox checks.
Local commit readiness does not establish release readiness; the root lint
scope/large-file errors and wall-clock test variability remain follow-ups.
No numerical model or research candidate was promoted, and no push was made.

## Implementation status — authorized 2026-10-15

- Initially implemented locally: **IR-001 through IR-017, IR-019, and IR-022 through IR-027** (24 confirmed items), with the scope limits below. Thomas subsequently requested removal of IR-025's typed move entry and review-section Tab traversal; these are now explicitly declined, superseding the original accessibility recommendations. No commit, push or store publication was requested or performed.
- Prior UI notice was given before adding the save failure/Retry saving status, Cancel import, promotion choice, compact move entry below engine suggestions, native unsaved-work warning, and keyboard/click library access. The incumbent appearance and module layout are retained.
- Deferred: IR-018, IR-020 and IR-021 performance experiments; broad legacy hash migration, global touch redesign and unbounded orphan repair.
- Original reproductions below describe the baseline defect, not a claim that fixed code still reproduces it. Original confidence/limits paragraphs remain historical audit evidence.

| Completed scope | Items | Maintained regression evidence |
| --- | --- | --- |
| Preserve intentional settings edits across tabs, including nested sound/category maps and section resets; keep each open review's active configuration until reload | IR-001, IR-027 | `tests/settings-coordination.test.mjs`, settings/category/concept tests, `tests/review-keyboard.test.mjs` |
| Retain immutable unsaved reviews, show save-only retry and native leave warning, retry known cleanup separately; disambiguate colliding anonymous PGNs without a broad migration | IR-019, IR-017 | `tests/review-persistence.test.mjs`, existing library storage tests |
| Retain pending learning saves across navigation and closing/reopening learning in the same review tab; deduplicate retries; enforce exact challenge deadlines | IR-009, IR-012 | `tests/learning-save-recovery.test.mjs`, `tests/learning-deadline.test.mjs`, existing progress/UI tests |
| Latest library selection wins; helper startup is shared and obsolete workers are disposed; stale threat/display results are discarded; canceled drags release their ghost and original piece | IR-002, IR-005, IR-006, IR-013, IR-023 | `tests/review-lifecycle.test.mjs`, existing reliability tests, native Chrome touch cancellation |
| Preserve native controls and focus recovery for library, engine candidates, Settings and Credits; review-section Tab traversal and typed SAN/UCI move entry were removed at Thomas's request | IR-010, IR-011, IR-016; IR-025 declined | `tests/review-keyboard.test.mjs`, Chrome workflow |
| Preserve promotion identity and support all four choices; verify unsearched practice alternatives with owned, bounded searches using the original build/protocol; unavailable checks stay ungraded | IR-007, IR-008 | `tests/practice-verification.test.mjs`, promotion tests, real bundled Stockfish practice verification in Chrome |
| Bound/cancel imports, coalesce duplicate in-page requests, clean up late canceled handoffs; reuse previous-month cache and preserve incomplete-lookup errors; acknowledge shared links before clearing them and handle hash changes | IR-003, IR-014, IR-015 | `tests/archive-recovery.test.mjs`, `tests/import-lifecycle.test.mjs`, `tests/analyze-flow.test.mjs`, popup/button tests |
| Coordinate bounded cache writes across contexts, restore explicit saved player identity conservatively, respect Black-start setup numbering, recover required calibration data before starting workers | IR-004, IR-026, IR-024, IR-022 | `tests/cache-coordination.test.mjs`, `tests/review-persistence.test.mjs`, `tests/calibration-recovery.test.mjs` |

**Validation, 2026-10-15.** The full `npm test` run passed **476/476**. The final pending-save collision refinement then passed **13/13** focused persistence/keyboard checks, including its added regression. `npm run verify:source`, `npm run verify:engines`, `git diff --check` and `npm run build` passed. The build created fresh Chrome and Firefox packages under `web-ext-artifacts/release-0.3.0-U8tM4r/`; the new `lib/import-request.js` is included by the existing library-directory allowlist. Build outputs remain local.

**Native browser evidence.** Chrome 148.0.7778.217, real production modules and bundled engine, isolated loopback origin and mocked extension storage/API boundaries: native Enter/Space activated an engine candidate, entered d4, saved a favorite without losing focus, retained Settings focus, trapped Credits focus, and selected rook promotion. Injected save failure recovered through Retry saving with no reanalysis. Native touch cancellation left zero drag ghosts and restored the original piece. At 390×844 there was no horizontal overflow and the board remained square. An unsearched opening alternative passed the real practice verifier while original review evidence remained unchanged. No page errors. Raw results/screenshots: `scratch/improvement-review/implementation-browser-results.json` and `implementation-*.png`.

**Remaining limits.** Unsaved queues survive navigation and workspace reopening within the same tab; they are not a persistent crash journal. Native leave warnings depend on browser interaction rules and cannot prevent forced process termination. Cross-context coordination uses Web Locks; the fallback only coordinates within its module/page. Legacy player ownership is restored conservatively when old records are ambiguous. Practice verification has a 15-second budget and remains ungraded on failure/timeout. Broad touch scrolling/gesture redesign and repair of unknown historical cache orphans remain deferred. Live platform markup/network conditions have not been exhaustively tested.

**Packaged runtime limitation.** The existing Chrome extension smoke launcher could not load the isolated extension because this installed Chrome reports `Extensions.loadUnpacked: Method not available`. It failed before extension runtime checks. Firefox is not installed. Thus packaging/source/engine checks and isolated real-Chrome module tests passed, but an installed-extension runtime smoke is still unverified; no browser security/settings workaround or user-profile changes were made.

**Concurrent work preserved.** Learning morph/presentation/docs/browser-script edits and the previously staged marketing video were present or appeared from separate work during implementation. They were preserved; the regression suite ran against the combined working tree. Only the persistence/deadline portions of learning workspace changes belong to this implementation.

## Review method

- Rotate through import/browser integration, storage/recovery, engine/scoring, learning, performance, accessibility/UI, and packaging/testing.
- Prefer reproducible user-facing defects and measured improvements over speculative features.
- For each recommendation retain the trigger, impact, source location, reproduction command/result, proposed direction, acceptance criteria, effort/risk, and evidence limits.
- Rank primarily by user impact and evidence, then reach, effort, and risk. A confirmed defect does not guarantee every proposed implementation is beneficial; verify the final implementation separately.
- Recheck recommendations against current code before adding duplicates or retaining obsolete findings.
- Original audit phase used existing checks and isolated diagnostics without changing implementation. During the authorized implementation phase, add focused maintained regressions and preserve research evidence, dependency manifests, production assets and unrelated user changes.
- Continue until Thomas asks to stop. Check the five-hour allowance before substantial review work. At **8% remaining or less** (92% used or more), enter conservation mode and only check allowance once per hour. Resume ordinary work when allowance is **100% remaining** (0% used). Persist conservation state and check timestamps under ignored `scratch/improvement-review/usage-state.json`; unavailable usage information must not be mistaken for a refill. The hourly heartbeat is a fallback for this ongoing chat.

## Prioritized recommendations

These entries retain the evidence-backed baseline recommendations. See the implementation status above for completed fixes. All except **IR-018, IR-020 and IR-021** are reproduced functional defects; those three are **provisional optimization candidates** supported by timing or protocol comparisons and awaiting integration/representative workload validation. Priority reflects user impact, reach, reproducibility, confidence and effort. No universal benefit or completed integration testing is implied.

| Rank | ID | Recommendation | Evidence | Expected effort / risk |
| --- | --- | --- | --- | --- |
| 1 | IR-001 | Preserve preferences changed in other review tabs | Sequential writes from two stale tabs lose an unrelated preference | Medium / medium: many write paths and engine effects |
| 2 | IR-019 | Surface failed automatic review saves and offer a save-only retry | Completed analysis stays ready while its library save fails; existing save retry recovers with zero new engines | Medium / medium: persistence status and retained snapshots |
| 3 | IR-009 | Keep unsaved learning changes visible and recoverable | Navigation hides a pending failed completion; reopening loses it; existing retry recovers it when invoked | Small to medium / medium: retry ordering and persistence |
| 4 | IR-010 | Make the saved-game library keyboard operable | Real Tab focus stays off-screen; library reveal and game cards lack keyboard activation | Medium / low to medium: navigation and focus |
| 5 | IR-025 | Provide keyboard input for arbitrary review/practice moves | Native Chrome cannot focus any board square or play d4 with keys; pointer input creates the legal branch | Medium / low to medium: move input, focus and shared legality |
| 6 | IR-016 | Make each engine candidate keyboard activatable | Real Chrome cannot focus/activate the second candidate with keys; pointer activation opens the branch | Small to medium / low to medium: native controls and focus |
| 7 | IR-008 | Verify unsearched practice alternatives before marking them wrong | Actual engine alternative loses only 0.907 percentage points, but single-PV practice rejects it | Medium / medium: asynchronous judging and evidence |
| 8 | IR-007 | Preserve promotion identity and support underpromotion in review/practice | Practice accepts a stalemating queen as a winning rook; ordinary board entry also forces queen | Medium / medium: judging plus promotion interaction |
| 9 | IR-002 | Keep the latest library selection when lookups finish out of order | Clicking A then B ends on A and saves A as the reload state | Small / low to medium: asynchronous navigation |
| 10 | IR-005 | Own, deduplicate and invalidate helper-engine startup | Two cold requests start two workers; old startup repopulates helper state after switching games | Small to medium / low to medium: worker lifecycle |
| 11 | IR-014 | Bound stalled imports and provide deliberate cancellation/retry | Both manual import flows remain disabled after three simulated minutes of unresolved fetch | Medium / medium: request budgets, cancellation and error causes |
| 12 | IR-022 | Recover calibration-data failures with an accurate data error | Empty failed calibration stays cached; analysis retry starts another engine and fails without refetching | Small to medium / medium: required-data loading and validation |
| 13 | IR-023 | Clean up canceled board drags and define touch gesture ownership | Native Chrome touch cancellation strands a ghost and hides the original; an existing-cleanup control restores both | Small to medium / low to medium: pointer lifecycle and touch policy |
| 14 | IR-013 | Keep displayed engine lines tied to their build/settings | Reanalysis labels prior-build cached lines as the newly selected engine/depth | Small to medium / low to medium: display cache and loading state |
| 15 | IR-011 | Give Credits modal focus and keyboard ownership | Focus remains behind the overlay and ArrowRight changes the game | Small to medium / low to medium: focus and shortcuts |
| 16 | IR-003 | Reuse cached previous-month archives and continue after an individual month fails | A cached game costs two network requests; a failed current-month request hides the cached game | Small to medium / low to medium: retain correct fresh-month behavior |
| 17 | IR-015 | Handle later share fragments and retain them until a successful handoff | Both platform scripts miss late fragments and clear valid payloads before rejected delivery | Medium / medium: event handling, acknowledgement and deduplication |
| 18 | IR-026 | Restore a saved game's identified player independently of current username | A saved Black win reopens as White/loss after a username change, while retaining Black board orientation | Medium / medium: saved identity and legacy anonymous records |
| 19 | IR-027 | Preserve settings-control focus when a preference rerenders the panel | Native Space saves Sound On but drops focus to BODY; restoring the equivalent control permits the next keyboard action | Small to medium / low to medium: stable control identity and focus |
| 20 | IR-017 | Disambiguate saved PGNs when their short hashes collide | Two distinct legal event headers produce one ID and overwrite a game/analysis | Medium / medium: identity migration and collision checks |
| 21 | IR-006 | Discard threat results after the feature is disabled | A delayed result draws an arrow while `showThreat` is false | Small / low: render validity |
| 22 | IR-004 | Serialize game/month cache index updates across extension contexts | Concurrent writes retain 1 indexed entry for 1,005 game payloads or 65 month payloads | Medium / low to medium: coordination and existing orphan cleanup |
| 23 | IR-024 | Respect starting side and fullmove number in setup-game move lists | Three list styles reset move 17 to 1; Black-start excerpts swap the presented White/Black columns | Small to medium / low to medium: grouping and retained-cell cache |
| 24 | IR-020 | Reuse validated history commands within repeated searches — candidate | Paired/quadruple-prefix benchmark reduces replays while preserving exact commands and rejection guards | Medium / medium: immutable snapshots and bounded reuse |
| 25 | IR-018 | Batch or filter content-script layout checks — candidate | Chrome fixture: 60 layouts → 1; median callback time 72.6 → 3.2 ms | Medium / medium: representative platform validation still required |
| 26 | IR-021 | Reuse compatible SF19 scoring evidence across live-preference changes — candidate | Actual SF19 commands/results are identical, but hash changes still schedule reanalysis and reject the cache | Medium / medium to high: model-aware cache boundaries |
| 27 | IR-012 | Guard Reveal and Skip at the challenge deadline | Post-expiry actions record assistance/skips; Submit and Hint correctly reject them | Small / low: deadline consistency |

### 1. IR-001 — Preserve unrelated preferences across review tabs

**Trigger and impact.** Open two review tabs, change one preference in A, then a different preference in B. B writes its older complete settings object, undoing A's choice. This does not require simultaneous writes. The same pattern can overwrite engine or rating preferences when a user changes an unrelated visual option.

**Source.** `analysis.js:5095–5108` (`setSetting`), `analysis.js:5140` (`setEngineSetting`), and the other `storage.local.set({settings: S.settings})` call sites. Startup loads a per-tab copy of settings. No `storage.onChanged` listener is present in `analysis.js`. The existing locks for library and learning progress do not coordinate settings writes.

**Reproduced.** The diagnostic evaluates the exact current `setSetting` function in two isolated VM contexts, mocking storage and rendering boundaries only. Both start with `{sound:true, showCoords:true, engineDepth:16}`. A saves `sound:false`; B saves `showCoords:false`. Final storage is `{sound:true, showCoords:false, engineDepth:16}`: one of two intentional edits is lost.

```powershell
node scratch/improvement-review/settings.mjs
```

Raw observation: `scratch/improvement-review/settings-results.json`. To recreate the fixture, extract the function beginning `async function setSetting(key, value)` through the following `// Engine setting: save` marker and give both contexts independently cloned settings plus the same mocked `storage.local.set` sink.

**Proposed direction.** Use one coordinated settings update mechanism that reads the latest stored preferences and applies only the fields intentionally edited, under a shared origin lock. Include reset actions, color pickers, sliders, category-name maps, migrations and engine settings. A lock around whole-object replacement alone will still lose unrelated edits. Decide how other tabs synchronize displayed preferences and invalidate affected engine state; storage synchronization must not silently leave cached results tied to different settings.

**Acceptance criteria.** Two stale tabs retain both unrelated edits; repeated same-field edits use a defined last-commit rule; nested category-name edits merge correctly; section resets affect only their intended keys. Existing setting persistence, release reset, scoring-cache compatibility and engine invalidation tests continue to pass.

**Confidence and limits.** High confidence in the lost-write defect and benefit of preserving intentional edits. The final coordination strategy has not been implemented or browser-tested. Settings behavior across open tabs needs an explicit choice before implementation.

### 2. IR-019 — Make failed automatic review saves visible and retryable

**Severity and impact.** P2 durability gap in the core review flow. A successful analysis automatically attempts to save the game and its results, but a storage write failure produces only a console warning. The review remains complete with no visible save error or save-only retry action, while the game and analysis are absent from library storage. Closing the tab can therefore discard results the user expected to reopen later.

**Source.** `analysis.js:5565–5584` (`updateLibrary`) catches failures and only logs `library save failed`; `:5942` invokes `saveToLibrary` without awaiting a saved/failed result. Existing engine-analysis error state concerns computation, and is not updated for storage errors. Unlike IR-009, this path has no retained failed-change queue or visible retry action to begin with.

**Reproduced with a recovery control.** Run the real `startAnalysis`, coordinator, UI and save path with a fake worker boundary. Reject the automatic `storage.local.set` containing the library. Analysis completes all positions, `analysisError` remains null, **1 save attempt** produces **1 console warning**, and neither the library entry nor its `analysis:save-failure` key exists. The rendered UI contains no save-failure/retry status. Restore storage and call the existing `saveToLibrary` operation: the game and analysis persist while the evaluation/root arrays remain unchanged and **0 additional engines start**.

```powershell
node --test scratch/improvement-review/review-save-failure.test.mjs
```

Raw observation: `scratch/improvement-review/review-save-failure-results.json`. The fixture injects a failure at the actual library write boundary; it does not depend on numerical engine results or a full browser profile.

**Additional partial-commit reproduction.** With 300 stored games, saving a new game commits its library entry and analysis, then eviction removal rejects. The new game is durably stored, but `S.library` remains the old list and `renderLibrary` is never called. Retrying the existing save refreshes the UI, yet no longer knows the dropped game's key: the orphaned `analysis:299` survives. Retaining that known key and retrying cleanup alone removes the orphan while preserving all 300 indexed games and the new analysis. This is the later-cleanup case of the same save-status/recovery item, not another backlog entry.

```powershell
node --test scratch/improvement-review/library-cleanup-failure.test.mjs tests/library-storage.test.mjs
```

Result: **4 passed** (one diagnostic plus three existing concurrency/favorites/eviction controls). Raw observation: `scratch/improvement-review/library-cleanup-failure-results.json`. The injected failure represents the removal API rejecting after a successful write; real-world frequency is unmeasured.

**Proposed direction.** Represent save status separately from analysis completion, retain the exact unsaved review snapshot and expose a save-only retry. Preserve that association if the user opens a different game before retrying. Distinguish failure to commit the library/analysis from failure of later eviction cleanup, so the status accurately reflects what is already stored. Do not rerun engines merely to retry persistence.

**Acceptance criteria.** Failed automatic saves are visibly unsaved and retryable; recovery stores the original game/results exactly once with no new analysis. Navigation cannot redirect a pending save to the wrong game. Favorites/solved state and cross-tab locks remain correct. Partial cleanup errors do not falsely claim that an already committed review is lost or leave its displayed library stale; known cleanup work stays retryable and cannot delete a game reintroduced by another tab. Leaving a known-unsaved review cannot silently discard its only retained snapshot.

**Confidence and limits.** High confidence in the silent failed write and zero-engine retry control. Frequency of real storage failures is unknown; the test does not modify user browser storage. A complete snapshot/status/close strategy remains unimplemented.

### 3. IR-009 — Keep pending learning saves visible until they recover

**Trigger and impact.** A puzzle completion fails to save because storage temporarily rejects a write. Learning retains a retry callback and initially shows a warning. Navigate to learning home: a successful storage **read** clears `ProgressStore.error`, and the retry banner disappears although the failed completion is still pending. An unrelated successful save has the same effect. Closing and reopening learning discards the in-memory callback, and the completion is absent from saved progress.

**Source.** `lib/learning/progress.js:13` clears `error` on a successful load, and `:19` clears it after any successful update. `lib/learning/workspace.js:217–221` reloads progress on navigation; `:242` displays the retry banner only when `store.error` is truthy; `:278–289` retains failed callbacks separately in `failedChanges`. Puzzle completion is persisted at `:488–493`.

**Reproduced and controlled.** Solve bundled mate-in-one puzzle `000rZ` while the mocked storage rejects `set` with a temporary error. One failed change remains and the banner is initially visible. Restore storage, navigate home, and start a lesson: one failed change still remains, but the warning and retry action are absent. Reopen learning: the completion is gone. Repeat in an independent live workspace and explicitly invoke the existing `retrySave` method after the banner has vanished: the pending count falls from **1 to 0**, and the stored completion count becomes **1**. The retry functionality works; the UI loses track of the pending work.

```powershell
node --test scratch/improvement-review/learning-save-recovery.test.mjs
```

Raw observation: `scratch/improvement-review/learning-save-recovery-results.json`. The fixture uses the real learning workspace, progress store, puzzle validator and retry action. Only bundled puzzle fetch and browser storage are controlled, and the library is reduced to the chosen real puzzle to keep the diagnostic small.

**Proposed direction.** Track unsaved mutations independently of the latest storage operation's error. Keep a retry/status action available while the failed queue is nonempty, even after a successful read or unrelated save. Define orderly retry/draining and how pending changes survive or are clearly surfaced on close; successful reads must not imply successful writes. Avoid replaying already committed puzzle events twice.

**Acceptance criteria.** Navigation and unrelated successful saves do not hide a pending failed completion; recovery stores it exactly once; repeated retries do not inflate solve counts. Pending operations stay visible after partial retry failure. Leaving learning cannot silently discard known unsaved progress. Existing multi-tab learning locks and normal successful saves continue to behave correctly.

**Confidence and limits.** High confidence in lost progress and the working retry control. A transient write error is injected, not a claim about its normal frequency. Keeping the existing retry action reachable is a demonstrated recovery path; a complete journal/close policy is not implemented or validated.

### 4. IR-010 — Make the saved-game library operable with a keyboard

**Severity and impact.** P1 accessibility gap. The library reveal depends on pointer hover. Keyboard focus can enter its controls while the panel stays entirely off-screen, and saved-game cards are click-only divs. A person using Tab/Enter cannot follow the normal saved-game reopening workflow. This is distinct from IR-002's asynchronous selection race.

**Source.** `analysis.js:1459–1469` creates a non-focusable `.lib-tab` div; `analysis.js:5669–5683` creates `.lib-card` divs with only click handlers. `styles.css:1751–1775` hides the panel with `translateX(-100%)` and reveals it only through `.library-rail:hover`.

**Verified in an actual browser.** With unchanged production HTML/CSS/modules served on loopback, Chrome **148.0.7778.217**, viewport **1366×900**, reduced motion enabled: after 19 Tab presses from Settings, the focused “Most recent” button occupies **x=-180 to -17**, entirely outside the viewport; the panel is at **x=-258 to 0**. Moving the pointer to the left rail reveals it at x=0. Both the trigger and saved-game card are `DIV`, `tabIndex=-1`, with no interactive role.

```powershell
node scratch/improvement-review/accessibility-browser.mjs
```

Raw observation: `scratch/improvement-review/accessibility-browser-results.json`. Screenshots: `library-keyboard-hidden.png` and `library-pointer-open.png` in the same directory. The test uses real Tab input and rendered bounding boxes. Storage and extension APIs are isolated fixtures; no installed extension data is touched.

**Focus after library updates.** A second native Chrome diagnostic first exposes the existing hover rail with a pointer, then focuses a favorite button and presses Space. The favorite persists, but `renderLibrary` replaces the focused control and native focus falls to `BODY`, outside the library. Explicitly restoring focus to the replacement favorite control allows a second Space action to toggle it off. This is part of the same keyboard workflow gap, not another backlog item. The identity-aware focus restoration and behavior when a filter removes the focused record remain to be designed.

```powershell
node scratch/improvement-review/accessibility-browser.mjs --library-focus
```

Raw observation: `scratch/improvement-review/library-focus-update-results.json`. No page errors; production modules remain unchanged. `analysis.js:5683–5704` rebuilds library controls/list, including on `updateLibrary` completion.

**Proposed direction.** Provide a focusable, labeled library toggle with explicit expanded state and a stable open/close interaction. Reveal the panel while focus is within it, or keep closed controls out of the tab order until the keyboard toggle opens it. Give each game a native keyboard activation target, separating the favorite action without nesting buttons. Preserve the current visual identity and pointer hover convenience.

**Acceptance criteria.** Using only Tab, Enter/Space and Escape, open the library, see focus, choose a game, toggle a favorite and return to review. Focus never disappears into the translated panel or falls to the page body after an update. Preserve focus by record/action identity when possible; choose a logical next control if filtering removes the active game. Game activation occurs once and remains separate from favorite activation. Verify both supported desktop browsers and narrow layouts.

**Standards and limits.** Relevant criteria are [W3C Keyboard, SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) and [Focus Visible, SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html). These describe keyboard-operable functionality and visible focus; they do not substitute for a complete conformance audit. Screen-reader output, Firefox, touch and the final fix remain untested.

### 5. IR-025 — Provide keyboard input for arbitrary review and practice moves

**Trigger and impact.** Use the review board with a keyboard. Existing shortcuts navigate recorded moves and flip the board, but cannot select a source/destination or type an arbitrary legal alternative. All 64 review squares are static `DIV`s without focus, names or activation handlers. The same board handles mistake-practice attempts. Keyboard users therefore lack the move-entry operation required to explore their own variation or submit those practice answers. Navigating the existing game or replaying an engine line does not provide arbitrary legal move entry. This is distinct from the saved-library and engine-candidate activation defects.

**Source.** `analysis.js:1932–1963` (`buildBoard`) creates unfocusable squares; `:2330–2369` (`initBoardInput`) starts move entry from pointer events; `:2444` (`applyUserMove`) routes to review variations or practice. Global shortcuts at `:5785–5797` provide navigation only. The learning workspace independently provides typed SAN/UCI input in `lib/learning/workspace.js:388–393`; that control is absent from the ordinary review/practice flow. Keyboard-equivalent functionality is the relevant requirement; every board square need not become a separate tab stop. See [W3C keyboard guidance](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).

**Reproduced with a pointer control.** Isolated Chrome **148.0.7778.217**, unchanged review modules and bundled engine, local mock storage and blocked external requests. At the initial position of `1. e4 e5`, the d2 square reports `DIV`, `tabIndex:-1`, no role/name and cannot receive native focus; there are **0 focusable board descendants**. Enter/Space do not open a variation. Pointer clicks on d2 then d4 create the branch and put a White pawn on d4, with no page errors. Code inspection confirms no separate main-review typed move input. This proves the ordinary variation-entry gap; mistake practice shares the pointer entry path, but was not independently browser-exercised in this command.

```powershell
node scratch/improvement-review/accessibility-browser.mjs --board-keys
```

Raw observation: `scratch/improvement-review/review-board-keyboard-results.json`; screenshot: `review-board-keyboard-gap.png` in the same directory. The local UI guidance search returned Keyboard Navigation and unreachable-custom-control guidance; the W3C source above provides the primary requirement.

**Proposed direction.** Provide a discoverable keyboard move-entry equivalent, such as the existing learning workspace's typed SAN/UCI pattern, and route it through the same current-position legality and review/practice ownership checks. If square navigation is also offered, expose coordinate/piece names, selected state and visible focus with a compact focus model. Preserve explicit promotion identity, focus during rerenders, and keyboard shortcuts outside active move-entry controls. Do not add 64 unrelated tab stops merely to make squares focusable.

**Acceptance criteria.** Without a pointer, users can enter a chosen legal move, start/extend a variation, submit a mistake-practice answer, recover from illegal input and choose a promotion. The operation uses the current displayed position and cannot submit into a different game/practice session after navigation. Flipped boards, rerenders, existing move navigation and pointer controls remain correct. Validate ordinary review and practice separately with real keyboard events; include assistive-technology checks before claiming broad accessibility compliance.

**Confidence and limits.** High confidence in the native focus/activation gap and pointer-only arbitrary-variation path. No screen-reader certification or full practice-browser test is claimed. The concrete keyboard design and integrated benefit remain to be verified when implemented; the recommendation restores an operation currently unavailable through the application's keyboard interface.

### 6. IR-016 — Make engine alternatives activatable from the keyboard

**Severity and impact.** P1 accessibility gap in variation exploration. Engine candidates are click-only divs. Mainline navigation shortcuts work, but the second candidate cannot receive native focus or activate through Enter/Space, so keyboard users lack the direct alternative-line exploration action offered to pointer users.

**Source.** `analysis.js:4103–4106` renders each `.engine-line.clickable` as a div with only `onclick: () => playLine(l.pv)`. The review shortcut listener at `:5785–5797` provides position navigation/orientation actions, without a candidate-choice action. Review has no chess-move input field; its board input also depends on pointer interaction.

**Verified in actual Chrome.** In the unchanged production analysis page, enable two candidate lines and let the bundled engine complete its searches. Chrome **148.0.7778.217** reports the second candidate as `DIV`, `tabIndex=-1`, no role. Calling native `focus()` leaves focus on `BODY`; real Enter and Space input does not open a variation. Clicking that same second candidate opens a branch and shows the variation controls. The observed second line was `g3 Nf6`; the exact engine line can vary with the fixture search.

```powershell
node scratch/improvement-review/accessibility-browser.mjs --engine-lines
```

Raw observation: `scratch/improvement-review/engine-keyboard-browser-results.json`. Screenshots: `engine-alternative-before-click.png` (1366×900) and `engine-alternative-narrow.png` (390×844, after pointer activation). Browser page errors: **0**. Only storage/extension APIs are fixtures; production modules, actual engine, native focus and key/pointer input are exercised.

**Proposed direction.** Give every available candidate a native activation control with an accessible line label and visible focus, preserving its existing SAN/evaluation presentation and line-playing behavior. Keep keyboard activation consistent with pointer activation and prevent duplicate activation or focus loss as engine results render.

**Acceptance criteria.** Tab reaches each candidate; Enter/Space activates the chosen alternative exactly once; the resulting branch can be navigated/exited with existing controls. Updated candidates retain a logical focus location and truthful labels. Practice states that intentionally hide answers keep those candidates unavailable. Existing panel sizing and worker cancellation remain correct.

**Guidance and limits.** This directly concerns [W3C Keyboard, SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html). The browser test verifies the specific candidate action, not full accessibility conformance. Firefox, screen-reader announcements and the final native-control implementation remain untested.

### 7. IR-008 — Do not treat an unsearched alternative as a proven bad move

**Trigger and impact.** Review practice promises to accept Best/Excellent moves, including alternatives within two percentage points of the best line's expected result. The default review searches one annotation PV (`classifyLines:1`). `judgePass` immediately rejects any other non-mating move absent from those stored lines, even if it is another excellent choice. Absence from a one-line search does not establish a quality difference. This can force memorization of one engine move and penalize sound alternatives.

**Source.** `analysis.js:321` (default one annotation line), `analysis.js:5447–5460` (`judgePass`, missing-line fallback to `false`). The function's comment asserts that an unlisted move cannot be Excellent; the measured counterexample disproves that inference.

**Measured with the actual bundled engine and real calibration.** From the standard starting position, depth-16 Stockfish 18 produces one stored line, best move `e2e4` at **+35 cp**. A separate cold, restricted depth-16 search of `d2d4` gives **+18 cp**. Using the actual bundled `CALIB.quality.outcome` through the application's own conversion, expected-result loss is **0.907375 percentage points**, below its **2-point** practice threshold. The unchanged judge rejects d4 when only the best line is stored. Adding the separately measured d4 line to the test data makes the unchanged judge accept it. The diagnostic explicitly restores real calibration because the reusable DOM harness otherwise uses a simplified outcome curve.

```powershell
node --test scratch/improvement-review/practice-alternative.test.mjs
```

Raw observation: `scratch/improvement-review/practice-alternative-results.json`. Both searches use the same initial FEN/history, Hash 16, Skill 20, depth 16, cold hash and exact completed evidence. Only stored evidence differs between the two judge calls; no application function is modified.

**Proposed direction.** For a legal attempt absent from stored candidates, obtain bounded, compatible restricted-move evidence before giving quality feedback, or clearly abstain while verification is unavailable. Share already-measured roots and compare at the same position/protocol. Do not broadly raise annotation MultiPV just to improve practice: existing calibration depends on one annotation line. Preserve cancellation when a practice session changes and avoid calling an unknown move wrong merely to retain instant feedback.

**Acceptance criteria.** This measured d4 alternative passes the intended threshold; a separately measured inferior move fails; unsupported, failed or canceled searches do not count as incorrect guesses. Stored top moves remain instant. Practice judging does not alter original review scores or silently use incompatible engine protocols. Preserve promotion identity as specified in IR-007.

**Confidence and limits.** High confidence in the judge counterexample and default evidence gap. The fixture directly exercises the judge at the starting position; it is not a full browser recording of entering a classified practice spot. Search noise and SF19's distinct protocol need explicit treatment in the final design. No production fallback search or UI behavior has been implemented.

### 8. IR-007 — Preserve legal promotions in review and practice

**Trigger and impact.** In review mistake practice, move a pawn to its promotion square when the best move is an underpromotion. `practiceAttempt` always chooses a queen, and `judgePass` compares only the first four UCI characters for the engine's best move. A queen and rook promotion from the same square are therefore accepted as identical even when their outcomes differ. This can teach the exact mistake practice is intended to correct and mark the exercise successful.

**Source.** `analysis.js:5447–5460` (`judgePass`, best-move comparison using `.slice(0,4)`) and `analysis.js:5462–5473` (`practiceAttempt`, hard-coded `promotion: "q"`). Main review classification already preserves promotion identity; its tests do not exercise this practice shortcut.

Ordinary review board entry at `analysis.js:2444–2459` (`applyUserMove`) independently hard-codes queen promotion. Its next-mainline shortcut compares source/destination without promotion identity. In contrast, `playLine` at `:2488–2517` preserves the UCI promotion suffix, and paired-score reuse has promotion-aware regression coverage. The proposed interaction should preserve those working paths rather than changing numerical classification.

**Reproduced with the actual bundled engine.** Position `8/k1P5/2K5/8/8/8/8/8 w - - 0 1` (White king c6, pawn c7; Black king a7). Stockfish 18 Lite WASM at depth 16 chooses **`c7c8r`, mate in 2**. Restricted search of **`c7c8q` scores 0 cp**; the chess rules library confirms immediate stalemate after queen promotion. The real practice judge nevertheless accepts `c7c8q`, and the real `practiceAttempt('c7','c8')` marks the attempt successful by setting `solving` false.

```powershell
node --test scratch/improvement-review/practice-promotion.test.mjs
```

Raw observation: `scratch/improvement-review/practice-promotion-results.json`. The diagnostic bridges the real engine worker protocol to the repository's existing Node engine host. It uses authored legal setup-FEN PGN `[SetUp "1"]\n[FEN "8/k1P5/2K5/8/8/8/8/8 w - - 0 1"]\n\n1. c8=Q 1/2-1/2`, then supplies the real engine root to the unchanged application practice functions. No external game or online engine was used.

**Ordinary-review reproduction and positive replay control.** The exact `applyUserMove` path creates `c8=Q` and stalemate in the White fixture; mirrored Black fixture `8/8/8/8/8/2k5/K1p5/8 b - - 0 1` creates `c1=Q` and stalemate. Both use a different legal recorded king move so the board move enters a variation. Rook-choice rules controls avoid stalemate, and the actual existing `playLine` operation replays the full rook UCI correctly in both positions. A third ordinary queen-promotion fixture remains legal and does not stalemate. These DOM diagnostics stub live engine scheduling only; the original White fixture above supplies the retained real-engine winning-move evidence, and no new Black mate-distance claim is made.

```powershell
node --test scratch/improvement-review/review-promotion.test.mjs tests/variation-classification.test.mjs
```

Three new diagnostics and nine existing variation/classification controls passed. After adding the explicit engine-line replay control, the three diagnostics passed again. Raw observation: `scratch/improvement-review/review-promotion-results.json`.

**Proposed direction.** Compare the full legal UCI move including promotion. Let ordinary review and practice users choose queen/rook/bishop/knight when a pawn promotes; a judge comparison fix alone would leave the winning underpromotion impossible to enter through the board. Preserve normal queen promotion as a convenient default while making the other legal pieces reachable through pointer and keyboard interaction. Evaluate alternative promotions using actual evidence and resulting terminal status. Retain the working full-UCI engine replay and promotion-aware paired-score reuse.

**Acceptance criteria.** In this fixture, `c7c8q` is not labeled the winning best move or counted as a correct solution; `c7c8r` is selectable and accepted. Review and practice entry support both colors, correct queen promotion and knight underpromotion. A chosen promotion matches the recorded mainline only when its complete move identity matches; otherwise it creates the intended variation. Promotion identity survives feedback, replay, paired-score reuse and success bookkeeping.

**Confidence and limits.** High confidence: legal rules, real engine evidence and application behavior agree on the defect. Underpromotion positions are less frequent than ordinary moves, but incorrect practice feedback directly undermines learning trust. The final interaction and fix have not been implemented or tested.

### 9. IR-002 — Prevent older library clicks from replacing the latest choice

**Trigger and impact.** Click saved game A and then B while A's stored analysis read is delayed. B opens first; when A's read completes, A replaces B. The tab's session recovery payload is also changed to A, so refreshing retains the unintended selection. Replacing a game also starts or restores its analysis, wasting work when the selection is stale.

**Source.** `analysis.js:5618–5629` (`openLibraryGame`) awaits `storage.local.get` before calling `applyGame`, without checking whether a newer library selection superseded it. `applyGame` at `analysis.js:5963` owns teardown, state replacement and session recovery. Existing worker generation guards do not guard this earlier selection lookup.

**Reproduced.** Uses the existing application DOM harness and real `openLibraryGame`, `applyGame` and session storage. Only analysis startup and storage latency are controlled. Click order `[A,B]`, storage response order `[B,A]`, game after B resolves `B`, final game `A`, reload-session game `A`.

```powershell
node --test scratch/improvement-review/library-navigation.test.mjs
```

Raw observation: `scratch/improvement-review/library-navigation-results.json`. The fixture opens `1. d4 d5` as A and `1. c4 e5` as B, delays only the `analysis:A` read with a deferred promise, awaits B, then releases A. The passing diagnostic asserts the current **incorrect** final state; it is not a regression test asserting the desired behavior.

**Proposed direction.** Give each user selection a request generation and check it after the analysis lookup, before changing the game. Include other game-opening actions and selecting the already-displayed game so these can cancel pending selections too. Retain the existing worker cancellation mechanisms.

**Acceptance criteria.** A/B with either response order finishes on B; A/B/current-game selection finishes on the user's final choice; stale requests do not start analysis or overwrite session storage; storage read failures still open the latest requested game with fresh analysis.

**Confidence and limits.** High confidence in deterministic reproduction. The fixture injects response reordering; its frequency in real browser storage has not been measured. No fix has been implemented.

### 10. IR-005 — Manage helper-engine startup as an owned, cancellable resource

**Trigger and impact.** Repeated threat renders arrive while the helper engine is starting. `getHelperEngine` assigns `S.helperEngine` only after `await createEngine`, so concurrent calls each start an engine. The later completion overwrites ownership of the earlier worker without terminating it. Switching games or changing engine settings while startup is pending also cannot dispose an engine that has not been assigned yet; it can appear in the new state after teardown. A dead assigned helper is returned without a liveness check, potentially preventing threat recovery.

**Source.** `analysis.js:2230–2235` (`getHelperEngine`); helper teardown in `applyGame` at `analysis.js:5974` and engine setting/reset paths. Contrast existing `ensureLiveEngine` at `analysis.js:2684`, which already shares startup promises and validates a generation.

**Reproduced.** With two deferred `createEngine` results, simultaneous helper requests start **2 engines**, only the second remains assigned, and the first remains live. In a separate real `applyGame` fixture, begin helper startup, switch to another game, then resolve the old startup: the old engine becomes the new game's helper and has not been terminated.

```powershell
node --test scratch/improvement-review/helper-lifecycle.test.mjs
```

Raw observations: `helper-startup-results.json`, `helper-switch-results.json` and `helper-crash-results.json` under `scratch/improvement-review/`. Engine objects are controlled boundary doubles; state ownership, startup function and game-switch teardown are the actual application code. A separate crash fixture also confirms `getHelperEngine` returns the same terminated helper with **0 recovery startups**.

**Proposed direction.** Share one helper startup promise, validate a generation before assignment, terminate superseded results, and recreate helpers that are dead. Centralize helper reset across game switches and setting changes so every pending or assigned worker is accounted for. Preserve the helper's independence from the main review batch and variation engine.

**Acceptance criteria.** Concurrent requests share one startup; a game switch/settings reset disposes stale startup results; old completions cannot overwrite a newer helper; a crash permits a subsequent clean startup. Startup errors reject callers without leaving retained rejected promises or orphan workers.

**Confidence and limits.** High confidence in resource-ownership, stale-startup and dead-helper reuse defects. Two workers versus one is an observed startup-count difference, not a measurement of actual browser memory, CPU, battery use or speed. No production change was made.

### 11. IR-014 — Bound stalled imports and make network recovery actionable

**Severity and impact.** P2 reliability gap in a core entry path. Platform fetches have no application abort/deadline signal. When a request stays unresolved, manual import remains busy with its submit button disabled and no in-flow cancel action. Users must close/reopen the popup or wait for the browser/network to fail on its own. On Chess.com, a rejected fetch also becomes a generic archive “not found” message, which obscures the actual recovery action.

**Source.** `lichess.js:61` and `chesscom.js:59,126` call `fetch` without a signal. `popup.js:99–141` disables the manual button until the awaited flow settles. Chess.com search catches current/previous-month failures and returns `null` at `chesscom.js:155,161`; the popup then reports absence from the archive. This overlaps the failure path in IR-003, but addresses request lifetime and feedback rather than reuse of cached archive contents.

**Reproduced in both real popup flows.** Use the actual popup script, production import helpers and DOM, with only storage/tab/network boundaries controlled. Leave the first platform fetch unresolved; advance Node's mocked global timers by **180,000 ms**. Lichess still displays “Fetching game from Lichess …”; Chess.com still displays “Searching your archive …”. In both cases, the manual button remains disabled, **1 request** is pending, and fetch options contain **no AbortSignal**. Explicitly reject that request: both buttons recover. The Lichess message exposes the injected network failure; Chess.com instead says the game could not be found in the archive.

```powershell
node --test scratch/improvement-review/import-deadline.test.mjs
```

Raw observations: `import-deadline-lichess-results.json` and `import-deadline-chesscom-results.json` under `scratch/improvement-review/`.

**In-page retry overlap.** Both site buttons reset their disabled/busy cue unconditionally after five seconds (`content.js:271–284`, `lichess-content.js:188–201`). The real background handler (`background.js:26–30`) is still awaiting its import. With one pending platform request, advance only the content button's five-second timer and click again: each site starts **2 requests**, eventually opens **2 review tabs**, and creates **2 distinct handoff jobs**. This extends the same request-lifetime/retry recommendation; the UUID handoff correctly keeps the payloads distinct and is not itself a collision defect.

```powershell
node --test scratch/improvement-review/content-request-overlap.test.mjs tests/analyze-flow.test.mjs
```

Result: **11 passed** (four diagnostic/control cases plus seven existing flow controls). The fixture executes actual content scripts, actual background message handler and production import/tab-opening helpers, with only browser/network/timer boundaries controlled. Raw observation: `scratch/improvement-review/content-request-overlap-results.json`. A scratch message-boundary adapter reuses the in-flight request for the same fixed fixture: **1 lookup / 1 tab / 1 job**, while a deliberate post-completion click still opens a new review using the existing cache with **0 new network requests**. The adapter is not a complete identity-aware cancellation implementation, and no real platform latency was measured.

**Proposed direction.** Give an import a finite, documented request/overall budget and/or an explicit cancel action that aborts its pending fetches. Tie in-page busy/retry behavior to real request ownership; coalesce repeated requests for the same still-pending game or cancel/replace them deliberately. Preserve serial request policy, later intentional reviews and cache fallback. Separate network/time-limit/canceled outcomes from a confirmed archive miss, and expose an actionable retry state. Discard late completions after cancellation so they cannot unexpectedly open a review tab or overwrite status.

**Acceptance criteria.** A stalled fetch reaches a recoverable state within the chosen budget; cancel stops pending requests and permits a new import without a late tab opening. Repeated clicks during one same-game request do not multiply lookups or surprise-open duplicate reviews; a later deliberate review still works. Changing games in a tab is a new intent and cannot accidentally join an older game's request. Successful slow imports inside the budget still work. HTTP 404/no-match, throttling, transient network failure, user cancellation and timeout have appropriate distinct handling. Cached valid games remain usable under IR-003's policy.

**Confidence and limits.** High confidence in the missing application bound, disabled UI and error conflation. This is a controlled unresolved-fetch test, not a measurement of real platform latency or browser-managed timeout behavior. The best budget and cancel interaction require validation; a short arbitrary timeout could harm slow but successful lookups and is not recommended as an untested universal fix.

### 12. IR-022 — Report and recover required calibration-data failures accurately

**Severity and impact.** P2 startup/recovery gap. `loadCalibration` catches a resource failure, replaces the required model with `{}` and caches that truthy object. The tested default calibrated review then fails on missing model fields and reports **“the engine stopped responding.”** Even if the resource becomes available, the loader and Retry analysis path keep reusing the empty object, start another engine and fail again. The user is directed toward the wrong cause and cannot recover through the provided retry.

**Source.** `analysis.js:45–49` (`loadCalibration` caches `{}`); `:3371–3376` retries only `startAnalysis`; `:5917–5933` categorizes coordinator exceptions as engine failure. `lib/calibrated-search.js` requires calibration quality/context/moves model fields after engine searches. Opening-book fallback is intentionally optional and is a separate behavior.

**Reproduced with recovery control.** Fail the calibration fetch once, then restore the resource. In a standard-position NNUE/depth-16 fixture, two analysis attempts start **2 engines**, both stop with missing `candidateVersion` errors, and the UI says the engine stopped responding. Calling `loadCalibration` again does not fetch: count remains **1**. Clear only the cached failed loader value in the diagnostic, invoke the existing loader and retry: fetch count becomes **2** and analysis completes successfully. The engine boundary never crashes in this test.

```powershell
node --test scratch/improvement-review/calibration-load-recovery.test.mjs
```

Raw observation: `scratch/improvement-review/calibration-load-recovery-results.json`. The engine and fetch boundaries are controlled; production loader, coordinator, retry/analysis and UI state are exercised.

**Proposed direction.** Validate required calibration data before numerical analysis and represent missing/invalid data as a distinct recoverable resource error. Do not cache a failed empty model as a successful load. The retry action should reload/validate the resource before restarting work and preserve the user's game/session. Avoid substituting unsupported numerical defaults to hide failure.

**Acceptance criteria.** Missing, unreadable or structurally invalid calibration yields an accurate resource message and actionable retry. A restored valid resource is fetched and completes the original review without a page-state reset. Failed loads never enable fabricated scores or save invalid analyses as complete. Real worker errors remain separately recoverable, and optional opening-book/coach fallback behavior remains appropriate.

**Confidence and limits.** High confidence for the controlled standard-position/default-protocol failure. Frequency of real packaged-resource failures is unknown; this does not establish a corrupt release package. Other settings may surface missing data differently. A complete runtime schema/retry design has not been implemented.

### 13. IR-023 — Clean up canceled board drags and define touch gesture ownership

**Trigger and impact.** Begin dragging a piece on a touch-enabled review board, then let the browser cancel the pointer stream. A vertical gesture in touch-emulated Chrome produces this cancellation naturally. The original piece remains hidden and its floating clone remains on-screen after the finger lifts. Starting another gesture creates a second ghost; a later ordinary release eventually cleans up both. Until then, the board misrepresents the piece position and retains the canceled drag's window listeners.

**Source.** `analysis.js:2385–2439` (`startDrag`) has an idempotent cleanup/cancel routine but subscribes only to `pointermove`, `pointerup` and `contextmenu`. It never handles `pointercancel`. `styles.css` specifies `touch-action:none` for color pickers, but no board touch policy. The adjacent right-button markup interaction at `analysis.js:2370–2383` similarly waits only for release; review it under the same lifecycle contract rather than assuming its consequences match this reproduction. Browsers may suppress a pointer stream when taking over direct manipulation; cancellation does not promise a later release event. See [Pointer Events cancellation](https://www.w3.org/TR/pointerevents3/#the-pointercancel-event).

**Reproduced with a cleanup control.** Isolated Chrome **148.0.7778.217**, unchanged production review modules and bundled engine, touch emulation at 390×844, loopback fixture storage, all external requests blocked. Native CDP touch events generate `pointerdown` then `pointercancel`, with no `pointerup` for that stream. Both explicit cancellation and a vertical touch movement leave **1 ghost / original visibility hidden**. The next gesture creates **2 ghosts**. A scratch-only event adapter routes cancellation through the existing context-menu cancel handler: **0 ghosts / original visible / no variation opened**, and the next gesture creates only its own single ghost. Ordinary release cleans up in both cases.

```powershell
node scratch/improvement-review/accessibility-browser.mjs --drag-cancel
node scratch/improvement-review/accessibility-browser.mjs --touch-pan
node scratch/improvement-review/accessibility-browser.mjs --touch-pan --cancel-cleanup-control
```

Raw results: `scratch/improvement-review/board-touch-cancel-results.json`, `board-touch-pan-results.json` and `board-cancel-control-results.json`. Screenshots: `board-native-pan-cancel.png` and `board-cancel-control.png` in the same directory. The event adapter is a diagnostic control, not a proposed production implementation.

**Proposed direction.** Give each active drag an owning pointer and one idempotent cleanup path for release, cancellation and relevant teardown. Cancel without making a move; remove listeners/ghost/highlights and restore the original piece. Define board gesture handling deliberately so a piece drag and page panning do not compete unpredictably. Preserve scrolling outside the board and the existing click-to-move alternative. Do not blindly dispatch context-menu events in production; connect the actual cancellation event to the owned interaction directly.

**Acceptance criteria.** Native canceled touches immediately restore the board and leave no ghost, hover marker or retained active interaction. A new pointer cannot finish or move an older canceled drag. Ordinary legal/illegal drag releases, click-to-move and right-click cancellation still work. Game changes, board rebuilds and interrupted gestures cannot apply a stale move. Verify on desktop mouse and physical touch hardware, including scrolling outside the board and the intended board gesture policy.

**Confidence and limits.** High confidence in the native cancellation defect and cleanup benefit in this Chrome fixture. Touch emulation is not physical Windows/Android hardware coverage; no claim about real-user frequency, supported mobile extension distribution or every interruption path is made. The control verifies cleanup only, not a complete gesture-policy implementation.

### 14. IR-013 — Do not relabel cached engine lines after a build/settings change

**Severity and impact.** P2 display-integrity gap. Start reanalysis after changing engine or depth at the same game position: the panel can retain lines from the previous configuration while its header already names the new build/depth. Users can mistake old evidence for a fresh result from their selected configuration. Original numerical review scores remain separate; this finding does not establish scoring-model corruption.

**Source.** `analysis.js:4061–4092` (`renderEngine`) keys `_lastEngineLines` only by FEN and search history. `startAnalysis` at `:5830–5849` clears current roots and `_panelCache` but not `_lastEngineLines`, then renders the engine panel. Build/depth labels use current settings/active engine state.

**Reproduced.** Render a marker line `+7.77`, PV `e2e4 e7e5`, as Stockfish 18 at depth 16. Accept a new SF19 Lite/depth-20 preference and enter the real `startAnalysis` while its engine startup is deferred. The panel reads **“Stockfish 19 Lite · depth 20 +7.77”** even though that line came only from the previous configuration and no new engine has returned evidence. The position and history remain identical, so the current cache key accepts it.

```powershell
node --test scratch/improvement-review/engine-display-cache.test.mjs
```

Raw observation: `scratch/improvement-review/engine-display-cache-results.json`. The marker score is deliberately synthetic to make stale reuse unambiguous; real application cache/render/startup code is exercised. This is a display-cache fixture, not a numerical engine comparison.

**Proposed direction.** Associate displayed cached lines with configuration/build and analysis generation, or clear them when those inputs change. While waiting, show a truthful pending state or explicitly identify retained results as previous-config evidence. Keep harmless reuse for unchanged position/history/configuration and the existing stable panel sizing.

**Acceptance criteria.** Switching build, depth, hash/skill or other search-relevant configuration cannot display old lines as newly computed results. Same-config navigation reuse remains correct and bounded. Pending and failed reanalysis preserve truthful labels, panel height and recovery controls. Original game scoring and cache admission stay unchanged.

**Confidence and limits.** High confidence in the stale relabeling behavior. The fixture inspects the actual DOM with controlled worker startup, not rendered Chrome pixels. Final key choice, loading copy and browser integration have not been implemented or tested.

### 15. IR-011 — Give Credits proper modal focus and keyboard ownership

**Severity and impact.** P2 interaction/accessibility gap. Credits visually covers and blurs review, but focus stays on its opener behind the overlay, subsequent Tab reaches another background control, and ArrowRight changes the reviewed move behind the dialog. Keyboard users can unintentionally navigate the game rather than read or operate Credits.

**Source.** `analysis.js:5036–5093` (`openCredits`) creates a `role="dialog"` card but does not focus it, contain Tab, make the background inert or restore the previous focus on close. Its key listener handles Escape only. The global review shortcut listener at `analysis.js:5785–5797` remains active.

**Verified in the same browser pass.** Open Credits from the real toolbar button. Focus remains on the toolbar opener; the card has no `aria-modal`; `.app.inert` is false. Press Tab: focus remains outside the card. Press ArrowRight: selected move changes from **0 to 1** while Credits is still open. Screenshot: `scratch/improvement-review/credits-focus-outside.png`.

```powershell
node scratch/improvement-review/accessibility-browser.mjs
```

**Proposed direction.** Treat the visually modal overlay as a complete modal interaction: initial focus in the content, contained forward/reverse tab sequence, inactive background and suspended review shortcuts, Escape/close button dismissal and focus restoration. Reuse the already stronger learning/calibration dialog behavior where appropriate. Adding `aria-modal` alone does not provide these behaviors.

**Acceptance criteria.** Opening Credits moves focus to an appropriate visible element; Tab/Shift+Tab stay in the dialog; review position/orientation do not change from background shortcuts; Escape and the close control restore focus to the opener; content links remain reachable and visibly focused.

**Guidance and limits.** [W3C's modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) describes focus entry/containment/restoration and inert background behavior. The browser reproduction establishes this particular interaction gap; assistive-technology announcements, all other overlays and the final fix are not verified.

### 16. IR-003 — Use the previous-month archive already in storage

**Trigger and impact.** A previous-month archive was cached while looking up a different game. A later lookup of another game in that same archive fetches the current month and previous month again instead of checking the cached archive. If the current-month request fails, the lookup returns `null` even though the desired finished game is already in storage.

**Source.** `chesscom.js:153–164`: current-month errors return early, and the previous month is always fetched. The deep-search cache lookup at `chesscom.js:170–180` excludes both months using `done`. `gamecache.js:65` already provides `getCachedMonth`. Direct per-game cache hits at `findGameById` continue to work; the gap concerns another game contained in a cached month.

**Reproduced.** Seed the deterministic previous-UTC-month archive for user `example` with `{url:'https://www.chess.com/game/live/12345678', pgn:'[Result "1-0"]\n\n1. e4 e5 1-0'}` using `setCachedMonth`. Do not seed the per-game cache. With a successful empty current month, lookup performs **2 network requests**, including a redundant request for the cached previous month. With current month HTTP 403, lookup returns **not found after 1 request**, while the cached archive still contains the game.

```powershell
node scratch/improvement-review/storage-import.mjs
```

Raw observations: `previousMonthCachedOnline` and `previousMonthCachedCurrentFailure` in `scratch/improvement-review/storage-import-results.json`. All network replies are fixtures; no platform account or live API is used. Month URLs derive from the current UTC date, so the diagnostic is reusable.

**Proposed direction.** Check known immutable monthly cache contents for a positive match before unnecessary network work, at least for the previous month. Continue searching usable cache/other archives when a particular month fails. Keep network requests serial and bounded, preserve retry handling, and never freeze the current growing month. Broader cache-first lookup should not let a cached negative prove a game cannot exist elsewhere.

**Acceptance criteria.** This positive cached-previous-month fixture returns the identical PGN with **0 network requests** and remains usable when fetch rejects. Cache misses still search fresh data. The current growing month remains uncached. Invalid/empty caches and failed individual months do not suppress otherwise available games.

**Confidence and limits.** High confidence in redundant requests and early-abort behavior. Zero requests is a proposed acceptance target, not a measured shipped fix. End-to-end latency, live API error handling and browser import behavior require validation after implementation.

### 17. IR-015 — Make share-fragment delivery event-driven and recoverable

**Severity and impact.** P2 reliability gap in sharing. Both platform content scripts inspect `#gambit` only immediately and once 1.2 seconds later. A valid fragment arriving afterward in an existing document is left unprocessed. They also remove the valid fragment before sending it to the background, so a failed extension handoff leaves nothing in the current URL for a reload to retry. Users can still revisit their original complete link; this is not a claim of permanent loss of the source PGN.

**Source.** `content.js:174–189` and `lichess-content.js:85–99` (`handleShareFragment` and startup timer). `background.js:24–29` starts `openAnalysisTab` for `openShared` without awaiting it or acknowledging that the analysis tab was successfully created.

**Reproduced on both platform scripts.** Execute the real content script and its scheduled 1.2-second check, then set a valid encoded PGN/metadata fragment and dispatch `hashchange`: **0 automatic opens**. Explicitly invoke the existing handler with the same fragment: **1 openShared message**, proving parsing is valid. In separate fresh-load fixtures, reject the `openShared` message: the valid fragment has already been removed. Positive controls confirm a removed review button is reinjected exactly once and an existing busy button stays busy through unrelated DOM mutation.

```powershell
node --test scratch/improvement-review/content-lifecycle.test.mjs
```

Raw observations: `scratch/improvement-review/content-lifecycle-results.json`. Payloads are authored test PGNs. The failure stub attaches a rejection observer to keep the diagnostic process stable; it does not add recovery to the content script.

**Proposed direction.** Listen for relevant later fragment changes and coordinate an in-flight share handoff. Have the background acknowledge successful storage/tab creation, and clear the carrier fragment only after success. Keep or surface retryable data on rejection; deduplicate the immediate check, delayed check, hash event and repeated delivery so one payload opens one review.

**Acceptance criteria.** Valid initial and later same-document fragments each open exactly once. Failure to send, store or create a tab retains a recoverable original payload; retry succeeds without duplicate tabs. Invalid fragments fail safely. Existing board orientation/player metadata and privacy behavior remain intact on both sites.

**Confidence and limits.** High confidence in the script event/handoff gaps under these DOM/runtime fixtures. Actual platform SPA navigation, extension reload behavior and background acknowledgement integration have not been browser-tested. A normal fresh document with a valid initial fragment is already handled; the improvement targets later changes and failed delivery.

### 18. IR-026 — Restore saved player identity independently of current username

**Trigger and impact.** Save an identified Black-side review, change the configured username, then reopen that game from the library in a review using the new username. The library record retains `meSide:'b'`, `myName:'Bob'` and personal result `win`; reopening keeps Black at the bottom but recomputes `meSide:'w'` from the current username. With an unrelated username it also loses the identified-player state; with the old opponent's username it identifies the opponent instead. `myResult()` now reports `loss` for the same saved game. Practice and personal review fields use `S.meSide`, so preserving orientation alone does not reproduce the saved review perspective.

**Source.** `analysis.js:5596–5603` stores `meSide` and `myName` separately on the library record. `:5618–5628` (`openLibraryGame`) forwards the old metadata and derived flip, but not the stored player's identity. `:830–841` (`derivePlayers`) consults `meta.myName` or current username; `:6005–6009` adopts its side/known state. `practiceSpots` at `:5274–5282` selects moves by `S.meSide`. The library opener explicitly intends to reproduce the perspective with which the game was saved.

**Reproduced with an explicit-identity control.** Use the actual save/open/apply/session functions with an authored legal Alice-vs-Bob PGN ending `0-1`. Save as identified Bob/Black, then reopen under Carol and separately Alice. Both reopen as White while flipped Black; their personal result is `loss`. Carol is unidentified; Alice becomes the identified player. Passing the original known Bob identity through the existing supported `meta.myName` field restores Black/known/win and remembers that identity in the tab session.

```powershell
node --test scratch/improvement-review/library-perspective.test.mjs tests/review-session.test.mjs
```

Result: **7 passed** (two perspective diagnostics, one anonymous-record boundary control and four existing session controls). Raw observation: `scratch/improvement-review/library-perspective-results.json`. Actual production DOM/application functions run with isolated storage; analysis scheduling is stubbed because this diagnostic concerns saved metadata, not numerical evidence or engine timing.

**Anonymous/legacy boundary.** An anonymous Alice-vs-Bob import saved under unrelated Carol still writes `myName:'Alice'` but does not retain `playerKnown:false`. Blindly forwarding every old record's `myName` would manufacture known identity for this case; the boundary control demonstrates that false identification. The explicit-identity recovery control above is valid for the originally known Bob fixture, not a complete migration policy for all existing records.

**Proposed direction.** Persist identified-player state separately from board orientation and display labels, then restore that state when opening a saved review. Preserve anonymous imports explicitly. Define conservative legacy handling for records that lack ownership provenance; do not infer a participant from flip alone or unconditionally treat `rec.myName` as a verified user. Reuse the restored identity in session recovery, practice and any later save, with a deliberate user action if changing the review's participant is supported.

**Acceptance criteria.** Known White and Black saved reviews retain their player/side/personal result after changing or clearing the configured username, including when the new username matches the opponent. Board flip remains independently changeable. Anonymous records remain anonymous; ambiguous legacy records do not invent ownership. Session reload, practice-side selection and subsequent saving preserve the intended known/unknown perspective. No raw engine score or game-result header changes are needed.

**Confidence and limits.** High confidence in the saved/opened metadata mismatch and recovery through the existing explicit identity field. Actual practice answer submission and later resaving were not browser-exercised here; their shared side dependency is source evidence. Username-change frequency and a safe complete legacy migration remain unmeasured/unimplemented.

### 19. IR-027 — Preserve settings-control focus across preference updates

**Trigger and impact.** Open Settings → Sound with the keyboard focused on On, then press Space. Sound saves correctly, but the panel rebuild removes the focused button and native focus falls to the page body. Continuing through settings now requires finding the panel again. This is a separate component from IR-010's library rerender, and is not a persistence failure: the preference itself is stored.

**Source.** `analysis.js:5095–5108` (`setSetting`) rerenders visible settings after saving. `:4804–4828` (`renderSettings`) replaces all panel children and restores focus for specific font, label-style, section-header and concept-toggle controls; ordinary setting buttons are omitted. Existing section-header focus restoration already demonstrates the intended continuity for another settings control.

**Reproduced with a focus control.** Native Chrome **148.0.7778.217**, unchanged production modules and isolated browser/storage fixture. Space on Sound On persists `sound:true`; the active element becomes `BODY` with focus outside Settings and no page errors. A scratch browser action restores focus to the equivalent replacement On control: Tab reaches Off, and Space persists `sound:false`. This control verifies keyboard continuation, not a general integrated focus implementation.

```powershell
node scratch/improvement-review/accessibility-browser.mjs --settings-focus
node --test tests/settings-preview.test.mjs
```

Browser diagnostic and **6 existing tests passed**. Raw observation: `scratch/improvement-review/settings-focus-update-results.json`. Existing tests retain section-header focus, preview behavior and custom-picker persistence. The initial scratch browser script had a syntax typo before it executed; corrected in the ignored diagnostic, then the native scenario and control passed. No production source changed.

**Proposed direction.** Retain mounted controls when feasible, or remember/restore stable setting-and-option identity across the panel rebuild. Reuse existing focus restoration conventions without matching only visible text: many settings contain identical On/Off labels. Preserve scroll and selection state and provide a deliberate fallback when an option disappears. Keep pointer-triggered updates from stealing focus from another active control.

**Acceptance criteria.** Keyboard activation of ordinary visual/audio toggles retains focus on the equivalent control and supports the next Tab/Space action. Switching settings sections/tabs, dependent options, resets and async writes have logical focus behavior. Existing font/label/header/concept focus restoration, picker input, slider dragging and preview tests remain correct. Validate both supported desktop browsers; the current reproduction covers the Sound toggle in Chrome only.

**Confidence and limits.** High confidence in the measured focus drop and restoration control. The shared rerender path suggests other ordinary buttons are affected, but they were not individually browser-tested and no universal accessibility certification is claimed. The complete focus strategy remains unimplemented.

### 20. IR-017 — Preserve distinct imports when their short IDs collide

**Severity and impact.** P2 data-integrity gap with unknown normal frequency. PGN imports without a platform `gameId` use a 32-bit hash as their sole identity. Two different valid PGNs can share it, causing the newer save to replace the older library entry and stored analysis; favorite state can also transfer between them. The current strict PGN check on analysis restoration does not prevent the earlier overwrite.

**Source.** `analysis.js:5517–5521` (`simpleHash`), `:5543–5545` (`currentGameId`), `:5586–5616` (`saveToLibrary` merges/replaces solely by ID), `:5618–5619` (`openLibraryGame` skips an ID equal to the current game's ID).

**Reproduced with exact legal fixtures.** Import `[Event "Aa"]\n[White "Alice"]\n[Black "Bob"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, then the identical movetext/players with `[Event "B@"]` instead. The real PGN parser accepts both. Both IDs are **`pgn:8mk3hj`**. After saving the second, only **1 library entry** remains, the first analysis is replaced by the second PGN and its favorite flag transfers. Trying to open a retained copy of the first record is skipped because its ID matches the current one. Supplying distinct explicit fixture IDs through the unchanged save path retains **2 entries and both analyses**.

```powershell
node --test scratch/improvement-review/library-identity.test.mjs
```

Raw observation: `scratch/improvement-review/library-identity-results.json`. The library is far below its capacity and writes are sequential, excluding eviction and concurrent-write races as causes. The event-header pair is deliberately chosen to demonstrate a collision; it is not evidence of typical user collision frequency.

**Proposed direction.** Use a stronger content identity and verify exact PGN equality before treating an existing ID as the same game. Resolve detected collisions rather than overwriting unrelated records. Plan a backward-compatible identity migration so existing analyses, favorites, solved state and session recovery remain reachable; a stronger hash alone should not justify skipping content checks.

**Acceptance criteria.** Both exact fixtures retain separate records, analyses and favorites. Each can be opened while the other is active. Reimporting the same PGN still deduplicates intentionally. Existing library IDs migrate without losing references or state, and normal capacity eviction remains bounded.

**Confidence and limits.** High confidence in the exact collision and overwrite. No census of real user libraries or probability-based prioritization was performed. This is ranked below broadly reachable workflow defects because the demonstrated pair is deliberately constructed.

### 21. IR-006 — Keep threat arrows off after an in-flight request finishes

**Trigger and impact.** Enable threat arrows, let a search begin, then disable the feature before the search resolves. The disable render clears the arrow and returns without invalidating `_threatToken`. The earlier result checks its token and learning state, but not whether threats are still enabled, so it draws the arrow again despite the saved preference being off. The same validity gap warrants checking practice entry, line walks and other hidden states.

**Source.** `analysis.js:2249–2281` (`renderThreatArrow`): the disabled-state return precedes token advancement; post-await guards omit the current feature flag.

**Reproduced.** Build the real board with `1. e4 e5`, select the post-e4 position, inject a deferred helper search, set `showThreat` false and render, then release Black's `e7e5` result. Before release there are **0** `.threat-arrow` elements; afterward there is **1** while `showThreat` remains **false**.

```powershell
node --test scratch/improvement-review/helper-lifecycle.test.mjs
```

Raw observation: `scratch/improvement-review/threat-disable-results.json`.

**Proposed direction.** Invalidate obsolete work whenever the arrow becomes ineligible, and validate enabled/current game/current board/search history after each asynchronous boundary. Keep this change distinct from helper resource ownership: canceling visibility does not itself dispose a worker or share startup.

**Acceptance criteria.** Off remains visually off after late search completion; practice and line-walk entry cannot show a stale arrow; switching games or rebuilding the board does not attach an arrow to an obsolete board. Re-enabling still permits a valid cached or newly computed arrow.

**Confidence and limits.** High confidence in the off-toggle case, verified against the real DOM renderer with controlled search latency. Other hidden states are acceptance targets, not reproduced findings yet. No browser rendering or fix validation has been performed.

### 22. IR-004 — Keep cache eviction indexes consistent

**Trigger and impact.** Two extension contexts write game or month cache entries while each has read the same old index. Payloads are stored under distinct keys, but the last index write omits another writer's key. Omitted entries survive without participating in eviction. The advertised limits of 1,000 games and 60 monthly archives no longer bound actual stored payloads. This concerns fetched-game caches, not the already-locked saved review library or learning progress.

**Source.** `gamecache.js:34–50` (`setCachedGame`) and `gamecache.js:76–89` (`setCachedMonth`) independently perform read/modify/write on shared index keys. Both are called without awaiting completion from platform import helpers. `unlimitedStorage` does not make unintended growth desirable.

**Measured comparison using unchanged production functions.** In-memory storage returns structured clones, as required for an isolated snapshot. A deliberate concurrent stress fixture retains **1,005 game payloads with 1 indexed key**, exceeding the 1,000 cap, and **65 month payloads with 1 indexed key**, exceeding the 60 cap. Scheduling the same production calls serially retains exactly **1,000/1,000** game payloads/index keys and **60/60** month payloads/index keys. Two overlapping new writes are sufficient to create an unindexed payload; the burst sizes make the failure to enforce the cap visible immediately.

```powershell
node scratch/improvement-review/storage-import.mjs
```

Raw observations: `concurrentGames`, `serialGames`, `concurrentMonths`, `serialMonths` in `scratch/improvement-review/storage-import-results.json`.

**Proposed direction.** Coordinate each index's full read/write/evict transaction across extension contexts, following the library's shared-lock pattern. Preserve cache failure tolerance and Node compatibility. Plan bounded reconciliation for existing orphaned entries; locking future writes cannot reclaim past orphans. A module-local promise queue alone does not coordinate separate tabs or the background context.

**Acceptance criteria.** Two writers and above-cap concurrent batches preserve every retained key in the index and evict only the appropriate entries. Actual payload count obeys each cap after reconciliation. Failing/unavailable storage still cannot break a successful game import. Cache read/write coordination does not delete a newly retained payload during eviction.

**Confidence and limits.** High confidence in the index race and benefit of serial coordination for the fixture. Stress sizes are diagnostic, not an estimate of normal simultaneous user activity. No estimate of real storage growth or browser lock overhead has been made, and the final locking/reconciliation implementation has not been built.

### 23. IR-024 — Respect starting side and fullmove number in setup-game move lists

**Trigger and impact.** Import a legal PGN excerpt with `SetUp`/`FEN` whose initial fullmove number is 17 or whose side to move is Black. The board/parser retain the correct position and move colors, but the Moves panel numbers every game from 1 and pairs the first imported ply as White. A Black-start excerpt consequently presents Black's `e5` in the left slot and White's `Nf3` in the right slot, under `1`, instead of an empty White slot and `17... e5`, followed by `18. Nf3 Nc6`. This misrepresents the excerpt's move sequence; no numerical scoring corruption is established by this finding.

**Source.** `analysis.js:3853–3892` (`renderMoves`) derives `nMoves` from `ceil(total/2)` and generates both compact and row/card groups from `n*2-1`/`n*2`, starting `n=1`. It ignores the starting FEN's side/fullmove fields and the actual `S.positions[ply].color`. The underlying `buildPositions` and clock ownership already preserve setup positions correctly.

**Reproduced with controls.** Exact production DOM renderer, three legal fixtures × all three list styles (`rows`, `cards`, `compact`): standard White-start move 1 displays correctly; White-start move 17 displays 1/2 instead of 17/18; Black-start move 17 puts plies 1/2 into the White/Black slots of row 1 rather than putting ply 1 alone in Black's slot of row 17. All moves remain present exactly once. A position-derived grouping control obtains the correct 17/18/19 rows and original ply identities. Existing clock tests also pass, including a Black-start excerpt.

```powershell
node --test scratch/improvement-review/setup-move-list.test.mjs tests/player-clocks.test.mjs
node scratch/improvement-review/accessibility-browser.mjs --setup-moves
```

Result: **11 tests passed** (nine renderer diagnostics and two existing clock controls). Isolated real Chrome **148.0.7778.217**, unchanged production modules and real bundled engine, independently reproduces the Black-start case with no page errors. Raw artifacts: `scratch/improvement-review/setup-move-list-results.json`, `setup-move-list-browser-results.json` and `setup-move-list-browser.png`. Browser/storage fixtures are isolated; external requests are blocked.

**Proposed direction.** Group displayed mainline plies by their actual move color and the preceding position's fullmove number. Represent a missing initial White move explicitly for a Black-start excerpt. Preserve each cell's original ply for navigation, classification and highlighting; include relevant starting-position identity in retained-render signatures. Reuse the same grouping across row, card and compact layouts.

**Acceptance criteria.** Standard games retain existing numbering and grouping. White-start excerpts retain arbitrary legal fullmove numbers; Black-start excerpts have the correct initial empty White slot and subsequent pairs. Odd/even ending plies, highlights, badge updates, click navigation and all three list styles agree with the parsed positions. Switching between equal-length games with different starting side/number cannot retain old grouping. No engine/scoring policy changes are required.

**Confidence and limits.** High confidence in the display defect, demonstrated by both actual DOM generation and real Chrome rendering. The grouping control validates the intended mapping; a complete integrated fix remains unimplemented. Setup-excerpt usage frequency and every responsive layout have not been measured, so this ranks below broad workflow defects.

### 24. IR-020 — Reuse already validated history commands (measured candidate)

**Status and scope.** P2 performance candidate, **not a completed production optimization**. `Engine.analyse` rebuilds/legally replays the full move prefix before every search. Calibrated review can submit the same position/history repeatedly for best, played and rating observations. The expensive validation is repeated even though the immutable UCI position command is identical.

**Source.** `engine/uci.js:10–21` (`positionCommand`) replays every prefix; `:278` calls it for each `analyse`. `lib/calibrated-search.js:13–37` reuses the same FEN/history across primary/restricted and optional moves-only searches. A control invoking the actual coordinator confirms **4 identical history commands**, with budget kinds `[depth,depth,nodes,nodes]`, for a non-top SF18 move needing separate moves-only evidence. Top moves and other configurations can require fewer calls.

**Measured comparison.** Node **24.20.0**, one retained public legal **167-ply game** (dataset index 14), at 11 nonterminal prefixes from 8 through 160 plies. Each policy/frequency combination has three alternating-order samples. Current validation is compared with a scratch-only bounded exact-key adapter; production functions are unchanged. Every output command is checked for exact equality.

| Submissions per prefix | Current median | Memoized median | Current → candidate full replays |
| --- | ---: | ---: | ---: |
| 1 | 105.5 ms | 107.9 ms | 11 → 11 |
| 2 | 223.2 ms | 110.8 ms | 22 → 11 |
| 4 | 421.7 ms | 106.6 ms | 44 → 11 |

The single-submission case demonstrates **no measured benefit**; reuse is valuable in the repeated-submission cases. Controls preserve underpromotion commands and rejection of mutated history, injected move text and mismatched FEN counters. A two-entry control cache enforces its capacity. The raw artifact binds the dataset hash and exact measured plies.

```powershell
node scratch/improvement-review/history-command-benchmark.mjs
```

Raw observation: `scratch/improvement-review/history-command-benchmark-results.json`.

**Proposed direction.** Consider a per-root immutable validated-command handle or a small bounded exact-context cache, avoiding legal replay only when the full initial FEN, moves and requested final FEN match previously validated input. Keep validation for new/mutated contexts and preserve queued-search snapshots. Search options, cold reset, budgets, engine order and numerical models must remain unchanged.

**Acceptance criteria.** Repeated realistic review workloads reduce main-thread validation cost with byte-identical position commands and unchanged review results. Existing queued-history, malformed-prefix, setup-FEN, repetition and underpromotion checks all pass. Single-call overhead, cache lifetime/memory and game/variation cancellation are measured before adoption. Validate in browsers and an integrated engine run; Node timing alone cannot prove reduced UI latency.

**Confidence and limits.** High confidence in command equality, replay-count reduction and the declared Node timings. **Provisional confidence in end-to-end user benefit**: this is not a browser frame-rate or full-analysis speed measurement, and the four-call case is one supported coordinator path rather than every move. No candidate was integrated into the extension.

### 25. IR-018 — Reduce redundant content-script layout work (measured candidate)

**Status and scope.** P2 performance candidate, **not yet a validated production recommendation**. The Chess.com observer scans injection locations on every child-list delivery anywhere in the body, and fitting an existing modal button reads layout. Multiple DOM batches before one paint can therefore force repeated global layout work even when the review controls did not change.

**Source.** `content.js:300–308` (`fitModalReviewButton`, `offsetWidth` reads), `:348–379` (unfiltered body/subtree observer invoking `tryInject`). Existing guards already prevent repeated button creation and busy-state resets; retain those behaviors.

**Measured comparison.** Chrome **148.0.7778.217**, 1366×900, synthetic platform-shaped DOM with **2,500 existing rows** and **60 added rows separated by microtask checkpoints**. Six fresh pages used alternating policy order, three samples per policy. The production script/CSS were identical in both arms. An isolated diagnostic adapter changed only observer delivery from immediate execution to one `requestAnimationFrame` callback per frame; no repository implementation was edited. Chrome performance counters and direct callback timing gave these medians:

| Metric per mutation burst | Current delivery | Frame-coalesced diagnostic |
| --- | ---: | ---: |
| Observer callback executions | 60 | 1 |
| Browser layouts | 60 | 1 |
| Style recalculations | 60 | 1 |
| Callback time, including forced layout | 72.6 ms | 3.2 ms |
| Chrome layout duration | 68.0 ms | 2.3 ms |
| Burst wall time, including frame waits | 75.7 ms | 28.5 ms |

Both arms retained the busy label/disabled state, preserved the **288 px** fitted width, and restored exactly one modal plus one sidebar button after removal. This supports a concrete benefit for the fixture; it does not establish real platform latency, battery or frame-rate improvements.

```powershell
node scratch/improvement-review/content-performance-browser.mjs
```

Raw observations, six trials and input source hash: `scratch/improvement-review/content-performance-browser-results.json`.

**Proposed direction.** Evaluate batching observer work or ignoring provably unrelated mutations, and separate necessary layout reads from repeated DOM scans. Preserve explicit resize fitting and prompt post-game reinjection. Before production implementation, replay representative platform updates, including animation-frame updates and modal transitions; scheduling can trade reduced work for injection latency.

**Acceptance criteria.** Representative replay demonstrates fewer redundant layouts and lower main-thread cost without perceptible missing-button frames, incorrect width, duplicate controls or busy-state resets. Hidden/restored tabs, resize, SPA replacement and extension-context failure still recover. Validate supported browsers and a slower device class; do not extrapolate this desktop synthetic burst into a universal speed guarantee.

**Confidence and limits.** High confidence in the measured Chrome fixture and deterministic layout-count reduction. **Provisional confidence in user benefit** until real update patterns and scheduling tradeoffs are checked. This candidate is explicitly separated from the reproduced functional defects in the backlog.

### 26. IR-021 — Separate SF19 scoring reuse from live preferences (protocol-backed candidate)

**Status and scope.** P2 optimization candidate, **not an integrated cache improvement**. SF19 numerical observations use fixed Hash 32, Skill 20, MultiPV 1 and a cold 20,000-node budget. Some user settings change live/helper searches while leaving this numerical protocol unchanged. The current shared settings key and update path nevertheless invalidate compatible saved scoring evidence and schedule whole-game reanalysis.

**Source.** `lib/calibrated-search.js:6–11` fixes SF19 primary options/budget/line count, and `:30–32` always records its rating evidence. `analysis.js:5547–5550` includes depth/hash/skill/annotation-lines/rating mode in one cache key; `:5140–5176` schedules reanalysis for changes beyond its limited display-only exceptions. Future reuse must follow the **actual** engine build, including fallback behavior.

**Actual-engine equivalence control.** Stockfish 19 Lite WASM at the standard initial position produces **identical UCI command sequences and identical completed root evidence** under these preference sets: depth 16/hash 16/skill 20/annotation lines 1, and depth 8/hash 256/skill 3/annotation lines 4. Both normalized to Hash 32, Skill 20 and `go nodes 20000`. This establishes protocol equivalence for the tested root; it is not a timing speedup claim.

**Cache/reanalysis observation.** A complete synthetic 23-ply SF19 evidence fixture is initially admitted. Changing only the real hash setting to 256 schedules **1 reanalysis** and makes the existing key fail admission. Opening with the original key starts analysis. A diagnostic copy with only its settings key retagged passes every other admission check and restores with **0 additional analysis starts**. The actual pure review function computes both context and moves-only ratings from the same complete evidence with unchanged accuracy. The retagging is an experimental control, not a proposed shortcut around guards or an implemented cache policy.

```powershell
node --test scratch/improvement-review/sf19-reuse.test.mjs
```

Raw observations: `sf19-protocol-equivalence-results.json` and `sf19-cache-reuse-results.json` under `scratch/improvement-review/`. The first uses the real bundled engine; the second uses authored complete evidence to isolate cache and mode behavior. Its rating values are not independent model-quality validation.

**Proposed direction.** Evaluate separate identities for immutable numerical observations, derived rating mode and live/panel search configuration. Reuse only complete evidence from the same effective build, game/history, fixed search protocol and compatible model versions. Recompute derived mode outputs and refresh live/panel state where needed. Coordinate with IR-013 so reused fixed-protocol evidence is not mislabeled as newly computed live-depth output.

**Acceptance criteria.** Eligible SF19 hash/depth/skill/live-setting or rating-mode changes avoid repeating unchanged numerical searches while updating relevant live behavior and displayed mode. Incomplete, stale, wrong-build, fallback-SF18 or incompatible-protocol/model evidence remains rejected. Original scores/classifications and both rating modes match full recomputation over representative games. Measure integrated latency/CPU and cache lifetime before adoption.

**Confidence and limits.** High confidence in the tested protocol identity, cache miss and reanalysis scheduling. **Provisional confidence in end-to-end benefit** until model-aware reuse is implemented in an isolated candidate and validated across full real reviews, fallback engines and display behavior. Do not generalize these SF19 invariants to SF18, whose settings and optional rating searches differ.

### 27. IR-012 — Apply challenge expiry consistently to Reveal and Skip

**Severity and impact.** P2 correctness gap, lower priority than lost state and incorrect move teaching. Submit and Hint check the monotonic challenge deadline; Reveal and Skip do not. An action arriving after expiry but before the 200 ms ticker observes it can still add an assisted completion or skip to both the run and durable puzzle progress. This does **not** allow an unassisted score increase in the tested cases.

**Source.** `lib/learning/workspace.js:471–486` (`submitPuzzle`) and `:494–499` (`hintPuzzle`) guard expiry. `:500–504` (`revealPuzzle`, `skipPuzzle`) omit that guard. Periodic observation is at `:513`, and result persistence is at `:516–524`.

**Reproduced with controls.** Use the real `ChallengeClock` with a controlled monotonic `now`, start a 60-second challenge, then advance to 60,001 ms before the periodic observer runs. Submit and Hint finish with zero new attempts/assistance/skips. Reveal instead records **1 assisted completion**; Skip records **1 skip**. Both create saved puzzle progress after the deadline. The periodic ticker is disabled in the fixture solely to deterministically exercise the interval between expiry and observation.

```powershell
node --test scratch/improvement-review/learning-boundaries.test.mjs
```

Raw observations: `expired-submit`, `expired-hint`, `expired-reveal`, `expired-skip` in `scratch/improvement-review/learning-boundaries-results.json`. Two additional controls confirm worker crashes abstain/retry safely and closing during validation saves no completion.

**Proposed direction.** Check the same monotonic deadline at every challenge action that mutates run or puzzle progress. On expiry, finish the run before Reveal/Skip can record changes. Keep the existing rule that loading, validating and saving pause active time; do not change score definitions to work around this action-boundary gap.

**Acceptance criteria.** At/after expiry, Submit, Hint, Reveal and Skip all finalize the existing run without adding a new attempt, assisted completion or skip. Just-before-expiry actions retain their documented behavior. Ending the run is idempotent, including an action racing the ticker, and unfinished genuine earlier mistakes still appear in review.

**Confidence and limits.** High confidence in inconsistent guards and recorded counters for this boundary fixture. The real-world frequency of clicking during the observation gap is unknown. No unassisted score exploit was observed; this recommendation concerns accurate deadline/statistics handling.

## Observations not promoted into recommendations

- **Timing-test failure did not reproduce in isolation.** The initial full suite failed one wall-clock limit in `tests/fast-coach.test.mjs:118` while other tests and source verification ran. Rerunning that file by itself passed all 12 tests; the affected test took about 1,172 ms versus its 3,000 ms limit. This is consistent with contention, but one repeat cannot establish the cause or long-term stability. It does not establish a production performance regression or prove that expensive searches occur in presentation code. Keep functional and performance evidence distinct.
- **Lichess clocks are explicitly disabled.** `lichess.js:61` requests `clocks=false`, while the review screen supports imported clock annotations. This is an enhancement candidate, but API response size, consistency, UI expectations and privacy implications have not been tested. Do not prioritize it as a proven win yet.
- Library cross-tab writes, learning progress locks, worker cancellation, session recovery and retained board images already have substantial implementation and regression coverage. Recommending those completed changes again would add noise.
- **Packaged-source validation is intentional.** Browser smoke/layout checks read the latest packaged staging tree, consistent with the documented build-then-test release workflow. This is not a reproduced stale-current-source defect. The learning audit's optional `--working-tree` mode overlays five UI files; that result should be interpreted as a scoped UI experiment, not proof that every working-tree module was tested. No release artifacts were present locally for a fresh packaged-browser run during this pass, and none were generated or modified.
- **Partial graph results are deliberately contiguous.** `renderGraph` stops at the first missing evaluation, retaining positional indices for hover lookups. The suspected sparse-result/index mismatch was ruled out by reading that guard and was not promoted into a recommendation.

## Review history

### 2026-10-14 — Initial pass complete

- Inspected repository guide and release/navigation audits, import flows, game caches, library and session storage, settings persistence, learning progress, scoring-integrity coverage and packaging inputs.
- Baseline: extension `0.3.0`, Git HEAD `e8cda39`, Node `24.20.0`, Windows. Existing staged `marketing/video/media/Main Edit.mp4` preserved. Only this Markdown is a lasting addition from this review.
- Restored the existing locked development dependencies using `npm ci --no-audit --no-fund`. Initial sandbox network access failed; the authorized elevated retry succeeded. Package manifests and lockfile were not changed.
- Initial targeted suite: **69 passed, 0 failed**. It covered import, PGN handling, engine failure/recovery, public scoring primitives, learning progress, and legal replay of all 25,000 puzzles.
- Full `npm test`: **414 passed, 1 failed (415 total)** in 140.8 seconds. Sole failure: the coach presentation wall-clock limit; its test duration was 3,371 ms, with a 3,000 ms assertion threshold and other verification work running. Raw output: `scratch/improvement-review/npm-test.txt`.
- Isolated follow-up `node --test tests/fast-coach.test.mjs`: **12 passed, 0 failed**, 72.2 seconds including detector fixture preparation; affected presentation test duration **1,172 ms**. Raw output: `scratch/improvement-review/fast-coach-isolated.txt`. The initial full suite result remains recorded as a failure; this is not a clean full-suite rerun.
- `node scripts/verify-source.mjs`: passed. `node scripts/verify-engines.mjs`: all four bundled engine JS/WASM checksums passed.
- Three isolated diagnostic commands above reproduce all four ranked findings. A passing diagnostic means the suspected defect was observed and asserted, not that production is fixed.
- Final Git check: no tracked extension code, assets, package manifests, lockfile or existing test edits; the pre-existing staged video remains staged. This review file is untracked and ready for human review. No commit or publication was performed.
- No live browser/store smoke tests or full research suite were run. Browser integration, actual fix benefits, current platform selectors, accessibility and release-package behavior remain unverified in this pass.
- The initial heartbeat ran every two hours; it was updated to hourly checks with the usage-conservation policy below when Thomas requested continuous work and an allowance threshold.

### 2026-10-14 — Engine lifecycle and practice correctness

- Confirmed the active goal: continue review-only improvement work until Thomas asks to stop, conserve at 8% five-hour allowance remaining, check only hourly in conservation mode, resume at a full refill.
- Allowance check before this pass: **8% used / 92% remaining** in the 300-minute window. Ordinary review work remains allowed. The hourly heartbeat now preserves this policy across wakeups.
- Added IR-005, IR-006 and IR-007, bringing the backlog to seven confirmed findings and reranking by impact/reach. Promotion correctness ranks second because the actual engine and rules prove practice rewards a drawn move in a winning position.
- `node --test scratch/improvement-review/helper-lifecycle.test.mjs`: **4 diagnostic cases passed**, reproducing duplicate worker startup, stale startup after a game switch, dead-helper reuse and the disabled threat arrow returning. No production worker or user browser data was involved.
- `node --test scratch/improvement-review/practice-promotion.test.mjs`: **1 diagnostic case passed** with the actual bundled Stockfish 18 engine; rook promotion mate in two and queen stalemate are independently retained in raw results.
- Targeted existing engine/recovery/review baseline: **53 passed, 0 failed**. Raw output: `scratch/improvement-review/engine-round-baseline.txt`.
- No extension implementation or existing tests were changed. All new code in this pass is ignored diagnostic material.

### 2026-10-14 — Practice alternative evidence

- Added IR-008 after a real-engine counterexample to the missing-candidate rejection rule. Eight findings are now ranked. IR-008 ranks above the rarer promotion case because one-PV annotation is the default and the evidence gap can affect many sound alternative attempts.
- `node --test scratch/improvement-review/practice-alternative.test.mjs`: **1 diagnostic case passed**, comparing two actual depth-16 searches and the application's real calibration. Missing candidate rejected; same candidate with its measured line accepted; expected-result difference 0.907375 percentage points.
- Last observed allowance during the pass: **12% used / 88% remaining**. Conservation is not active. No implementation changes were made.

### 2026-10-14 — Learning save recovery and keyboard access

- Added IR-009 after reproducing a lost puzzle completion and verifying the existing retry method recovers it when invoked. Normal navigation alone hides the retry warning; an unrelated successful save is not required. Nine findings existed at that point; the recovery gap ranks second because known unsaved progress can disappear silently.
- Existing learning baseline: **23 passed, 0 failed**, using `node --test tests/learning-progress.test.mjs tests/learning-ui.test.mjs`. Raw output: `scratch/improvement-review/learning-round-baseline.txt`.
- Save-recovery diagnostic: **1 passed**, including a separate retry control with exactly one saved completion and zero remaining failed changes.
- Used the Impeccable audit guidance and UI/UX Pro Max's focused keyboard/focus guidance. Impeccable's context launcher failed with `The system cannot find the batch label specified - cache_directory_failed`; no PRODUCT.md or DESIGN.md was present. Continued from repository documentation and actual source/CSS. No context files, design system or launcher were repaired, and the bundled detector did not run.
- Added IR-010 and IR-011 after one bounded real-browser pass: Chrome 148.0.7778.217, desktop 1366×900 plus narrow 390×844, reduced motion enabled, isolated storage/API fixture and unchanged production HTML/CSS/JS. The real bundled engine completed the fixture review. The browser emitted **zero page errors**.
- Confirmed off-screen library keyboard focus and non-keyboard game cards; confirmed Credits leaves focus and review shortcuts active behind its overlay. Retained four screenshots and a JSON report in ignored scratch. Opened the pointer-visible library screenshot in Codex for follow-along.
- Positive narrow measurement: document width **390 CSS px**, scroll width **390**, board **294×294**. This establishes no horizontal overflow and a square board in that measured state only. The screenshot retains the preceding navigation scroll position; it is not a full narrow-screen visual audit.
- No overall accessibility/health score is assigned: this pass did not cover all themes, contrast, screen readers, touch gestures, Firefox, actual extension-origin APIs or every responsive state. Official W3C references support the specific keyboard/modal recommendations only.
- **11 confirmed findings** now ranked; no extension implementation, existing tests, manifests or lockfile changed. The existing staged video remains untouched.
- Allowance at end of pass (20:39 UTC / 22:39 Copenhagen): **24% used / 76% remaining** in the 300-minute window. Conservation mode remains inactive.

### 2026-10-14 — Challenge boundaries and engine display provenance

- Allowance before this pass: **25% used / 75% remaining**; normal review work remained allowed.
- `node --test scratch/improvement-review/learning-boundaries.test.mjs`: **6 passed**, comprising two positive worker controls and four deadline-action observations. Worker crash/retry and close/cancellation behaved correctly; no new worker recommendation was added.
- Added lower-priority IR-012 for Reveal/Skip recording assistance/skips after the challenge deadline. Submit/Hint controls correctly reject late actions; tested unassisted scores stay zero.
- Added IR-013 after `node --test scratch/improvement-review/engine-display-cache.test.mjs` reproduced prior-configuration lines under a new build/depth label. The diagnostic passed; it asserts the current defect, not a fix.
- Packaging source inspection found an explicit runtime file/directory allowlist, version/lockfile consistency checks and engine verification. The staged marketing video and ignored diagnostics are outside that runtime allowlist. No package was built or published during this pass.
- Thirteen recommendations are now ranked. No extension implementation or existing test was edited.

### 2026-10-14 — Import request lifetime

- `node --test scratch/improvement-review/import-deadline.test.mjs`: **2 passed**, covering the actual manual popup flows for both platforms with controlled unresolved fetches and three minutes of simulated timer advancement.
- Added IR-014: pending network work has no application deadline/cancel signal, keeps import disabled, and recovers only after the fixture rejects it. Chess.com conflates the injected network failure with an archive miss. No live APIs, account data or browser-installed extension state were used.
- Fourteen recommendations now have reproduction evidence and acceptance criteria. Existing library/modal accessibility findings remain distinct; non-focusable move-list or graph markup was not promoted merely on markup because review navigation already has keyboard equivalents.
- Final source diff remains empty; the pre-existing staged video and this review Markdown are the only Git status entries. Allowance at 20:48 UTC / 22:48 Copenhagen: **31% used / 69% remaining**. Normal review work remains active.

### 2026-10-14 — Content-script lifecycle and engine keyboard activation

- Allowance before this pass: **33% used / 67% remaining**; normal review remained allowed.
- Existing content-button/import baseline: **8 passed, 0 failed**, using `node --test tests/review-button.test.mjs tests/analyze-flow.test.mjs`. Raw output: `scratch/improvement-review/content-round-baseline.txt`.
- `node --test scratch/improvement-review/content-lifecycle.test.mjs`: **6 passed**, covering reinjection/busy-state controls, later share fragments and rejected share handoffs on both platform scripts. Added IR-015; existing button lifecycle behavior passed and was not recommended again.
- Added IR-016 after a focused second browser pass using the existing accessibility skills: actual second engine candidate cannot be focused or activated through keyboard input; pointer control opens a real branch. Desktop/narrow screenshots were inspected in one batch, with zero page errors. No additional visual polishing round was run.
- Sixteen findings now ranked. This pass changed only the review Markdown and ignored diagnostics; extension source, CSS, existing tests and user-staged video remain untouched.
- Allowance at 20:57 UTC / 22:57 Copenhagen: **38% used / 62% remaining**. Normal review remains active; conservation has not been entered.

### 2026-10-14 — Import identity and measured observer work

- Allowance before this pass: **39% used / 61% remaining**; normal review remained allowed.
- `node --test scratch/improvement-review/library-identity.test.mjs`: **1 passed**, reproducing an exact PGN hash collision and overwrite, with a distinct-ID control retaining both games/analyses. Added IR-017 with an explicit rarity/fixture limitation.
- Existing library/session baseline: **7 passed, 0 failed**, using `node --test tests/library-storage.test.mjs tests/review-session.test.mjs`. Raw output: `scratch/improvement-review/library-identity-baseline.txt`.
- Used Impeccable's performance measurement guidance for one isolated Chrome experiment. Six fresh pages compared unchanged production source under immediate versus coalesced observer delivery. Busy state, fitted width, reinjection and exact control counts passed in both arms.
- Added IR-018 as a **provisional performance candidate**: median callbacks/layouts fell 60→1 and callback time 72.6→3.2 ms on the declared synthetic burst. It is not counted as a confirmed functional defect or universal production speedup.
- Eighteen review items now exist: **17 reproduced functional defects and 1 measured candidate**. Only this Markdown and ignored diagnostics were changed.
- Allowance at 21:04 UTC / 23:04 Copenhagen: **44% used / 56% remaining**. Normal review remains active; conservation is still inactive.

### 2026-10-14 — Automatic review persistence and scoring controls

- Allowance before this pass: **46% used / 54% remaining**; normal review remained allowed.
- Added IR-019 after reproducing a completed review whose automatic library write fails with only a console warning. The existing save operation recovers the game/results with **zero additional engine startups**. It is distinct from the learning retry-queue visibility issue in IR-009.
- `node --test scratch/improvement-review/review-save-failure.test.mjs scratch/improvement-review/scoring-protocol-controls.test.mjs`: **7 passed** — one persistence diagnostic and six positive protocol controls. Raw combined output: `scratch/improvement-review/save-protocol-round-results.txt`.
- Standard/setup initial positions and changed depth retain the intended SF18 depth-quality and SF19 fixed-node/context tag restrictions. Separate moves evidence remains available under its own protocol. These controls exercise the coordinator with deterministic engine-boundary replies; they are not new calibration validation or proof of rating reliability for arbitrary setups.
- Existing scoring admission/exact-recovery baseline: **15 passed, 0 failed**, using `node --test tests/scoring-integrity.test.mjs tests/exact-scoring-recovery.test.mjs`. Raw output: `scratch/improvement-review/scoring-round-baseline.txt`.
- Nineteen review items now exist: **18 reproduced functional defects and 1 measured candidate**. No scoring policy, production code or existing tests were changed.

### 2026-10-14 — Repeated history validation experiment

- Added IR-020 as a second provisional performance candidate. The experiment compares single, paired and quadruple submissions at representative legal prefixes, instead of assuming every move repeats four times.
- `node scratch/improvement-review/history-command-benchmark.mjs` completed all 18 timing cohorts and command/invalid-history/capacity controls. Paired submissions fell 223.2→110.8 ms; quadruple submissions 421.7→106.6 ms. Single-submission timing showed no gain (105.5→107.9 ms), retained explicitly as a tradeoff.
- The actual calibrated coordinator control emitted four equal position commands for the declared non-top SF18/moves-only case. Engine replies in that call-count control are deterministic boundary doubles; benchmark game prefixes and validation commands use the real rules and transport functions.
- Twenty review items now exist: **18 reproduced functional defects and 2 measured candidates**. No production implementation or model was changed.
- Allowance at 21:17 UTC / 23:17 Copenhagen: **55% used / 45% remaining**. Normal review remains active; conservation has not been entered.

### 2026-10-14 — SF19 reuse boundaries and calibration load recovery

- Allowance before this pass: **57% used / 43% remaining**; normal review remained allowed.
- `node --test scratch/improvement-review/sf19-reuse.test.mjs`: **2 passed**. The real SF19 engine emitted identical commands/root evidence under substantially different live preferences; a separate complete-evidence fixture demonstrates cache invalidation, reanalysis scheduling and a retag-only restoration control. Added IR-021 as a third provisional optimization candidate.
- Existing settings/calibration/SF19 context baseline: **15 passed, 0 failed**, using `node --test tests/settings-calibration.test.mjs tests/sf19-context.test.mjs`. This includes retained public-evidence replay for both rating modes. Raw output: `scratch/improvement-review/sf19-reuse-baseline.txt`.
- `node --test scratch/improvement-review/calibration-load-recovery.test.mjs`: **1 passed**, reproducing a cached failed data load misreported as an engine failure and a working loader-reset control. Added IR-022 as a functional recovery defect.
- Twenty-two review items now exist: **19 reproduced functional defects and 3 provisional optimization candidates**. No implementation, model, existing test or user change was edited.
- Allowance at 21:28 UTC / 23:28 Copenhagen: **63% used / 37% remaining**. Normal review remains active; conservation is still inactive.

### 2026-10-14 — Board touch cancellation and cleanup control

- Chrome native touch-event diagnostics reproduced both explicit cancellation and browser-generated cancellation during a vertical gesture. Both strand a floating piece and hide its original; the next gesture creates a second ghost.
- A scratch-only event adapter exercised the existing cancel routine on the same native cancellation: no ghost, original restored, no variation opened, and the following gesture/release cleaned up normally. Added IR-023 with physical-device and teardown validation still required.
- Twenty-three review items now exist: **20 reproduced functional defects and 3 provisional optimization candidates**. No production implementation, existing test or user-staged file changed.
- All three board diagnostic commands completed with their assertions passing and no browser page errors. Priority table/detail numbering was checked: 23 matching entries. Existing input-size limits, range inputs and the calibration-warning keyboard guard were observed; they were not promoted into speculative new defects.
- Allowance at 21:37 UTC / 23:37 Copenhagen: **72% used / 28% remaining**. Normal review remains active; conservation has not been entered.

### 2026-10-14 — Library partial-commit recovery refinement

- Refined existing IR-019 rather than creating a duplicate: failed eviction removal occurs after the game and analysis are already saved, leaves the sidebar stale, and loses the cleanup key from the next normal save retry. A cleanup-only control removes the known orphan without losing retained reviews.
- `node --test scratch/improvement-review/library-cleanup-failure.test.mjs tests/library-storage.test.mjs`: **4 passed**, covering the new boundary plus existing cross-tab saves, favorite/solved preservation and ordinary eviction. No engines or external services were needed.
- Confirmed `applyGame` parses and validates the replacement PGN before tearing down the current game; invalid-input teardown was therefore not promoted as a defect. Practice advance also checks the original practice object's identity before its delayed transition. No recommendation was added from those reads.
- The backlog remains **23 items: 20 reproduced functional defects and 3 provisional optimizations**. Priority/detail numbering remains aligned; only the Markdown and ignored diagnostics changed.
- Allowance at 21:40 UTC / 23:40 Copenhagen: **75% used / 25% remaining**. Conservation remains inactive.

### 2026-10-14 — Setup-game move presentation

- Added IR-024 after reproducing wrong numbering for White-start move-17 excerpts and wrong numbering/columns for Black-start excerpts in all three list styles. The underlying positions and clock ownership retain the correct side; this is a display-grouping issue, not evidence of incorrect engine scoring.
- Nine renderer diagnostics and two existing clock tests passed. A separate native Chrome run using the unchanged app and actual bundled engine reproduced the Black-start case; the captured Moves panel was visually inspected and opened in Codex.
- Twenty-four review items now exist: **21 reproduced functional defects and 3 provisional optimization candidates**. Production implementation, existing tests and the pre-existing staged video remain untouched.
- Table/detail ordering validated: 24 matching priorities. Allowance at 21:43 UTC / 23:43 Copenhagen: **77% used / 23% remaining**; conservation remains inactive.

### 2026-10-14 — Keyboard board input and release-test scope

- Added IR-025 after native Chrome confirmed no focusable review-board input, no variation from Enter/Space, and a successful pointer-only d2→d4 variation control. Existing navigation shortcuts do not enter arbitrary moves. The learning workspace already has a typed move form that can inform a future implementation.
- Read packaged-browser/layout audit source and release workflow. Their packaged-source scope is intentional; no new packaging defect was asserted. The optional five-file learning overlay remains a scoped UI experiment. Existing release artifacts were untouched.
- Ruled out a suspected evaluation-graph sparse-index mismatch because its point construction stops at the first missing evaluation. Record negative checks to avoid repeating speculation.
- Twenty-five review items now exist: **22 reproduced functional defects and 3 provisional optimization candidates**. No production implementation or existing tests changed.
- Native keyboard/pointer diagnostic completed with no page errors; table/detail numbering checked for all 25 items. Allowance at 21:46 UTC / 23:46 Copenhagen: **80% used / 20% remaining**. Conservation remains inactive.

### 2026-10-14 — Promotion handling beyond mistake practice

- Extended IR-007 rather than adding a duplicate: ordinary review board entry also forces queen promotion. White and mirrored Black rules fixtures both stalemate, while explicit rook controls and the real `playLine` replay preserve a legal non-stalemating rook result. An ordinary queen-promotion control remains correct.
- `node --test scratch/improvement-review/review-promotion.test.mjs tests/variation-classification.test.mjs`: **12 passed**. After adding actual engine-line replay assertions, reran the three diagnostics: **3 passed**. No engine scheduling or scoring implementation changed; existing real-engine White mate-in-two evidence is retained in the original finding.
- The backlog remains **25 items: 22 reproduced functional defects and 3 provisional optimizations**. This pass adds scope/evidence and acceptance criteria to an existing item, with no production changes.

### 2026-10-14 — Saved library player perspective

- Added IR-026 after the actual save/open path changed a saved Black-side review into White-side state when the configured username changed, despite retaining Black orientation. An existing explicit-identity control restores Black/known/win and tab-session identity.
- Added a required anonymous-record boundary: the stored display name alone is not proof of ownership. Blindly forwarding every legacy `myName` would invent identification. The recommendation therefore includes explicit known/unknown state and conservative legacy handling.
- `node --test scratch/improvement-review/library-perspective.test.mjs tests/review-session.test.mjs`: **7 passed**. The backlog is now **26 items: 23 reproduced functional defects and 3 provisional optimizations**; no implementation changes.
- All 26 priority/detail entries remain aligned. Allowance at 21:52 UTC / 23:52 Copenhagen: **85% used / 15% remaining**; conservation remains inactive.

### 2026-10-14 — In-page retries and duplicate review requests

- Extended IR-014: both site buttons become retryable after five seconds while the real background import is pending; the second click produces two lookups and two eventual review tabs. A boundary coalescing control prevents the duplicate, while a post-completion click still opens a deliberate new review from cache.
- `node --test scratch/improvement-review/content-request-overlap.test.mjs tests/analyze-flow.test.mjs`: **11 passed**. The first control run incorrectly required a new network request after completion and failed two assertions; corrected that diagnostic assumption after confirming the existing cache serves the deliberate repeat. Production code was not changed.
- Backlog remains **26 items: 23 reproduced functional defects and 3 provisional optimizations**. Request coalescing is evidence for the existing cancellation/retry item rather than a duplicate recommendation.

### 2026-10-14 — Library keyboard focus after persistence

- Extended IR-010: native Space activation saves a favorite but library reconstruction drops focus to the page body. A native focus-restoration control permits the next keyboard favorite action. No additional recommendation was needed; this strengthens the existing end-to-end keyboard acceptance criteria.
- The actual Chrome run completed with no page errors, using unchanged production modules and isolated storage. Raw result: `scratch/improvement-review/library-focus-update-results.json`.
- Backlog remains **26 items: 23 reproduced functional defects and 3 provisional optimizations**. No production implementation, existing tests or user-staged files changed.
- Allowance at 21:57 UTC / 23:57 Copenhagen: **89% used / 11% remaining**. Conservation remains inactive; the 8%-remaining threshold still applies before further substantial review.

### 2026-10-14 — Settings focus continuity

- Added IR-027 after a native keyboard preference update saved successfully but dropped focus out of Settings. Explicit focus restoration permits the following Tab/Space action; six existing settings-preview tests passed.
- Backlog is now **27 items: 24 reproduced functional defects and 3 provisional optimizations**. The new item concerns settings controls; library focus remains covered separately by IR-010. No implementation changes.
- All 27 priorities/details align, and Git still shows only this review Markdown plus the pre-existing staged video. At **21:59:50 UTC / 23:59:50 Copenhagen**, allowance reached **92% used / 8% remaining**: entered conservation mode. Next allowance check is no earlier than **22:59:50 UTC / 00:59:50 Copenhagen on October 15**. Inspection remains idle until an hourly check confirms **100% remaining**.

### 2026-10-15 - Authorized implementation and validation

- Implemented the 24 confirmed items within the scoped limits recorded above. Deferred the three provisional optimizations.
- Full suite: 476 passed; final persistence/keyboard follow-up: 13 passed. Source/engine integrity, whitespace checks and Chrome/Firefox package builds passed.
- Native Chrome module workflow passed keyboard, promotion, save retry, touch cancellation, narrow layout and actual-engine practice verification with no page errors. During this check, fixed a native focusout/rerender interaction that JSDOM did not emit automatically; added a regression.
- Packaged Chrome smoke failed at the browser loading API before running the extension; Firefox unavailable. Retain this as an explicit verification limit.
- Preserve concurrent learning work and the staged marketing video. Last observed five-hour allowance: 72% used / 28% remaining; normal mode.

### 2026-10-15 — Post-implementation packaging review

- Read the updated review/status and preserved the combined working tree. Allowance: 77% used / 23% remaining; normal mode.
- Checked the fresh Chrome and Firefox packages' static relative module dependencies from review, popup and background entrypoints: each contains **36 modules / 68 import edges**, including `lib/import-request.js`, with matching version 0.3.0. Diagnostic: `node scratch/improvement-review/package-module-closure.mjs`; raw results: `scratch/improvement-review/package-module-closure-results.json`.
- This check covers static module inclusion only; it does not resolve the recorded installed-extension smoke limitation. No duplicate finding or new recommendation warranted. No implementation, existing tests or user changes modified.
- Next rotation: storage/recovery, focusing on distinct interactions between pending saves and navigation rather than repeating the completed baseline checks.

### 2026-10-15 — Requested UI reversions and Concepts visibility

- Removed the typed Move field from review and practice. Restored the Learn button's row beside review navigation, with its full height retained when engine suggestions grow.
- Disabled Tab traversal between review sections and removed added sequential focus stops from engine/library controls. Settings, dialogs and the learning workspace retain their existing keyboard behavior.
- Added Settings → Concepts → **Show Concepts panel** (shown by default). The saved switch hides/restores the module, releases its automatic-layout column/row and desktop/custom fitting extent, and preserves its stored geometry and concept-analysis preferences.
- Focused UI/layout/learning tests: **59 passed**. Full run: **477/479 passed**; the remaining two failures were old checkbox-count assumptions. Updated those selectors/counts and reran the entire affected concept-performance file plus visibility tests: **12/12 passed**. Source verification and whitespace checks passed.
- Native Chrome check passed at 1366×900, 1920×1000 and 390×844: no Move field, Tab retains review focus, the setting hides/restores Concepts, no narrow horizontal overflow, and Learn/navigation are aligned at y=826 with 44px height. No page errors. One batched inspection and one alignment confirmation; raw evidence: `scratch/improvement-review/ui-revert-browser-results.json` and `ui-revert-*.png`.
- These preferences supersede IR-025 and the original recommendation to add review-section Tab traversal. Do not propose reintroducing them as automatic improvements.
- Refreshed Chrome/Firefox packages successfully with `npm run build`: `web-ext-artifacts/release-0.3.0-jS7ceD/`. The previously documented installed-extension smoke limitation is unchanged.

## Next inspection targets

Current UI preferences: do not reintroduce typed review/practice move entry or Tab traversal between review sections. Keep the Learn button in its original row beside navigation. Settings → Concepts includes a persisted **Show Concepts panel** switch; hiding the panel releases its layout space and preserves its saved geometry and analysis choices.

1. Continue the review-only improvement loop against the updated implementation, excluding completed baseline defects unless a distinct regression is reproduced. Do not implement new recommendations without further authorization.
2. Run installed-extension runtime smoke when a compatible test browser is available; do not alter user browser profiles or security settings to work around the current loader limitation.
3. Revisit presentation labels/navigation for nonstandard starts only for behavior distinct from IR-024. Inspect packaging/browser integration and recovery paths under representative platform conditions.
4. IR-018, IR-020 and IR-021 remain experiments awaiting representative integration evidence. Do not equate a local timing control with a proven overall benefit.
5. Keep checking allowance under the existing conservation policy; avoid concurrent heavy checks during timing measurements.
