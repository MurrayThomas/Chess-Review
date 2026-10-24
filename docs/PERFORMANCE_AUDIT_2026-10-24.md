# Extension performance follow-up — 2026-10-24

Thomas requested additional findings across the shipped extension, excluding
research. This is a report, with disposable diagnostic candidates only. No
production optimization was implemented. Puzzle chunking and the laptop engine
preset from the previous review are excluded from the recommendations.

## Priorities

| Priority | Opportunity | Where it helps | Evidence and expected benefit | Implementation effort / risk |
| --- | --- | --- | --- | --- |
| 1 | Check Brilliant eligibility before expensive sacrifice analysis | Opening reviews, loading saved games, variations | Current startup checks every game move before any engine evidence exists. Three Chrome fixtures reduced the initial classification pass from 303–2,077 ms to 25–54 ms with an isolated lazy candidate. | Small to medium; retain identical Brilliant/forced/book/mate rules and cache invalidation. |
| 2 | Avoid whole-game reanalysis for settings that do not change existing evidence | Engine settings and completed reviews | Changing only worker count schedules a complete analysis restart, although worker count is already excluded from the saved-analysis identity. Additional SF19 reuse remains possible under its fixed numerical protocol. | Small for worker-count handling; medium to large for protocol-aware SF19 reuse. |
| 3 | Retain more than one completed engine-panel result | Moving backward and forward through a game with multiple engine lines enabled | A → B → A issues three searches in the real coordinator with a fake engine. Only repeating the immediately current position reuses results. | Medium; use a bounded cache keyed by full history, effective build and search settings. |
| 4 | Stop rescanning and forcing layout on unrelated page mutations | Chess.com pages, including while the extension review is closed | Synthetic burst: 60 forced layouts → 1; median observer work 142.7 → 6.2 ms with diagnostic batching. | Medium; preserve resize fitting, SPA replacement, prompt reinjection and busy state. |
| 5 | Update existing graph/player/library elements | Navigation, progress refresh and larger saved-game libraries | Graph and player strips are rebuilt with unchanged data; the closed library also builds every card. Chrome measured 17.3 ms per complete 300-card library render. | Medium; retain hover, clocks, captured pieces, focus, scroll and all graph styles. |
| 6 | Avoid writing identical coach attributes every animation frame | Idle review CPU use with animated coaches | Three rigs each performed 2,100 SVG writes over 300 settled frames; none changed the attribute value. | Small to medium per rig; preserve every visible expression, blink, gesture and ambient animation. |
| 7 | Reuse exact, previously validated search-history commands | Long-game analysis and repeated searches of the same root | Current code legally replays the whole prefix on each submission. Existing IR-020 experiment established identical commands and fewer replays for repeated submissions; current guards still repeat that work. | Medium; immutable snapshots, bounded memory and full-context validation are essential. |

These proposals preserve the current content, search budgets, engine choices,
worker defaults and visible features. That is an implementation requirement,
not a claim that the diagnostic candidates are release-ready. The largest new
measured responsiveness opportunity is item 1. Items 2 and 3 can remove whole
engine searches in their specific trigger cases; overall savings depend on use.

## 1. Make costly annotation work conditional

Source: `analysis.js`, `classifyLine`, `_sacAt`, `isSacrifice`,
`brilliantEligible` and `classifyMove`.

`classifyLine` eagerly calls `_sacAt` for every ply. That can perform legal
capture/exchange searches, including the recent short-material-refund check.
The later classification pass withholds every label when engine evidence is
absent. Consequently, startup does expensive work that cannot yet affect the UI.
It also checks sacrifices for moves that cheap eligibility rules would exclude.

The diagnostic removes the eager call and asks for sacrifice evidence only
after the existing sound-mate and Brilliant-eligibility conditions pass. The
actual sacrifice detector is unchanged. A qualifying move still receives the
same check, and its result still uses the existing per-game cache.

Fresh-page Chrome medians, three trials per policy per game:

| Public game | Plies | Current initial `computeDerived` | Lazy diagnostic |
| --- | ---: | ---: | ---: |
| qw9OwOT5 | 61 | 2,077.1 ms | 25.4 ms |
| UWiKRSdj | 167 | 1,494.6 ms | 54.2 ms |
| mCGCdRKM | 208 | 302.5 ms | 31.5 ms |

Both policies produced zero labels with no engine evidence. This measures one
initial UI-thread computation, not total review time or engine throughput.
Position complexity matters more than game length in these three examples.

