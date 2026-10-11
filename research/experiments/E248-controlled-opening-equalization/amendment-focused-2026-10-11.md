# E248 late-history fixture repair, no behavioral or search change

2026-10-11 after own freeze7c90e35. Original four-row pilot passes; focused
subprocess passes7of8checks in17.005seconds. The late-history negative reused a
four-knight-ply cycle five times. E024 correctly refuses histories continuing
after threefold repetition, so this fixture never reached the intended opening
window gate. Preserve evidence/focused/{started,pilot,focused-failure} unchanged.

Replace ONLY this fixture's20plies with a legal nonrepeating Italian continuation,
and its nominated21st-ply move with legal Nf1g3. The standard-start/first20plies
gate, every actual research input, engine observation, runtime/checker/admission,
numerical threshold and claim stays unchanged. No new engine searches.

Rerun ONLY the formerly failing named check, under a new source freeze and
exclusive evidence/focused-repair paths. Bind current full inputs and retain raw
repair output. Verify against original frozen test bytes that ONLY the declared
late fixture changed. Reuse the seven other passed checks, whose bodies and
behavioral dependencies are unchanged; independently replay all four own saved
results again before build retention. Report combined7+1checks, not a fresh
all-eight run. Original failed process and test semantics remain visible.
