# E216: outside rook passer and quiet checking-fortress setup

Date: 2026-10-11. State: prototype. New bounded original scopes **C0683/C0746**.
Accepted mechanics and production remain unchanged. Full outside-passer strategy
and static/enduring fortress construction remain open.

## Prerequisite audit and demonstrated behavior

T002's single-pawn KRPvKR closure cannot establish an outside passer relative to
other pawn files. A new tablebase acquisition was unnecessary for a bounded
resource: E097 already retains a complete all-defense surviving-queen route in
a both-sided rook ending with another pawn. Both color proofs were reused and
independently replayed with E037; no promotion search was repeated.

The reused white example has Kf7 Rb1 Pg6 against Kh8 Rh4 Pa2, actual g7.
The same original passed pawn is strictly outside all other pawn files before
and after. Its route queens against every legal defense and survives every next
response with positive nominal gain. The reflected black example also passes.
This proves a concrete outside-passer resource in a rook ending, not outside-
versus-inside comparative superiority, king distraction or general conversion.

New authored fortress setup: white Kf6 Ra6 Bc4 Nf5 versus black Kh8 and four
knights a1/c1/e1/g1, actual quiet Ra7. The actor has a one-point nominal deficit.
In the labelled hypothetical enemy-turn before diagram Kh7 was legal; after
Ra7 the enemy king has no legal move, while all13 knight replies remain legal.
Each reply preserves that confinement. A complete checking-only continuation
then forces an ACTOR-side threefold claim opportunity within9 further plies,
covering every legal defense. Defender claims are not assumed accepted.

The color/rank reflection gives the same construction. Each query has13 goal
leaves and65 enemy policy edges under independent E093 history-key replay.
Quiet alternative Rb6 retains a king escape and gets no construction label;
this does not mean all drawing strategies fail after Rb6. Missing-guard and
omitted-defense mutations cannot reuse the original certificate. Practical
desirability, necessity, best move, permanent blockage and static fortress
theory are not established by this bounded checking-fortress construction.

## Callable implementation and independent checks

`code/resources.mjs` exports `inspectOutsideRookPasser` and `inspectFortressSetup`,
each taking FEN/move/genuine history, options `enabled` (default false) and
`maxNodes`0..2000, plus a complete proof. Atomic exhaustion returns no witness.
Promotion route admission costs5 nodes per saved example; fortress admission
costs133. These replay ledgers differ from query-generation ticks, explicitly
reported separately. No oracle-valued outcome panel is accepted.

The independent own-result checker reconstructs passed/outer-file/rook-ending
geometry, actual move and armies, nominal deficit, before/after king options,
all immediate defenses and history-key counts without importing the classifiers.
E037/E093 independently replay complete future legal policies and goals.
Default-disabled, strict/getter/history/frame, geometric absence, exact-budget,
omitted-defense and output-mutation controls are retained.

The E097 archive is authenticated by exact compressed/plain hashes and current
source bindings. Its original receipt is retained. The historical policy-document
hash matches the archived Git revision; all other receipt fields match the
current guard. This audits the document addition without rewriting the old
receipt. Only the two relevant original fixtures are replayed.

## Focused evidence and cost

[Plan](plan.md) committed `e3b6dab`; collector/reuse admission frozen `d011ac2`
before evaluation. Implementations/proofs/checks frozen `648f973` before testing.

- Two new authored fortress queries:340 ticks each,680 total. Original query+
  independent replay0.436seconds, reflection0.405seconds, below unchanged
  two-second/2000-tick/9-ply limits. No engine, tablebase or game collection.
- Two old promotion proofs reused, zero fresh promotion queries.
- Twelve focused checks passed in5.825seconds using saved proofs only, zero
  fresh queries. Four own explanations were independently reconstructed.
- Provenance binds114 source inputs and exact retained proof/archive bytes.
  Source verification and diff checks passed. No cumulative suite, unchanged
  historical collection or fresh main/repeat/clean run was performed.

See [examples](evidence/examples.json), [focused checks](evidence/focused-checks.json),
[provenance](evidence/provenance.json), [route reuse](evidence/route-reuse.json)
and [build record](build.json). All positions are authored synthetic mechanics
fixtures; they establish no real-game precision or teaching utility.

## Resume state

Accepted coverage stays378/1085. Accepted-or-candidate coverage is883/1085
(81.4%), with202 entries lacking code. Every phase4 occurrence now has at least
an accepted or provisional scope; that does not complete its broader definition
or final acceptance. The remaining no-code queue is75 strategic and127 support
occurrences. No catalog item was removed or accepted tracker advanced.

Next: audit the strategic sacrifice/compensation family, starting C0092 and
related C0280/C0907/C0908, against genuine nonmaterial functional benefits.
Do not equate a forced mate certificate with positional or long-term value.
Combined original-occurrence/integration validation, full strategic/enduring
claims, changed main/repeat/clean reproductions, real-game precision, human
utility and production promotion remain deferred/open under BUILD-FIRST.
