# E083 guarded replay sessions — 2026-10-12

Source-only refinement before ANY adapter/control execution: source inspection
shows openResearchData verifies the entire D001 registered provenance/artifact
closure on every call. The prepared stateless checkSavedE083 opens it per case.
For finite authored control/replay batches, add openE083Replay(): a guarded session
factory that opens the same unmodified loader once and returns a pure case checker
with that exact receipt. The stateless entrypoint retains its per-call guard.
Tests and runners remain separately guarded; callers cannot inject or fabricate
an admitted receipt. No data-policy source, provenance/hash check, terminal full-
regression prerequisite, chess definition or 120/600-second cap changes.

This avoids repeated identical whole-registry validation within one authenticated
batch; it does not cache scientific successes or permit changed input bytes. The
runner still rechecks every canonical/source hash before/after, and saved-artifact
admission must authenticate exact bytes at use. Source-review.json for the first
unexecuted adapter remains immutable; the new source preparation gets a separate
bound record. No measured cost or semantic outcome is claimed before execution.
