# E212: outcome-qualified side defense resources

Registered 2026-10-11 after E211, under BUILD-FIRST and the authorized current
main research-only exception. Local commits only; no push or cumulative suite.

Question: can a concrete long-side checking resource or short-side king choice
be explained by a complete legal move/outcome contrast rather than geometry?
Original occurrences are C0666 (long-side defense) and C0667 (short-side defense).
Neither is ready merely because this plan exists. General defense policies and
human utility remain in scope and unproved by a one-ply resource.

Teaching metadata only: GM Alex Ipatov's long-side/short-side principle at
https://lichess.org/kab/video/xB_fuTcVVv0 recommends the defending rook on the
long side and king on the short side. No external example/game position is used.
All positions below are newly authored, not copied from that source.

## Prospective fixtures and stopping rule

First pilot: white Kf5 Pf6 Re2 versus black Kh7 Ra8, black to move, no rights,
EP or prior moves, halfmove zero. Test whether a legal lateral rook check from
the pawn's longer wing preserves exact WDL50 draw (0), while at least one legal
nonchecking move of that same original rook loses (-2 defender perspective).
Geometry requires the checking rook to share the attacking king's rank, an
unblocked checking line, strictly long-side file relative to the pawn, at least
three intervening files to the king, and defender king on the pawn's short side.
Stop this hypothesis if the root is not exactly drawn or no qualifying resource
exists. Retain all outcomes, including a failure, without changing the gate.

Second pilot, only after the first is retained: same attacking pieces, black Kf8
Ra8, black to move. C0667 additionally requires a legal king move onto the
pawn's strict short-side wing preserving WDL50 draw and a legal same-original-
king long-side alternative losing (-2). An on-pawn-file move is not long-side.
If no contrast exists, record C0667 unready; do not redefine it from rook checks.

If a pilot passes, collect its rank/color reflection once to exercise both
players. Maximum four new complete panels, each root plus every legal successor,
maxProbes128, one process per panel, 15-second process timeout. A pilot above
three seconds total guarded collection stops additional collection for cost
review (retain result, no weakened threshold). No fresh main/repeat/clean runs.
The frozen E211 losing geometric fixture is reused through its authenticated
saved loader as an explicit negative, never probed again.

## Implementation and checks

Use E211 V2 actual process-output collector/checker and T002 guarded local
20-file closure with current source/program/vendor/runtime/data bindings. Retain
exact process stdout/stderr/exit/signal and every legal successor. Verify each
panel structurally with the independent E211 checker and hash-bind saved files
before subsequent use. This is a trusted tablebase observation, not independent
retrograde truth or arbitrary-clock/repetition proof. Limit candidate inputs to
genuine empty-history zero-counter KRPvKR defender-turn roots with no EP/rights.

For a passing scope, implement callable strict-input, default-disabled resource
explanation using independently admitted fixed observations. Output explicit
defender, move, alternative, geometry and exact WDL50 semantics; not a promise of
arbitrary-game draw. Complete legal alternatives must remain inspectable.
Representative checks: both colors if collected, retained losing negative,
same-rook/king and outcome gates, mutation/receipt rejection, unsupported clock/
history and disabled compatibility. Independent own reconstruction must cover
legal geometry and perspective rather than simply copy candidate output.

Retain original failed assertions and sources if a check fails; repair only
implementation defects without revising the chess gate. Record build.json only
for demonstrated callable scopes with the full normalized source dependency
closure. Otherwise retain a support/inconclusive result, with no coverage credit.
Source verification and diff checks finish the batch. Combined original-
occurrence integration, full strategic policy, independent outcome validation,
changed main/repeat/clean reproductions, real-game precision and teaching utility
remain deferred. Do not shrink the original catalog to the operational scope.
