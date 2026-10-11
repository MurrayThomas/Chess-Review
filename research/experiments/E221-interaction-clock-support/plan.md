# E221: observable interaction, termination and clock support

Registered 2026-10-11 after E220e23f691. BUILD-FIRST/current-main research-only
exception, local commits/no push. Approved ACTIVE-QUEUE phase6 routes these
concepts to input-dependent support, not new FEN-only detectors. Implement one
shared callable support contract; NO build.json or accepted/provisional detector
coverage credit. Preserve all original IDs and teaching scope.

19original occurrences: C0018/C0019, C0814..C0820, C0871/C0872,
C1033..C1040. C0818/C1039 increment and C0819/C1040 delay retain both contexts.
This prerequisite-driven support batch does not replace remaining strategic
research. E147 opening failures and E179/E180 evaluation/human-quality rubrics
remain open; do not invent quality thresholds for timing or mental states.

## Versioned primary reference, not game data

FIDE Laws effective2023-01-01, official Handbook
https://handbook.fide.com/chapter/e012023, inspected2026-10-11.
Relevant sections4.2..4.4,5.1.1..5.1.2,6.3.1..6.3.2,A.1,B.1.
Metadata/rule prose only; no games/positions/diagrams imported. Authored fixtures
below are synthetic. Pin profile name `fide-laws-2023`; do not silently inherit
later rule changes or claim platform categories share this definition.

## Callable contract and separate evidence types

Default-disabled `inspectInteractionClockSupport(input, options)`. Strict plain
JSON input with optional full FEN, timeControl, turns, termination, touch events,
event declarations and selfReport. Explicit source/event identifiers on reported
external facts. Integer milliseconds, safe bounded arithmetic; no live clocks,
private data, acquired games, UI/runtime integration or automatic adjudication.

TimeControl has white/black phases1..16, each moves positive integer or null
(only final phase unbounded), allotmentMs, mode none/fischer/delay, bonusMs.
None requires zero bonus. At each turn identify phase from completed own move
number. Reconcile declared after-press clock snapshots using measured elapsed,
increment or delay charge, next-stage allotment and explicit signed adjustment.
Missing semantics, underflow/flag ambiguity or inconsistent snapshots withhold
computed elapsed summaries; preserve reported data, never infer a flag winner.
All turn records, including failures, remain visible. maxTurns0..256/default256,
atomic exhaustion emits no modules/routes. No silent truncation or inferred
elapsed time from clock differences when delay/adjustments are unknown.

Reported time control/increment/delay and reconciled turn facts support C1038,
C0818/C1039,C0819/C1040,C0814. Caller-supplied timeTroubleThresholdMs is a declared
convention for C0816/C0817, with source/model shown; no universal cutoff or
performance claim. C0815/C0820 require explicit self-reports, labelled reported
rather than observed thinking/awareness. C0871/C0872 remain unavailable without
a validated quality/timing rubric even when measured elapsed time is present.

Compute versioned FIDE rapid/blitz category only for single-phase unbounded
none/Fischer controls; base plus60increments,<=600000ms blitz, strictly between
600000 and3600000 rapid. Other profiles and mixed asymmetric categories remain
unclassified; do not infer classical/bullet from leftovers. Classical/bullet
are explicit reported event categories, Armageddon explicit draw-odds event
configuration. No result conversion or new competition-format detector.

C0019 preserves sourced termination reason/result separately from local board
checkmate. No FEN can establish resignation; contradictory metadata/board facts
are conflict. A reported resignation draw remains a draw: no automatic loser
inference without legal possible-mate adjudication. C0018 preserves sourced touch
events, declared purpose, piece identity and complete compatible legal move
inventory when a FEN is supplied; adjustment/unknown-purpose/wrong-side contexts
remain distinct. Ruling always null: no full multiple-touch/arbitration/intent
adjudication from these observations, and no inferred deliberate touch.

## Focused hypotheses and acceptance

Commit plan/implementation/fixtures before evaluation. Authored cases cover both
sides, ordinary/Fischer/delay clocks, phase boundary/adjustment, inconsistent or
missing snapshot semantics, flagged/underflow ambiguity, exact speed boundaries,
asymmetric/multi-stage/delay unsupported categories, reported bullet/classical/
Armageddon, live resignation versus board mate, contradictory/missing termination,
draw-on-resignation preservation, touches/adjustment/unknown purpose/no FEN,
explicit versus missing mental self-report and missing quality rubric.

Independent checker imports neutral Chess/strict-data helpers only, not own
classifier/arithmetic/routing helpers. Reconstruct timing/phase/credit equations,
versioned categories, termination/move inventories, fact-vs-report routing and
entire output/accounting separately. Focused positive/negative, strict/getter/
overflow/duplicate/ordering/schema, disabled/missing and exact/short/zero cap
checks; source/result/payload/routing mutations. First representative pilot
admission+independent replay<=2seconds, then saved-only/focused synthetic checks
with no chess search. Record errors before changing any gates; preserve originals.

Retain small complete fixture/results/commands/hashes and support.json with
coverageCredit:false. Cross-check all19IDs against canonical catalog and approved
routes. Full clock-device/platform/PGN adapters, trusted external provenance,
touch-move rulings, possible-mate termination adjudication, performance/mental
quality labels, human usefulness, combined integration and production promotion
remain open. No cumulative suite or historical experiment reruns.
