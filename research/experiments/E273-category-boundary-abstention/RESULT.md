# E273: ordinary-band abstention — working result

2026-10-15. State: **first development evaluation complete; verification pending**.
Outcome: **joint gates fail on coverage; selective-utility benefit retained**.
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
Nine synthetic checks and source verification pass. Exact repeated results,
raw-input reconstruction and independent BigInt-bootstrap replay are pending.
No clean repository replay or independent human validity is claimed.

Current next step: complete the frozen repeat and independent verifier, retain
their receipts, then record the reflection decision before starting another
candidate. Do not rerun collection or alter the failed gate.
