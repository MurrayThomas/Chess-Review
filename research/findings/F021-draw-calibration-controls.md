# F021: draw-aware calibration needs strong controls and rare-outcome evidence

2026-10-16. [E275](../experiments/E275-draw-aware-calibration/RESULT.md).
Development comparison; verified joint failure, no production promotion.

One frozen symmetric log-WDL temperature plus draw intercept is trained on450
games and compared on150 already exposed development games. Human mover W/D/L,
equal game weights and game-clustered inference distinguish the task from
engine self-play probabilities, scalar mean points, move loss and ratings.

| Comparator | Validation NLL gain, control minus candidate | Nominal simultaneous98.333% interval | Frozen comparison |
| --- | ---: | --- | --- |
| CP mean preserved, fitted draw split | .026352 | [-.018970,.078796] | Unresolved |
| WDL temperature only | .274490 | [.164165,.359710] | Pass |
| Constant training class frequencies | .012558 | [-.036311,.060818] | Unresolved |

Candidate validation NLL .820844/Brier .522375. All point-gain thresholds and
validation Brier guards pass, but two uncertainty gates fail. Cross-fit Brier
.484190 versus CP .477888 also fails its guard, despite slightly better NLL.
Mean-point, registered CP/ply subgroups, stability, coverage and fit gates pass.
Keep all comparisons; large raw-WDL/temperature gains alone would overstate value.

Only18 training and six validation games are draws. Predicted mean draw mass
.041839 versus observed .04 is compatible with merely matching a base rate;
all draw predictions occupy one0–.2 reliability bin. Low draw ECE does not prove
conditional calibration. Adequate counts in CP/ply subgroups do not establish
adequate independent draw outcomes. No fresh or population-wide claim.

Exact offline report/prediction repeat, original-input reconstruction and exact
refits pass. Independent arithmetic verifies18 numerical optimality conditions,
six constants,3,640 human outcome mappings,18,200 probability vectors,450 stability
vectors,120,000 bootstrap replicates and all metric/group/gate calculations.
Verification77.378seconds including admission; retained evidence650,269bytes.
Zero new searches or annotations. Clean-checkout replay unclaimed. Reproduction
supports the calculation, not scientific confirmation. Prior failed E011/E018
evidence remains unchanged.

Keep the strong controls, fixed comparison design and separation of prediction
targets. Stop this exact candidate; do not rescue it with a grid on the exposed
cohort. Defer bulk rating collection and any production selection. Next distinct
hypothesis: preserve the CP expected-score mean and model conditional draw
allocation. One possible affine allocation uses engine draw probability to mix
two bounded draw fractions; this is a design idea, not a fitted or validated
candidate. It needs a separate prospective protocol, train-only information
audit, matched controls and fresh confirmation. Compare its expected information
value with obtaining independent human labels for categories/accuracy before
spending the next compute budget. Checkpoint four records that choice.
