# Performance implementation and responsiveness — 2026-10-25

Implements the seven opportunities in [the follow-up audit](PERFORMANCE_AUDIT_2026-10-24.md).
Search depth, scoring rules, engine choices, worker defaults, puzzle content and
visible animation options are retained. Research is outside this work.

## Implemented

| Area | Result |
| --- | --- |
| Sacrifice detection | Legal exchange searches run only after a move passes the existing Brilliant eligibility checks. Missing engine evidence no longer triggers every game's sacrifice searches at startup. |
| Settings and saved analysis | Worker-count changes retain completed reviews. During analysis, resizing the worker pool keeps completed positions when protocol/build identity matches. Compatible SF19 preferences reuse complete fixed-protocol evidence and recompute derived ratings; live-panel searches refresh separately. Fallback, stale, incomplete and incompatible evidence is rejected. |
| Engine panel | Sixteen recent exact-context results are retained. Repeated requests share pending work; obsolete results cannot replace the selected position. Keys include full history, FEN, effective build, depth/hash/skill and requested lines. |
| Site observers | Chess.com and Lichess ignore unrelated subtree updates and batch relevant injection work before a frame. Resize, hidden-page recovery, replacement controls and busy state remain supported. |
| Review rendering | Navigation retains graph geometry, player names/flags and unchanged captured-piece images. Unchanged engine panels remain mounted. Library cards and filters update by identity rather than rebuilding the list. Move-list row grouping is skipped on its existing fast path. |
| Animated coaches | All ten rigs avoid writing unchanged SVG attributes. Facial expressions, speech, gestures, blink scheduling and ambient animations remain intact. |
| Search history | Each engine keeps four exact, successfully validated position commands. New/mutated contexts still undergo legal replay. Entries over 16,384 key characters are not retained; termination clears the cache. |

The panel cache also skips oversized context keys. These are small bounded
runtime caches, not additional copies of the puzzle library or reduced search
budgets. No puzzle chunking or laptop engine preset was introduced.

## Does the interface itself have avoidable overhead?

Yes. It has synchronous rendering/layout work independent of Stockfish. Before
these changes, navigating completed reviews replaced the graph and player
strips; repeated library updates replaced every card, including while closed.
Coaches also repeatedly wrote identical SVG values. The new implementation
removes those particular repeated operations.

`scripts/review-responsiveness-audit.mjs` compares the pre-change `e00ee436`
review UI against the implementation using a completed 167-ply public game
(`UWiKRSdj`) and a 300-game library. Engine evidence is synthetic and immutable;
**zero workers start**. The timing fixture disables sound, move animation and
the coach in both arms to isolate navigation/rendering cost. Those production
features and defaults are unchanged.

Chrome 156.0.8078.47; three alternating-order fresh-page trials per policy and
CPU setting; each sample is the median of five warmed batches. Values below
are medians across those trials, in milliseconds:

| Work | Normal CPU: before | Normal CPU: after | 4x CPU slowdown: before | 4x CPU slowdown: after |
| --- | ---: | ---: | ---: | ---: |
| Navigate 30 moves | 269.2 | 227.1 | 1,467.6 | 1,320.5 |
| 100 unchanged graph updates | 34.6 | 3.4 | 92.8 | 10.5 |
| 100 unchanged player-strip updates | 43.2 | 1.4 | 202.3 | 6.1 |
| 10 unchanged 300-game library updates | 135.0 | 2.3 | 603.5 | 10.3 |

Whole-navigation CPU time fell about 16% normally and 10% under emulated CPU
slowdown in this fixture. Individual repeated render operations improved much
more. Native ArrowRight input and retained-node identity checks passed; no page
exceptions occurred. These are synchronous burst timings, not frame-rate,
render-to-screen latency, battery measurements or a benchmark of Thomas's
physical laptop. Other machine activity was not controlled.

Raw observations, exact tested source/corpus hashes and browser version:
`scratch/responsiveness-sSjryv/results.json`. The final scoring-pool guard
changes settings reuse, not the measured navigation/rendering functions.
The original startup and content-observer
measurements remain in the follow-up audit and are not represented as new
whole-application speedups here.

