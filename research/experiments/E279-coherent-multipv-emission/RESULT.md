# E279: coherent MultiPV emission — working record

2026-10-16. **Complete: all fixed development-replay gates pass.** Previous goal turn made
progress through E278's verified fixture correction and natural metadata census.
Test one causal producer and a weak common-depth comparator; unchanged admission
C and fixed coverage/freshness gates. No production code or new searches.
Use exactly the authorized54 retained streams with their strict source guard.
Plan/code e74a99a and input/source freeze e1ecbba precede assessment. Twelve authored
producer controls pass before replay. First report ed25b70 and independent oracle
f6d2728 retain the fixed result. No runtime or scoring-model changes, no push.

## Result and fixed gates

P clears its pending rank group at EVERY scored rank1 message, including invalid
or bounded tops. It emits only after fresh exact/legal/distinct ranks1..K at the
same depth arrive; K is clamped to legal choices. Snapshots clone source indices,
scores and PVs. Duplicate/regressing groups are withheld. The message group is
an observed source boundary, not a claim about hidden engine iteration identity.
Completed native results are never replaced by an older coherent progress group.

| Measure | Current top-only B | Fresh-group P | Depth-only cache Q |
| --- | ---: | ---: | ---: |
| Logical progress emissions |930|924|924|
| Secondary source inspections |616|618|618|
| Eligible under unchanged admission C |0|618|618|
| Rejected secondary sources |616|0|0|
| MultiPV streams with a coherent snapshot | Not the registered B target |24/24|24/24|
| Old-group sources in observed emissions | Mixed-depth reference |0|0|

P passes every registered gate: zero source/admission/causality errors;24 served
MultiPV streams (minimum22);618 usable inspections (minimum493,80% of616);
24/24 last snapshots within one deepest-top depth (minimum20); all30 single-PV
streams preserve their last provisional score/PV/depth;54 native final results
match exactly. Native baseline frames/summary also match the E278 record.

There are396 complete MultiPV emissions and528 single-PV emissions. Eighteen
MultiPV streams finish at deepest-top depth and six one depth behind. The
MultiPV message-index delay is1–2 messages, median/p95/max2; across all streams
the median is0 because single-PV emission is immediate. No depth regressions or
duplicate-signature suppression occur in this corpus. These source-event counts
and different emission opportunities are NOT recall, milliseconds, actual grades
restored or measured user-visible callback frequency.

## Why keep the stronger producer if Q ties?

P and Q produce exactly the SAME observed frames on these streams. No empirical
advantage over Q is claimed here. The frozen authored same-depth test distinguishes
them: after a complete group, a changed exact rank1 at the same depth makes Q
emit immediately using earlier secondary sources. P waits for fresh secondaries.
Existing C checks bounds/depth/identity, not this observed message provenance.
The test preserves Q's counterexample even though Q looks equally good in the
natural corpus. Prefer P's stronger causal contract without pretending the
two-case corpus observed that failure.

Other authored controls cover incomplete prefixes/ranks, upper/lower bounds,
depth mismatch, illegal/duplicate PVs, forced one-move clamping and terminal
boards, distinct promotion identities, mate0/malformed scores, bounded top
restart, mutation isolation, duplicate/regressing groups and final closure.
All12 pass, no changed recipe or relaxed gate after outcomes.

## Verification, cost and scope

[Independent prefix audit](evidence/verification.json) reconstructs both policies
from raw-message prefixes with a separate grammar/oracle, checking all924 frames
per arm, source indices, scores/PVs/ranks, eligibility/counts, stats, stream
completeness,30 single-PV latest results,54 native completed results and all gates.
The compressed report repeats byte-for-byte in a separate output directory;
wall-clock durations are kept ONLY in run receipts this time.

Four-stream hash-selected smoke239ms; full first assessment5.019seconds including
1.145seconds native parser replay; independent audit314ms. Zero new Stockfish
searches, downloads, fits or human labels. Source verification/diff checks pass.
Reuse the unchanged parent65 regression passes: relevant tests remain clean and
all archived source hashes still match, including dirty app/helper bytes. No full
application/coach regression, clean-checkout or actual installed-UI integration
is claimed. This is a research producer, not a changed UCI client.

Data is the same guarded54 complete streams (24 requested MultiPV,30 single-PV)
from exactly two user-supplied complaint positions/continuations. Four selected-
info-only inferred-history records remain excluded. The user's explicit case
diagnosis authorization and E278/E276 image/case/manifest/hash chain are retained;
no public-dataset registration or unrelated game ingestion. D001/D002 reuse
preflight passes; no archive target used. This exposed convenience corpus is
neither fresh confirmation nor ordinary live-search prevalence.

Original timestamps are absent. We do not know whether a 120ms throttle would
emit/suppress the same groups, actual rendering delay, CPU overhead in browser
workers, cross-platform behavior or resulting Brilliant precision. No after-
position scores or Brilliant labels are fabricated for alternative traffic moves.
Paired/completed evidence and numerical models remain unchanged. E277's original
failed controls and E278's later correction stay intact.

## Reflection and next action

[Manifest](evidence/manifest.json) binds seven payload artifacts, research code
and shared parent evidence. Retained evidence including manifest179,741bytes is
below the soft2MiB target; original raw streams are referenced, not duplicated.

Keep P together with selective C as a promising engineering candidate: the replay
restores usable source metadata while preserving completed results. Reject a
depth-only guarantee as insufficient under the authored same-depth counterexample,
but retain its observed tie. Do not call this a validated human-quality gain or
implement it automatically.

Next distinct question: does P work through actual progress callbacks and the
120ms throttle with acceptable measured latency and unchanged completed scores?
Preregister a SMALL bounded timestamped engine/integration pilot on the authorized
cases, both builds, with source-message/callback/grade timestamps, unchanged
budgets/options and meaningful positive/negative preservation controls. Estimate
cost before collection. This adds missing timing/consumer evidence; another
coefficient sweep or a large rating collection would not resolve this gap.
After that bounded check, consolidate the Brilliant shortlist for user review;
independent human precision/rarity and other numerical tracks remain open.

Replay using new output directories:

```text
node --test research/experiments/E279-coherent-multipv-emission/code/producer.test.mjs
node research/experiments/E279-coherent-multipv-emission/code/run.mjs evaluate research/runs/E279/another-repeat
node research/experiments/E279-coherent-multipv-emission/code/audit.mjs research/runs/E279/another-verification
```

The audit expects research/runs/E279/repeat/results.json.gz; rebuild that distinct
directory if absent. Never overwrite retained runs/evidence.
