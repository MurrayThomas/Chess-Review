# E277: Brilliant evidence admission — working record

2026-10-16. **Complete diagnostic study; joint candidate screen FAILED.**
Previous turn E276 was progress: saved dual-engine case results and both regression
guards. Current five-hour allowance59% remaining at resume, no conservation mode.

Source inspection identifies a specific hypothesis: unpaired candidate score
selection can use a secondary line while Brilliant inspects different lines.
Existing primary exact UCI admission and cache restoration already enforce some
guards; distinguish those protected routes from default live variations.

Authored synthetic boards/scores/transcripts only. D001/D002 inspect preflight
passes, no dataset loaded. No screenshot reuse, searches, downloads or production
changes. Same current-main exception, unrelated dirty app work/video preserved.
Plan/code f385e71 and input/source commit230cb0b precede first assessment.
Four-row pilot308ms passes. First252-row screen FAILS: all132 invalid-used-source
Brilliant awards disappear under C, but eight declared positives fail under BOTH
B and C. They are overlay valid-no-candidate/valid-no-lines controls: the fixture
retains completed losing after-position evals and supplies no child preview, so
fallback correctly remains losing. They were not valid positive controls in that
path. Preserve the failed gate and original frozen source/results; no retuning.
The reported candidatePositiveLost8 includes these shared failures, not eight
baseline Brilliant labels suppressed by C. Independent replay verifies this distinction.

Actual default UCI parser witnesses reproduce bounded/stale secondary lines and
false Brilliant in live variation replay; exact admission filters them. Candidate
blocks those witnesses. All40 existing cache guards pass. No root/scores/accuracy/
rating mutation by C. No production promotion or retrospective gate change.

## Mechanism and scope

annotationPair selects the unpaired played move's score by a root PV's first
move, without checking that selected line's bound/depth/rank/root identity.
brilliantEligible inspects the root TOP line and next-position TOP line instead.
Below the already-winning threshold, an uncertified SECONDARY source can therefore
supply the apparently sound score for Brilliant.

The actual engine/uci.js parser receives an authored depth15 rank2 upper-bound
line followed by an exact depth16 rank1 and final bestmove. Default live admission
retains the secondary line. Its progress and final objects feed actual
classifyVariationMoves and can produce Brilliant on the contract probe. C
withholds it. requireExact filters the line and the baseline then rejects
Brilliant. Both phases/colors/build contexts agree:8 default versus8 exact frames.
The fixed matrix separates bounds, depth and identity rather than attributing
the combined witness to one field alone.

This is current producer/consumer CONTRACT reachability with synthetic UCI traffic.
No Stockfish process emitted that transcript during this study. It does not show
natural frequency, real-game false-positive rate, independent human brilliance,
or the cause of the original screenshots. Raw unpaired states and paired-control
overlays are admission probes, not all normal producer outputs. Build axes select
app/protocol contexts, not independently generated engine scores.

## Fixed comparison and failed controls

| Frozen group | Rows | Baseline B | Selective C | Blanket U |
| --- | ---: | --- | --- | --- |
| Explicitly invalid USED sources |132| Brilliant132 | Abstains132 | Abstains132 |
| Declared positives |84| Brilliant76; Blunder8 | Brilliant76; Blunder8 | Brilliant24;60 declared positives lost |
| Existing negatives |36| Non-Brilliant36 | Categories AND grades unchanged36 | No special-label benefit claimed |

C wraps annotationPair in the research DOM only. It abstains for an actually used
unpaired candidate with invalid bound/depth/rank or move identity; it preserves
paired evidence, unrelated unused bounds and independent after-position fallback.
Numerical coefficients are unchanged. U withholds every unpaired annotation:
52 of76 observed baseline-positive controls disappear. C loses zero of those76.
These are descriptive counts on authored controls, NOT replacement gates.

The registered gate still requires84 positive awards. Eight overlay rows (no
candidate/no lines x both colors/builds) violate that premise: completed losing
after-position evals remain, and no child preview supplies the intended positive
fallback. Both arms correctly remain Blunder. [Count disaggregation](evidence/count-interpretation.json)
preserves candidatePositiveLost8 and the failed gate while explaining that shared
failure. Do not change C to turn this fixture green. A separate prospective
repair should make completed child evidence coherent and explicitly provide the
exact child preview for those intended positive fallback controls.

All40 cache probes behave as registered. Complete current pairs restore; stale
versions, unknown builds, absent/invalid pairs, mixed builds and wrong SF19 node
protocols do not. SF18's depth protocol legitimately ignores an extra nodes field.
This does not validate arbitrary forged pair provenance or every stale-cache fault.

## Verification and cost

Pilot4 takes308ms; full first assessment including routes/cache13.428seconds.
Zero searches, downloads, fits or real-game dataset use. Fixed runtime calibration
bytes instantiate existing scoring contracts on synthetic scores only.

Distinct output directories repeat the compressed report byte-for-byte.
[Independent audit](evidence/verification.json) checks252 keys/counts,84 retained
raw-source metadata states,16 parser frames,40 cache outcomes and all source/input
hashes. Variations preserve mainline labels/grades/numerics; overlay filtering
preserves completed bests/evals/numerics. Audit passed=true verifies arithmetic;
scientificJointScreen=false preserves the failed candidate screen. Its count of
208 baseline Brilliant includes132 invalid-source awards plus76 declared-positive
awards;132 disappear under C. Do not misread that as132 valid controls lost.

Sixty-five existing Brilliant/paired/variation/engine/data-policy checks, source
verification and diff checks pass. No full coach/application regression claimed.
Exact source fingerprints, authored inputs/rows, UCI commands/traffic and relevant
AST declarations remain. App/helper hashes include pre-existing dirty work,
excluded from commits; no clean-checkout/full-environment reproduction. AST
snapshots prepare later pure replay rather than proving a portable whole app.
There is no IID interval, fitted model, new tactical truth or human-validity claim.
[Manifest](evidence/manifest.json) binds eight payload artifacts and the research
code. Retained evidence including manifest34,740bytes is below the soft2MiB target.

## Reflection and next action

Keep selective USED-source admission as a concrete candidate; reject blanket
suppression as costly to supported controls. Preserve the failed screen and defer
implementation. Current paired/cache protections remain useful. Source admission
work is a better immediate question than tuning brilliance thresholds here.

Next preregister a fixture-only correction with coherent completed/child-preview
evidence, unchanged candidate bytes/gates and this failure retained. Also census
compatible saved MultiPV traffic for natural bound/iteration states under its own
authorized hash-bound loader before fresh searches. Do not turn synthetic
reachability into observed prevalence. Brilliant remains priority; draw-allocation
and bulk rating collection stay deferred. No production change or push.

Replay commands, with new output directories:

```text
node research/experiments/E277-brilliant-evidence-admission/code/run.mjs evaluate research/runs/E277/another-repeat
node research/experiments/E277-brilliant-evidence-admission/code/audit.mjs research/runs/E277/another-verification
```

The audit reads research/runs/E277/repeat/results.json.gz. Rebuild that distinct
repeat directory from hash-matched source first if absent; never overwrite an
existing run or frozen evidence.
