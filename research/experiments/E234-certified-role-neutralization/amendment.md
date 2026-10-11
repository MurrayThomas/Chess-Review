# Reflected history endpoint correction

2026-10-11 after frozenf6993cd pilot. First19rows pass including both-color role
positives and the original quiet-fivefold control; row20 (reflected quiet-fivefold)
rejects Actual history endpoint mismatch. Original started.json and
pilot-failure.json retained unchanged. No tests ran after pilot rejection.

FRIEND reflect preserves full-move counters but flips the first actor. The new
15ply history has an odd number of moves, so the reflected sequence increments
the full-move number differently from a reflected final FEN. The utility does
not promise canonical endpoint reconstruction for such histories. This is fixture
construction, not a candidate/Chess/claim-rule failure. Original strong-role
hypothesis already passed; the stopping rule for absent positives does not apply.

Prospective correction: after reflecting each fixture's history, genuinely replay
it and use that full canonical endpoint. No move, claim count, candidate gate,
strict endpoint requirement, work budget or expected result changes. Core runtime,
checker and tests unchanged. Freeze corrected fixture and separate revised runner
paths; retain original failure and write revised output under evidence/revised/.
Bind this amendment. Repeat only this small own pilot/focused suite because its
new fixture failed; no parent/historical suite or searches.
