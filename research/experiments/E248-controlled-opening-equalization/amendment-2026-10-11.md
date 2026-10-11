# E248 collector admission repair — before new engine evaluation

2026-10-11 after frozen collector3fd4c08 failed while checking the first borrowed
E147 panel. The compact adapter retained events/view but omitted `result.after`,
which unchanged E138 checkPanel requires. Assertion actualundefined versus
expected post-e4/e5 FEN. The failure occurred in the borrowed-source loop BEFORE
the child collection loop; zero fresh engine searches/panels. Original
evidence/started.json remains immutable; retain admission-failure.json separately.

Restore the exact existing `full.after` in both compact source-result adapters.
No shared checker, hypothesis, chess budget, engine configuration, threshold,
claim, source eligibility or search result changes. Retry under a new collector
freeze and DISTINCT evidence/v2 output directory, retaining the original source
revision and failed attempt. Registered two roots/alternatives and all gates
remain unchanged. Do not overwrite or remove original evidence.
