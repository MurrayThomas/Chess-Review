# E271: opportunity-aware rating feasibility — result and reflection

2026-10-15. **Complete feasibility experiment; independent checks pass.**
Outcome: existing evidence fails the registered game-level readiness gate.
No model fit or rating improvement. Plan `7bfe3da`, original runner `60017b3`,
amended calculation freeze `aafbdb9`, independent verifier `ea46efe`.

| Census | Result |
| --- | ---: |
| Exposed development games: train / validation | 600: 450 / 150 |
| Sides with at least ten actual nonforced decisions | 1,200 / 1,200 |
| Actual nonforced decisions / legal alternatives | 41,371 / 1,227,294 |
| Complete-alternative vectors available | 600 (1.45% of decisions) |
| Measured vectors per player side | 0 to 1 |
| Games with ten measured vectors for BOTH sides | 0 / 600; gate at least 300 |
| Player-connected components / largest | 600 / 1 game |
| Unique full-game 20k queries / compatible reuse | 1,191,939 / 23,560 (1.98%) |
| Missing unique queries | 1,168,379 |

Every focal vector reproduces the full legal list, played move, full history
and root/restricted-query bindings at the exact retained SF19 20k protocol.
Player-disjointness passes; independent graph algorithms agree. Actual games
have enough decisions, but complete-alternative measurements are missing.
One focal decision cannot represent a game's accuracy or strength.

Historical mean 57.9017 ms per cached query implies **18.792 serial hours** for
the missing collection. Applying historical p95 83.726 ms to every query gives a
**27.173-hour reference**, not an upper bound. Mean query JSON size 875.38 bytes
implies **.9525 GiB uncompressed**. These are planning extrapolations, not current
hardware benchmarks or whole-pipeline guarantees. Phase, hardware, exact-score
recovery, serialization and scheduling can differ; no compression ratio assumed.
Selected branching averages 32.265 versus 29.6656 over full games (p95 45).
Games average 69.5867 plies, maximum 225. Timing representativeness, population
representativeness and prospective precision remain unestablished. Exact census
counts do not need sampling intervals.

The first full attempt hit its unchanged 120-second analysis limit before any
report. [Failure](evidence/initial-failure.json) and prospective amendment remain.
The equivalent traversal avoids pretty-move/SAN construction. Public-API legal
set/FEN equivalence checks cover normal moves, castling, en passant,
underpromotion and check evasion. Full history still binds queries; draw or
repetition conclusions never use its unmaintained repetition counter.
Successful main/repeat wall times including admission: 76.21 / 73.39 seconds.

All twelve focused E271/E272 tests pass (five here), plus nine data-policy tests.
Retained evidence totals 108,103 bytes, below the 250 KiB target. Main/repeat result bytes
match. Independent verification checks original source/input bytes, side counts
against separately normalized data, focal-side counts and cost arithmetic, plus
the independent graph traversal. No clean repository replay is claimed: the
existing application checkout is dirty, and no development clone was created.
No new games, searches, fits, human labels, rating/outcome analysis or test target
use. Source verification and research diff checks pass.

- [Census](evidence/results.json), [main run](evidence/run.json), [repeat run](evidence/repeat-run.json)
- [Smoke](evidence/smoke-results.json), [smoke receipt](evidence/smoke-run.json)
- [Independent verification](evidence/verification.json)

Reports are hash-registered D002 derivatives; original parents/older artifacts
remain intact. Receipts retain exact code/input hashes, engine/NNUE configuration,
command, environment and eligibility. No random seed. Reproduce from repo root
after D001/D002 preflight with
`node research/experiments/E271-opportunity-feasibility/code/run.mjs --out research/runs/E271/new-run`.
For the independent verifier, first generate a repeat at
`research/runs/E271/repeat-optimized`, then run
`node research/experiments/E271-opportunity-feasibility/code/verify.mjs --out research/runs/E271/new-verification`.
Outputs refuse overwrite. Exact working-source hashes include line endings.
Ignored runs are conveniences; retained evidence and registered inputs supply
the rebuild recipe. This is not scientific confirmation of a model.

Reflection: **keep the opportunity-aware rating hypothesis; defer fitting and
bulk collection**. A later whole-game pilot must measure current-machine cost
and information value, freeze fresh player-disjoint confirmation ownership, and
exclude ratings, IDs and results from predictors.

**Recommend uncertainty-aware ordinary category boundaries next**, using the
existing SF19 20k/80k cache. Only low-budget evidence may select labels/abstentions;
report coverage, retained disagreements and stable labels withheld together.
Selecting with both budgets then claiming stability is circular. Search agreement
is operational reliability; independent human validity still requires E005/E013
blinded reviews. Alternatives: full collection now (defer until pilot); another
choice-curve sweep (reject repeating stopped recipes); multi-game strength
intervals (need longitudinal targets); real-game accuracy reweighting (needs
coherent inputs and external usefulness target). STOP fitting/collection here.
