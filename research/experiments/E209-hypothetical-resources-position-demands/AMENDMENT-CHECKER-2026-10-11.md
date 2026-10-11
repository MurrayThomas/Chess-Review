# Independent exhaustion verifier hardening

The six baseline-repair checks passed1.784seconds; preserve their exact source in
baseline-repair-sources.json.gz. Final audit finds an independent-checker corner
case: a forged E209 exhausted result with a nonnull, itself exhausted E208 parent
could pass the normal supplied-source branch. Runtime already atomically drops
that source. Original preregistered atomicity gate requires rejecting this result.

Before final readiness, reject an exhausted parent retained in any supplied-source
branch. No runtime/control/model/goal/graph/budget semantics change. Add ONE
adversarial test that first admits valid full and exhausted runtime outputs, then
attaches a correctly shaped exhausted parent and requires rejection. Run only this
new check; retain prior thirty unchanged and six repaired passes with their exact
source hashes. No model recollection or full-file/cumulative repetition. This
repairs verification of the existing atomicity gate, not a new research label gate.
