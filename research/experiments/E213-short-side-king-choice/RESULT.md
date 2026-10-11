# E213: outcome-qualified short-side king choice

Date: 2026-10-11. State: prototype. New bounded original scope **C0667**;
accepted mechanics and production are unchanged.

The preregistered authored position white Kf5 Pf6 Rh2 versus black Kf8 Ra8,
black to move, is an exact WDL50 draw. `...Kg8` moves the same original king to
the pawn's short side and preserves the draw; the legal long-side alternative
`...Ke8` loses. The defending rook is already on the pawn's long side. The
color/rank reflection gives the same contrast: `Kg1` draws, `Ke1` loses.

The prospective sequence first tested white rook d2, then b2. Both roots are
drawn but both king choices Kg8/Ke8 lose, so neither qualifies. They remain
retained negative hypotheses. Only the third registered placement h2 qualified;
its reflection then passed. E212's Re2 king-choice negative remains intact:
Ke8 was illegal there, and Kg8 lost. No earlier gate or outcome was rewritten.

## Callable behavior and admission

`code/resources.mjs` exports `inspectShortSideKingChoice(input, options, token)`.
Inputs contain FEN and genuine history; options contain only `enabled`, default
false. Enabled explanations require zero-counter empty-history defender-turn
KRPvKR, no EP/rights, and a privately admitted observation. They report the
drawing short-side king move, losing same-king long-side alternatives, original
piece locations, defender, source and exact WDL50 scope. Pawn-file destinations
count as neither side. The complete legal successor domain is retained.

`code/admission.mjs` checks fixed SHA-256 artifacts, current source closures,
runtime/program/vendor/data identities and E211 independent legal/perspective
replay before creating private admission capabilities. Its live path reuses the
guarded actual V2 collector; no caller-supplied outcome panel is accepted. Exposed
views are clones, and cloned/forged tokens cannot authorize fabricated outcomes.
`code/check-result.mjs` independently reconstructs legal same-king alternatives,
file-wing geometry and defender outcome perspective without importing the
candidate classifier or geometry helper. These checks authenticate observations
and explanations; they do not independently recompute retrograde WDL truth.

This bounded position-choice resource does not establish a sustainable defense
policy, isolate king placement as the sole cause, or certify future checking
access against every reply. The negative rook placements show why a geometric
short-side king recommendation alone is insufficient. Arbitrary clocks,
repetition histories and DTZ/DTM are outside the admitted outcome model.

## Evidence and focused cost

[Plan](plan.md) and collector were committed at `7c87aa0` before all four probes.
All outcomes and the candidate/checker sources were frozen at `a29b784` before
focused checks. No external example/game position was used.

- Four complete panels, 15 position probes each: 60 new observations. Guarded
  costs d2/b2/h2/reflection: 1.721/1.525/1.515/1.419 seconds, all below the
  unchanged three-second collection limit. Collection stopped as registered.
- Eight focused checks passed in 3.940 seconds using saved observations only:
  both-color positives, two prospective negatives, five inherited controls,
  default-disabled/strict interfaces, clock/history/frame prerequisites,
  private admission isolation and independent output/wing/outcome/getter forgeries.
- Nine saved explanations were independently reconstructed: two positive and
  seven negative. Provenance binds 71 source inputs, all new artifacts and the
  existing guarded T002 data closure. No historical observations were recollected.
- `npm run verify:source` and `git diff --check` passed. No cumulative suite,
  repeated historical collection, fresh main/repeat/clean runs or push.

Retained [examples](evidence/examples.json),
[focused checks](evidence/focused-checks.json),
[prospective decisions](evidence/decisions.json),
[provenance](evidence/provenance.json) and [build record](build.json) preserve
the full sequence. Each new panel retains actual stdout/stderr/exit/signal and
process-error metadata; no uncaptured stderr is represented as captured output.

## Resume state

Accepted coverage stays 378/1085. Accepted-or-candidate coverage is now
879/1085 (81.0%), with 206 entries still lacking code; broader occurrence meanings
remain open. Combined integration with C0666, independent outcome validation,
changed main/repeat/clean reproductions, real-game precision and teaching utility
are deferred under BUILD-FIRST.

Next: audit existing C0670 Philidor/C0671 Vancura geometric evidence and register
an outcome-qualified named rook-defense batch using T002. Preserve the full
mechanism/strategy ambition instead of treating a position label as a draw proof.
