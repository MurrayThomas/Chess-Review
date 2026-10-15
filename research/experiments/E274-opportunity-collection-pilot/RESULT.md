# E274: opportunity collection pilot — working record

2026-10-15. State: **selection frozen; collection not started**.
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
or performance metric yet. Nine authored synthetic checks pass.

Cache inventory: E008 exact20k raw queries plus compatible E01120k roots.
No E011 game targets are read or analyzed. The public SF19 rating-input archive
has the same nominal engine configuration but contains only per-move summary
statistics: no raw search cache, CP/PV records or independently reusable query
bindings. Its schema/field names were checked under the guarded loader; no
rating values or prediction assessments were inspected. It is not substituted
for exact raw observations. Existing80k searches differ in budget and are not
20k cache matches. E271's historical reference counted E008 reuse only.

Next: commit registered selection, execute collector once with its32-query smoke
and600-second watchdog, preserve complete/partial output and errors, register
raw observations before offline analysis. No automatic retry, reduced budget,
game substitution, fitting or bulk collection. Continue result/reflection here.
