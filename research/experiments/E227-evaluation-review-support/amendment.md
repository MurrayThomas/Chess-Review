# E227 focused-check correction,2026-10-11

Frozen source6cccb26 produced14successful pilot cases in0.234180seconds and15/16
passing focused checks. Keep evidence/pilot-started.json, pilot.json and
focused-failure.json unchanged. The failed assertion expected a numerical
aggregate for the full pilot's white CP and mate reports, which intentionally
share full root+playedMove+engine/configuration. The registered duplicate rule
correctly returns null for that group. This is a test-expectation error, not an
implementation failure or permission to relax duplicate suppression.

Change only the test expectation/positive aggregation setup and its saved-source
admission: assert the original group remains duplicate-unavailable, then construct
two distinct genuine white roots and compare their aggregate against unchanged
sf19GameAccuracy. Add a saved-source audit that verifies every original pilot
source hash; only the amended test path may differ, and its original hash must
match Git's frozen source. Preserve all14original cases/results unchanged and
all16checks, with the strengthened aggregation check. No classifier/helper/core,
original plan, pilot input or accepted evidence changes.

A separate amended-check runner records its own exact revision/current closure,
original pilot hash and actual process output. Record generation will distinguish
original successful pilot bindings from the current amended checks, bind both
and replay original results unchanged. No searches/full/historical tests.
