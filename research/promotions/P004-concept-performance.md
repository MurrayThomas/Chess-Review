# P004: Demand-driven Concepts performance and cost controls

Date: 2026-10-12. Baseline: `6b9330b`, following P003. The user explicitly
requested a large speed improvement, selectable concept categories ordered by
computation cost, and a Concepts settings page consistent with the other tabs.
This changes execution policy and settings, not research acceptance.

## Decision and behavior

- Keep one optional local worker, one cache and the existing All concepts / Coach
  reply views. Only the selected move is analyzed. Unvisited moves are registered
  for cost reporting but never queued for search. Starting position/practice has
  no selected job. Game replacement and disable cancel outstanding work.
- Navigation preempts unfinished work rather than waiting behind a different
  position. Partial supported facts remain associated with their own key;
  returning to an unfinished position restarts it. Completed positions reuse
  cached results. Stale worker messages and watchdogs cannot update/fail a new job.
- Use eight cost-ordered groups. Fast enables attacks/lines/placement,
  pawn/board features, recorded routes/development tempo and immediate
  checks/mating warnings. Tactical proof searches, pawn races/endgame policies,
  detailed positional comparisons and complete candidate/objective policies are
  opt-in. All preserves access to every P003 implementation with existing bounds.
  Basic rules, structural/development observations in the shared baseline remain
  available. Group controls skip additional detector calls and control old-chain
  flags/depths; they do not simply hide expensive results after computing them.
- Normalize selections in settings and include them in selected/mainline/variation
  input keys. Switching player perspective or view reuses results. A previous
  profile cannot supply findings for a new profile. Returning to a completed
  profile reuses its exact cache.
- Fast runs its controlled baseline once. Immediate successor checks, mate-in-one
  opportunities, recorded changes and undefended observations publish before the
  remaining enabled stages. Heavy profiles keep a cheap first checkpoint before
  bounded parent searches. Expensive successor panels run only with the policy
  group enabled. Budget exhaustion and unavailable prerequisites remain explicit;
  disabled groups are separate from proof failure and genuine no-finding results.
- Settings uses the existing compact width, rows, presets and accordion sections.
  Findings/details stay in the main Concepts panel; cost/status and selected-move
  diagnostics remain in the collapsed Analysis status section. Native checkbox
  activation finishes before redraw; rapid changes read current settings, and
  keyboard focus/scroll survive updates.
- The 22-move browser check exposed a completion-yield/watchdog race. Starting a
  selected job before the prior completion's zero-delay yield could lose the new
  watchdog handle. Cancel the queued yield before starting, guard it by its handle,
  and guard watchdogs by both key and run generation. A regression explicitly
  invokes both stale callbacks after starting another job and after restarting
  the same key.

The frozen E020–E080 modules, P001 provenance, P003 source adaptations, accepted
E082 tracker (378 occurrences / 328 names), provisional scopes and unavailable
inventory remain unchanged. Controls/worker/session hashes join the generated
runtime fingerprint. No historical research rerun or new detector is required.
All mode can still be expensive; these controls do not certify unavailable goals,
tablebases, broader strategy or a best move.

## Measurements and validation

Authored synthetic opening `e4 e5 Nf3 Nc6`, same local machine:

- Prior full Node pipeline: 5.021, 6.772, 11.712 and 10.094 seconds (33.599 total).
  Retained in `scratch/runtime-pilot.json`; this was measured before changes.
- Fast Node pilot: 0.215, 0.224, 0.430 and 0.310 seconds (1.179 total), initial
  observations in 0.096–0.142 seconds. This comparison uses fewer enabled searches;
  it does not claim identical coverage or faster exhaustive proof search.
- Final Chrome four-position layout check: 2.915 seconds including navigation/polling;
  detector time 2.174 seconds, maximum first response including worker startup
  0.775 seconds, navigation plus both view switches 0.101 seconds, maximum sampled
  UI tick gap 0.038 seconds. Prior P003 equivalent worker time was 32.75 seconds.
  Screenshots inspected at desktop and 320px: settings rows/checkboxes fit within
  the existing popover and scroll without horizontal overflow.

Same authored 22-move packaged-browser smoke game as P003:

| Browser | Prior full pipeline | Fast profile, all moves visited | Maximum first response | Findings / errors |
| --- | ---: | ---: | ---: | --- |
| Chrome | 247.46 s | 24.569 s wall / 23.056 s detector | 1.095 s | 461 / 0 |
| Firefox | 332.62 s | 39.096 s wall / 37.459 s detector | 2.014 s | 461 / 0 |

These are about 10x and 8.5x shorter total runs, respectively. Each move is
explicitly visited; an ordinary review does not need to wait for this entire
run. P003's 597 findings reflect the heavier profile. The default's smaller
collection and lower work are intentional; All retains the slower searches.
The difference is not evidence that exhaustive searches run 10x faster.

Validation on feature commit `f6cd8ab`:

- All 343 production tests pass. New checks cover group/stage/flag coverage,
  skipping disabled calls, rapid persisted checkbox changes, exact profile keys,
  cached profile reuse, both-color mate warnings, perspective/variation inputs,
  preemption, stale worker messages and stale timer callbacks, plus actual worker
  early-facts/full-policy completion. Existing source-concordance, evidence,
  prioritization/combination, duplicate/unsupported-claim and game tests pass.
- Source verification and production build pass; both bundled engines retain
  their verified checksums. Frozen promoted source identity checks pass.
- Packaged Chrome and Firefox smoke checks pass with zero concept errors,
  engine/scoring/reload behavior intact, both views sharing results and navigation
  clearing prior findings. Logs: `scratch/performance-chrome.log` and
  `scratch/performance-firefox.log`; compact timings:
  `scratch/performance-browser-summary.json`.
- All 33 final Chrome layout cases pass, including native category switching,
  skipped E090 stage, cache reuse after restoring a group, both colors, move/game
  replacement, both views, desktop/320/390px fitting and responsive navigation.
  Screenshots and measurements:
  `web-ext-artifacts/release-0.3.0-OpT0FK/layout-v799Jx/`.
  The final 320px screenshot was inspected; prior desktop screenshot has the same
  layout. The first harness attempts were adjusted to inspect the main finding
  panel and wait for engine completion before selecting a new game's move;
  navigation intentionally remains restricted to analyzed engine positions.
- Packaged Firefox lint: zero errors/notices, one existing dynamic-innerHTML
  warning outside concept rendering. No unrelated lint/research changes.
- `git diff --check` passes. No push or publication.

Retained outputs are local ignored artifacts. The historical research audit,
strategic acceptance and teaching usefulness remain separate and unchanged.
