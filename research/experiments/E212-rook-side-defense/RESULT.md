# E212: outcome-qualified long-side rook resource

Date: 2026-10-11. State: prototype. New bounded scope: **C0666**.
**C0667 remains unready**. Accepted mechanics and production are unchanged.

The preregistered authored position, white Kf5 Pf6 Re2 versus black Kh7 Ra8,
black to move, is an exact WDL50 draw. The legal long-side check `...Ra5+`
preserves that draw, whereas seven legal nonchecking moves of the same rook
lose: `...Ra2`, `...Ra7`, `...Rd8`, `...Re8`, `...Rf8`, `...Rg8`, `...Rh8`.
The short-side defending king and four intervening files between the checking
rook and attacking king are reconstructed from the board. The color/rank
reflection also passes, with `Ra4+` preserving the draw and seven quiet losses.

The separate authored Kf8 defender-king pilot is drawn but lacks the registered
short-side drawing king move versus losing long-side king alternative. C0667
receives no coverage credit. The two E211 losing geometric fixtures, one per
color, remain negative despite their long-rook/short-king arrangement. A useful
geometry label therefore does not by itself establish a saving defense.

## Callable behavior and source admission

`code/resources.mjs` exports `inspectLongSideDefense(input, options, token)`.
Inputs are FEN plus genuine history; options contain only `enabled`, default
false. Enabled explanations require zero-counter empty-history defender-turn
KRPvKR, no rights or EP, and an admitted observation. They expose drawing checks,
losing same-rook quiet alternatives, geometry, defender, source and the exact
WDL50 scope. The full legal successor domain remains in the admitted view.

`code/admission.mjs` admits fixed-hash saved observations after current source/
runtime/vendor/program checks and independent E211 legal/perspective replay.
It can also collect through the actual guarded V2 process, retaining its bundle;
it does not accept a caller-supplied outcome panel. Admission capabilities use
private snapshots; cloned tokens and modified exposed views cannot authorize
invented WDL. This matters because structural legality alone cannot authenticate
an in-range outcome value. `code/check-result.mjs` reconstructs occupied squares,
checking rays, legal move identities and defender outcomes without importing
the candidate classifier or geometry helper.

This is a one-move resource with a complete outcome contrast. It does not prove
that checking distance or king placement alone caused the draw, nor provide a
sustainable all-defense strategy. WDL50's zero-counter model is not an outcome
promise at arbitrary game clocks or repetition histories.

## Evidence and focused cost

The [plan](plan.md) was committed at `5ca91f7`; pilot collector/gates at `1b1cc4e`.
Both first pilot outcomes were retained at `47f933a` before the passing scope's
reflection. Candidate/checker sources and reflection were frozen at `1f6dfbc`
before focused testing. All fixtures are authored; external teaching metadata
supplied terminology only, with no copied example/game position.

- Three complete new panels: 18 + 14 + 18 = 50 position probes. Guarded collection
  costs were 1.632, 1.585 and 1.435 seconds, below the unchanged three-second gate.
- Eight focused checks passed in 3.373 seconds, with zero fresh probes: both-color
  positives, both-color losing controls, short-side negative, default-disabled/
  strict inputs, history/clock/frame limits, authenticated capabilities and
  independent output mutation rejection.
- Five saved explanations were independently reconstructed and matched retained
  examples. Source provenance binds 63 inputs, the three exact new artifacts and
  E211's guarded source/data closure. No retrograde truth cross-validation claimed.
- Source verification and diff checks passed. No cumulative suite, unchanged
  historical collection, main/repeat/clean reruns or push was performed.

Retained [examples](evidence/examples.json),
[focused checks](evidence/focused-checks.json),
[provenance](evidence/provenance.json), and [build record](build.json) preserve
the successful resource and negative hypotheses separately. The first pilot
and reflection retain actual stdout/stderr/exit/signal/process-error metadata.

## Resume state

Accepted coverage remains 378/1085. The new C0666 provisional scope brings
accepted-or-candidate coverage to 878/1085 (80.9%); 207 entries still lack code.
Broader original occurrence meanings stay open. Human utility, real-game
precision, independent tablebase truth, clock/repetition/DTZ semantics, policy
discovery and combined validation remain deferred.

Next: preregister a new C0667 king-relocation contrast, informed by the retained
negative without changing E212's gates. If its prerequisite is not demonstrated,
continue the remaining named rook-defense family with outcome-qualified
mechanisms; do not copy C0666 credit onto C0667.
