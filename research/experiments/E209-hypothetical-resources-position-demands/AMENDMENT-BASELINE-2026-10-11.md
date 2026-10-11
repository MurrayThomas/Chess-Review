# Positive test baseline repair after retained first run

Initial36focused checks:34pass/2fail. The shared base selected models[0], which
is the quiet NO-mate control, while two checks require a positive baseline.
Thus exact full budget returned no-immediate-mate rather than proven; replacing
an already-empty answer.moves with[] was a no-op and correctly did not reject.
This is a fixture-selection error, not a relaxed gate or observed runtime defect.
Initial test/runtime/checker source, failure output and13complete raw diagrams
are retained before repair. All13 model results matched the frozen raw collection.

Select the first explicitly positive model by its prospective positive flag.
Runtime, checker, controls, collection, model fixtures, graphs, goals, cap and
preregistered positive/negative/mutation gates unchanged. Rerun only six tests
using that base: actual/model-turn prerequisites, disabled/missing, strict
controls, exact/short/zero budgets, model mutations and fifty/isolation.
The30other passed tests use unchanged per-case or demand baselines and remain
retained. No diagram recollection or full-file/cumulative repetition.
