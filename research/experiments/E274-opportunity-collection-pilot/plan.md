# E274: bounded opportunity-evidence collection pilot

Registered 2026-10-15 before selection or new engine searches. Numerical research
only. Keep the existing current-main checkout exception from E270 onward; no new
development clone/branch, switching, stash, push or production scoring edits.
Main has unrelated dirty application work and a staged video; exclude both.
No active Git operation or separate safe clean verification checkout found.

## Reflection and question

E271 finds only one complete alternative vector per game, insufficient for a
game-level rating fit; filling the 600 development games costs a historically
extrapolated 18.792 hours. E273's fixed category margin fails coverage. Stop that
selector, and measure the cost/measurement feasibility of obtaining more useful
rating inputs before another model sweep. This pilot asks whether the current
machine can collect ten complete nonforced decision vectors for each side of
two traceable development games under a bounded budget. It does NOT evaluate
rating prediction, human difficulty, accuracy validity or an improved model.

## Inputs, selection and protocol

Run D001/D002 collection preflight and use `openResearchData`/guarded reads.
Use already acquired D002 train games only, with no new public archive acquisition
or permission inference. Reuse exact compatible E008 SF19 observations. Confirm
no existing study has already acquired the newly requested keys; the current
register has no other new SF19 20k raw collection since E008. Never rerun a
hash-matched key just for timing. Cost/hardware conclusions therefore remain
confounded with different query histories; no paired speedup claim.

Select exactly two train games by ascending SHA256(`E274-games-v1:` + game ID).
Do not select using ratings, outcomes, quality or feasibility results. Both sides
have >=10 nonforced decisions under D002 admission. Enumerate all actual legal
histories; for each color with N nonforced decisions select indices
floor((j+.5)*N/10), j=0..9. These ten distinct indices spread observations through
the game without selecting score extremes. Sort the combined40 vectors by game
selection order then ply. Retain full preceding history and complete legal list.
Player disjointness is inherited and checked; no rating/outcome targets accessed.

Freeze/register selection, unique query keys, matched-cache keys, exact source
hashes and engine configuration before collection. Root and every legal move
receive the existing cold SF19 20,000-node policy: exact bundled JS/WASM/NNUE,
one thread, Hash32, MultiPV1, Skill20, WDL on, ucinewgame/Clear Hash/isready,
startpos plus full history, mover perspective, restricted search for each legal
alternative. Validate raw exact scores, PV legality and selected/final nodes.
Preserve recovery flags; configured nodes do not imply selected-score nodes.

## Prospective stages and hard resource stops

Zero downloads, fits, rating targets or candidate-label evaluation. At most2,500
NEW unique query observations /5,000 engine search requests (recovery can double
one request); reused matching observations are free of new searches. If the
frozen missing query count already exceeds2,500, do not start the engine.

Stage1 smoke: first32 uncached keys in frozen root/lexical-alternative order.
Validate every result. Use mean measured end-to-end engine-call wall time times
the ENTIRE frozen missing-query count to project collection time. Continue only
if all32 validate and that projection <=480 seconds. Keep these searches in the
main cache; do not rerun them. Projection from an early prefix is approximate.

Stage2: if smoke passes, collect all remaining frozen missing keys. Stop no later
than600 seconds since engine initialization began (admission/freeze time excluded),
or at a query/request limit, malformed result or engine failure. A watchdog kills
only this collector's own child if necessary. Keep partial observations, errors,
stage decision and incomplete vectors; never drop/change games or reduce nodes
to obtain a successful pilot. No automatic resume of an unregistered partial run.
Store failure receipt even when the engine never starts. Per-search maintained
timeouts remain; the global timer prevents a hanging pilot from running onward.

Primary feasibility gates:40/40 fully validated vectors, all four player sides
with10 vectors; <=600-second measured collector wall time; <=2,500 new queries
and <=5,000 requests; successful smoke; zero integrity/search failures.
These are operational engineering gates, not statistical power or prediction.

Secondary measurement sufficiency screen: at least60% of vectors and at least5
per player side have restricted-alternative WDL expected-point range >=.02.
This just checks whether observed alternatives offer varying engine consequences
at the existing near-best tolerance. It does NOT identify human difficulty or
strength information; keep this screen separate from collection feasibility.
Report CP-curve ranges separately, full distributions, ties and negative root
residuals without tuning or filtering. No rating fit from a four-side pilot.

## Timing, storage, verification and stopping

Retain per-query engine-returned elapsedMs AND caller wall time (includes reset,
readiness and both requests during exact recovery). The maintained engine's
returned elapsedMs on recovery describes its final restricted search, not both
requests; do not use it alone to estimate total cost. Report startup/serialization
overhead, complete collection wall time, means/median/p95 and recovery counts.
Extrapolate E271 remaining queries using both historical and observed caller
timing, identifying the two-game convenience scope and phase/hardware confounds.
No confidence interval on dependent query timings or guaranteed bulk runtime.
Report actual compressed/uncompressed evidence bytes; target <=2 MiB retained
raw evidence, soft under PROTOCOL.md. Cache keys prevent duplicate search copies.

Synthetic checks cover deterministic role/score-free selection, spread indices,
exact cache reuse, stage admission/stopping, completeness and elapsed/request
accounting. Commit all collector and verifier code BEFORE collection. Retain
every new raw observation separately from later scoring. Register it and its
receipt before later analysis, then independently reconstruct selection, legal
queries/PVs, coverage, timing arithmetic and WDL/CP ranges. Exact offline repeat
must reproduce the report without rerunning the engine. Keep source/input/config
hashes, command, seed strings, Node/OS/CPU metadata and output hashes per run.
Use focused checks, guarded admission and source verification. Clean repository
replay remains unclaimed unless a safe existing verification checkout is found.

At completion STOP new collection. Reflect on collection cost versus actual
measurement coverage/variation, and whether the next question should be a
prospectively designed rating comparison, a distinct measurement study or
coherent-input accuracy research. Pilot success alone never authorizes bulk
collection, fitting or production promotion. Record negative/incomplete results
with the same evidence and do not rerun merely to get a passing gate.

## Source-inventory amendment, before selection or collection, 2026-10-15

The initial claim that E008 was the only compatible20k observation source was
wrong: E011 also collected20k roots for its already consumed confirmation panel.
Inspection of collector source, not case scores or targets, established this.
Merge exact matching20k root keys from its registered raw artifact into the cache
inventory, preferring the original E008 observation for identical duplicates and
rejecting conflicting duplicate score/query records. Read no E011 game outcomes
or ratings. Only keys matching the frozen train-game histories may supply scores
to this pilot; no test target is analyzed and existing consumption is unchanged.
Keep selection seeds, two-game/40-vector scope, all node/options settings and
every stage/resource/variation gate unchanged. Record additional matching E011
reuse separately when relating counts to E271's E008-only historical reference.
No selection, new search or pilot performance result existed before this amendment.
