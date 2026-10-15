# E272: accuracy aggregation stress — result and reflection

2026-10-15. State: **complete synthetic mechanical experiment**. Outcome:
**opportunity weighting improves the registered padding property; overall
real-game improvement remains inconclusive**. No production promotion.
Plan commit `7bfe3da`; calculation freeze `60017b3` precedes the saved main run.

| Aggregator | Base | With 200 zero-range perfect decisions | Shift | Replication census |
| --- | ---: | ---: | ---: | --- |
| Current SF18 arithmetic | 87.5000 | 99.4048 | +11.9048 | Pass |
| Current SF19 combined | 78.2955 | 98.6594 | +20.3640 | Pass |
| Opportunity weighted (candidate) | 87.5000 | 87.5000 | 0 | Pass |
| Worst 20% (candidate) | 57.5000 | 97.0238 | +39.5238 | Fail |

Opportunity weighting passes all six registered mechanical gates. Padding with
200 small but nonzero range-.001 decisions raises it by .4808 points, below the
one-point threshold. Perturbing each ordinary base weight by .01 causes at most
.1353 points of change. It returns null when every range is zero. All methods
pass harmful-decision monotonicity and forced-decision padding checks. These
are deterministic fixtures, so sampling uncertainty intervals are inapplicable.

Tail20 fails padding resistance and replication invariance: the fixed length
1..25, factors 2/3/5 census finds a 3.6364-point shift at length 11, factor 5.
The subset ceiling changes the fraction represented. Keeping only a fixed worst
fraction also eventually admits the padding when the game grows.

The deliberately independently authored quality/range adversarial control gives
OW 94.9833 versus arithmetic 87.5. This is a warning about the input contract,
not a demonstrated real-game failure: a quality derived from the same expected-
point loss curve imposes consistency constraints on loss and available range.
We have not shown this control could arise in a coherent game under that curve.
Range measures consequences available, not the human difficulty of finding a
move. Weight error near zero, mismatched WDL/CP scales, and human interpretation
remain unresolved beyond the small fixed perturbation panel.

## Verification and retained evidence

All 11 focused tests across E271/E272 pass (seven here), including independent
arithmetic/harmonic/weighted equations and 256 finite candidate input pairs.
Initial pre-freeze control expected duplication of [0,100] to change Tail20;
that expectation was wrong (enough zeros remain). Corrected to [0,100,100,100,
100,100] duplicated: 50 becomes 100/3. No candidate formula or registered gate
changed. The development panel was exercised by deterministic tests before code
freeze; it is wholly synthetic, without an unseen-sample claim.

Main/repeat result bytes match. An initially empty portable source export with
the exact two scoring modules reproduces the complete result without games,
Git, npm dependencies, engines or fitted models. This verifies computation; it
is not untouched scientific confirmation or a clean repository checkout.
`npm run verify:source` and research diff checks pass. Actual calculation takes
milliseconds; no network, fits or searches. Small retained JSON evidence includes
main/repeat run identities and portable source hashes.

- [Full deterministic panel](evidence/results.json)
- [Main run and exact source hashes](evidence/run.json)
- [Repeat run](evidence/repeat-run.json)
- [Portable replay verification](evidence/portable-verification.json)

Reproduce from repo root:
`node research/experiments/E272-accuracy-aggregation-stress/code/run.mjs --out research/runs/E272/new-run`
and compare the output hash with the saved run. For portable replay, first create
the expected `main/` output, then run `code/portable.mjs --out research/runs/E272/new-portable`.
Outputs refuse overwrite. Exact working-source byte hashes matter, including
line endings of the imported production file.

## Reflection checkpoint

- **Reject Tail20** for the proposed padding/invariance purpose; no parameter rescue.
- **Keep OW as a mechanical candidate; defer adoption and human validity.** Next
  first establish coherent opportunity/quality inputs and sensitivity across
  actual engine budgets, then compare to an external usefulness/quality target.
- **Keep a separate severe-error summary as an untested alternative.** It avoids
  assuming a single percentage must simultaneously measure mean play, severity
  and difficulty. This study does not test that alternative.

Stop this study. Do not change the public percentage or claim better accuracy
from these fixtures. Review the rating-feasibility cost before selecting the
next numerical study; uncertainty-aware categories are a distinct cheap option.
