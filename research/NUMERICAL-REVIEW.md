# Numerical research review checkpoints

Resumed 2026-10-15 by the user; updated2026-10-16. Research and experiments only; implementation
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

Third checkpoint,2026-10-15: [F020](findings/F020-opportunity-collection-cost.md).
E274 collects40 complete vectors in132s and passes its operational/variation
screens; exact/independent replay and19 focused checks pass. Caller timing projects
roughly32h for E271's original missing-query reference, with explicit input/hardware
limits. Keep measurement approach, defer bulk collection/fits. Next recommend a
preregistered draw-aware W/D/L probability comparison against actual human outcomes
using existing cached roots; no new engine cost or implied accuracy-percentage gain.

Fourth checkpoint,2026-10-16: [F021](findings/F021-draw-calibration-controls.md).
E275's frozen draw-bias candidate fails the joint screen. Development NLL gains
over CP and constant controls have adjusted intervals including zero; cross-fit
Brier is worse than CP by .006302. Its large gain over temperature alone is
insufficient. Exact/independent replay passes, including all18 refits and120,000
independent bootstrap replicates. Only six validation draws; near-correct average
draw mass and one-bin draw ECE do not demonstrate conditional calibration.
Stop the exact candidate; no tuning or replacement-model promotion.
Final22 focused checks, guarded185-artifact preflight, maintained-source verification
and diff checks pass; no production changes or push.

This closes five new numerical studies across the four tracks and creates a
review boundary. Feasibility and mechanical properties are useful findings;
none establishes a production improvement across the requested outputs.

| Next direction | Information it could add | Cost/limitation | Reflection decision |
| --- | --- | --- | --- |
| CP-anchored conditional draw allocation | Test draw information while preserving current expected-score mean | Cached roots; zero searches; only18 training draws,150 validation games already exposed | Recommended next research design and train-only information audit; separately preregister any fit; no automatic trial |
| More temperature/draw-bias tuning | Another fit on the same exposed outcomes | Low compute; repeated selection and no fresh evidence | Stop this exact family; no rescue grid |
| Full opportunity-aware rating collection | Complete alternative-choice inputs for rating comparisons | Rough32h reference; current40 vectors/four sides cannot establish rating validity | Defer until a bounded predictive design and confirmation plan justify cost |
| Independent category/accuracy targets | Distinguish consequence, difficulty and usefulness; test external meaning of accuracy | Human rubric/review or a justified external target still required | Preserve as a separate priority; engine stability or outcome prediction cannot substitute |

The next concrete action is a design-only CP-anchored draw-allocation protocol
with a train-only information check, compared with the independent-target option
before any decisive run. More exposed-cohort gains would remain development;
fresh confirmation and user selection remain necessary before implementation.
Keep this review point available for the user to redirect the research agenda.

| Track | Starting evidence | Current research action | Review decision |
| --- | --- | --- | --- |
| Moves-only rating | E002 practical gain failed; E006 intervals broad; E019 proposes opportunities | [E274](experiments/E274-opportunity-collection-pilot/RESULT.md): four-side/40-vector collection feasible; rough32h full-reference cost | Keep input approach; four-side sample cannot support fits; defer bulk and design fresh confirmation |
| Accuracy | E008 development gain failed E011 confirmation; aggregation independently unvalidated | [E272](experiments/E272-accuracy-aggregation-stress/RESULT.md): OW passes synthetic properties; Tail20 fails padding/replication | Keep OW for coherent-input/external-target study; reject exact Tail20 for this purpose |
| Ordinary categories | Policy cutoffs lack independent rubric validation; search instability retained | [E273](experiments/E273-category-boundary-abstention/RESULT.md): risk/utility benefit under fixed cost, coverage gate fails; radius not calibrated uncertainty | Stop exact rule; keep abstention idea pending fresh and human evidence |
| Special categories | E005/E013 blinded packs pending human reviews | Preserve packs; consider separate tactical truth and perceived difficulty/usefulness labels | Independent reviews still required |
| General calibration | E018 point gain interval includes zero; E019 target limits; E274 scale/search differences | [E275](experiments/E275-draw-aware-calibration/RESULT.md): draw-bias model beats temperature only; CP/constant uncertainty gates and cross-fit Brier fail | Stop exact candidate; keep strong controls; distinct CP-anchored draw hypothesis requires separate protocol and fresh confirmation |

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
