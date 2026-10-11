# E232: avoidable own pawn weakness with direct mating exploitation

2026-10-11: provisional C0867 candidate, default disabled. Plan b5020ce;
implementation frozen1a27a28. E231 prior turn made indexed progress. Authorized
current-main research-only work/local commits/no push; numerical work paused.

`inspectOwnPawnWeakness` requires a legal own support-pawn capture that newly
isolates the same original own pawn and clears an enemy slider's capture ray.
The original support pawn must be the sole root blocker and survive on its new
square; all after-actual interior squares must be empty. A legal enemy capture
of that exact target must immediately mate. A distinct legal nonpawn/noncapture/
nonpromotion/noncastling alternative must preserve support and positively give
mate instead. These opposed positive outcome proofs establish an avoidable
concrete adverse consequence, not just geometrical isolation. No hidden motive,
best/necessary move, persistent/general weakness or broader quality is claimed.

Authored White Kg1 Qg5 Bf7 Rf1 Pd4 Pg2 Ph2 versus Kh8 Rh7 Qd2 Pf3:
g2xf3 isolates h2 and clears d2-h2 for ...Qxh2#, while Qg8# preserves g2/h2.
The color-reflected case agrees. Capturing a pawn does not establish greed.
The root ray comparison is geometric, not a fabricated opposite-turn outcome.
Changed positions are newly evaluated legal certificates; old E145/E192 search
observations are not falsely reused for them. No engine or tablebase is involved.

Strict ordinary input, exact full history endpoint and unchanged E210 genuine
history/automatic terminal/optional claim semantics. Missing history abstains;
known current actor claims and automatic terminals do not label. Earlier history
completeness is explicit and false for these synthetic segment roots; no actual
game adjudication claim follows. Default-disabled calls do no board replay.
Conservative logical work is270+recorded plies, allocating four64-square frames,
three moves, seven ray slots and four frame guards. It is not a node/search/time
measure. Short/zero caps atomically hide context/witness before board replay.

Own checker imports no own inspector/classifier/features. It independently
replays history and legal named moves, counts known occurrences, reconstructs
original pawn/slider identities, support/ray and both terminal frames, and checks
check plus empty legal-response inventories. Shared Chess/strict schema and
legal-position validation limit independence; no independent chess engine.

All26both-color pilot cases reconstruct in0.354782seconds; first0.024015seconds,
within registered1second smoke bound. Four positives include genuine4ply recorded
prefixes; negatives distinguish remaining support, pre-existing isolation, wrong
target/route, Ng4's legal capture refutation, absent protecting rook and a
nonmating alternative. Known repetition/fifty/automatic75 and missing histories
abstain. All10focused checks pass2.0985424seconds: strict/default-disabled/illegal
frames/history endpoints, exact/short/zero caps, independent clones and forged
identity/ray/outcome/history-completeness/quality/work assertions also covered.
No failed checks or amendments, no new searches or historical matrix.

`npm run verify:source` and `git diff --check` pass. Four evidence files total
118013bytes: actual frozen revision/process output, authored pilot results,
D001 loader receipts,23source bindings and exact source/evidence hashes. Build
record remains provisional. No production, real-game, numerical fitting or
accepted tracker change. Full original catalog remains in scope.

Remaining: durable/nonmating weaknesses, comparative necessity/value and broader
strategic causal evidence, complete earlier history and claim/terminal/priority
matrices, independent chess truth, eligible real-game precision/human usefulness,
combined semantic/integration and changed-source exact reproduction gates,
separate production promotion. Full coach goal remains unfinished.
Next: inspect C0784 strong-piece neutralization and C0866 trading an active piece
for independently demonstrated functional roles and causal outcomes; nominal
piece cost, move counts or a failed short search cannot supply those judgments.

Metadata-only queue audit: accepted378/1085 unchanged;707pending,516with
provisional candidate scopes,191without ready detector code;140ready batches,
zero stale. Accepted or provisional894/1085 (82.4%) is not acceptance.
Remaining no-code routing:64strategic and127support occurrences.
