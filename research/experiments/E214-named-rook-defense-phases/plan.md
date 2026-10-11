# E214: outcome-qualified Philidor and Vancura phases

Registered 2026-10-11 after E213; BUILD-FIRST/current-main research-only exception,
local commits/no push. Existing E057 checking rays/E082 rook facts do not certify
C0670 Philidor or C0671 Vancura outcomes. Both original scopes remain broader
than a one-move resource; sustainable policies and causal isolation stay open.

Teaching metadata only: GM Alex Ipatov's Philidor lesson
https://lichess.org/ckb/video/FXxgPK5AceU and GM Petrov's rook-endgame lesson
https://www.chessclub.com/videos/gm-petrovs-20-endings-you-must-master-video-6-rook-endgames
describe the waiting barrier and change after pawn advance. Vancura terminology
uses https://www.thechesswebsite.com/vancura-position/ (front rook/sixth-rank pawn)
and https://blitztactics.com/vancura-position (side attack/checking). Only indexed
teaching prose was used, no external example/game/diagram positions. Below are
authored synthetic fixtures; they are hypotheses, not assumed drawn positions.

## Registered fixtures and gates

All ranks below are normalized toward the pawn's promotion direction. Require
defender-turn KRPvKR, no rights/EP, complete legal successor outcomes, exact
root WDL50 draw0. Resource must preserve draw0. A contrast must be a legal quiet
move of the SAME original defending rook with root-actor WDL=-2, and no legal
immediate reply may capture that rook. Pawn-file/phase constraints are explicit.

Philidor barrier: white Kd5 Pe5 Rh2, black Ke8 Ra6, black turn, empty actual
history and clock0. Defending king occupies the pawn's promotion square. A quiet
rook waiting move along the sixth rank must control every unobstructed-by-own-
unit adjacent sixth-rank square of the attacking king (at least one target),
while a qualifying losing alternative leaves that rank. The prospective Rb6
must be among drawing resources to continue this family; otherwise stop it.

Philidor retreat: from that exact barrier root, actual moves a6b6 e5e6 (no
substitute waiting move) produce black turn and clock0 after the pawn advance.
Require that actual two-ply history, defending king still on promotion square,
attacking king on fifth, pawn on sixth, defending rook on sixth. A quiet same-
rook retreat to the normalized first rank draws, while a qualifying losing
alternative stays on the sixth rank. This phase changes a real recorded position;
it is not a hypothetical turn swap. Gate does not claim subsequent perpetual
checks. Require at least one retreat resource; stop family otherwise.

Vancura pressure: white Ka5 Pa6 Ra8, black Kg7 Rf6, black turn, empty history
clock0. Rook pawn on sixth, attacking rook on its promotion square and defender
king at least three files away. Quiet drawing rook move along sixth rank must
maintain an unobstructed attack on the pawn from its side. Qualifying losing
alternative leaves sixth rank. Stop family if contrast absent.

Vancura check: independently authored white Kb6 Pa6 Ra8, black Kg7 Rf5, black
turn, empty history clock0. Same pawn/front-rook/far-king requirements. Drawing
rook move to sixth rank gives an actual unobstructed lateral check to attacking
king on that rank, with at least three intervening squares. Qualifying losing
quiet alternative does not check and stays off sixth rank. Stop family if absent.

Evaluate families independently in listed order: barrier then its retreat;
pressure then check. A stopped family receives no code-ready credit, even if
one phase passed. For each family whose BOTH phase gates pass, collect both
phase color/rank reflections once; both must pass. No selecting a different
fixture or weakening gates after outcomes. Preserve every negative/failure.

Maximum eight new panels, each root plus EVERY legal successor, maxProbes128.
E211 V2 actual process outputs, source/data/vendor/runtime/program checks and
independent legal/perspective replay are mandatory. Each guarded collection
must be <=3seconds or all further collection stops for cost review. Process
timeout15seconds unchanged. No engine search, historical collection repeat or
fresh main/repeat/clean run. Reuse E213/E212 fixed observations for negative and
unrelated-outcome controls without probing again. Root WDL50 is the zero-counter
model, not arbitrary-clock/repetition adjudication or independent retrograde truth.

## Conditional implementation

For each fully passing family, implement callable default-disabled phase
explanations with strict FEN/history/clock/interface controls. Authenticate fixed
saved observations or collect via real guarded V2 process; never accept arbitrary
caller outcome panels. Preserve same-rook identity, complete legal alternatives,
phase geometry, draw/loss distinction and source model. Require actual exact
Philidor pawn-advance history for retreat; other phases require empty history.
Independent own-result checker reconstructs geometry/rays, legal moves, immediate
rook-capture alternatives and outcome perspectives without classifier imports.

Focused saved-only checks: both phases/both colors for any passing family,
negative/unrelated controls, wrong/omitted history, clock/frame/default-disabled/
strict controls and output/admission mutations. Full combined acceptance,
strategic policy/phase transitions against every defense, other files, isolated
causes, arbitrary clocks/repetition/DTZ, independent WDL truth, changed main/
repeat/clean reproduction, real-game precision and human utility remain open.
Only demonstrated callable scopes receive build.json credit; otherwise retain
inconclusive/support result. Source verification/diff checks finish the batch.
