# E232: avoidable own pawn weakness with direct mating exploitation

Registered2026-10-11 after E2317ce2dad (indexed progress). Current-main
research-only exception/local commits/no push. BUILD-FIRST and unchanged D001
test preflight54artifacts. Earlier C0170/C0276 and evaluation/strength targets
retain E147/E179/E188 prerequisites; C0867 now has a prospective concrete
own-weakness/outcome hypothesis, a recorded prerequisite-driven deviation.

No inspected own result yet. Authored hypothesis, derived from the published
E145/E192 mating geometry, not compatible reuse of their changed-position
observations: White Kg1 Qg5 Bf7 Rf1 Pd4 Pg2 Ph2 versus Kh8 Rh7 Qd2 Pf3.
Actual g2xf3 should leave original h2 pawn newly isolated and clear the d2-h2
queen ray; ...Qxh2 should mate, while quiet Qg8 should mate the other king and
preserve g2/h2. Remove Ng4 because its capture on h2 refutes that exploitation.
Reflect colors. No engine/tablebase or finite failed-search inference.

Default-disabled inspectOwnPawnWeakness(input,options). Strict ordinary input
{id,source,fen,history?,move,target,exploit,alternative}, source caller-authored;
options enabled,maxWork0..4096 default4096. Exact canonical full history endpoint
required if supplied; missing history unavailable. Reuse unchanged E210 actual
history/automatic terminal/optional claim semantics, no claims inferred absent
from incomplete earlier history. Report prior-history completeness explicitly.
Default disabled validates schema only, no board replay.

C0867 gate: root live with no known actor claim; original own target pawn has
adjacent-file own support; actual is a legal pawn capture by that original support
pawn, which survives at its new square, leaving SAME unchanged target pawn with
NO adjacent-file own pawn. Actual frame is live. Supplied legal enemy sliding
capture of that exact pawn immediately mates original actor. Same original enemy
slider exists at root; its root-to-target interior blockers are exactly the
original support pawn and its after-actual interior is empty. This identifies
the concrete opened capture route; not a counterfactual synthetic turn/outcome.
Distinct legal root alternative is nonpawn/noncapture/nonpromotion/noncastling,
preserves target/support adjacency and immediately mates enemy. These are
positive opposed outcome proofs, not mere geometric isolation or finite failures.
No inferred motive/greed, best/necessary move, lasting/general weakness/value.

Own checker imports no inspector/classifier/features; independently replay legal
history and three supplied moves, enumerate empty legal responses plus checks
for both mating certificates, reconstruct original identities/adjacency/ray and
exact output. Chess and strict schema shared; no independent chess engine.
No search/collector. Conservative declared logical work270+history plies:
four64-square frame allocations, three moves, seven ray slots, four frame guards.
Atomic preflight exhaustion hides every context/witness before board replay.
This accounting is logical work, not engine nodes or elapsed time.

Freeze before decisive evaluation. One candidate query plus checker<=1second.
Tiny both-color pilot, retain negatives: considered structural support still
present, wrong target/route, original support absent, Ng4 capture refutation,
missing rook-protected mate, alternative does not mate, genuine recorded prefix,
known repetition/fifty claim, missing history, strict/default-disabled/illegal
frame/endpoint, exact/short/zero budgets, cloned results and forged ray/identity/
mate/quality assertions. Stop after this authored family if no positive; retain
the hypothesis/failures without gate or threshold changes. No search for a pass.
Retain output/errors, receipts, exact frozen source/evidence hashes and process
output before assertions. Source verification/diff checks; build only if positive
and separating controls pass; RESULT/INDEX/local commit. No historical suite.

Broader work remains: persistent nonmating weaknesses, comparative necessity/
value, real decision context, all original strategic meanings, complete earlier
history/claim/terminal matrices, independent legality/truth, eligible real-game
precision/human usefulness, combined semantic/integration and changed exact
reproductions, separate promotion. Numerical research remains paused.
