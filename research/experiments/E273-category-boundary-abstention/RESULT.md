# E273: ordinary-band abstention — working result

2026-10-15. State: **complete development experiment; independent replay passes**.
Outcome: **inconclusive as a replacement; joint coverage gate fails despite
selective-utility benefit under the declared cost**.
No promotion or scientific confirmation. Plan `30eb9c3`, candidate code `7af1e42`,
registered input freeze `a856b53` precede the single decisive evaluation.

| Fixed SF19 45-game development comparison | Baseline | Candidate |
| --- | ---: | ---: |
| Emitted bands | 45 | 33 |
| Coverage | 100% | 73.33% |
| Disagreements with configured 80k-node band | 10 | 4 |
| Disagreements among emitted | 22.22% | 12.12% |
| Mean policy loss: disagreement 1, abstention .1 | .222222 | .115556 |

Candidate withholds 12 bands: six higher-budget disagreements and six stable
bands. Mean paired policy gain .106667, approximate bootstrap 95% interval
[.024444, .206667] (20,000 game draws, seed 20261015). Practical and interval
gates pass, but 73.33% coverage fails the frozen 80% requirement. Eligible
subgroup guards pass; four non-excellent consequence groups are sparse and
unresolved. The overall outcome stays failed; no tolerance tuning or gate rescue.
Predictions on emitted cases are unchanged, so this is selective output, not
better classification of those same cases. Baseline/candidate risk have different
denominators; the all45 policy loss explicitly prices missing labels.

The break-even abstention cost is .5 per withheld label for this fixed panel.
The declared .1 cost favors withholding here, but no human utility was measured.
Only 30/45 actual loss drifts fit inside the nominal .01 radius; maximum drift
.061297. This margin is not a calibrated uncertainty interval. There are four
played-top status changes and one mate-influenced focal decision. Retained
agreement is 29/33, with a descriptive Wilson 95% interval [.726745,.951838].
The bootstrap and conditional interval are approximate, development-only and
based on sparse events; neither establishes a population guarantee.

Scope is ordinary CP expected-point consequence bands at the frozen default
2/5/10/20 percentage-point boundaries. Full Best/Book/Brilliant/Great/Miss,
contextual mate/history rules and human judgments were not evaluated. The same
engine's higher configured budget is a finite-search reference, not ground truth;
selected exact iterations can precede the nominal budget. All45 cases remain.
No new data, engine searches, fits, human labels, rating/outcome analysis or
reserved test targets. Original D002 exposure remains consumed development.

Evidence: [frozen inputs](evidence/inputs.json.gz), [protocol](evidence/freeze.json),
[freeze receipt](evidence/freeze-run.json), [results](evidence/results.json),
[decisions](evidence/decisions.json.gz), [main receipt](evidence/run.json).
All inputs/results are registered D002 derivatives with original lineage.
Nine synthetic checks plus nine data-policy checks and source verification pass.
Main/repeat results match exactly. Independent verification reconstructs all
frozen inputs from their original raw queries, checks 90 score equations,
45 margin decisions, 25 confusion cells, subgroup counts/gates, all-case cost
accounting and 20,000 bootstrap replicates using separate BigInt resampling.
Source/input hashes and exact decision records match. No new candidate trials.
No clean repository replay or independent human validity is claimed.
Retained evidence totals 156,765 bytes, below the 250 KiB target. Freeze/main/
repeat/verification take 22.52/21.76/22.66/22.89 seconds including source admission,
not engine work. No failed or hidden evaluation attempts in this study.

Additional evidence: [repeat receipt](evidence/repeat-run.json),
[independent verification](evidence/verification.json). The latter is generated
from the retained first-result source revision, not a candidate rescue.
Commands from repo root after D001/D002 preflight:
`node research/experiments/E273-category-boundary-abstention/code/run.mjs evaluate --out research/runs/E273/new-run`.
For verification, generate an exact reproduction at `research/runs/E273/repeat`,
then run `node research/experiments/E273-category-boundary-abstention/code/run.mjs verify --out research/runs/E273/new-verification`.
Existing outputs refuse overwrite; retained registered inputs/evidence supply the
rebuild recipe. Exact source bytes and newline representations are in receipts.

## Reflection checkpoint

**Stop this exact fixed-margin policy.** Passing utility at a declared .1 cost
does not override failed coverage or validate the cost as a human preference.
Keep rejection/ambiguity as a research idea, but do not shrink the radius on
these exposed cases to find a passing point. Four rare-band groups are sparse;
repeated selector tuning on the same45 is not independent evidence.

**Do not describe the radius as calibrated uncertainty.** Two thirds of observed
drifts fit inside it, and a higher-budget comparison can itself be wrong.
Distinguish consequence bands, reliability, perceived difficulty and human
instructional usefulness. Existing blinded packs remain pending, unchanged.

**Next recommended distinct study: a bounded current-machine collection pilot
for opportunity-aware rating evidence.** E271's historical 18.8-hour estimate
needs measurement on this hardware before bulk collection. Preregister a cheap
smoke, an explicit elapsed-time/search cap, traceable development games and
whether enough complete decision vectors can be collected within it. Do not fit
ratings or collect a confirmation cohort as part of that pilot. This changes
the next question to evidence acquisition, rather than tuning labels on45 cases.
Alternative considered: uncertainty sets from low-budget root inconsistency;
defer it until its distinct hypothesis and need for fresh validation are clear.
