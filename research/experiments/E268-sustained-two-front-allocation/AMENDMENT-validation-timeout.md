# Validation timeout amendment — 2026-10-12

The first focused validation process reached the runner's 30-second timeout
before emitting TAP output. Its original focused/started.json, replay.json.gz
and checks.json are preserved. No collection error or scientific gate change
is inferred. Retry saved-proof validation in focused-retry with a 180-second
per-test-process timeout. Query limits, solver, independent checker, fixtures,
forecasts, calibration and original collection remain unchanged. No new chess
query is authorized by this amendment; failed alternative forecasts still
exclude readiness. This is a validation-runtime correction only.
