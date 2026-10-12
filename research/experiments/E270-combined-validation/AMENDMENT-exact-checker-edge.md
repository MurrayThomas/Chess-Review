# Exact observed-checker import edge and complete retry — 2026-10-12

The frozen b9f6be9 dependent run passed9of16 files, then E228 source admission
rejected an unregistered added dependency before its semantic tests. All1623
canonical archive hashes unchanged; full failed run/logs retained. No concept or
build/support record qualified. This is a real dependency-closure omission in
the first repair, not a reason to relax the guard.

Trace of BOTH E228 and E230 saved pilot closures finds exactly one new previously
unlisted source edge introduced by the concordance bridge:
research/experiments/E211-rook-tablebase-admission/code/check-execution.mjs
normalized SHA778598e1fa741f25dfd36bac971499050cce7eb56dd9be311c9192b900edb30f.
The checker itself has NEVER changed. Register only this exact added dependency
and update the registry pin. Keep all15original before/after transitions and
other helper additions unchanged. No wildcard, null hash or arbitrary new source.
Add an adversarial check for a forged hash on this explicit edge.

Run a NEW separate complete retry on all prior16files PLUS original E220 equality
file (17total), serial, same600second per-file/1800second whole caps, same output
preload and before/after canonical/source checks. Do not reuse cached successes
as this current-source runtime acceptance; the first9passes remain diagnostic.
All17must pass before the same13-record reconciliation gate. Preserve the unused
registered separate E220 runner as provenance; combined retry includes its exact
original file once. Full cumulative pilot-pass and later acceptance gates unchanged.
Original48-panel numeric observations remain reusable under their exact frozen
producer/source-epoch bindings; do not recollect them.
