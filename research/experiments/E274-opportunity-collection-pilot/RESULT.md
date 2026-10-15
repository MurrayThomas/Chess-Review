# E274: opportunity collection pilot — working record

2026-10-15. State: **complete collection-feasibility study; exact/independent replay passes**.
Outcome: operational feasibility and variation screens pass; rating/accuracy
improvement is unassessed. No production promotion or scientific confirmation.
Plan `303458f`; collector, offline analysis and independent verifier frozen at
`9799dbe`, including the prospective E011 cache-inventory correction. Amended
v2 schema source33218d5 preserves the same selection rule, budgets and gates.

Two hash-selected D002 train games, four disjoint player sides. Forty complete
vectors are requested, ten spread through each side's nonforced decisions.
There are 1,288 unique queries: three exact historical cache matches and
1,285 missing queries. This is below the2,500 new-query cap. At the historical
57.9017 ms returned-time mean the missing queries imply about74.4 seconds before
reset/readiness/serialization/recovery overhead; the actual32-query smoke will
decide whether to proceed under the unchanged480-second projection threshold.

[Eligible v2 selection](evidence/selection-v2.json.gz) and [v2 freeze receipt](evidence/freeze-v2-run.json)
retain full query/history bindings, legal alternatives, source/config hashes
and permission lineage. No new engine observation, rating fit, target analysis
or performance metric yet. Nine original authored checks passed; a tenth now
directly verifies summary admission with the unchanged origin checker and rejects
the old schema. Nineteen focused experiment/data-policy checks pass.

Cache inventory: E008 exact20k raw queries plus compatible E01120k roots.
No E011 game targets are read or analyzed. The public SF19 rating-input archive
has the same nominal engine configuration but contains only per-move summary
statistics: no raw search cache, CP/PV records or independently reusable query
bindings. Its schema/field names were checked under the guarded loader; no
rating values or prediction assessments were inspected. It is not substituted
for exact raw observations. Existing80k searches differ in budget and are not
20k cache matches. E271's historical reference counted E008 reuse only.

The first collection command at44a1404 failed in admission before any engine
or output directory existed. Selection-v1 used `gameId` without the required
`games[].id`. Original selection/freeze bytes are unchanged; their invalid
registrations were explicitly withdrawn and are not collection inputs.
[Failure](evidence/initial-admission-failure.json) and
[withdrawal metadata](evidence/withdrawn-registration.json) retain the registration
hashes/reason. Regenerate selection-v2 from original guarded parents under new
filenames, with unchanged seeds, algorithm, scopes, nodes and gates. No guard
bypass or permission change.

Regenerated v2 again has1,288 keys/three reused/1,285 missing and40 vectors.
Original v1 selection/freeze bytes are retained solely as withdrawn evidence.

Admitted v2 collection fromdc8e1e5 completes in132.073 seconds, with1,285 new
queries/1,287 requests, two exact recoveries and no engine/integrity errors.
The32-query smoke mean caller time74.2556ms projects95.419 seconds and passes the
480-second gate; its queries are retained in the completed cache, never repeated.
Raw compressed observations are183,619 bytes. Startup/reset/serialization costs
and CP/WDL-vector coverage/variation will be assessed only after this raw freeze.
No scientific rating/accuracy performance metric has been evaluated.

[Raw observations](evidence/observations.json.gz) and
[collection receipt](evidence/collection-run.json) retain every new query, caller
and returned timing, selected/final-node diagnostics, source/config identity and
CPU/Node environment. Original rejected metadata and successful v2 remain distinct.
No reduced budget, altered game selection or changed gate. The single actual
engine collection is complete; do not rerun searches for offline reproduction.

Offline assessment fromeb2fd6a passes every collection-feasibility gate:40/40
complete vectors, ten per side, smoke/time/query/request limits and no search
failures. The separate variation screen also passes:34/40 WDL ranges >=.02,
with6/9/10/9 qualifying vectors across the four player sides. WDL range mean
.571438, median.525; CP-curve range mean.514365, minimum.102593. Six vectors have
negative unrestricted-root-minus-played WDL residuals. These are finite engine
consequences, not human difficulty or measured rating information.

