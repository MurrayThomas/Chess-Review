# E209 — explicit hypothetical resources and declared position demands

2026-10-11 after E2089013e5f. BUILD-FIRST, authorized main exception, research-only
local commits/no push. C1084/C1085 have no current candidate. E085 already has a
labelled hypothetical enemy-turn immediate-mate snapshot; reuse its E027 turnBoard
model and one-ply semantics, not its full production wrapper. E208 supplies complete
current-frame certified outcomes; do not copy its opponent-only answer into an
own-turn position demand. E192 explicitly separates declared goals from intent.

Two default-disabled callable questions share strict current fen/history and
explicit required player w/b. maxNodes0..50000/default50000; ordinary data only.

inspectHypotheticalOpponent(input,options): C1084 exact diagram-model mate-in-one
resources. Require genuine actual history, actual player's turn, live and not in
check. Flip only turn to opponent and clear EP, retaining armies/castling/clocks;
this is a hypothetical diagram, NOT a legal pass or alternate recorded game.
Hypothetical history=null, repetition adjudication unavailable, model changes
explicitly recorded. Enumerate EVERY legal model move, all promotions/castling,
resulting frame/check/mate/draw and ALL immediate mates. Answer only positive
mate-in-one moves, all ties; absence is not safety or best nonmating move. Actual
opponent-turn/check-evasion/missing/terminal prerequisites do not invent a model.
Actual source history retained separately. Matements take precedence over draw
flags. Work setup2+actual history length,1 diagram transform,1 inventory operation,
1 per played model move,1 mapping. These are fresh cheap one-ply scans, not fresh
full-tree/engine collection; disclose counts rather than claiming zero searches.

inspectPositionDemands(input,options,graph): C1085 declared current goal tied to
exact root/player: {source:'declared-coaching-input',fen,actor,outcome:'avoid-loss'
or 'win'}. Missing goal withholds; supplied malformed/mismatched goal rejects.
Options additionally plies0..4/default2. Reserve1 routing then E208 complete
current-tree source under remaining cap. Use FULL factual defense outcomes even
when E208 correctly withholds its opponent-only C1083 answer on own turn.
Require current player is actual actor and EVERY current choice outcome exact.
Partition ALL legal choices: avoid-loss accepts certified win/draw; win accepts
win only. Emit a position demand only when a NONEMPTY PROPER subset meets the
declared goal. Preserve ALL accepted/rejected choices and exact outcomes/check
context. None meeting goal is unavailable goal-unachievable; all meeting goal
means no discriminating demand; unresolved outcomes remain unknown. No hidden
intent, broad positional-quality claim or finite-failure-as-draw inference.
Work1 + full E208 nodes +1 each choice +1 mapping. Source and own exhaustion
atomic limit+1, no partial answers/witness/source. No library/time bound asserted.

Independent checkers import neither own runtime nor E027 model helper for the
hypothetical question. Reconstruct diagram fields/full legal one-ply inventory
directly. Position-demand checker shares E208 independent source checker and
rebuilds own goal/turn/domain/partition/necessity/ledger. Shared chess.js and frozen
source admission are explicit independence limits.

Reuse E085 authored both-color retained/refuted/quiet/promotion roots, existing
EP root plus an authored castling diagram and clock99 control; no acquired games.
Reuse all eight E208 exact trees, current receipt/archive/collector closure and
pilot0.077second evidence. Focused positive/negative both colors/goals, actual vs
model provenance/EP/rights/clocks, own/opponent turn, check/missing/disabled/strict,
terminal/claim prerequisites, exact/short/zero caps, goal/domain/model/source/
identity/history/frame/perspective/accounting/getter/output isolation. No long
historical suites/reproduction, no new full-tree source collection. Preserve
failures and preregister semantic corrections before decisive reevaluation.

General hypothetical decision quality, nonmating plans/resources and position-wide
strategic prescriptions remain in full scope. Combined original-occurrence/
absence/priority/history/terminal/claim/budget matrices, inherited replay and
changed main/repeat/clean reproductions deferred. Accepted/production unchanged.