Separately, 45 current/candidate comparisons across six public games and three
targeted setup positions preserved classification, move grades, counts,
accuracy outputs, stored engine evidence and corresponding variation labels.
Inputs cover missing/partial evidence, level scores, score swings, mates, a
positive Brilliant offer, a short material refund and promotion. These are
synthetic scoring inputs and do not independently validate model quality.
Full production/browser regressions and completed real-engine reviews would
still be required before shipping this change.

## 2. Keep completed analysis when changing unrelated settings

Source: `analysis.js`, `setEngineSetting`, `analysisSettingsKey`,
`scheduleReanalyze`; `lib/calibrated-search.js`.

A real-handler diagnostic with engine/render boundaries stubbed recorded one
whole-game restart when changing only `engineWorkers` on a completed review.
Worker count controls scheduling; it is absent from `analysisSettingsKey`.
Completed results need not be discarded merely to choose a different worker
count for subsequent work. During an active review, pool adjustments must keep
completed positions and generation/cancellation guarantees intact.

The previous IR-021 candidate also remains applicable: SF19 numerical searches
fix Hash 32, Skill 20, MultiPV 1 and 20,000 nodes, while the shared cache identity
includes live depth/hash/skill and rating mode. Separate numerical evidence from
live-panel preferences, then recompute only affected derived outputs. This is
specific to compatible, complete SF19 evidence; it must not be generalized to
SF18 or a fallback build. Its earlier actual-engine equivalence evidence is in
[IMPROVEMENT_REVIEW.md](IMPROVEMENT_REVIEW.md). It was not rerun with a real engine
in this follow-up.

## 3. Cache a bounded set of engine-panel results

Source: `analysis.js`, `requestPanelLines`, `renderEngineCurrent`,
`resetLiveEngine` and `S._panelCache`.

With extra candidate lines enabled, `_panelCache` retains only one position.
The real request path searched positions 0, 1 and 0 again: cumulative search
counts were 1, 2 and 3. Repeating position 0 immediately afterward added none.
This is deterministic call-count evidence using a fake engine, not a measured
Stockfish speedup. The default single-line case does not request these searches.

A small multi-entry cache could retain the already completed result from the
first visit. Identity must include initial FEN, full move history, final FEN,
effective engine build, depth/hash/skill and line count. Keep this cache separate
from immutable scoring evidence, invalidate incompatible entries and never show
a different history's lines. Measure cache memory before choosing capacity.

## 4. Reduce content-script work on the host page

Source: `content.js`, `watchForReviewSpots`, `fitModalReviewButton`;
`lichess-content.js`, `watchForFollowUp`.

Both site adapters observe broad subtrees and search for insertion points on
unrelated child-list mutations. Chess.com's existing modal path also reads
`offsetWidth`, forcing pending layout. This extends earlier IR-018 with a fresh
comparison against the current source baseline.

Chrome fixture: 2,500 existing rows, 60 row additions separated by microtasks,
three alternating-order trials per policy. Only diagnostic observer scheduling
changes; the content script and its selectors are identical.

| Median per burst | Current | Frame-batched diagnostic |
| --- | ---: | ---: |
| Injection callback executions | 61 | 2 |
| Forced browser layouts | 60 | 1 |
| Callback time | 142.7 ms | 6.2 ms |
| Browser layout duration | 128.2 ms | 2.9 ms |

Both policies retained the 288 px modal-button width, disabled busy state and
opening label, exactly two controls, and exactly two controls after removal and
reinjection. This is a synthetic platform-shaped burst, not a live Chess.com
trace. Lichess's broad observer is confirmed by source inspection; no equivalent
Lichess timing benefit was measured. Prefer ignoring provably unrelated changes
and batching required work, with explicit resize handling and recovery.
Hidden tabs, live SPA/modal updates, Firefox and slower devices remain checks
for a production implementation.

## 5. Retain stable UI instead of rebuilding it

Source: `analysis.js`, `go`, `renderGraph`, `renderPlayers`, `alignPlayers`,
`renderLibrary`, `updateLibrary`, `renderMoves`.

`go` rebuilds the evaluation graph even when only its position marker changes.
It also replaces both player strips, including stable names/flags and captured
piece images, then reads board geometry to align them. `renderLibrary` rebuilds
filters and every matching card even when its rail is closed. These are
additional opportunities beyond the board-image/SAN caching already shipped.

Chrome baseline on the 167-ply fixture, median of five batches:

