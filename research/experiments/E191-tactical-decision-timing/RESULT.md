# E191 — tactical decision timing

2026-10-11. Provisional BUILD-FIRST code after E190; plan committed as fbd0842
before decisive evaluation. Current main uses the user-authorized checkout
exception; research-only local commits, no push.

Three new candidate occurrences: C0810 when to attack, C0811 when to defend,
C0813 when to change structure. The checked-root comparison certifies a winning
checking capture against a losing quiet legal block; the selected winning policy
contains only checking actor moves and covers every enemy defense. The structure
comparison certifies forced new isolation plus target-capture mate against a quiet
alternative with a live nonisolating escape from that goal. These are bounded
scopes, not general timing or quality judgments. Original broad meanings remain
open; see [retained prerequisites](PREREQUISITES.md).

Five smoke representatives passed. All **24 focused checks passed in 7.824s**:
fourteen role cases in both colors, strict/missing/disabled inputs, independent
result/source mutations, policy/actor/checker/ray frames, full response inventories,
draw-rule suppression and exact/one-short/zero combined work caps. Twelve distinct
hash-matched E168/E169 panels were reused. One predeclared unmatched halfmove99
A0/D0 control was collected, **seven nodes**, and retained before assertions.
No other searches, historical suites or real games were collected or replayed.

Evidence: `evidence/focused-checks.json` retains actual command, output, runtime,
31 exact test-source bindings, D001 receipt, raw archive byte hashes and parent
row references; `evidence/claim-control.json.gz` retains the tiny raw panel,
collector closure and zero-match reuse audit. Source admission semantically
replays full query traces, including discarded exploration. The E191 checker
imports no E191 runtime/context/derivation/collector; its frozen admission and
Chess dependencies are shared and explicitly limited. Own work is charged
separately, and exhausted results discard own panel/witness/labels.

`npm run verify:source` and `git diff --check` passed. `build.json` records full
source bindings (1,029 verified) and deferred gates; own evidence is 25,794 bytes.
Machine status is 472 pending entries with candidate code, 111 ready batches,
zero stale batches, and 850/1,085 accepted-or-candidate entries (78.3%); 235
entries still lack code. Accepted E082 evidence is unchanged at 378/1,085 (34.8%). Full
integrated replay, cumulative validation and changed-source main/repeat/initially
clean reproductions remain deferred to the combined freeze. Focused development
checks do not establish final acceptance or human validity.

Next: audit remaining decision-making and strategic planning scopes against
available causal alternatives, using saved proof panels and cheap representative
checks; keep general uncertainty, practical difficulty and human judgment as
explicit prerequisites when bounded chess evidence cannot establish them.
