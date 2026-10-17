# Research maintenance review

Reviewed 2026-10-18. This is a repository housekeeping review, not a research
experiment or a new acceptance tracker. No engine searches, new game acquisition,
evidence regeneration or scientific acceptance were part of this cleanup.

## Completed cleanup

- Extension lint shares the packaging allowlist. Research demos, historical
  negative fixtures, Python tooling and marketing captures no longer masquerade
  as extension files. Every shipped JSON file is parsed directly, including the
  25,000-puzzle library beyond web-ext's 5 MiB parser limit. Oversized scripts
  still go through web-ext and retain its size error.
- The research overview now links to current routing instead of repeating old
  experiment summaries and obsolete next actions. The index includes previously
  unlinked P003–P006 and FRIEND-01–03 records, preserves their evidence status,
  and corrects the stale ID-allocation instructions.
- Numerical follow-ups have their own index section. Coach status and test
  selection exclude that section instead of assuming every later E-number is a
  coach study. Missing evidence for an actual completed coach study still fails.

## Retain these apparent duplicates

| Material | Disposition and reason |
| --- | --- |
| Per-study concept trackers, inherited results and source manifests | Retain. They bind different frozen revisions, cumulative fingerprints and reproduction records. Same content alone does not establish interchangeable provenance. |
| Initial, failed and corrected evidence | Retain. In particular E270's generated `guard-8120` JSON contains the intentional text `fresh`, produced by its output-isolation test. Repairing it as JSON would corrupt the saved test evidence. |
| Shared KQvK tablebase file in T001 and T002 | Retain both registered paths and hashes. Consolidation requires a prospective dataset/loader migration with independent replay. |
| FRIEND-01–03 contributor records | Retain their original IDs and boundaries. E082 already covers the narrow four-versus-three scope; extra records confer no extra accepted credit. |
| E074 catalog, order and duplicate mapping | Retain as the approved historical vocabulary snapshot. Current scheduling filters this snapshot against canonical acceptance; refreshing it would erase its provenance. |
| Mixed line endings in frozen research inputs | Preserve. Some fingerprints normalize line endings and others bind exact historical bytes; a bulk formatter would invalidate evidence. |

No unused maintained implementation was established by this audit. Redundant
overview prose was removed; archived files were not deleted on appearance alone.

## Decisions still open

| Question | Recommended next action |
| --- | --- |
| Two remaining extension lint warnings | The shared development manifest intentionally contains Chrome's service worker and Firefox's background scripts; packaging selects the appropriate browser fields. The other warning is the existing generic `el()` HTML-assignment branch in `analysis.js`; review its call sites before a separate DOM-construction hardening change. Neither warning is suppressed by this cleanup. |
| Stale provisional build records | Before cleanup, 141 differed only on `package.json`; no detector-source mismatch was found. This cleanup also changes `research/workflow.mjs`, an admitted dependency of 11 batches, including two previously ready batches: 143 now require requalification. Preserve the original hashes and requalify at the E270 combined boundary if research resumes. A housekeeping rehash would falsely imply fresh validation; current CLI counts can therefore be lower than historical result counts. |
| Incomplete coach semantic acceptance | Continue from E270's recorded E061 boundary only when coach research is requested. Preserve the E066/E067 boundary questions, E073 Hedgehog discrepancy, combined API integration and changed-source reproductions. The full regression alone does not close them. |
| Human validity and category reviews | Keep E005/E013 blinded packs pending. Choose a rubric and independent reviewers before claiming explanation usefulness, category validity or improved player ratings. |
| Bulk rating evidence and timing pilot | Numerical research stays paused. E274's roughly 32-hour collection reference and E280's unexecuted timing run do not justify starting either automatically; choose a bounded question and resource budget first. P009 implementation is separate. |
| Physical evidence deduplication | Defer until measured savings justify a hash-preserving migration. Preserve failure records, dataset permissions and independent reproduction; do not replace registered paths with ad hoc links. |

See [current research routing](../research/INDEX.md),
[the accepted coach tracker](../research/experiments/E082-rook-ending-facts/evidence/concept-status.md),
and [the combined-validation boundary](../research/experiments/E270-combined-validation/RESULT.md).

## Validation

- Extension lint: zero errors, two retained warnings; 25 shipped JSON files parsed.
- Focused lint/font checks: 15 passed; source-maintenance/lint checks: 9 passed;
  research workflow/build metadata checks: 7 passed. These groups overlap.
- Maintained-source verification and diff checks passed. Syntax parsing covered
  2,937 project JavaScript files outside frozen evidence, vendor and engine code;
  1,040 maintained Markdown files had no broken local file links. Every retained
  experiment result, finding and promotion now has an index link.
- Packaging file, directory and piece-set allowlists match the pre-cleanup lists.
  Coach selection remains 259 test files and excludes E271–E280; no cumulative
  scientific acceptance rerun was needed for this metadata/tooling cleanup.
- Current status reports E082 with 378 accepted occurrences, 24 pending entries
  with hash-matched provisional scopes, 19 ready batches and 143 stale batches.
  No historical source hashes or accepted counts were rewritten.
- Full application tests: 496/497 passed. The remaining assertion in
  `tests/learning-ui.test.mjs` expects the previous presentation list while
  concurrently edited learning code adds `New way`. Those unrelated working
  changes are preserved outside the cleanup commits.
