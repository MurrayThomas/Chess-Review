# E213: short-side defending king choice

Registered 2026-10-11 after E212 under BUILD-FIRST/current-main research-only
exception. Local commits, no push, no cumulative or historical repeated tests.
Original C0667 short-side defense remains unready after E212: its white Re2
prevents black Ke8, so the root lacks a legal long-side king alternative, while
the legal short-side Kg8 loses. Preserve that negative unchanged.

Hypothesis: in authored zero-counter KRPvKR defender-turn positions, a legal
same-original-king move to the pawn's strict short-side wing preserves exact
WDL50 draw, whereas a legal same-king move to its strict long-side wing loses
(-2 defender perspective). Root must itself be exactly drawn (0), and defending
rook must already be on the pawn's long side. A pawn-file destination is neither
wing. Keep every legal successor and all five outcome categories; no outcome
selection, threshold or definition change after inspection.

## Prospective sequence and budget

New authored roots: white Kf5 Pf6 plus a rook on d2, then b2, then h2; black Kf8
Ra8, black to move, no EP/rights/prior moves, halfmove0/fullmove1. This changes
the attacking rook placement so Ke8 is not automatically excluded by Re2; it
does not assume the resulting positions draw or that Kg8 saves them. Iterate
in that exact order, stopping at the first qualifying contrast. Retain every
negative before proceeding. If none qualifies, record inconclusive and no build
credit; continue the remaining named rook-defense family rather than tune more
positions in this study. If one qualifies, collect its color/rank reflection
once; both must pass before a code-ready C0667 resource scope is recorded.

Maximum four new complete panels. Each has root plus EVERY legal successor,
maxProbes128, E211 V2 real stdout/stderr/exit/signal retention and 15-second
process timeout. Any collection above3seconds stops further probes for cost
review, preserving its evidence without relaxing this threshold. No fresh
repeat/main/clean reproduction or historical search. E212's fixed-hash source
and E211's losing geometric fixtures may be reused without probing again.

All positions are authored, no external game/examples used. Terminology retains
GM Alex Ipatov's teaching metadata at https://lichess.org/kab/video/xB_fuTcVVv0
as referenced in E212. T002 source license/exports/origins and current runtime/
program/vendor/data identities remain guarded. Structural checks authenticate
legality and perspective, not independent retrograde outcome truth.

## Conditional implementation and validation

If the registered contrast and reflection pass, implement callable default-
disabled strict input/history/clock controls and C0667 explanations for the
bounded outcome-qualified king resource. Only private admissions originating
from authenticated fixed saved observations or actual guarded V2 collection
may supply outcomes, never caller-supplied tablebase values. Keep outcome/king
identity, long-side rook geometry, all alternatives and source model explicit.
Independent own-result reconstruction must use legal moves and manual file-
wing geometry without importing the classifier. Check positive both colors,
retained E212 king-choice negative, token/output mutation, frame/history/clock
and default-disabled/strict input limits using saved observations only.

Full original short-side defense ambitions remain open: sustainable all-defense
policies, isolated causal rook-check access, other pawn files, arbitrary clocks/
repetition/DTZ, independent outcome validation, real-game usefulness and combined
acceptance with changed main/repeat/clean reproductions. A one-ply contrast does
not discharge them. Only demonstrated callable scope earns provisional build
credit. Preserve negative hypotheses and source hashes; source verification and
diff checks close the batch.
