# Focused mutation-test repair and justified rerun

2026-10-11. Initial focused run: 26/27 passed; all15 chess role cases and full
promotion-policy checks passed. The own-result mutation group failed because
`first.captures[0].positive=false` changed nothing: canonical first capture is
the losing Nxd2, already false; profitable Qxd2 is the other recorded capture.
This was a no-op test mutation, not a rejected chess hypothesis or detector bug.

Preserve actual failed output/source hashes in
`evidence/initial-focused-failure.json`, and complete original test source/hash
in `evidence/initial-test-source.json.gz`. No detector/checker/collector/fixture/
claim/budget/outcome changed. Replace the no-op with selecting the genuinely
positive capture before falsifying its flag. Add explicit deep-inequality from
the admitted baseline before each own-result mutation check, so no unchanged
value can masquerade as a mutation.

One rerun of this small focused file is justified by its failed test and changed
test source; initial26 successes are not relabeled a passing original run. No
cumulative suite, historical regeneration, fresh searches or additional chess
fixtures. All original and combined validation gates remain unchanged.
