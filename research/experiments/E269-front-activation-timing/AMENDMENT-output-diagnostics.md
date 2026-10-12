# Output diagnostic amendment — 2026-10-12

The first focused validation process at e87c01e timed out after180.032seconds,
without TAP output. Preserve evidence/focused/started.json,pilot.json.gz and
checks.json. No new collection and no science/forecast/gate/budget change.

Replace the independent output checker's final assert.deepEqual(result,expected)
with assert(isDeepStrictEqual(result,expected), fixed concise message). Both use
Node strict deep equality; the repair avoids formatting a full40-policy corpus
when intentionally rejecting forged outputs. Do not bypass any equality field.
Git e87c01e retains the original checker. Retry in focused-retry with the SAME
180second process limit, unchanged tests and parent solver/checker. Require all
valid callable output SHA digests to equal the retained original pilot outputs.
The hypothesis is diagnostic formatting overhead, not a proven chess finding.
If retry fails, preserve that too; readiness requires actual passing checks.
