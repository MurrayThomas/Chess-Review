# E082 historical transitive supplements — 2026-10-12

The initial saved admission at a1e443e failed38.654seconds before any row replay: new gate required every current86-source replay-closure path to appear in the original309-input manifest. The historical manifest was a manual physical-input list, not a complete recursive import closure. The full original vector and all canonical artifacts passed preceding checks; preserve complete failed attempt.

Source-only inspection at exact frozen2859af1c33dc359237119f936778514764356190 finds exactly three omitted transitive dependencies, all byte-identical after registered normalization to current/frozen cumulative sources:

- research/d001-format.mjs: 5dffe4a50655536950d2bb8c475fef31f493cfb9b47cfcaad808b0fb087ea24d
- research/fresh-format.mjs: 6537d177ad21cbe16c89471040e63d0f42ad43a69e4f189787b8dcf2624e5b21
- tools/calibration/core.mjs: c9f38c42f4937fcfdcb3bd44fdaf1d4eea6323c69533a24ca16779cfc4178ace

Prospectively require exactly these three supplementary historical Git source identities in addition to the unchanged original309-vector; all other83 replay-closure paths must still match that original vector. Verify the three actual Git blobs at the frozen revision, current files and cumulative freeze, not merely this list. Never insert them into or rewrite the original manifest, and do not retrospectively describe the old vector as a complete import closure. Any extra/missing/different supplement fails. Add three explicit supplement-shape corruption tests to saved stage (269 total, including246original rows); smoke remains55 and must repeat under the changed new-gate source binding before saved retry. Existing checker/candidate/tests/fixtures, run caps, original scopes and canonical evidence remain unchanged. Retain old smoke qualification as historical to its own source closure, not as admission for modified gate.
