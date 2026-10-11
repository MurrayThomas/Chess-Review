# E235: explicit two-result goal with a complete finite nonloss policy

2026-10-11: provisional C0826 candidate, default disabled. Plan08695e8;
implementation frozenb54d885. Prior E234 turn made indexed progress. Authorized
current-main research-only local commits/no push; numerical research stays paused.

`inspectTwoResultPolicy` combines an exact root/actor declared win-or-draw coaching
goal with a complete finite policy: actual legal move, EVERY legal enemy reply,
then a fixed legal actor followup. Every leaf must positively certify actor mate
or mechanical/known automatic draw. Early terminal branches stop; illegal followup,
live unresolved leaf or enemy mate cannot be called a draw. BOTH a win and draw
leaf are required for C0826; all-win or all-draw alone supply no two-result label.
Declared goal is input, not observed private intent or optimal/practical strategy.

Authored White Kf7 Qe5 versus Kh7: Qf5+ has exactly ...Kh6 and ...Kh8. Qg6#
mates after ...Kh6, while Qg6 stalemates after ...Kh8. The opposite-color policy
agrees. This is a nonterminal actual move with a complete branching nonloss
certificate, not a single winning move or absence of a short enemy mate.
The same root also has Qg7# immediately, retained as the
all-win negative. Thus this synthetic policy is not recommended/necessary/best
play and does not establish practical benefit from playing for two results.
It tests the explicit goal/policy contract; original broader teaching scope stays.

Strict ordinary input/genuine supplied history/full canonical endpoint, exact
declared goal frame and unchanged E210 known current actor-claim/automatic terminal
semantics. Missing goal/history abstain; foreign goal frame/actor rejects. Earlier
history completeness is explicit and false for these synthetic segment roots;
no arbitrary actual-game adjudication claim. Additional VALID draw claims,
including prospective claims, only add draw choices and cannot introduce a loss
to this nonloss policy; no missing claim eligibility is certified. Clock99 control
preserves the policy with that explicit limit. Known root actor claims abstain.

Disabled calls validate schema without replay. Logical work133+history plies+
130*defender count reserves root/actual frames and all defense/followup frames,
not engine nodes or elapsed time. Minimum reservation precedes board replay;
full work/reply-domain reservation precedes branch replay. Short work or reply
caps atomically hide context/witness, never truncate a certified defense domain.

Own checker imports no own inspector/classifier/features. It independently
replays history/known occurrences, reconstructs the complete legal defender
inventory, fixed followup legality, terminal check/response facts, totals and
exact goal/witness output. Shared Chess/schema/legal-position validation limit
independence; no separate chess engine or generic practical-strategy evaluator.

All26both-color pilot cases reconstruct in0.6556408seconds; first0.0440539seconds,
within registered1second bound. Six positives include genuine4ply prefix and
clock99 cases. All12focused checks pass3.1405147seconds: extra legal defender,
illegal/unresolved followup, all-win/all-draw alone, missing/foreign goal/history,
known repetition/fifty/automatic75, strict/getter/cycle/default-disabled/illegal
frame/endpoint, exact/short/zero work AND defender-domain caps, clones and valid-
baseline omitted defense/leaf/basis/goal/intent/history/work forgeries. No failed
checks/amendments, searches, engine/tablebase runs or historical suite.

`npm run verify:source` and `git diff --check` pass. Four evidence files total
124941bytes retain actual revision/process stdout/stderr, D001 receipts, full
authored policy outputs,23source bindings and exact source/evidence hashes.
No production, real-game acquisition, numerical fitting or accepted tracker change.

Remaining: richer adaptive/longer nonterminal policies, useful/optimal drawing
margins and practical strategy, full original two-result meaning, complete earlier
history and original claim/terminal/priority matrices, independent chess truth,
eligible real-game precision/human usefulness, combined semantic/integration and
changed-source exact reproductions, separate promotion. Full coach goal unfinished.
Next: inspect remaining nonterminal strategic policy/value prerequisites and
reusable draw/win evidence; do not infer practical chances from this toy policy
or substitute a declared goal for validated human utility.

Metadata-only queue audit: accepted378/1085 unchanged;707pending,519with
provisional candidate scopes,188without ready detector code;143ready batches,
zero stale. Accepted or provisional897/1085 (82.7%) is not acceptance.
Remaining no-code routing:61strategic and127support occurrences.
