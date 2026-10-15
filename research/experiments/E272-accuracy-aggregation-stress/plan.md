# E272: accuracy aggregation stress experiment

Registered 2026-10-15 before evaluation. Scope: synthetic mechanical properties,
with unchanged imported production aggregation formulas. No real games, fitted
calibration parameters, independent quality judgments or rating claims.

## Hypothesis and frozen candidates

Ordinary/harmonic averaging can hide a fixed severe error as easy decisions
accumulate. A simple opportunity-weighted score should resist uninformative
padding, but might overvalue narrow low-information positions or amplify noisy
weights. Test these tradeoffs before proposing real-game work.

Compare the current SF18 arithmetic and SF19 arithmetic/harmonic aggregators
with exactly two research-only candidates:

- OW: weighted arithmetic quality, weight = max(alternative expected points) -
  min(alternative expected points). Zero-range choices have zero weight. Return
  null if all weights are zero. This is a range heuristic, not human difficulty.
- Tail20: arithmetic mean of the worst ceil(20% * eligible decisions), at least
  one. No tunable grid. Eligible means nonforced, matching production filtering.

Authored qualities are inputs to aggregation; they are deliberately NOT generated
by a candidate's own curve or claimed to represent human assessments. Opportunities
are synthetic alternative vectors in expected-point units. No real games copied.

Primary mechanical panel (all cases retained, no optimization):

1. Padding: base ten decisions (one quality 20, nine quality 95), range .5 each;
   add 10/50/200 quality-100 decisions with range 0, then repeat with range .001.
   Practical desired shift <=1 quality point for every padding size.
2. Replication: duplicate an entire ten-decision game 2/5 times; desired shift
   <=1e-10 for each method. Tail ceiling can fail on other lengths; separately
   exhaust lengths 1..25 and replication factors 2/3/5, retain worst case.
3. Harmful-decision monotonicity: lower each quality by 10 (floor zero) in each
   position of the base game; no score may increase by >1e-10.
4. Range-error sensitivity: perturb each base weight by +/-.01, bounded [0,1];
   retain maximum absolute score shift, desired <=1 point. Adversarial control:
   put the quality-20 move at range .001 and other nine at .5. Report score and
   compare to baseline; do not turn a desired padding property into human validity.
5. Forced padding: add 200 ineligible quality-100 entries; exact invariance.
6. All-zero opportunity: candidates must disclose denominator/null behavior.

Outcome: mechanically improved only on individually passed, preregistered
properties. No overall improvement verdict without all gates and no clinical
interpretation of synthetic percentages. A candidate failing another property
is a tradeoff, not a replacement. No confidence intervals for deterministic
fixtures. More than one output/condition is a descriptive panel, not hypothesis
testing on independent sampled games.

Budget: <5 seconds per calculation, no searches/fits/downloads, <100 KiB retained
evidence. Before running, commit code and plan. Run focused independent formulas
and exhaustive property checks; repeat exact output in a distinct directory.
Retain code/import hashes, revision, command, Node/platform and output hashes.
Synthetic entry point records `datasets: []`, and reads no games or fitted
parameters. The guarded game loader requires nonempty dataset IDs and therefore
does not apply to this wholly authored, synthetic panel.
If no clean verification checkout is available, do not claim clean replay.

## Reflection point

At the end compare invariance with responsiveness and weight uncertainty.
Explicitly decide keep/reject/defer for each candidate. STOP this study after
reporting; no production adoption, new aggregators or parameter rescue in this
batch. A later real-game quality/usefulness study needs an external target and
fresh game-level evidence; likelihood improvements alone cannot validate it.
