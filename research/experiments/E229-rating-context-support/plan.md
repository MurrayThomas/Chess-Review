# E229: reported rating and performance context

Registered2026-10-11 after indexed E228a6ebda7. Previous goal turn is progress:
guarded tablebase interface/evidence/index committed, incomplete-history gap
corrected openly. BUILD-FIRST/current-main research-only exception, local commits
no push. D001 test preflight passes54artifacts/unchanged registry. Only authored
synthetic event/rating reports. No games acquisition/search/tablebase probes.

Preserve C1041..C1046: Rated game, Unrated game, Rating, Elo rating, Rating
performance, Performance rating. These are source-qualified contextual support,
not board detectors or verified strength. No build.json/accepted credit. Existing
lib/public-scoring.js numerical rating models answer a different move-quality
question; the separate numerical goal stays paused. Do not invent a new Elo,
performance, update or conversion formula or claim official policy. Reuse E224
competition context and optionally E227 typed review output as separate context.

Default-disabled inspectRatingContextSupport(input,options). Strict plain source/
eventId, required typed E224 competition; systems<=16, snapshots<=128,
gameContexts<=128, performanceReports<=32. Optional moveReview {player,review:
E227input,accuracyModel:none|sf19-display}. Referenced players/games/systems/
snapshots must exist; distinct IDs and no repeated sample references. Declared
systems {id,name,model:elo|glicko|other,authority,pool,variant,timeControl,version,
source,eventId} remain separate, even when names/values happen to match.

Snapshots {id,player,systemId,value:null|finite0..10000,provisional:boolean|null,
asOf:YYYY-MM-DD,source,eventId}; zero is preserved as a reported number, not
automatically recoded as unrated. Validate real calendar dates. No implicit
latest snapshot, system conversion or strength ordering across pools/platforms/
time controls. Game contexts {gameId,date,ratingStatus:rated|unrated|unknown,
systemId:null|known,whiteSnapshotId:null|known,blackSnapshotId:null|known,source,
eventId}; each referenced snapshot belongs to its named player. System mismatch,
future snapshot and absent values make that rating use unavailable rather than
silently selecting a different snapshot. Missing context gives unknown status,
never inferred unrated. Rated declarations need no invented policy authentication.

Every game view retains its original E224 result/played flag and explicit source
context. Compatible rating reports may expose a white-minus-black arithmetic
difference only within the exact declared system and at/before game date; report
provisional/unknown flags and source identities, never predicted results/skill.
Unrated games can retain rating context without becoming rated. No board/engine
inference of rated status or hidden rating. No automatic rating update.

Performance reports {id,player,systemId,value:null|finite-10000..10000,method,
period:{from,to},scope:rated-only|all-played,gameIds<=128,source,eventId} are caller
reports, not computed/certified performances. Audit the explicitly selected
sample: player participation, completed actually-played results, dated period,
declared system and rated-only policy. Missing data excludes with explicit reason,
never silently counts pending/cancelled/unplayed games or byes as played results.
Report exact wins/draws/losses and half-point numerator/denominator, included and
excluded IDs, opponent snapshot availability/provisional state and same-system
value. Do not adjust the reported performance, calculate a new estimate, grant
norms, infer complete event/sample coverage or compare it to move-quality rating.
Both performance occurrences retain separate routes to this audited reported
context; computedPerformance/ratingChange/officialCertification remain unavailable.

Optional E227 review context preserves existing display math and its source/frame/
sample limits. It is explicitly unlinked to event game results/rating identity;
no engine score/accuracy conversion into a recorded or performance rating. E224
declared event score units are separately retained, not reused as half-point
result units when a custom scoring policy differs.

Options enabled,maxRecords0..4096(default1024),maxReviewPvPlies0..4096(default1024).
Charge systems/snapshots/context/performance records, each selected performance
game reference, E224 players/games/byes/norms/titles/tie columns/rows, optional
review wrapper and all E227 report/raw-row records. Inherited child limits remain
explicit; pass remaining budgets down. Any exhaustion atomically hides view/routes.
No truncation/partial ledger. Default disabled still validates schema but computes
no event/review/rating observations.

Freeze before decisive checks. Representative rated/unrated/system/sample review
and separate reconstruction<=2seconds. Focused positives/negatives only: both
sides, zero/null/provisional/unknown snapshots, missing/foreign/future systems,
real dates/periods, custom scoring versus half-point results, missing contexts,
unrated/pending/unplayed/byes/other-player exclusion, repeated/unknown references,
reported zero/negative/extreme performance without certification, optional E227
separation, strict/getter/default-disabled, exact/short/zero shared budgets, clones
and forged status/rating/score/sample/official claims. Separate checker imports
no own rating/sample classifier; shared E224/E227 adapters/checkers/schema limit
independence. Retain actual process outputs/input and evidence hashes/guard receipts.
No full historical matrix or numerical fitting. Source verify/diff checks/index.

Open: authenticated rating/event provenance, applicable current rating/performance/
update policies, complete sample and official eligibility, production adapters,
strength/prediction/precision/human usefulness, original67strategic prerequisites,
combined semantic/integration validation and separate production promotion.
After this batch, audit full original scope and strategic prerequisite routes;
127support dispositions are not completion of the original catalog/coach goal.
