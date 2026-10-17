# P009: coherent evidence for provisional move annotations

2026-10-18. Implementation selected by Thomas: “Okay implement it,” following the
review of F022–F025 and the recommendation to adopt the Brilliant evidence guard
and coherent progress producer. This is a production correctness change against
baseline`62dd162c`, not a replacement accuracy/Elo model or a resumed research goal.
Use the existing current-main checkout. The usage-monitor schedule stays deleted.

## Selected scope

- `analysis.js`: adopt E277/E278 candidate C at the unpaired annotation boundary.
  If a matching root line supplies the played score, require exact top/played
  lines at the same positive integer depth, correct ranks, consistent bestmove
  identity and legal moves. Otherwise withhold the annotation/grade. Completed
  paired decisions and independent child-score fallback retain their behavior.
- `engine/progress.js` and `engine/uci.js`: adopt E279 producer P for callbacks.
  Each scored rank1 starts a new group, even at the same depth or when bounded.
  Wait for all requested ranks (capped by legal move count) to be exact, legal,
  distinct and common-depth before publishing. Suppress duplicate/decreasing-depth
  groups, keep the120ms throttle, and isolate snapshots from completed search data.
  No saved-frame history is accumulated in production.
- No change to UCI searches/options/budgets, completed parser results, fitted
  coefficients, rating formulas, accuracy aggregation or Brilliant thresholds.
  The losing-position gate already prevents Ke8 from receiving Brilliant.

Unsupported matching evidence can now leave a move temporarily ungraded; this is
intentional. A missing/unused alternative does not invalidate independent child
evidence. Valid paired caches remain compatible; no schema migration or blanket
cache eviction. Rollback is a revert of this implementation commit.

## Evidence and adoption limits

[F023](../findings/F023-brilliant-secondary-evidence.md),
[F024](../findings/F024-brilliant-coherence-coverage.md) and
[F025](../findings/F025-coherent-progress-producer.md) establish the input contracts
and their saved-stream coverage. The132 invalid and84 positive examples are
authored fixtures, not a measured real-world false-Brilliant rate. The traffic
comes from exactly two user-supplied images, under their specific diagnostic
authorization. The image/case/parent manifests were reverified; D001/D002 reuse
preflight passed185 artifacts. No public-data/training authorization is inferred.

E277's original failed overlay screen stays failed. E278's repaired fixture
screen and E279's observed tie with a weaker cache remain recorded unchanged.
E280's registered experiment remains unrun; the following production integration
checks do not retrospectively complete its protocol or its statistical gates.

Implementation replay: all54 native final results and UCI command sequences equal
the baseline; all924 progress snapshots equal frozen P when a simulated121ms
message clock exposes every eligible frame. All252 current application
category/grade/numerical snapshots match frozen C. Four current DOM-harness
case/build checks preserve Qg3 Brilliant and Ke8 Best. See the adjacent
`evidence/P009/replay.json` for hash-bound input receipts and counts.

Actual headless Chrome, production app/engine modules and bundled SF18/SF19 WASM:
four parent searches at2m nodes, MultiPV3, Hash32, Skill20, WDL enabled and cold
reset. The DOM consumes streamed parent/previously completed child previews.
Qg3 remains Brilliant at completion and Ke8 Best in both builds; all four searches
emit coherent progress, enforce120ms gaps and preserve completed numerical/search
evidence. Callback counts were7/6 for Qg3 and6/11 for Ke8 (SF18/SF19); observed
message-handler-to-callback latency was at most0.4ms on this machine. Temporary
Qg3 Best→Brilliant transitions are legitimate provisional updates, not counted
as false awards. This is a small integration check, not a performance guarantee.
See`evidence/P009/browser.json`. Local extension storage/APIs were mocked;
installed-extension and Firefox execution are not established by this check.

## Validation and release status

Focused annotation/engine/Brilliant/variation checks:57/57 pass, including both
colors/builds, invalid USED evidence, preserved paired decisions, unused-line
fallback, same-depth causality, rank completeness, zero-clock throttle and final
result isolation. The old metadata-free USED-score test now expects abstention.
Full application suite:495/495 pass with test concurrency1; the existing coach
timing check passes in the full run. Source verification and diff checks pass.
The offline public reproduction passes every check exactly, including outcome,
choice, accuracy, context and both rating models/protocols. Root lint retains
the same five errors and64 warnings as baseline; error details compare exactly
(unchanged research fixtures/oversized evidence and the existing puzzle JSON).
No thresholds or frozen evidence were changed to hide those lint results.

Reproduce the maintained regressions with
`node --test --test-concurrency=1 tests/*.test.mjs`, and the selected frozen
candidate/producer/case comparisons with
`node research/promotions/evidence/P009/verify.mjs` from the repository root.
The latter uses the guarded two-case artifacts, frozen E278 inputs and saved
baseline final objects; it performs no searches or fitting. Its outputs go to ignored
scratch. Live browser results are retained observations with the environment/
API-mocking limits above, not a portable installed-extension acceptance claim.
`evidence/P009/verification.json` records normalized source hashes and commands.
The earlier temporary replay harness had a fixture-field lookup error; correcting
that harness required no runtime or frozen-evidence changes. The failure log is
retained in ignored scratch. No push or release was performed.
