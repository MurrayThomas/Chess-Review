# E275: draw-aware human outcome calibration

Preregistered2026-10-15 before new fitting or categorical outcome comparisons.
Research only. Existing current-main exception retained from E270 onward; no
development clone/branch switch, push, production scorer/model changes or use of
the unrelated dirty application files/staged video. No active Git operation or
safe separate clean verification checkout found at registration.

## Reflection, novelty and scope

E274 makes40 alternative vectors feasible but revises the rough full-reference
collection cost to32h. E273's exact margin policy stops on coverage. Rather than
collect more engine observations, ask whether treating human wins, draws and
losses separately improves outcome-probability prediction on existing roots.
Equal expected points need not imply equal outcome distributions. This is a new
target/model comparison, not another E008 slope sweep or rescue of failed E011
confirmation. Prior E004/E008 predict fractional mean points, E015-E018 legal
move choice; neither validates full human W/D/L probabilities. Their failures
remain unchanged. Reused labels are consumed development, never fresh test data.

No rating prediction, counterfactual move consequence, category agreement or
displayed accuracy validity is claimed. A positive result only shortlists this
full-distribution predictor; separate mean-point and search-stability guards
prevent a multiclass gain from silently justifying a move-loss replacement.

## Frozen observations and roles

Guarded D001/D002 preflight and `openResearchData`. Reuse the exact registered
E008 SF19/20k root observations at plies10,11,30,31,50,51,70,71 where the original
E008 protocol has a finite nonmate root. Preserve its exclusions, all600 games,
450 train/150 exposed development roles and one unit weight per game divided
equally over its remaining roots. Class target from the actual result in the
mover's perspective: win index0, draw1, loss2. Both colors/roots stay together.
Drop ratings and player identity from predictor inputs; IDs bind lineage/folds
only. Verify D002's1200 distinct development identities. The consumed reserved
300 games and E011 targets are not accessed for this study.

Five train-only folds: sort450 game IDs by SHA256(`E275-fold-v1:`+ID), assign
rank modulo5 (90 games each). Fit all recipes on360 games for each omitted fold,
and once on450 games for the final150-game development evaluation. D002 is
player-disjoint, so this is also player-separated. No tuning using omitted-fold,
development, stability or test outputs. Freeze/register decoded rows, folds,
engine/config/query hashes and specification before fitting; commit fitted
models before the single decisive evaluation. Code is frozen before either.

Reuse E009's fixed45 focal20k/80k root pairs for a separate stability guard; only
raw root scores, no human targets from those pairs enter stability. Validate all
source/config/history/query/PV bindings through existing E008 machinery and direct
paired-root checks. Higher-budget output is not independent human ground truth.

## Exactly one candidate and fixed controls

Order classes W,D,L. For finite roots, floor each engine WDL probability at
epsilon=.0005, renormalize to p, and use x=log(p). No fitted parameter receives
CP, ply, rating, result, ID, band, phase or clock inputs beyond these probabilities.

- Candidate C: softmax(a*xW, a*xD+b, a*xL), a in[0,20], b in[-20,20].
- Temperature control T: same map with b=0, a in[0,20].
- Current-mean control P: q=current SF19 CP expected-points curve, clipped to
  [epsilon,1-epsilon]; m=min(q,1-q). Probabilities(q-m*r,2*m*r,1-q-m*r), with one
  training-fitted r in[epsilon,1-epsilon]. This preserves q exactly after clipping
  and does not pretend the current scalar scorer supplies a unique W/D/L vector.
- Constant control K: training game-weighted class counts plus.5 in each class,
  normalized by training game count+1.5. No held-out count enters it.
- Raw engine p is descriptive only, not the only comparator.

For C/T minimize average game-weighted multinomial NLL plus .001/2 times
((a-1)^2+b^2); omit b for T. Fixed penalty, bounds and initialization(1,0), no grid.
Use bounded Newton/backtracking, <=200 iterations, projected-gradient tolerance
1e-9; fail instead of scoring an unconverged fit. For P use convex derivative
bisection, <=100 iterations, width<=1e-12; endpoint solutions are recorded.
C must be interior to qualify; a converged boundary control is still evaluated.
K has no optimization. Six training sets produce18 numerical fits and six
constant controls. Signed mates are excluded by the original outcome panel;
for the stability-only pairs a signed mate maps to a W/L point mass, mate0 invalid.

## Primary tests, weighting and uncertainty