## Remaining responsiveness costs

A separate 4x-slowdown profile, again with no engine workers, identifies
`highlightCurrentMove`'s selected-move scrolling/layout and `fitEnginePanel`'s
size measurements as the largest measured navigation hotspots: about 380 ms
and 86 ms respectively across 30 steps in that diagnostic. Function times are
inclusive; do not add parent and child timings together.

An additional move-list geometry-cache experiment did not improve whole
navigation consistently and was removed. Its raw comparison remains in
`scratch/responsiveness-SvkKAV/results.json`; it is not shipped. The profiling
run is `scratch/responsiveness-K01Typ/results.json`. Further interface tuning
should target layout scheduling around scrolling and engine-panel sizing,
with input-to-paint measurements on the actual slower device. The evidence
supports the reported impression of UI overhead; it does not establish that
all device-specific pauses are resolved.

Reproduce the UI comparison and optional function profile sequentially, with
other workloads stopped where possible:

```powershell
node scripts/review-responsiveness-audit.mjs
node scripts/review-responsiveness-audit.mjs --profile-only
```

The script uses a loopback fixture server and disposable Chrome profile,
requires a Git checkout, and supports `CHROME_PATH`. Each run writes a new
ignored `scratch/responsiveness-*/results.json` with its hashes. This is a
developer diagnostic; it is excluded from shipped extension packages.

## Validation

- Maintained suite: **717/717 passed**, including classification, real bundled
  SF19 scoring, settings/cache admission, cancellation, history, navigation,
  layout, learning, storage and new performance regressions.
- The first broad implementation run passed 714/716. Two transition assertions still expected
  the old timed-run board reset after a concurrent change intentionally retained
  the final puzzle. The assertions now check retained results and assembly only
  when returning to the overview. The final full run is green.
- Source verification and lint passed; lint retains two existing warnings.
- Both Chrome and Firefox packages built; bundled engine hashes were verified
  during packaging. Build: `web-ext-artifacts/release-0.3.0-KjZQpi/`.
- Packaged Chrome review smoke passed both real bundled engines, complete
  reviews, both rating modes, reload recovery and one-time release migration.
  This uses the explicit `--review-only` option because the legacy learning
  smoke scenario still expects a removed Home screen; it is not counted as
  passing. The current dedicated popup/workspace audit separately passed real
  pointer/keyboard/reduced-motion behavior, blank startup without engine/data
  work, narrow layouts, learning entry/return, saved-game reload and PGN imports.
- Packaged Chrome layout audit passed all 20 sizes/cases, expanded popup,
  refresh/reset, legacy preference migration and concurrent library writes.
  Its popup fixture now uses the current native 360 px width. Desktop and popup
  screenshots were inspected. No installed Firefox runtime smoke was run.

Commands for the current packaged checks:

```powershell
node scripts/browser-smoke.mjs chrome --review-only
node scripts/release-layout.mjs
node scripts/learning-browser.mjs --popup-workspace
```

## Local implementation commits

| Commit | Message |
| --- | --- |
| `72894e34` | perf: defer sacrifice searches until Brilliant eligibility is known |
| `fdeda4b8` | perf: reuse bounded exact-context search history commands |
| `8856acee` | perf: skip unchanged SVG writes in every animated coach |
| `d205f5f6` | perf: ignore unrelated page mutations and batch review-button updates |
| `3f2f5117` | perf: retain bounded history-aware engine panel results |
| `a1c3aa34` | perf: retain compatible reviews when engine preferences change |
| `852839b4` | perf: retain review interface elements during navigation and refresh |
| `d1d8818a` | fix: tie active SF19 reuse to the actual scoring pool |
| `15ef1d0b` | test: align timed-run transitions with retained result boards |
| `a9848b90` | test: support current popup sizing and focused review smoke audits |

Commits use T-Julsgaard as author and the Codex co-author trailer. Nothing was
pushed. The staged marketing change and concurrent feature work were preserved.
