# E208 — strongest defensive resource by certified complete outcomes

2026-10-11 after E2072c8a0d7. BUILD-FIRST, authorized current main, research-only
local commits/no push. C1083 has no current candidate. Reuse complete E146/E155
trees, not E143's first-winning-branch search as a strongest-resource inventory.

Default-disabled inspectDefensiveResources(input,options,graph). Input current
fen/history, with at least one genuine recorded move. Reconstruct last move's
earlier prefix/root and admit E146 complete continuation graph at the EXACT current
after frame. Options enabled, player w/b required when enabled, plies0..4/default2,
maxNodes0..50000/default50000. Do not invent opponent turn, history or a null move.
Defender is actual current side to move; original source actor remains explicit.

New C1083 bounded criterion: best certified win/draw/loss outcome among EVERY
legal current defensive choice under the full declared continuation tree. Utility
for defender: terminal own mate+1, certified stalemate/insufficient-material draw0,
enemy mate-1. Frontier is interval[-1,1], NEVER draw/loss. At defender nodes maximize
both bounds, enemy nodes minimize both. This can certify a forced result despite
unselected frontier alternatives, but complete current defense ranking requires
EVERY legal defense interval to be exact. Return ALL equal-best ties, including
forced only choice and all-losing ties under this explicit outcome criterion;
do not imply unique move, maximum resistance distance or unrestricted engine best.
If any defense is unresolved, retain full intervals and withhold strongest answer.
Any visited claim in whole source suppresses answer; claim is not automatic draw.

Saved cooperative-mate control has ...Nxf6 capturing the checking queen to a
certified insufficient-material draw versus ...Kg8 permitting Qg7#. Complete
outcome comparison, not nominal capture value, selects the resource. Both colors,
single forced defense, equal-material source, shorter-bound unresolved controls.
Actual defender/player relation explicit; current frame is source.after, not
the earlier root or an invented alternative turn. All source nodes/edges retained.

Work=3+current history length setup, exact graph.nodes,1 per solved interval node,
1 per inspected current defense and1 final mapping. Atomic exhaustion limit+1,
no source/profiles/answer. Missing history/last move/graph abstain; strict supplied
history/FEN/H/control/graph plain data and exact legal source replay. No internal
library/time bound asserted. Independent own checker imports no own runtime or
collector; separately evaluates lower/upper extreme-frontier minimax, exact root
inventory/outcomes/ties/frames/mapping/cost. Shares frozen E146 semantic admission
and chess.js with runtime as an explicit independence limitation.

First measure ONE retained63-node refutation-source semantic admission before
building the full focused matrix. Retain timing/provenance; if >2seconds, stop
expanding that source matrix and register smaller compatible work. Then focused
six saved H2 contexts, both requested player perspectives and subtree frontier
inspection where already frozen source supplies shorter horizon. Do not truncate
or forge a source tree to manufacture a negative. If no exact shorter source,
record prerequisite instead of collecting under this no-new-collection plan.
Strict/missing/disabled/current-history/terminal/claim prerequisite, exact/short/
zero caps, original source mutation, own outcome/interval/tie/frame/perspective/
legal inventory/accounting/getter/output isolation. No fresh search/engine/
tablebase/real game. Preserve failures, source/diff verification and local commit.

Full strategic strongest defense, mate-distance ranking, nonterminal draw proofs,
unknown outcomes, broader histories/material/horizons and human utility stay open.
Combined original-occurrence/absence/priority/history/terminal/claim/budget matrices,
inherited replay and changed main/repeat/clean reproductions remain deferred.
Accepted evidence and production unchanged; complete teaching catalog retained.