Primary role: identical150 development games, one unit each. Metrics: class NLL
and multiclass Brier=sum over3 squared probability errors; smaller is better.
For EACH control P,T,K require mean control-minus-C NLL gain>=.01 nats/root
(averaged within game), a paired game-bootstrap lower bound>0, and C's multiclass
Brier no worse than that control. One candidate/three fixed comparisons: use
Bonferroni simultaneous two-sided98.333333% percentile intervals,20,000 draws
each, seeds20261021/20261022/20261023 for P/T/K. Quantile index floor(p*(B-1)),
tail=.05/(2*3). All gates must pass; no choosing a favorable comparator afterward.
These approximate conditional development intervals do not repair prior exposure.

Cross-fit guard on450 train games: C NLL and multiclass Brier no worse than EACH
P/T/K omitted-fold prediction, with identical coverage. Descriptive95% paired
bootstrap intervals (seeds20261031/32/33) are not additional confirmation tests.
Mean-point guard: development C mean(PW+.5PD) MSE no more than.002 above the
UNCLIPPED current fixed CP mean. Report fractional point NLL separately. These
are different targets, not interchangeable versions of the primary metric.

Subgroups fixed before exposure: ply<=20/21-50/>50 and current CP mean<.1/
.1-.9/>.9. For subgroups with>=30 distinct development games, relative to P
allow at most .03 NLL and .01 multiclass-Brier deterioration; smaller groups are
sparse/unresolved. Report each actual outcome class count and class-mean predicted
versus observed probability; rare draw-class uncertainty remains unresolved.
Five equal-width classwise probability bins are descriptive ECE diagnostics only;
never fit/select from them. No unregistered new subgroup gates.

Stability guard on45 paired roots: mean C total-variation drift may exceed final
T drift by at most.01. Report every vector/mean-point drift, root-mate cases,
requested versus selected-score budget limits and sparse scope. Do not call this
choice-vector stability or human calibration evidence. No new engine searches.

## Verification, resources and stopping

Synthetic checks: probability normalization/color symmetry, preserved CP mean,
draw identification, score/mate/missing-class handling, gradients/Hessian finite
differences, optimizer/KKT/boundary behavior, train-only folds, game weighting,
bootstrap reproducibility, empty/sparse guards and direct summary origin admission.
Independent verification: reconstruct frozen outcomes/folds from registered raw
parents; independently replay probabilities, NLL/Brier/point metrics, grouping,
paired bootstrap via a separate RNG calculation, stability and fit KKT/objective
conditions for all18 numerical fits. Exact refits/predictions/reports and a second
offline output directory must agree. Retain code/input/config/model/output hashes,
run commands, seeds, receipts, environment and all failed attempts. Clean repository
replay unclaimed unless an existing safe verification checkout becomes available.

Budget: zero downloads/searches/human labels, no production updates; <=5 minutes
fitting and <=2 minutes scoring after input admission, <=5 minutes independent
verification after admission. Soft retained evidence target2 MiB; explain any
overrun without discarding rows/proofs. Use focused tests, source verification,
guarded final preflight and diff checks; no full application regression is needed.

STOP after the unchanged joint outcome and reflection. Record improved,
no-improvement, inconclusive or invalid with evidence maturity/scope, identify
which target/gate limits the result, and choose the next distinct question.
No rescue grid, retuning on exposed150, new test consumption or implementation.

Sources read2026-10-15: [Kull et al.2019](https://arxiv.org/abs/1910.12656v1),
abstract/introduction and the model description in the NeurIPS paper motivate
multiclass probability-space calibration; the symmetric two-parameter restriction,
regularization, controls and gates above are OUR design, not its validated chess
method. [Stockfish WDL model](https://github.com/official-stockfish/WDL_model)
documents self-play calibration; that motivates testing human outcomes rather
than assuming engine probabilities are already human forecasts.

## Execution-date amendment,2026-10-16, before fitting

The local input-freeze commit's automatic permission review missed its deadline
while the app was unavailable. Authoritative status onOctober16 shows the staged
freeze still atd424fca, no fit directory and no launched fit handle. The permitted
single retry succeeds as3985423. Preserve the timeout metadata; it is neither a
scientific failed fit nor an unsafe-action finding. Resume without duplicate work.
The hash-frozen run.mjs date field is the originalOctober15 study date. Add a
provenance-only execute.mjs launcher that records actual UTC start/end, command,
revision, exit and its own hash, while invoking the UNCHANGED guarded entry point.
Use this launcher for remaining stages and retain its metadata with each receipt.
No scientific source hash, input, target, model, regularization, bound, seed, gate
or exposure rule changes. Re-admit the registered data before fitting. No model
parameters or categorical performance results were available before amendment.