Engine-returned mean73.6582ms versus caller mean98.8345ms; medians52.4059 versus
75.5715ms, p95s158.7598 versus187.2635ms. Caller sum127.002s plus5.070s outside
calls accounts for the132.073s collection (startup.404s included). Applying mean
caller time to E271's original missing count gives32.077h;32.041h after this
pilot's1,285 new keys. Additional E011 cache hits within the pilot:zero. Other
possible E011 matches outside these games were not censused. This is a rough
two-game/input-mix extrapolation, not a pure hardware comparison, confidence
bound, guaranteed whole-pipeline runtime or permission to run bulk collection.

[Offline result](evidence/results.json) and [assessment receipt](evidence/run.json)
are registered before replay. The forty vectors sample spread decisions, not
every decision of either game; whole-game accuracy/prediction validity is not
established. No model fitting, player-rating/outcome analysis or human labels.

Exact offline main/repeat result bytes match, with zero new engine requests.
The independent verifier reconstructs all40 selected legal vectors via public
Chess APIs, all1,288 query keys, all1,285 new records/PVs, caller-time/request
arithmetic and all40 WDL/CP consequence ranges. Original input/config/source
hashes match. Nineteen focused experiment/data-policy checks and maintained-source
verification pass. Clean repository replay is not claimed: only the existing
dirty application checkout is available, and no development clone was created.

[Repeat receipt](evidence/repeat-run.json) and
[independent verification](evidence/verification.json) retain the exact replay.
Reproduce OFFLINE from repo root after D001/D002 preflight:
`node research/experiments/E274-opportunity-collection-pilot/code/run.mjs evaluate --out research/runs/E274/new-report`.
To reproduce the verifier's repeat check, create an exact report at
`research/runs/E274/repeat`, then run
`node research/experiments/E274-opportunity-collection-pilot/code/run.mjs verify --out research/runs/E274/new-verification`.
Existing outputs refuse overwrite. Exact working-source bytes and newline
representations are recorded. Retained data supply the recipe; DO NOT rerun
the collector for an offline reproduction. Raw compressed evidence183,619 bytes
is below the2 MiB target. Total retained evidence, including withdrawn originals
and replay receipts, is627,900 bytes. Frozen v1 remains withdrawn, not an input.

## Reflection checkpoint

**Keep the full-alternative measurement approach as operationally feasible for
this pilot.** It supplies10 vectors per side within132s, and34/40 have >=.02
WDL consequence range. This does not prove rating information: only four sides
were measured, and engine consequence range is not human difficulty. At least
one vector has zero WDL range although all40 have nonzero CP-curve ranges.
Six negative unrestricted-root residuals remain; compatible searches need not
give identical root/played scales. Do not silently repair those observations.

**Defer bulk collection and fitting.** The98.83ms caller mean and32.08-hour rough
historical-reference projection materially change planning relative to18.79h.
Within the same new queries, caller time exceeds returned search time because
it includes resets/readiness/recovery; outside-call overhead adds another5.07s.
Across old versus new queries, hardware and input mix are confounded. The early
smoke projection95.42s also understates actual132.07s. No timing confidence or
whole-cohort guarantee follows. Ten sampled decisions/side are not full-game
evidence; a future rating study needs a declared sampling/target population,
refitted comparable baseline, train-only median, player-disjoint development and
fresh confirmation. Four sides cannot meet E271's300-game readiness gate.

**Recommended next distinct question: draw-aware outcome-probability calibration
using existing human-game outcomes and cached SF19 WDL roots.** A scalar expected
point value can represent different win/draw/loss distributions; test that full
distribution against actual human outcomes before spending more engine time.
Use a new preregistered development protocol, multiclass proper scores, game
clustering and mean-point diagnostics. This is a different target from the failed
CP mean-point curve, not a rescue of its consumed confirmation. No improvement
of displayed accuracy, categories or rating follows automatically.

Alternatives considered: fit ratings now (reject four-side sample); immediately
fill the full cohort (defer cost and confirmation design); tune E273's radius
(stop its exact exposed-case recipe); continue accuracy-weight mechanics
(retain candidate, but human usefulness remains missing). Choosing an outcome
target is a deliberate change in research direction, not adoption of a model.

Motivation only: [Kull et al.,2019](https://arxiv.org/abs/1910.12656), abstract
revisited2026-10-15, describes multiclass calibration in probability space.
It supplies neither our chess comparison, a validated candidate nor a guarantee.
STOP new searches/fits at this completed-study checkpoint; preregister next work.
