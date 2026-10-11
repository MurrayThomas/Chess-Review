# E190 — forced liquidation commitment and goal-relative simplification

2026-10-11. Prospective BUILD-FIRST batch after E1898fa6f4c. Current main,
research-only local commits/no push, standing user checkout exception. Exposed
E108/E177 published findings inspected; proof reuse, not fresh confirmation.

Three original occurrences, distinct scopes/contexts:
- C0804 commitment (32.Decision-making): actual queen capture forces every
  legal enemy reply to recapture that SAME own queen with the king, leaving
  live KRK with the original rook retained. Legal noncapture alternative keeps
  the original five units immediately. This is a concrete forced liquidation
  commitment, not evidence of purpose, prudence or long-term plan quality.
- C0926 commitment (36.Deeper strategic concepts): preserve the duplicate
  occurrence/context explicitly. Same commitment additionally explained by the
  pawn-free/queen-free invariant at EVERY recapture endpoint. Future ordinary
  moves preserve remaining unit types and captures only remove them; without
  pawns no promotion can restore either queen. Permanent queen-free phase,
  NOT permanent advantage, global win or a claimed human intention.
- C0808 when to simplify: the full forced liquidation commitment also has a
  complete actor mating policy at H2 while the distinct legal alternative fails
  that SAME finite mate goal. Advice only relative to declared H2 mating goal.
  Failed alternative search is never called draw/loss or globally inferior.
  Geometry/less material alone cannot supply this label.

API inspectLiquidation(input,options,panel), saved-only, no collector/engine.
Default enabled=false; plies0..2 default2 (other H returns horizon-prerequisite),
maxNodes0..50000 default50000. Input legal fen/actual UCI, alternative UCI,
explicit genuine history. Missing history/alternative/panel abstains; supplied
malformed/illegal controls reject. Live root exactly kings, two opposing queens,
one own rook; actual own queen captures enemy queen, alternative distinct legal
noncapture/nonpromotion by any own unit. Actual after must remain live for a
forced recapture phase; actual immediate mate withholds all three scopes.

Reuse unchanged E177 observations and prefix-control, verifying every recorded
collector/context hash and full closure, original receipts, exact keys/config
and raw archive hashes. Frozen E177 verifyPanel independently replays all legal
replies/counters, states, material/claim and E144 complete query exploration.
Own checker imports no new runtime/context/derive/collector; independently
reconstructs commitment endpoints, both original context decisions, type
invariants and separate goal comparison. Shared Chess/frozen source verifier
are explicit limitations. No need for an admission cache: parent panels31..78
logical nodes. Do not replay the full inherited study or regenerate its panels.

Own logical cost=setup3+history.length + source.nodes + audit work:
1root ledger +root.units.length +alternative.units.length +sum(1+endpoint.units
.length) for EVERY actual reply +2goal ticks. Exact/short/zero caps atomic;
exhaustion removes all own panel/witness/labels. Any visited fifty/threefold
claim in supplied full policies suppresses all three scopes. No reset history,
artificial turn, identity substitution or new tablebase/real-game data.

Predeclared exposed cases, BOTH colors: original Qxg8/Kxg8/Ra8# versus Qg7+
gives all scopes; quiet king alternative Kf6 also all scopes despite no profitable
alternative capture policy (counterplay removal is not required here). Replace
Ra1 by Rf1: forced liquidation still gives BOTH commitment contexts, but actual
H2 mate fails and C0808 MUST withhold. Rg7 protecting Qxg8 makes actual immediate
mate: no forced live liquidation commitment, all withhold. Existing halfmove99
alternative claim suppresses all. Reuse true two-ply prefix for history control.
Ten cases plus one genuine-prefix context, zero new searches.

Focused positive/functional-negative separate gates, strict/missing/disabled,
actual identity, before/alternative/endpoint armies, irreversible type invariant,
exact/short/zero ledger, source trace/defense/counter/gain/history/claim mutations
and own result/context/goal/label mutations. Run focused file ONCE plus metadata
source/diff checks. Retain source-bound check record with parent references;
soft evidence500KB. Guarded D001-test receipt on entrypoints. No human precision,
statistical sample/speed improvement or production promotion claim.

C0807 exchange decisions and C0812 sacrifice timing already have E108 candidates;
do not regenerate them. C0809 when to complicate needs independently validated
complexity/goal and causal alternative evidence; counts/unknown queries cannot
substitute. Full original catalog/broad commitment and simplification meanings
remain open. Integrated pilot/replay, cumulative occurrence/absence/priority/
history/budget/terminal audits, changed main/repeat/initially clean reproductions
and human/real-game validity remain deferred to combined validation.
