# E215: Philidor retreat and Vancura checking resources

Date: 2026-10-11. State: prototype. New bounded original scopes **C0670/C0671**.
E214's original paired gates remain failed and all of its source/evidence is
unchanged. Its three originals are explicitly already-exposed development data,
not fresh confirmation. Accepted mechanics and production remain unchanged.

## Demonstrated resources

Philidor waiting: white Kd5 Pe5 Rh2 versus black Ke8 Ra6, black turn. `...Rb6`
and `...Rg6` draw while controlling c6/d6/e6; `...Ra7`/`...Ra8` lose without
immediately losing the rook. This retains E214's successful barrier gate.

Philidor retreat: after the actual `...Rb6 e6` history, `...Rb1` draws while
`...Rb7`/`...Rb8` lose and are not immediately capturable. E215 explicitly
registered seventh/eighth-rank alternatives before its new counterpart probes;
it does not turn E214's absent sixth-rank contrast into a passing result. The
rank/color reflection passes both phases, including the genuine reflected
waiting/pawn-advance history and back-rank retreat.

Vancura immediate check: white Ka5 Pa6 Ra8 versus black Kg7 Rf6, black turn.
`...Rf5+` draws; quiet pressure moves `...Rc6`, `...Rd6`, `...Re6`, `...Rg6`,
`...Rh6` lose without immediate rook capture. Keeping side pressure alone is
insufficient in this root. This replaces the proposed quiet waiting mechanism
with an explicitly registered immediate-check resource in a new study.

Vancura check at the pawn's rank: independently authored white Kb6 Pa6 Ra8 versus
black Kg7 Rf5, black turn. `...Rf6+` draws versus nine quiet same-rook losses
that stay off sixth and are not immediately capturable. Both Vancura checking
positions also pass their color/rank reflections. They are separate authored
frames, not proof that this second frame follows every reply to the first.

All outcomes are WDL50 zero-counter observations; all four phase gates preserve
the entire legal successor domain and same-original-rook identity. Full
sustainable strategies, isolated causal mechanisms and every-reply phase
transitions remain open. These resources do not discharge those broader original
teaching meanings or certify arbitrary-clock/repetition outcomes.

## Callable implementation and source admission

`code/resources.mjs` exports `inspectNamedRookResource(input, options, token)`.
Input is FEN plus genuine history; options are `enabled` (default false) and
`phase`. The four phase names are in `code/contrast.mjs`. Philidor retreat requires
actual two-ply rook-wait/pawn-advance history; other phases require empty history.
All require root clock0, no rights/EP and privately admitted observations.

`code/admission.mjs` authenticates fixed artifacts and current source/data/vendor/
runtime/program identities before independent E211 legal/perspective replay.
Actual guarded V2 live collection can also create a capability; arbitrary caller
outcome panels and cloned tokens cannot. Exposed views are isolated copies.
Outputs include phase, defender, complete drawing resource and losing alternative
sets, geometry and explicit source model. `code/check-result.mjs` independently
reconstructs ranks, occupied-square rays, checking distance, recorded history,
noncapturability and outcome perspectives without classifier/geometry imports.
It is an explanation verifier, not an independent retrograde WDL calculation.

## Focused evidence and cost

[Plan](plan.md), revised gates and collector were committed at `c3360c0` before
new probing. New observations and candidate/checker sources were frozen at
`0225e76` before focused checks.

- Three E214 originals/54 records reused, with zero new probes for them.
- Five new complete panels/94 position probes: Philidor reflections20+15,
  Vancura first reflection19, and second phase/root reflection20+20. Costs were
  1.615/1.490/1.584/1.506/1.508 seconds, below the unchanged three-second gate.
- Fourteen focused saved-only checks passed in 3.295 seconds, zero fresh probes.
  Eight own explanations were independently reconstructed; cross-family wrong
  phases, missing/wrong history, clock/frame/default-disabled/strict input,
  private admission and output/getter forgeries were checked.
- Both revised families pass both phases/both colors. Provenance binds 87 source
  inputs, exact new artifacts, the retained E214 observations and guarded T002
  source/data identities. Eight panels contain148 position records in total.
- Source verification and diff checks passed. No cumulative suite, unchanged
  historical collection, main/repeat/clean rerun or push. Color counterparts are
  deterministic mechanics checks, not independent statistical confirmation.

See [examples](evidence/examples.json), [focused checks](evidence/focused-checks.json),
[decisions](evidence/decisions.json), [provenance](evidence/provenance.json) and
[build record](build.json). Actual process stdout/stderr/exit/signal/errors remain
retained for every new panel. All positions are authored, with no new external
example/game data or tablebase acquisition.

## Resume state

Accepted coverage stays378/1085. Accepted-or-candidate coverage is881/1085
(81.2%), with204 entries lacking code. Broader original scopes, full combined
integration, independent WDL truth, arbitrary-clock/repetition/DTZ semantics,
changed main/repeat/clean reproductions, real-game precision and teaching utility
remain deferred/open under BUILD-FIRST.

Next: audit C0683 outside passed pawn in rook endings and C0746 fortress
construction against existing mechanisms and T002's single-pawn closure. Record
any missing material/strategy prerequisite explicitly, and continue compatible
strategic/support work without inventing a saving defense from geometry.
