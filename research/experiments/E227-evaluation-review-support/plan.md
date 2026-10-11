# E227: typed evaluation review and existing scoring support

Registered2026-10-11 after indexed E226617fe93. Previous goal turn is progress:
E226 implementation, focused evidence and index committed locally. BUILD-FIRST,
authorized current-main research-only exception, no push. D001 test preflight
passes54artifacts/registry c00de91f767ec439aecbf27fd0929fd26ed3d8c3ca6a5525e996ee58989d026b.
Only authored synthetic reports; no external games/book data or engine searches.

The approved ACTIVE-QUEUE/REMOVAL-SUGGESTIONS routing requires reuse of existing
move categories, not another blunder classifier. analysis.js classifyMove retains
contextual mate/forced/book/missed-opportunity logic and existing thresholds.
lib/public-scoring.js already provides sf19MoveQuality/sf19GameAccuracy. Reuse its
math unchanged, explicitly chosen as a display estimate; do not copy thresholds
or turn CP difference into an objective error/positional/tactical diagnosis.

Preserve15 support occurrences C0847..C0849,C1007..C1010,C1024..C1031. These are
source-qualified evaluation/report/scoring interfaces, not new detector credit.
No build.json or accepted-status change. Mate-search/tactical/positional reports
are reports, never claims that a search/PV proves mate absence or strategy.

Default-disabled inspectEvaluationReviewSupport(input,options). Strict plain input
source/eventId and<=16 reports. Each report has unique id, typed E223 diagnostics,
declared configuration {id,source,eventId}, optional legal playedMove and human
{move,source,eventId}, optional selection {frameId,rank}, optional existing category
{value,source,eventId,policyVersion}, optional analysis {kind:mate-search|tactical|
positional,source,eventId,text}. Categories use the existing runtime category keys;
preserve caller provenance and never authenticate a caller label as production.
Unknown frames/rank outside declared MultiPV reject; absent reported ranks are
unavailable. Legal played/human moves use genuine supplied E223 root/history and
automatic-terminal rules, retaining promotion identity and actor perspective.

Retain E223 diagnostics/CP/mate/bounds/depth/PVs. Selection is explicitly a reported
rank in one frame. A top move means reported rank1, never objective optimality.
Compare rank1 and the played move only inside the selected complete caller-framed
menu with exact scores. Do not merge frames, substitute child scores or compare
CP and mate arithmetically. CP residual is signed reference-minus-played from the
actual mover perspective; retain negative residuals without redefining categories.
Mate transitions retain typed scores; mate0 never gains a winner/proof.

Options enabled,maxRecords0..256(default256),maxPvPlies0..4096(default1024),
accuracyModel:none(default)|sf19-display. Charge every report plus all raw E223
rows; aggregate PV cap is passed down before replay. Atomic exhaustion gives no
view/routes. Explicit sf19-display computes the unchanged existing move transform
on eligible exact same-frame CP or nonzero mate scores; root legal count determines
forced exclusion and exact full UCI identifies a reported top agreement. Bounds,
missing/incomplete comparisons and mate0 yield unavailable. No SF18 fitted model
or calibration data is loaded, no search-budget/engine authentication is implied.

Aggregate accuracy only as a supplied-review-sample estimate grouped by actual
actor and exact declared engine identity/configuration provenance. Show included,
missing and forced counts; never claim whole-game accuracy, player rating or skill.
Suppress an affected group's aggregate on repeated full-root+played-move records,
so duplicate observations do not silently inflate its sample. Group identity and
configuration remain caller assertions, not verified comparable execution.
Human-versus-engine comparison is legal move identity within reported menus,
not proof that a human move is inferior. Analysis kind/text is reported context;
no inferred tactical/positional truth or hidden human mental state.

Freeze before decisive checks. Representative both-color evaluation/comparison/
existing-math/reconstruction<=2seconds. Focused only: CP positive/negative, mate
sign/zero/bounds, missing/conflicting/partial/split frames, played-outside-menu,
legal human move/promotion, existing categories/provenance, forced exclusion,
sample groups/duplicates/missing, strict/getter/default-disabled, exact/short/zero
shared budgets, clones and forged evaluation/category/accuracy/top/proof fields.
Independent scalar/menu/group/category reconstruction must not import own review
classifier. Shared E223/checker, Chess/schema and existing scoring math limit its
independence; validate representative math against independent equations too.
Retain actual process output, source/evidence hashes and guard receipt. No full or
inherited historical matrix. Source verification/diff checks then index/commit.

Open: authenticated production category/engine/config adapters, independent
score/outcome/mate/strategy truth, full-game source/sequence/selection validity,
validated explanations of error causes, SF18 calibrated scoring, real-game
precision/human usefulness, all67 strategic prerequisites, combined validation
and separate production promotion. Tablebases/rating support remain next scopes.