| Work | Batch | Time |
| --- | ---: | ---: |
| Rebuild unchanged graph | 100 calls | 32.0 ms |
| Rebuild unchanged player strips | 100 calls | 55.8 ms |
| Render closed, 300-game library | 10 calls | 173.3 ms |
| Navigate alternately between plies 5 and 6 | 30 calls | 362.0 ms |

DOM-identity checks confirmed graph/player replacement. The last row includes
all navigation work; it must not be attributed solely to graph/player rendering.
No retained-DOM candidate was timed, so these numbers are current costs, not
promised savings. Update marker/counter/text attributes in place; rebuild graph
geometry only when its inputs change. Update library cards by stable game ID and
avoid regenerating an unchanged closed list. Keep the existing focus/scroll and
hover behavior. `renderMoves` also builds all row descriptors before checking
its existing fast-path signature; moving that work behind the rebuild decision
is a smaller source-confirmed opportunity, without a separate timing claim.

## 6. Eliminate identical idle coach writes

Source: `data/coaches-anim/rigs/old_soviet_rework_rig.js`,
`animated_professor_rig.js`, `animated_mentor_rig.js`, their `apply` loops.

After 180 settling frames, each real rig script wrote seven SVG attributes on
each of the next 300 simulated frames: 2,100 writes, zero changed values.
The deterministic harness excludes separate random blink timers and gestures
to isolate settled work. It is not a browser CPU/battery measurement.

Only write attributes when their formatted values change. The same interpolation,
visible blink, speech, gesture and CSS ambient animation can continue. A later
event-driven loop could sleep between active animations, but requires more
extensive wake-up/visibility tests. Start with unchanged-value guards and measure
actual browser cost. Do not remove or slow the coach's visible behavior.

## 7. Reuse validated commands without weakening history checks

Source: `engine/uci.js`, `positionCommand`, `Engine.analyse`;
`lib/calibrated-search.js`, `analyseCalibratedPosition`.

The current wrapper still legally replays all preceding moves before every
search. Main/restricted and optional rating searches can use identical history.
The current diagnostic confirms repeated validation and rejects altered history
and mismatched final move counters. Timing varies substantially with machine
load, so this follow-up does not add a new history-cache speedup claim.

Earlier IR-020 measured roughly 223 → 111 ms for paired submissions and
422 → 107 ms for four submissions over its declared prefix cohort; single
submissions showed no gain. Those are historical Node adapter measurements,
not new integrated-browser results. A bounded exact-context cache or immutable
validated-command handle remains a reasonable candidate. Preserve first-use
validation, promotion, setup FEN, repetition history, queued snapshots, cold
resets and search budgets. Never cache by board layout alone.

## Scope, method and reproduction

Reviewed shipped entry points, content scripts, popup/background/import flow,
game/month caches, engine queue/progress/coordinator, review rendering/settings/
storage/library, coach rigs, learning modules and package allowlists. Research
was excluded. Existing targeted storage reads, bounded archive caches, import
cancellation/coalescing, terminated batch workers, lazy learning entry and
retained board pieces are useful existing protections. No additional large
unused component was demonstrated safe to remove in this pass.

Measurements use Node v24.14.1 and headless Chrome 156.0.8078.47 on this machine.
Browser modules/styles/content source were pinned to `3b46be26`; the audit does
not incorporate unrelated edits arriving concurrently in the working tree.
The final browser sampling ran without other diagnostic workloads from this
task. Other machine activity was not controlled; timings are fixture-specific.
Browser fixtures use loopback, a disposable profile and mocked extension
storage/API boundaries. No installed user profile or production data was used.
Browser audit recorded zero page exceptions. No end-to-end real-engine review,
Firefox run, power measurement or release build was performed for this report.

Disposable scripts, fixed-source hashes and raw results remain in ignored
`scratch/performance-review-2026-10-24/`:

```powershell
node scratch/performance-review-2026-10-24/freeze-baseline.mjs
node scratch/performance-review-2026-10-24/browser-audit.mjs
node scratch/performance-review-2026-10-24/node-audit.mjs
node scratch/performance-review-2026-10-24/panel-cache-audit.mjs
node scratch/performance-review-2026-10-24/equivalence-audit.mjs
```

Run timing commands sequentially. The public calibration corpus supplies legal
game fixtures; no research code or numerical model was changed. Recorded corpus
SHA-256: `802f4fa8819408df565de0b3a0316ee24b5a302fa92291cba788a8ad5e9ac15f`.
Raw files: `baseline.json`, `browser-results.json`, `node-results.json`,
`panel-cache-results.json`, `equivalence-results.json`. Scratch files are local
diagnostics, not part of extension packages or this documentation commit.
