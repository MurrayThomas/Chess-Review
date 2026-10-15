# E273: uncertainty-aware ordinary consequence bands

Registered 2026-10-15 before the category comparison. Research only, current-main
checkout exception retained from E270/E271; no clone, branch switch, push or
production edits. The application checkout has unrelated dirty work and a staged
video; exclude all of it from research commits. No active Git operation found.

## Reflection and distinct hypothesis

E271 found insufficient full-game opportunity evidence and a historical ~19-hour
collection cost. E272 found mechanical accuracy improvements without human
validity. Before collecting more games, test whether a cheap conservative label
policy usefully trades coverage for reliability on the already retained E009
budget pairs. E009 exposed aggregate CP/WDL/rank drift and E014 root-consistency
failures; these are consumed development observations, not new confirmation.
No per-case consequence-band/abstention comparison has been inspected for this
study. Do not select a tolerance from its results.

The question is ordinary expected-point consequence bands, NOT the complete
classifier: Best/Book/Brilliant/Great/Miss, history and contextual mate rules are
outside scope. SF19 loss = current `sf19MoveQuality().loss`, including its
top-move zero rule and signed mate mapping. Use frozen boundaries
[.02,.05,.10,.20] expected points, matching ordinary excellent/good/inaccuracy/
mistake/blunder fallback policy. Larger search is a stability reference, not
correct tactical or educational truth.

Exactly one candidate: keep the unchanged low-budget band unless the low loss
is within .01 expected points of ANY boundary (inclusive, tolerance 1e-12).
Otherwise abstain with an explicit uncertain band. The radius is an engineering
tolerance, NOT a calibrated confidence interval. Low-budget inputs ONLY select
the output; high-budget scores never select, tune, repair or filter cases.
No refits, alternate radii, thresholds, weighting or rescue trials.

## Data, freeze and scope

Use guarded D001/D002 preflight and `openResearchData`, all 45 fixed E009 games:
30 D002 train, 15 exposed validation; one focal decision/game, player-disjoint.
Keep all cases, including mates, ties, negative residuals and top-status changes.
No rating, outcome or identity predictors; game ID binds lineage only. Reserved
test targets remain unused. Exact E008 20k/E009 80k SF19 observations, same build,
NNUE, history, reset, options, root restrictions and score perspective. Existing
verified query observations are reused, not rerun. Validate raw root/played keys,
histories, legal moves, scores and engine configurations, and reproduce E009's
recorded losses before using them. Preserve all raw exact-recovery diagnostics
in their original registered parents.

First freeze/register 45 compact scalar input records with root/played scores,
keys, history/position identifiers and configurations. That stage calculates no
bands, abstentions or new performance metrics. Commit derived inputs and all
candidate/evaluation code before the single decisive development evaluation.
Subsequent runs only reproduce that fixed evaluation.

## Metrics and gates fixed before evaluation

Baseline emits all 45 low-budget bands; reference is the 80k band from the same
scoring recipe. Report emitted coverage, reference disagreements, disagreement
rate among emitted labels, withheld disagreement count and withheld stable count.
Conditioning alone does not change predictions on retained cases.

Primary coverage-aware policy loss: disagreement costs 1, agreement 0, abstention
costs .1. This engineering preference means withholding costs a tenth of an
operational disagreement; it is not a measured human utility. Compare mean
baseline minus candidate loss on ALL45 paired games. Practical gate: >=.02 mean
gain, paired game bootstrap two-sided 95% percentile lower bound >0, AND coverage
>=.80. Use 20,000 replicates, LCG seed 20261015, quantiles floor(p*(B-1)); no
new significance look or test-set extension. A pass is development support for
this operational policy under this declared cost, not broad category validity.

Guardrails: for train/validation and each baseline consequence band with at least
10 cases, candidate coverage >=.60 and emitted disagreement rate no more than
.05 above baseline disagreement rate. Empty retained groups fail. Smaller groups
are explicitly sparse, reported and unresolved. All-case coverage/error matrices
remain visible even when one criterion looks favorable. Report conditional
Wilson 95% intervals as descriptive uncertainty, never a guarantee.

Secondary: ordinary confusion matrix; root-top changes and mate-influenced group;
loss drift relative to the fixed radius; conditional error-rate difference;
analytical break-even abstention cost = withheld disagreements / withheld cases.
This break-even is a descriptive calculation, not a sweep of candidate policies.
Show which conclusions depend on the arbitrary cost, and whether the radius
actually contains most observed drifts. No population or calibration claim from
45 convenient, exposed cases. Bootstrap intervals are approximate and sparse
event counts can be misleading.

## Verification, budget and stopping

Synthetic smoke tests cover every boundary, equality, high-budget independence,
mate/top/residual handling, all/none withheld, empty groups, cost accounting and
bootstrap reproducibility. Before exposure freeze the code. Independently replay
the raw CP-to-points equations, band counts, margin decisions, confusion/withheld
accounting and a separate resampling calculation; exact repeat in a distinct run
directory. Retain source/input hashes, dataset receipt, command, seed, environment,
engine configuration and output hashes. Clean repository replay remains unclaimed
unless an existing safe clean verification checkout is actually available.

Budget: no searches/downloads/fits/labels; <2 minutes calculation after admission,
<250 KiB retained output target. No large collection or full extension regression
is warranted by research-only code. Use focused tests, guarded preflight,
`npm run verify:source` and diff checks. Record all failures and deviations.

STOP after the fixed result and reflection: keep/reject/defer this exact policy,
identify whether the limiting factor is uncertainty, coverage, input scale or
missing human targets, and recommend one distinct next question. Do not expand
the grid or implement the winning-looking output automatically.

Literature motivation only: [Geifman and El-Yaniv, 2017](https://arxiv.org/abs/1705.08500)
and [El-Yaniv and Wiener, 2010](https://jmlr.org/beta/papers/v11/el-yaniv10a.html)
study risk/coverage with rejection. Their methods/guarantees are not adopted or
transferred to our finite-search comparison. Read scope: abstracts, 2026-10-15.
