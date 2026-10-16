# F022: keep sound defensive sacrifices; reject best moves in lost positions

2026-10-16. [E276 report](../experiments/E276-reported-brilliant-cases/RESULT.md).
Two user-supplied complaint cases,58 engine searches, no production modification.

Qg3 is not a demonstrated false positive. It deliberately ignores the new h3
attack on Ng4; hxg4 Nxg4 gives a knight for a pawn with active threats. Rf3 then
allows the king to escape viaf1 after Qh2+. Both bundled engines prefer Qg3 at
all configured budgets; deeper searches put Black near equality or slightly
ahead. The actual current app retains Brilliant with the visible preceding
history, and conservatively uses Best without it. A sound offered piece need
not be the piece that moved; accepting an offer need not refute it.

Ke8 SHOULD NOT be Brilliant under our policy. It is best because the only
alternative e6 allows Qxe6+ Kc7 Qxc8#; Black remains lost after Ke8/Bxc8.
Current source returns Best at every tested engine/budget setting. A legal
material offer and zero expected-point loss are insufficient for Brilliant.

Exact historical pre-soundness-gate functions reproduce the bad Ke8 label with
synthetic preceding-error context. The current minimum-position gate blocks it.
Original screenshot app/cache/history are unknown: a demonstrated historical
mechanism, not proof of the original session's cause or a newly implemented fix.

Four cold engine repeats and exact report repeat pass. Independent audits replay
58 observations,1,868 legal PV lines/18,681 moves, nine local exchange results,
the full mate witness and four current-app integration cases. Thirty focused
checks and source verification pass. Source/image/engine hashes and limits are
retained; no fresh population or human-agreement claim.
Exact archived scientific declarations reproduce28 history/no-history rows
without reading live analysis.js;17 payload artifacts/586,384 evidence bytes
including manifest remain under the soft storage target.

Reflection: retain positive AND negative guards. Do not suppress Qg3 to fit a
complaint or promote a material heuristic without counterexamples. Next audit
stored/streamed/variation score admission and cache/build consistency; reproduce
a current defect before proposing its fix. Broader brilliance/difficulty/rarity
needs independent reviewer evidence. Draw-aware design remains queued behind
this user-prioritized investigation.
