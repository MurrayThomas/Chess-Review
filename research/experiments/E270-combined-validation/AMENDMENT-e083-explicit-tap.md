# Explicit TAP reporter for independent replay drivers — 2026-10-12

First E083 control attempt is TERMINAL and preserved at semantic-e083-controls-
initial:65assertions pass, child0 but overall qualification fails because direct
Node execution chooses SPEC rather than the assumed TAP. Current limits, source/
canonical preservation and all assertions passed; this does not waive TAP admission.

Prospectively add --test-reporter=tap to BOTH new direct one-process E083 drivers
and the fixed control command checker. Bind this amendment in both source closures.
First run a tiny authored node:test reporter smoke with NO Chess/candidate/saved
payload, retaining exact command/output. Then retry ALL65controls, unchanged,
in a NEW semantic-e083-controls-tap directory;120-second cap unchanged. No default
reporter parsing fallback, test exclusion or weaker pass predicate. On qualified
retry, use that exact control attempt for the registered complete saved replay.
If explicit reporter invocation fails preserve it before any further change.

No bound2658-source/259-test/canonical freeze edits, no full regression rerun,
no original attempt rewrite, no accepted credit or scientific scope change.
The single-process design and original registered limits remain unchanged.
