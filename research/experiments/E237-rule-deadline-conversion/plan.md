# E237 — a rule-defined temporary advantage and its conversion deadline

2026-10-11, before implementation or decisive evaluation. Parent f9408bc.
Current main, research-only local commits, no push, BUILD-FIRST. E236 made
indexed evidence progress but added no coverage. Current canonical queue shows
C0600/C1075/C1076 still without ready code. E207 explicitly requires a measure,
timescale and genuine expiry/conversion comparison; E196's failed H4 mate does
not prove expiry. No old observation or gate is being relabeled.

Scheduling deviation from opening/evaluation/minor-piece prerequisites: address
this common temporal family using exact game rules rather than invent strategic
ratings or repeat E147's failed equalization hypotheses.

Primary rules checked 2026-10-11: https://handbook.fide.com/chapter/e012023,
Articles 9.3 and 9.6.2. The fifty-move claim is optional. At 150 reversible plies
the automatic draw applies, except that checkmate on the final move wins.
These rules give an objective deadline, not a wall-clock/time-trouble model.

Proposed callable, default-disabled detector: replay exact supplied legal history
using E210 admission, refuse already automatic-terminal roots/continued history.
Require root halfmove counter 149. Enumerate EVERY legal move and its exact leaf,
counting optional draw claims separately from automatic termination. Prove at
least one actual immediate mating choice and at least one nonmating clock draw;
EVERY other legal nonmating choice must be an automatic draw (board draw or the
75-move rule), with no pawn/capture resetting alternative escaping this partition.
For every choice also replay the same board/action with halfmove counter 148;
at least one clock-drawn nonmating action must leave a mechanically live position
there. This is a causal rule-clock comparison, not a claim that the lower-clock
position wins. Exhaustion emits no partial labels.

C0600/C1075: conditional on an ongoing supplied root and declining optional own
draw claims, an immediate winning resource has exactly this final-move window:
every nonmating ordinary action ends in a draw. C1076 additionally requires the
ACTUAL action to be one of the mating choices, so conversion really occurs.
Do not require or claim that mate is unique. Do not infer private intention,
general positional advantage, optimal practical play or real-game adjudication.
Partial histories cannot exclude unrecorded prior termination/repetition; output
must state that limitation explicitly. Pawn/material/mobility proxies never win.

Authored base hypothesis: White Kf7 Qe5 versus Kh7, white to move, counter149;
actual Qg7#, delay Qf5+ reaches counter150 without mate. Both colors and genuine
recorded prefix, derived by replay rather than copying reflected move counters.
Controls: lower/expired counters, absent mate, zeroing escape, actual nonmate,
missing history, automatic-terminal continued history, strict/default-disabled,
exact/short/zero caps, full ledger/clock/outcome/label mutations. Independent own
checker recomputes history, all choices, rule precedence and expiry comparison
without importing the new detector or its derive functions. Shared Chess/rule
admission remains a limitation. No search/engine/tablebase/game acquisition.

Before assertions retain source revision/hashes, D001 receipt, raw results and
failures. First representative runtime+checker <=1 second, <=256 choices; focused
test process <=30 seconds. Stop on failed positive, retain and diagnose; do not
search fixtures until passing. Full cumulative suite, original broad occurrence
matrices, independent chess truth, exact reproductions and human/real-game
usefulness remain deferred to combined validation. No accepted tracker change.
