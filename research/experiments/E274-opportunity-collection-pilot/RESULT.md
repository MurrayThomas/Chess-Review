# E274: opportunity collection pilot — working record

2026-10-15. State: **v1 admission failure retained; v2 correction ready to freeze**.
Plan `303458f`; collector, offline analysis and independent verifier frozen at
`9799dbe`, including the prospective E011 cache-inventory correction.

Two hash-selected D002 train games, four disjoint player sides. Forty complete
vectors are requested, ten spread through each side's nonforced decisions.
There are 1,288 unique queries: three exact historical cache matches and
1,285 missing queries. This is below the2,500 new-query cap. At the historical
57.9017 ms returned-time mean the missing queries imply about74.4 seconds before
reset/readiness/serialization/recovery overhead; the actual32-query smoke will
decide whether to proceed under the unchanged480-second projection threshold.

[Selection](evidence/selection.json.gz) and [freeze receipt](evidence/freeze-run.json)
retain full query/history bindings, legal alternatives, source/config hashes
and permission lineage. No new engine observation, rating fit, target analysis
or performance metric yet. Nine original authored checks passed; a tenth now
directly verifies summary admission with the unchanged origin checker and rejects
the old schema. Nineteen focused experiment/data-policy checks pass.

Cache inventory: E008 exact20k raw queries plus compatible E01120k roots.
No E011 game targets are read or analyzed. The public SF19 rating-input archive
has the same nominal engine configuration but contains only per-move summary
statistics: no raw search cache, CP/PV records or independently reusable query
bindings. Its schema/field names were checked under the guarded loader; no
rating values or prediction assessments were inspected. It is not substituted
for exact raw observations. Existing80k searches differ in budget and are not
20k cache matches. E271's historical reference counted E008 reuse only.

The first collection command at44a1404 failed in admission before any engine
or output directory existed. Selection-v1 used `gameId` without the required
`games[].id`. Original selection/freeze bytes are unchanged; their invalid
registrations were explicitly withdrawn and are not collection inputs.
[Failure](evidence/initial-admission-failure.json) and
[withdrawal metadata](evidence/withdrawn-registration.json) retain the registration
hashes/reason. Regenerate selection-v2 from original guarded parents under new
filenames, with unchanged seeds, algorithm, scopes, nodes and gates. No guard
bypass or permission change.

Next: freeze/register/admit corrected selection-v2, then execute its32-query smoke
and600-second watchdog, preserve complete/partial output and errors, register
raw observations before offline analysis. No automatic retry, reduced budget,
game substitution, fitting or bulk collection. Continue result/reflection here.
