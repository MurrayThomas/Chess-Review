# E228 incomplete-history availability correction,2026-10-11

Original sourcee91af51 passed10pilot queries and14focused checks with zero probes.
Keep original pilot-started.json/pilot.json/focused-checks.json/provenance.json
unchanged. Before indexing, review found an actual semantic gap: a supplied
endgame history segment cannot exclude earlier repetitions, so its below-three
count must not report false actual threefold eligibility. Similarly absence of
an automatic terminal within a segment does not prove actual-game play remains
available. Existing tests covered positive thresholds, not this negative scope.

Add explicit priorHistoryComplete (only a canonical standard initial query root
or supplied history root), playAvailableWithinSuppliedSegment and nullable
actualPlayAvailable. Known automatic termination gives false; complete legal
history without it gives true; incomplete earlier history otherwise gives null.
Threefold eligibility is true when supplied evidence reaches the threshold,
false only with complete history below it, otherwise null. Preserve positive
clock/repetition facts, genuine histories, source WDL/rows/model and all caps.
No observed arbitrary-clock game outcome becomes available.

Amend candidate and separate checker, strengthen existing history/clock checks
with empty and short incomplete segments versus a canonical initial-root control.
Keep14checks and original ten queries; publish separately named amended pilot/
check evidence. Reuse source/archive data with no fresh probes. The unchanged
two-second source-opening+first-query gate applies. Bind original and amended
sources/evidence, explain projection differences and final current semantics.
