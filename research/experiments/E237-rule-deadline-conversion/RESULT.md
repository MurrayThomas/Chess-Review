# E237 — rule-defined temporary winning resource and conversion deadline

2026-10-11. BUILD-FIRST prototype, not accepted evidence. Three bounded candidate
scopes C0600/C1075/C1076, previously absent from the current ready-code queue.
Plan 0dc8b6e; source frozen 358a873. Authorized current main, research-only local
commits and no push. Numerical research remains paused.

This addresses E207's missing declared measure, timescale and actual expiry
comparison. At reversible counter149, an immediate mate is available, while
EVERY nonmating legal ordinary action draws automatically. At least one such
action is specifically clock-terminated and is mechanically live with the SAME
board/action at counter148. This positively proves an exact final-ply conversion
window, unlike an incomplete or failed short mate search. The lower-clock live
control does not assert a win. No generic positional metric or probability is
invented. Original broad temporary/strategic advantage meanings stay open.

Primary rules: [FIDE Laws, Articles 9.3 and 9.6.2](https://handbook.fide.com/chapter/e012023),
checked 2026-10-11. The optional fifty-move claim may be declined; the 75-move
automatic draw applies at counter150, with final-move checkmate taking priority.
These are reversible-move rules, not wall-clock expiration or time trouble.

Authored White Kf7 Qe5 versus Kh7 at counter149: Qg7# converts the resource;
Qf5+ instead ends in the automatic draw despite being check. Every legal action
is retained, including other mating choices and board draws. The reflected
Black case agrees. Genuine recorded ...Kh7 prefixes are replayed; reflected
fullmove counters are derived by replay rather than copied. Both colors of
additional pawn/capture positions retain actual legal zeroing escape actions
and correctly fail the exhaustive expiry gate.

C0600/C1075 identify this conditional temporary winning resource whether or not
the actual move uses it. C1076 additionally requires that the actual legal move
be checkmate. Actual Qf5+ does not receive conversion credit. Strict schema,
default-disabled behavior, exact history endpoint and automatic-terminal history
refusal, complete legal domain and atomic budget abstention are implemented.
Known fivefold repetition terminates; optional own fifty/threefold claims may
be declined rather than being incorrectly treated as unavoidable outcomes.

All claims are conditional on the supplied root being ongoing. A partial history
cannot exclude earlier game termination or unrecorded automatic repetition.
The output exposes this limitation and never claims actual-game adjudication,
private intention, general strategic value or unique/best practical play.
Before promotion, earlier-history and dead-position adjudication require the
full integration audit; the immediate mate certificate itself excludes a dead
root for positive examples.

Guarded authored pilot:26both-color cases,1.7934859seconds total; first runtime
plus independent own checker0.1170824seconds, below registered1second limit.
All12focused checks passed6.7563213seconds (test duration6.6259137seconds).
Includes genuine prefixes, every legal choice/lower-clock ledger, actual delay,
lower/expired counters, absent mate, pawn/capture resets, optional claims/known
fivefold, illegal continued history/endpoints, strict/getters/default-disabled,
exact/one-short/zero logical and domain caps, ordinary clones/nonmutation and
independent ledger/clock/mate-precedence/scope/label/work forgery rejection.
No failed hypothesis or fixture search. No cumulative or long historical suite.

The own checker independently replays supplied history, recomputes legal choices,
terminal precedence, clocks and labels without importing the new detector, E210
rule helper or collector. It shares Chess, legal-position admission and strict
schema with runtime, so this is not an independent chess engine. Saved replay
rechecked all26rows before build registration. No cached success substitutes for
semantic checking. Every executable entry point gates D001; no real games used.

`npm run verify:source` and final `git diff --check` passed. Four retained evidence
files total268686bytes, with23recursive source bindings, exact revision/inputs,
D001 receipts, complete rows and process stdout/stderr, hashes and zero fresh
searches. No engine/tablebase probes, real-data acquisition, numerical fitting,
accepted tracker advance or production changes.

Machine status:378/1085 accepted unchanged,522pending entries with provisional
code,145ready batches and zero stale. Accepted-or-candidate900/1085(82.9%);
185entries lack ready candidate code, including separately routed support work.
These scoped candidates do not discharge the complete broader definitions.

Deferred: broader temporary/permanent strategic measures and intrinsic
nonterminal resource expiry, resettable windows, full original occurrence/claim/
history/terminal/priority matrices, combined independent replay/integration,
changed main/repeat/clean reproductions, independent chess truth, eligible
real-game precision/human usefulness and separate production promotion.
Full catalog goal remains unfinished. Next: audit whether rule-defined windows
can extend to genuine nonterminal temporary resources without equating voluntary
surrender, arbitrary move counters or failed finite search with intrinsic expiry;
retain the current queue's opening/evaluation/minor-piece prerequisites.
