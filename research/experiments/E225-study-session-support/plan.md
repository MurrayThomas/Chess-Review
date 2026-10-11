# E225: committed-answer study-session support

Registered2026-10-11 after E224202765c. Previous turn progressed by indexing and
committing E224. BUILD-FIRST, approved training/lesson/thinking-skill support;
current-main research-only exception, local commits/no push. D001 test preflight
passed. Only authored synthetic exercises, responses and optional adapter reports.

Preserve30 original occurrences: C0119..C0122, C0789..C0796, C0832,
C0835..C0846, C0870, C0873..C0876. Retain duplicate pattern-recognition contexts.
These are learning objectives/reflection topics, not observed mental actions.
No new error classifier or psychological/skill/learning inference. NO build.json,
detector credit, accepted tracker change or production integration.

Callable createStudySession(input,options), applyStudyEvent(token,event) and
readStudySession(token). Default-disabled factory. Strict plain input source/
eventId and tasks; each task has unique id, kind, prompt, full fen, prefix UCI
segment and learningGoals from the30 IDs. Kinds board-state, choose-move, line,
reflection. Board questions piece-at/side-to-move/legal-move derive exact local
answers after the prefix. Choose-move/line keys are supplied targets with explicit
source/eventId; verify their legal replay, never infer optimality or tactical
truth. Reflection accepts text and is ungraded. Optional notation/engine review
contexts reuse unchanged E222/E223 typed adapters, retained privately until reveal.

Keep answer keys, computed answers, grading and review contexts in a private
capability-bound state. Public views expose prompt/root/prefix/question/goals,
commit status and the learner's own answer; no feedback/context until that task's
answer is committed and a separate reveal event succeeds. Copied/serialized or
other arbitrary tokens cannot authorize reads/events. This prevents accidental
public projection of keys; it is not cryptographic secrecy from the input author.
Input/output/event cloning isolates state. Exactly one submission and one reveal
per task; reveal-before-submit and revision-after-commit reject without mutation.

Events have unique id and type submit/reveal/self-report. Submit taskId and typed
answer; malformed answer shape rejects, but syntactically valid illegal moves or
lines commit as responses and receive illegal-answer feedback only after reveal.
Legal mismatch is key disagreement, not proof of error. Board feedback is a local
fact; key feedback is reported-target agreement. Reflection remains ungraded.
Self-reports have goalId, source/eventId and boolean/string value and remain
explicitly reported, never converted to detected overconfidence/awareness/etc.

Tasks<=32, prefix<=64plies, move keys<=16, line keys<=16lines of1..64plies;
answers<=64plies or4000characters. Options enabled,maxTasks0..32(default32),
maxEvents0..128(default128),maxPlies0..4096(default512). Prepared logical plies
count prefixes, all target moves/lines and all typed context PV/notation moves.
Submitted line/move plies charge their entire requested length, even if illegal.
Use remaining context bounds when invoking existing adapters. Factory cap failure
returns no capability/view; event cap failure returns no new view and leaves state
unchanged. No truncation, search, arbitrary full cumulative suite or UI integration.
Reject automatic-terminal continuations while allowing optional draw claims to
be declined. History means only the supplied segment, not invented earlier play.

Commit before decisive checks. Representative multi-task create/commit/reveal plus
independent view reconstruction<=2seconds, then focused positive/negative/strict/
disabled/exact-short-zero budgets and affected adapter checks only. Both actors,
special moves, wrong/legal/illegal responses, private-key/context withholding,
immutable answers, duplicates/state failures/getters/token copies, output mutation,
reported versus inferred mental state. Independently reconstruct feedback and
session projections from authored input plus successful event log, importing no
own session/classifier/grader/projection helpers. Shared strict schema/Chess and
E222/E223 context adapters limit independence; do not claim independent validation
of their underlying opinions. Retain actual outputs/hashes/guard receipt.

Broader exercise authoring, independently validated keys, forcing/strategic
solutions, adaptivity/mastery, learning benefit, mental-state truth, source/data
eligibility for real model games, persistent/multi-user UI, combined integration
and separate production promotion remain open. Every original strategic scope
remains required; a session or matching answer does not discharge it.

Pre-evaluation projection clarification: hidden preparation totals could hint at
key length or context content. Public pliesUsed stays null until all tasks reveal;
submittedPlies reports only the learner's own charged moves. Full accounting is
then disclosed. Adapter review materials are explicitly supplied context, not an
implicit same-position or causal link to the exercise.
