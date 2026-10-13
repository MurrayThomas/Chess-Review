# P008 — Complete, current scoring evidence

Date: 2026-10-13. Production correctness assessment authorized by the user's
request to research and implement verifiable calibration/category/accuracy
improvements. This is an input-contract repair, not a new fitted model study.
Work uses the current implementation checkout; no experimental model, numerical
study branch, fresh game acquisition or confirmation panel is introduced.

## Research review and adoption boundary

Reviewed the numerical index, B000, measurement/protocol/data policy and F006–F017
summaries. The earlier curve, alternative-choice and uncertainty candidates
do not support model adoption: their confirmation, stability or practical gates
failed. E005/E013 still require independent human reviews for category claims.
The existing coefficients, transforms and category thresholds remain the
comparators; the current implementation baseline is b70ea93.

Primary sources read on 2026-10-13:

| Source / reading scope | Relevance and decision |
| --- | --- |
| [Regan and Haworth (2011), model sections](https://cse.buffalo.edu/~regan/papers/pdf/ReHa11c.pdf); [Regan (April 2026), predictive-model slides](https://cse.buffalo.edu/faculty/regan/Talks/ChessResearchApr2026.pdf) | Available alternatives and decision sensitivity motivate opportunity-aware rating work. These methods do not validate our single-game coefficients. |
| [Barthelemy (2025), full text](https://arxiv.org/html/2505.03251v1) | Proposes principal-variation complexity from best/second-best gaps. Skill-dependent resolution is assumed, so the separated curves are not an independent validation of human difficulty. Do not promote an entropy multiplier for accuracy. |
| [Zhou et al. (2026), abstract](https://arxiv.org/abs/2606.26267v1) | Move information for faster rating updates is promising; bounded deviation from Elo does not validate a PGN-only performance estimate. Requires future/repeated-game evaluation. No adoption based on this abstract. |
| [Omori and Tadepalli (2024), v2 abstract](https://arxiv.org/abs/2409.11506v2) | Moves and clocks motivate richer rating inputs. Reported test error cannot transfer to our pool, feature set or player-disjoint evaluation. No model/data downloaded. |
| [Zaidi and Guerzhoy (2024), abstract](https://arxiv.org/abs/2406.11895) | Perceived brilliance is distinct from optimal play. Retain the blinded-review requirement; do not manufacture human labels. |
| [Stockfish FAQ, evaluation/annotations sections](https://official-stockfish.github.io/docs/stockfish-wiki/Stockfish-FAQ.html) | WDL derives from engine play; human outcomes depend on opponent/time control. Engine scores and educational labels are separate. Preserve engine-specific score paths. |
| [Lichess accuracy explanation](https://lichess.org/page/accuracy) | Accuracy depends on position/opportunity and aggregation. Its display recipe does not establish a universal human quality scale or validate our transform. |

These are source-review conclusions and hypotheses, not new population results.
No games from these papers are ingested. D001/D002 inspect preflight passed
(public-data-v1, 147 artifacts); public reproduction/regression reuses exposed
D001 observations solely to check unchanged numbers, with no fitting/selection
claim beyond the existing recipe. No locked targets are newly inspected.

## Concrete defects and gates frozen before candidate evaluation

1. `calibratedReview` computes accuracy over available valid observations even
   when `complete` is false. A missing/malformed/stale adverse decision can
   silently improve the displayed whole-game score. Require complete coverage
   for each player's accuracy while retaining valid individual move scores.
2. Rating observation admission checks candidate version but not the enclosing
   calibration version, known engine or SF19 node protocol. Require all three;
   keep valid SF18 fixed-node ratings available under custom display settings.
3. `scoringEvidenceComplete` accepts truthy malformed score objects and sparse
   arrays (Array.every skips holes). Require dense, current, recognized-engine
   evidence with finite CP or signed nonzero integer mate for both observations.
   Reject mixed engines and incorrect SF19 node budgets. Valid custom SF18
   annotations may still restore, even outside fitted display settings.

Acceptance: zero contract violations in the synthetic regression matrix for
both engines/colors; valid complete reviews retain their exact accuracy/rating;
all published player-side scoring and offline public replay remain exact.
Adversarial scores include missing/nonfinite CP and zero/noninteger mate;
metadata cases include stale/missing tags, wrong engines/budgets and sparse
caches. Pure checks need no statistical interval: they assert deterministic
input invariants, not population accuracy or Elo gains. No tuning or exclusions.

Implementation scope: `lib/calibrated-review.js`, focused regression tests and
current public-method documentation. No engine searches/coefficients/labels
change. No new schema or blanket cache invalidation: invalid cached observations
fail admission and are reanalyzed; complete valid caches remain compatible.
Coverage is per player. Display and WDL rating input validity remain separate.
No additional searches, network requests or dependencies; only linear admission
checks over existing observations. Rollback is the implementation commit revert.

Validation: first reproduce the defects against the frozen source, then run the
new regression matrix, existing scoring/annotation/cache checks, `npm test`,
`npm run verify:source`, `npm run lint`, offline reproduction and a browser check.
Retain compact command/results and exact source/fixture hashes here or in the
adjacent evidence record. A replay checks correctness, not fresh confirmation.

## Implementation and verification

Implemented locally. The plan/source-review commit is `d55a0be`; the record was
renumbered from P007 to P008 because a concurrent coach task allocated P007.
No prior evidence or numerical study was renumbered or rewritten.

The frozen-source comparison and hashes are retained in
[comparison.json](evidence/P008/comparison.json). From the repository root run
`node research/promotions/evidence/P008/compare.mjs --verify` to independently
import the original b70ea93 scorer, rebuild an authored legal sequence, and check
all retained outputs/current input hashes. Outputs go to ignored `scratch/`.
This needs Git with the baseline revision available and Node 24+, but no game
data, network, engine, fitting or random seed. Source/fixture hashes normalize
CRLF to LF. The regression matrix includes all malformed/stale cases rather
than selecting on the comparison's two illustrative numerical examples.

| Deterministic example | Old behavior | Repaired behavior |
| --- | --- | --- |
| SF19: omit the adverse decision | Accuracy rises from 16.431348 to 20.069904 | Whole-game accuracy unavailable; remaining individual scores retained |
| SF18: same omission | Accuracy rises from 1.008201 to 1.099807 | Whole-game accuracy unavailable |
| Stale calibration with matching rating-candidate version | Rating 920.159593 / 961.535969 for SF18 / SF19 | Rating unavailable |
| Cached mate-zero observation | Cache admitted | Cache refused |

Valid complete synthetic output is exactly unchanged for both engines. The
comparison is a deterministic correctness witness, not an estimate of defect
prevalence, rating MAE or human-quality improvement.

Checks on Node v24.14.1:

- Original scorer: all 11 new regression tests fail. Repaired scorer: all 11
  pass, including the stronger adverse-decision fixture.
- Focused scoring/annotation/cache/public regression: 40/40 pass. Corrected
  cache fixture plus new regression: 26/26 pass. Final broader numerical,
  category, engine, reliability and cache selection: 162/162 pass.
- Offline `node tools/calibration/reproduce-public.mjs`: passed; published
  models/scores and SF19 context remain exact. This is exposed public evidence,
  not fresh confirmation. No bundled coefficients changed.
- `npm run verify:source`: passed. `git diff --check` and scorer syntax pass.
- First `npm test`: 378/379 pass; the sole failure was a formerly accepted
  unidentified-engine cache fixture. Updated it to explicitly identify SF18.
  A second full run during concurrent coach edits reports 377/385, with eight
  failures in concept cost groups/Fast coaching; all scoring checks pass.
  A clean full-worktree acceptance is not claimed for those unrelated edits.
- Root `npm run lint`: five errors (three oversized retained research files,
  one deliberate malformed research sentinel and a transient concurrent
  `analysis.js` parse failure). Extension-runtime lint excluding `research/**`,
  `scratch/**`, `calibration-runs/**`: zero errors, four manifest warnings.
  The research directory is excluded from extension packages. No unrelated
  research evidence or UI source was altered to suppress lint.
- Attempted an isolated headless Chrome renderer check; DevTools
  `Runtime.evaluate`/`Runtime.enable` repeatedly timed out, including with
  baseline UI source. No browser success is claimed. DOM/cached-restore
  regressions pass; manual extension-browser verification remains a limitation.

Implementation commit is recorded in Git history. No push or release.

Next numerical research: preregister an opportunity-aware rating feasibility
study following F017, with target-free predictors, complete-alternative search
cost estimates, player-disjoint roles and fresh confirmation ownership. Test
improvement against refitted current recipe and training-only median, with band
bias and useful interval width/coverage. Gather independent E005/E013 reviews
before changing instructional labels. These remain future studies, not adoption
claims from this repair.
