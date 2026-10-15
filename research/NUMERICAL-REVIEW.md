# Numerical research review checkpoints

Resumed 2026-10-15 by the user. Research and experiments only; implementation
requires the user's later selection. Current baseline and frozen evidence remain.

Each completed study must record: what improved, effect/denominators/uncertainty,
what failed, reproducibility status, validity limits, cost, and keep/reject/defer.
Then reflect on the next question instead of automatically sweeping parameters.
Before a large collection, compare its information value and cost with alternatives.
Before confirmation, freeze one candidate and obtain genuinely untouched evidence.
Before implementation, review the accumulated candidates with the user.

| Track | Starting evidence | Current research action | Review decision |
| --- | --- | --- | --- |
| Moves-only rating | E002 practical gain failed; E006 intervals broad; E019 proposes opportunities | E271 cached full-game feasibility, no new fits | Pending |
| Accuracy | E008 development gain failed E011 confirmation; aggregation independently unvalidated | E272 controlled aggregation tradeoffs | Pending |
| Ordinary categories | Policy cutoffs lack independent rubric validation; search instability retained | Next candidate: uncertainty-aware boundary labels, report stability AND abstention/coverage | Defer selection until first checkpoint |
| Special categories | E005/E013 blinded packs pending human reviews | Preserve packs; consider separate tactical truth and perceived difficulty/usefulness labels | Independent reviews still required |
| General calibration | E018 point gain has interval including zero; E019 tail concentration | Preserve negative results; investigate target and information before more utility curves | No retry of stopped exact recipes |

Ideas for later comparison: information-weighted strength evidence instead of
move counts; multi-game hierarchical rating with honest uncertainty; uncertainty
intervals around category boundaries; separate consequence from difficulty;
retain a severe-error summary alongside average accuracy; audit human probability
calibration separately from engine self-play WDL. These are hypotheses, not
accepted improvements. Do not conflate Lichess blitz rating with FIDE Elo.

Sources revisited 2026-10-15: [Regan and Haworth, 2011](https://ojs.aaai.org/index.php/AAAI/article/view/7951)
models sensitivity and consistency in move choices;
[Maia-2](https://arxiv.org/abs/2409.20553) motivates skill-conditioned human
behavior assessment; [Stockfish WDL documentation](https://github.com/official-stockfish/WDL_model)
describes a self-play-calibrated engine quantity. Our inference is that decision
opportunity, human behavior and engine WDL need separate evaluation targets.
These sources motivate the agenda and do not validate our candidates.
