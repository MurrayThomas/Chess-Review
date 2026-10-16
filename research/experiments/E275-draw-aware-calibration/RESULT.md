# E275: draw-aware calibration — working record

Updated2026-10-16. State: **complete; exact and independent verification pass**.
Outcome: **inconclusive against stronger controls; joint screen fails**.
Plan df50362 and code d424fca precede any new fit or categorical performance look.
No production changes. Current-main research exception; dirty application work
and staged video remain excluded, no push/new development checkout.

Frozen inputs:600 D002 development games (450 train,150 exposed validation),
3,640 original finite/nonmate roots,54 preserved original mate-root exclusions,
five90-game train folds and45 configured20k/80k root pairs. All1,200 development
player identities are distinct; IDs define provenance/folds only, ratings are
not predictor inputs. Human W/D/L targets are decoded in the mover's perspective.
No consumed reserved300 target is used. Thirteen synthetic tests pass, including
derivatives/Hessian, independent optimality, mean preservation, color symmetry,
target orientation, game weighting, fold isolation, sparse groups and unchanged
summary-origin admission.

[Inputs](evidence/inputs.json.gz) and [freeze receipt](evidence/freeze-run.json)
retain original source/config/query hashes, data eligibility and code bytes.
The specification fixes one two-parameter candidate and three controls, all
gates and multiplicity before fitting. Full-distribution prediction is distinct
from mean points, move consequences, displayed accuracy, rating or human labels.
Existing label exposure remains development; successful replay cannot confirm
the scientific claim or repair E011's failed confirmation.

Input-freeze commit3985423 completes after an automatic permission-review deadline
expired on the original attempt. Authoritative Git status/no fit directory confirm
that the initial commit and fit never ran; one permitted commit retry succeeds.
No unsafe-action decision or duplicate fit. [Timeout metadata](evidence/approval-timeout.json)
and a prospective plan amendment preserve this. The original scientific code and
October15 study-date receipts remain unchanged. A provenance-only launcher records
actual UTC execution dates for stages resumedOctober16; its hash accompanies each
execution record. Re-run data admission before the first fit.

Training-only stage from3453ec6 onOctober16 completes18 numerical fits and six
constant controls. All converge; all six candidate fits are interior. Final
candidate a=.1146858304,b=-2.5538008887; temperature a=.0801837225; CP draw
r=.0579465591. These are training parameters/diagnostics, not held-out evidence.
The final candidate projected gradient9.94423e-10 meets the frozen1e-9 threshold;
no tolerance, penalty, bound or family change. No failed numerical attempts.

[Models](evidence/models.json), [fit receipt](evidence/fit-run.json) and
[actual fit execution](evidence/fit-execution.json) retain all six training sets,
code/input hashes and actual UTC dates. The scientific entry point's date is the
October15 registration date, as prospectively documented; the launcher records
theOctober16 execution separately. Neither omitted-fold nor validation metrics
had been assessed at that training-only boundary. No searches, human annotations
or production updates.

Fitted-model commit1536bc0 precedes the single development comparison. All150
development games/896 roots retain coverage. Multiclass NLL (lower better):
candidate .820844, CP-mean-preserving control .847196, temperature1.095334,
constant .833402, raw engine3.389685. The controls are distinct research forecasts;
the extension does not already expose a full CP-based W/D/L distribution.

| Control minus candidate NLL | Point gain | Nominal simultaneous98.333% interval | Gate |
| --- | ---: | --- | --- |
| CP mean preserved, fitted draw split | .026352 | [-.018970,.078796] | Interval fails |
| WDL temperature only | .274490 | [.164165,.359710] | Pass |
| Training-only constant class frequencies | .012558 | [-.036311,.060818] | Interval fails |

Every practical point-gain threshold passes, and all three development multiclass
Brier guards pass. The uncertainty gates against CP and constant fail, and the
cross-fit guard fails. Mean-point, subgroup, coverage, convergence/interior and
45-root stability guards pass. Candidate Brier .522375 versus CP .530751; mean
point MSE .232227 versus CP-distribution .236432. Better multiclass loss does
not by itself establish displayed accuracy, move consequence or rating validity.
Across450 cross-fit games/2,744 roots, candidate NLL .777532 versus CP .784412,
but candidate Brier .484190 is WORSE than CP .477888 by .006302. This fails the
frozen cross-fit guard despite a small NLL gain .006880 (descriptive95% interval
[-.016100,.032908]). Overlapping training fits are not fresh confirmation.

Only18 training and six validation games are draws. Mean predicted draw mass
.041839 versus observed .04 and draw ECE .001839 look close, but all predicted
draw probabilities occupy the same0–.2 bin. This is no demonstration of conditional
draw calibration. The six registered CP/ply subgroups all have enough games;
that subgroup coverage does not repair the rare-draw limitation. Both mover
perspectives and repeated roots are clustered by game, not independent outcomes.

The candidate mean total-variation drift is .006421 on45 configured20k/80k root
pairs, versus temperature .005577 and raw .047119; candidate maximum .031815.
This passes the frozen .01 deterioration allowance relative to temperature,
not an independent human-calibration or choice-vector stability test.

[First report](evidence/results.json), [all predictions](evidence/predictions.json.gz),
[assessment receipt](evidence/run.json), [actual execution](evidence/main-execution.json)
retain the unchanged joint failure. No rescue tuning, new searches, test targets
or production model changes.

[Repeat receipt](evidence/repeat-run.json) and [actual repeat execution](evidence/repeat-execution.json)
retain a second output directory with identical report and prediction hashes.
[Independent verification](evidence/verification.json) passes in77.378 seconds
including admission; [UTC execution](evidence/verification-execution.json) confirms
successful completion onOctober16. Frozen inputs reconstructed from original
parents; all18 fits and six constant controls reproduced exactly. Separate
target/probability/NLL/Brier/KKT/RNG arithmetic checks3,640 human target mappings,
18,200 outcome vectors,450 stability vectors,120,000 bootstrap replicates and
all group/point metrics and gates. No clean-checkout replay or scientific
confirmation is claimed. The retained650,269 evidence bytes are below2MiB;
duplicate bulk predictions need not be retained because their exact hashes match.
Final checks:22/22 focused experiment/data-policy tests, guarded D001/D002 reuse
preflight (185 registered artifacts), maintained-source verification and research
diff checks pass. Scientific source, inputs and fitted parameters are unchanged.

Reflection: stop this exact log-WDL temperature plus draw-bias candidate. Its
large advantage over raw engine WDL or temperature alone does not establish an
advantage over the stronger CP and constant controls. Preserve those comparators;
neither is promoted by this failed comparison. A full W/D/L forecast and its mean
can rank models differently, so this experiment cannot justify an accuracy,
move-loss, category or rating change. Do not retrofit the gate or tune on these
exposed600 games.

Next distinct question: can a CP-anchored draw-allocation model add conditional
information while preserving the existing expected-score curve? Start with a
separate design/protocol and train-only information audit before fitting; require
matched controls and genuinely untouched confirmation before any promotion.
This is a hypothesis, not an accepted improvement. Review alternatives and rare-
draw evidence needs at [checkpoint four](../../NUMERICAL-REVIEW.md) before committing
to further empirical work or the roughly32-hour rating collection.
