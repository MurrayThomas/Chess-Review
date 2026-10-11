# E196 — phase change and bounded simplification window

2026-10-11. BUILD-FIRST prototype, two new occurrence candidates C0917/C1081.
Preregistered at efcb3d16d8ed9841329113eb6654c57505d050bc; current main under
user-approved checkout exception, research-only local commit, no push.

The original queen exchange forces every legal defense into live pawn-free KRK
with the original actor rook. This phase change remains true when H2 conversion
fails. The positive same-queen checking noncapture Qg7+ instead permits Qxg7+;
the enemy retains nine root-relative material points through every immediate live
actor counterreply. Actor mate fails even at H4 after that alternative while the
actual exchange has a complete H2 mating policy. This is a finite timing window,
not a proof of globally correct/unique timing or global alternative loss/draw.

Three new H4 delay queries completed: White39, reflected Black39, genuine-prefix41
nodes, total119; prospective cap5000 each. All complete queries failed actor mate
as hypothesized. Raw compressed trees, every explored state, reuse audit, receipt
and collector source closure were retained before outcome assertions in
`evidence/delays.json.gz`. Eleven exact frozen E177 contexts reused through E190;
zero new E177 panels, engine/tablebase queries or real games. The relevant E108
fixture/history and H2 source query audit found no matching H4 observation.

Four representative smoke contexts passed. The single focused run passed26checks
in2.952seconds, covering14 role cases, both colors, genuine two-ply prefix,
separate functional negatives, original identities/all replies/counters, exact/
short/zero budgets, source visited claim, strict/missing/disabled controls, missing
delay and valid-baseline source/H4/own-result mutations. Runtime and separate own
checker semantically admit full source/delay traces in separate exact clone
caches, then recompute own labels. Missing delay preserves C0917 only. Malformed
provided delay rejects even when timing is ineligible. Source/delay visited claims
suppress both scopes; a new delay-only claim fixture is deferred with the full
claim matrix. Source verification and diff check passed.

Evidence: `evidence/focused-checks.json`, `evidence/provenance.json`, `build.json`.
Original broad meanings and shared-admission limitations: `PREREQUISITES.md`.
No acceptance, human-validity or production claim. Combined integration/replay,
cumulative original occurrence/absence/priority/history/budget/terminal/claim
matrix and changed main/repeat/initially clean reproductions remain deferred.

Machine status after this batch:378/1085 accepted unchanged;481 pending occurrences
with provisional code,115 ready batches,0 stale. Accepted-or-candidate coverage
859/1085 (79.2%);226 without candidate code. Full build closure1105 source bindings;
own retained artifacts approximately238KB, within the soft500KB target.

Next: audit C1077 advantage-transformation measures and remaining good/bad
structure, tension and flexibility prerequisites against compatible causal
evidence before selecting the next small provisional batch.
