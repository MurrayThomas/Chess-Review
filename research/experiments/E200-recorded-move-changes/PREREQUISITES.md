# Scope and remaining work

C1060 now has an exact recorded-transition prototype. Its supplied history may
start at a composed position: identities begin there, not at an assumed opening.
Moves before that start are unknown. No proposed input.move is applied. Inventories
retain earlier captured identities as dead units and preserve a pawn's original
identity after promotion. Castling updates both original units.

Complete geometric attack maps include friendly occupied targets and pinned
pieces. They do not establish legal recaptures, safe squares, tactical gains or
strategic improvement. Complete legal move/check/capture lists use each frame's
actual actor; the actors differ. Their difference is not a same-player causal
comparison. Nominal values are conventional inventory arithmetic, not position
evaluation. FEN en-passant fields use chess.js canonical serialization.

Threefold and fifty-move flags are library claim conditions, not adjudication
records. E024 rejects continuations after library game-over, including claimable
draws. Final mate/draw frames are supported. Claims about games continued without
claiming, fivefold/75-move adjudication, unseen earlier repetition and external
termination require a broader history/rule contract; no such claim is made here.

The independent checker rebuilds identity via occupied-square maps and computes
attacks using coordinates/ray blockers. It shares chess.js legality, FEN and rule
semantics. Independent parent-rule replay and exhaustive matrices remain deferred.
The explicit 2L+260 operation ledger bounds declared work admission, not internal
chess.js operations, elapsed time or engine nodes. Ordinary acyclic data only.

Full strategic consequences of the last move require existing tactical/positional
proofs and comparisons to be integrated and validated, rather than interpreting
geometry as value. The original broad question remains in scope. Human usefulness,
eligible real-game precision and production promotion are unestablished. Combined
regression, original occurrence/support routing, detector priority/absence/history/
budget/terminal/claim matrices and changed main/repeat/initially clean reproductions
remain deferred under BUILD-FIRST. Accepted E082 evidence is unchanged.

Next audit C1061: current legal checks and captures are available here, but an
answer about threats must reuse complete bounded tactical proof machinery and
distinguish unavailable/nonmating resources from a claim of no threats.
