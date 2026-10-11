# E200 — what changed after the recorded last move?

Preregistered 2026-10-11 after E199 c6d01a0 under BUILD-FIRST. Current main,
research-only local commits/no push under the user's checkout exception.

Claim C1060: callable factual before/after answer for the last genuine recorded
legal move leading to input.fen. Preserve all original piece identities from the
supplied starting position, captured units, en-passant victim squares, promotion
types and both castling units. Retain complete armies, nominal material counts,
full FEN fields, history-aware rule indicators and complete geometric attack
maps/deltas for both colors. Legal checks/captures describe each frame's actual
side to move; different sides' options are not a causal improvement comparison.

Reuse E024 validateHistory and E020 legalPosition/values rather than invent legal
rules. E083 inventories and E086 routes were audited: both take a proposed move,
and E086's identity tracker is embedded in its detector, not exported. New ledger
therefore extends that identity method without invoking inherited detectors or
altering frozen sources. It never applies input.move. Missing/empty history is
unavailable, disabled is inert, invalid supplied history is rejected. Supplied
start bounds repetition knowledge; earlier unseen history is unknown. E024's
terminal contract rejects continuations after a claimable library draw.

Use an explicit atomic operation budget: initial validation charge L+1 before
history validation, L identity transitions, two snapshots each costing129
(one inventory/rule operation plus128 color/square attack operations), one delta
operation. Successful exact cost 2L+260, not engine nodes or a runtime bound.
Exhaustion returns no partial answer. Plain-data guard precedes field access.

Focused authored synthetic checks: quiet move, ordinary capture, en passant,
promotion/underpromotion, castling both colors, last-move mate and repetition;
strict/missing/disabled input, exact/short/zero budgets, preserved identities,
rule/geometry changes, output isolation and tampered evidence rejection.
Independent checker uses square-map identity reconstruction and coordinate/ray
geometry, not runtime helpers or Chess.attackers. Shared chess.js legality/rule
library dependency is explicit. No game/engine/tablebase collection or searches.
Run guarded focused tests once; retain failures and repair only affected checks.

Source closure/hash provenance, source verification and diff checks accompany
the provisional batch. Defer cumulative regression, full original-scope and
cross-detector integration audits, exhaustive history/terminal/claim matrices,
independent parent replay and exact main/repeat/clean reproductions to combined
validation. Full strategic consequences, favorable/unfavorable changes, hidden
intent, human usefulness and real-game precision remain prerequisites. No
accepted tracker advancement or production behavior change.
