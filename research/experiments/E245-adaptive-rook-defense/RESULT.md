# E245 — adaptive defense after the drawing rook check

2026-10-11. BUILD-FIRST prototype; extensions to existing C0666/C0897 only,
**zero new occurrence credit**. Preregistrationd193104, collector48dadcf,
observations/lock2b5e9b6, policy/test freeze7e709b4. Current-main user exception,
research-only local commits/no push. Accepted tracker and production unchanged;
numerical research remains paused.

## What the complete continuation shows

E244/E212's White Kf5/Pf6/Re2 versus Black Kh7/Ra8, actual ...Ra5+, has five
legal White replies. All five subsequent Black positions have source WDL0 and
positive exact-drawing continuations. The complete one-round adaptive defense
therefore qualifies. All selected nonlosing continuations actually have WDL0;
no blessed-loss/cursed-win category was silently recoded as an exact draw.

**H1 checking-only fails.** After Re2e5 interposes, the only legal Black check
is ...Ra5xe5+. It captures the original White rook and changes nominal material
to Black5versusWhite1, but its exact defender value is-2: it loses under the
source model. Original identities/material changes remain in the proof. Material
gain and giving check cannot substitute for the actual outcome.

Six quiet original-rook moves preserve the draw after Re5: ...Ra1, ...Ra2,
...Ra3, ...Ra4, ...Ra6, ...Ra8. There is no nonlosing checking continuation,
even when captures are allowed. Thus this reply requires switching away from
checking if the source-model draw is to be retained in this defense round.

The other four White replies have noncapturing drawing checks: Ke4 permits
...Ra4+, Ke6 permits...Ra6+, Kf4/Kg4 permit...Ra4+. Every other legal Black
move, including losing alternatives and nonchecking drawing king/rook moves,
remains visible; the policy does not claim those checks are uniquely best.

The opposite-color tree agrees. After Re7e4, Ra4xe4+ loses despite gaining the
rook. Ra1/Ra3/Ra5/Ra6/Ra7/Ra8 draw instead. The other four king replies allow
drawing checks. Both the noncapturing-only and relaxed capturing-check-only
hypotheses retain positive interposition refutations.

**H2 adaptive nonloss passes** for every legal enemy reply in both colors.
This is ONE completed defense round with exact source-model leaf values, not
an indefinite checking rule, closed-loop defense policy, complete causal theorem
about long-side geometry or general dynamic-equilibrium/imbalance finding.
The broad original C0666/C0897 meanings remain open.

## Source and callable proof

Reused two fixed admitted E212 root menus. Collected12missing COMPLETE native
V2 menus: after-check menu plus every one of its five reply menus, both colors.
194new position lookups,20.714567seconds total; first smoke2.248359seconds,
every panel<=3seconds. All input prefixes are genuine root/actual/reply histories.
Known scalar overlaps are intentionally reobserved by the unchanged full-menu
collector and checked for exact agreement; no scalar substitutes for a full menu.
There was no acquisition, engine/tactical search or historical/cumulative suite.

`inspectAdaptiveRookDefense` in code/policy.mjs is default-disabled, strict
fen/history/actual/private capability, maxRecords0..1536(default1536). Each color
charges115full represented records (18reused root plus97continuation records).
Short/zero caps expose no context/witness. All source minimax links, legal root/
check/reply/action/response inventories, original-unit identities, actual captures,
nominal material and all five native WDL categories stay visible. Caller proofs,
cloned capabilities and edited exposed views cannot authorize source values.

Source admission binds exact saved compressed bytes/lock, frozen collector
dependencies and current D001/T002 permission/origin/runtime/vendor/program
checks. Every new panel retains actual stdout/stderr/exit/signal/error. WDL50
values are zero-counter MODEL observations on genuine actual counter0/1/2/3
frames (captures reset their real counters); they are not arbitrary-clock,
repetition or DTZ adjudications. No prior full-game reachability claim.

Independent checker uses a separate FEN parser/history/identity/material/menu/
policy reconstruction, importing no new runtime or feature derivation. Shared
Chess and frozen source admission limit independence; no independent retrograde
table truth is established. Both saved full own results replayed before build
registration, with every original branch and negative checking option retained.

## Focused validation and resume state

Eight focused checks passed17.363723seconds (test17.240510seconds): both-color
adaptive/checking hypotheses, interposition/captured original rook/material
contrast, complete domains/source/frame/actual/history, strict/getter/disabled/
missing/capability/clone, exact/short/zero caps, omitted branches and altered
values/identities/material/selection/source/result/accounting. Saved policy pilot
including current guarded admission and independent replay7.003835seconds.
No execution failure or amended gate; H1's scientific negative is preserved.
Source verification and diff checks pass. Full historical tests were not run.

84recursive source bindings, current tablebase/probe/runtime receipts and data
hashes, exact source/archive/output hashes.18evidence files total280596bytes.
evidence/collection.json records all12immediately retained panel files/timings;
code/archive-lock.json binds their hashes. evidence/focused/pilot.json.gz holds
full derived trees; focused-checks.json keeps raw subprocess output;
provenance.json binds originals, current sources and saved semantic replay.
Focused command:
`node --test research/experiments/E245-adaptive-rook-defense/code/policy.test.mjs`.
Collection/replay runners already ran and refuse output overwrites.

No new covered IDs or acceptance. Broader strategic meanings, indefinite/adaptive
policy beyond this round, causal mechanism isolation, complete earlier history,
arbitrary-clock/repetition/DTZ, independent table truth, real-game precision and
human teaching usefulness remain unresolved. Combined original occurrence/
absence/history/claim/terminal/priority/budget/integration and changed main/repeat/
clean reproductions remain deferred. Full catalog goal is unfinished.

Machine status:378/1085accepted unchanged;530pending entries with candidate code,
152ready batches,0stale. Accepted-or-candidate908/1085(83.7%) is availability
only;177entries remain without ready detector code. E245 adds stronger evidence
to existing scopes without increasing the unique-coverage count.

Next return to filtered remaining strategic claims, prioritizing the E186
closed/fixed-pawn minor-piece comparisons and their retained causal-role failures.
A legal conditional type contrast is insufficient: any new C0712/C0714/C1070
study must isolate the actual pawn obstruction/route role rather than introducing
an unrelated protecting pawn. Do not recast this rook tree as new general
initiative/activity/complexity/equilibrium coverage.
