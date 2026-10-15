# Numerical research review checkpoints

Resumed 2026-10-15 by the user. Research and experiments only; implementation
requires the user's later selection. Current baseline and frozen evidence remain.

Each completed study must record: what improved, effect/denominators/uncertainty,
what failed, reproducibility status, validity limits, cost, and keep/reject/defer.
Then reflect on the next question instead of automatically sweeping parameters.
Before a large collection, compare its information value and cost with alternatives.
Before confirmation, freeze one candidate and obtain genuinely untouched evidence.
Before implementation, review the accumulated candidates with the user.

First checkpoint completed 2026-10-15: [F018](findings/F018-aggregation-and-evidence.md)
records the keep/reject/defer decisions. Twenty-one focused experiment/data-policy
checks and maintained-source verification pass. Both reports repeat exactly;
E271 has independent census/cost/lineage checks, E272 a portable pure-source replay.
No replacement model is confirmed. Retained evidence is 108,103 bytes for E271
and 9,660 bytes for E272. The next study should be preregistered separately;
this batch launches no bulk collection, rating fit or production promotion.

Second checkpoint, 2026-10-15: [F019](findings/F019-category-coverage-tradeoff.md)
retains the category tradeoff. E273 withholds six disagreeing and six stable
bands; emitted disagreement drops, but 73.33% coverage fails the frozen80% gate.
Exact/independent replay and18 focused experiment/data-policy checks pass.
Stop this fixed radius; do not tune it on the exposed45. Next recommend a
bounded current-machine collection pilot for rating evidence before bulk compute.

| Track | Starting evidence | Current research action | Review decision |
| --- | --- | --- | --- |
| Moves-only rating | E002 practical gain failed; E006 intervals broad; E019 proposes opportunities | [E271](experiments/E271-opportunity-feasibility/RESULT.md): 0/600 games have enough measured vectors; ~18.8 historical serial hours for full histories | Next: preregister bounded current-machine pilot; keep bulk collection/fits deferred |
| Accuracy | E008 development gain failed E011 confirmation; aggregation independently unvalidated | [E272](experiments/E272-accuracy-aggregation-stress/RESULT.md): OW passes synthetic properties; Tail20 fails padding/replication | Keep OW for coherent-input/external-target study; reject exact Tail20 for this purpose |
| Ordinary categories | Policy cutoffs lack independent rubric validation; search instability retained | [E273](experiments/E273-category-boundary-abstention/RESULT.md): risk/utility benefit under fixed cost, coverage gate fails; radius not calibrated uncertainty | Stop exact rule; keep abstention idea pending fresh and human evidence |
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
