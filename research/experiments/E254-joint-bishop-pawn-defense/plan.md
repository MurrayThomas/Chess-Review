# E254 — joint bishop/king defense against both original flank pawns

2026-10-11 before new proof queries. Follows E253934aae5 and current filtered
needsCode C0698 rank447. BUILD-FIRST, current-main research-only/local commits/
no push. Do not collect tablebases or reuse conversion results as draw evidence.

Authored prospective White roots: White Kf3 Bd6 versus Black Kd8 Pa3 Pg3,
White turn, actual Bd6xa3; and White Kb3 with SAME other units, actual Bd6xg3.
Pa3 is queenside, Pg3 kingside. White king handles the nearby remaining pawn,
the original bishop captures the opposite pawn. Each root and all moves are
subject to legal validation before querying. Rank/color reflection supplies
Black versions with replay-derived counters. No earlier game reachability claim.

Goal: within THREE total plies INCLUDING the nominated actual, actor has a
single legal joint policy against EVERY legal enemy reply leading to actual
insufficient-material draw with BOTH tracked original enemy pawns captured
(including any promoted descendants) and original actor bishop still alive.
Every positive leaf must mechanically satisfy this objective. No independent
single-pawn success, missing/failed branch or merely guarded promotion square.
This is bounded KBvKPP neutralization, not optimal defense/unbounded theory or
universal bishop strength. Pawn captures are part of the declared actual goal,
not evidence of general material/strategic advantage.

H1: four positive roots (two king flanks/two colors) pass complete joint goal.
H2: same-root quiet bishop alternative Bd6c5 (reflected Bd3c4) fails the SAME
three-ply goal, and relocating actor king to h8 (Black h1) with the SAME actual
also fails. This proves bounded joint-resource roles, not root loss or theoretical
failure of those alternatives. Retain all exact control outcomes and domains.
Two additional source-negative both-color frames use enemy pawns a2/g2 (reflected
a7/g7), actor Kf3/Bd6 (reflected Kf6/Bd3), actual quiet Bc5/Bc4, so promotion
including all four underpromotions occurs in legal enemy inventories. They must
not get readiness from an incomplete or failed tree. Total14 authored queries.

Preregistered deterministic search: fixed actual first; subsequent actor ANY
legal choice (OR), enemy EVERY legal reply (AND). Actor legal captures precede
other moves, then UCI lexical order; enemy UCI lexical. Track original pawn and
bishop IDs through captures/promotions. Actual full FEN/history/counters retained;
same Chess instance move/undo retains supplied-segment repetition information.
Reject continuation after automatic terminal; conservative current/intended
claim-sensitive states withhold goal rather than treating missing history as
complete. Terminal goal requires insufficient material, not claim expiry.

Hard prospective first smoke <=3seconds and <=512visited/tick records; each
later query <=3seconds/512records; total <=12seconds/7168records. Entire focused
subprocess <=30seconds. Stop and retain on cost/execution failure; no retry,
greater horizon, alternative root or silent policy/gate change after inspection.
Each later query only runs after complete first positive and independent replay.
Proof-output cap512KiB compressed, soft storage target with full branches retained.
No broad historical/cumulative suite, engine searches, table lookups or games.

Default-disabled callable inspector, strict ordinary fen/history/actual/goal
inputs; fixed private saved-proof admission, zero/short/exact logical budgets,
complete legal actor/defender inventories and proof labels. Independent own tree
checker imports no search/goal/tracker helpers: independently reconstruct original
units, legal branches, genuine history, automatic/claim controls, outcome and
node accounting. For negative proofs, limit means bounded-unresolved only.
Saved proof semantic replay precedes own outputs; hash integrity alone is not
proof. Focused four positives/all controls, underpromotion inventory, both tracked
IDs/bishop identity, strict/history/disabled/source/capabilities/ownership/budgets
and legal-domain/goal/selection/terminal/claim/accounting forgeries.

Freeze plan, then query/checker/collector before decisive evaluation. D001
preflight/guard and source/input/output/revision/environment receipts. Source
verification/diff, RESULT/INDEX/build ONLY if H1/H2 pass, local commits/no push.
Full C0698 theoretical defense/other pawns/materials/long horizons, independent
chess truth, complete earlier history and human teaching utility remain open;
combined occurrence/priority/history/terminal/budget integration, cumulative and
changed main/repeat/clean reproductions remain deferred. Full catalog stays active.
