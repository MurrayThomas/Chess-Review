# E254 — one joint bishop/king policy neutralizes both flank pawns

2026-10-11. New bounded C0698 candidate, not accepted evidence or general endgame
theory. Authorized current main/research-only/local commits/no push, BUILD-FIRST.
Accepted tracker, production and paused numerical research unchanged.

## Actual joint terminal objective

E186/E253 require one shared defensive policy for BOTH original enemy pawns.
E109's own-pawn conversion goal does not match; E106's conversion query/checker
were inspected but its search results were not reused as draw evidence. The new
query targets actual insufficient-material draw after both original enemy pawn
identities, including promoted descendants, are captured and the original actor
bishop survives. Every positive enemy branch must meet that SAME joint goal.

Authored White roots have Bd6 versus Black Kd8/Pa3/Pg3, with White king either
f3 or b3. Actual Bxa3 with Kf3, or Bxg3 with Kb3, captures the far-wing pawn.
Every legal Black reply then permits the same original king to capture the
remaining pawn, whether it stayed on its original square or pushed one square.
The reached KBvK is an actual dead-material draw under the shared Chess model.
The color/rank reflections independently pass with Black Kf6/Kb6 and Bd3.

| Cases | Joint three-total-ply goal | Interpretation |
| --- | --- | --- |
| Two king-flank roles, both colors | 4 positive certificates | Each has5complete enemy branches and12retained proof nodes |
| Same roots, quiet Bc5/Bc4 instead | 4 bounded failures | No joint neutralization within the SAME horizon |
| Same actual, actor king relocated to h8/h1 | 4 bounded failures | Bishop action alone does not accomplish the joint terminal goal |
| Both-color advanced-pawn promotion controls | 2 bounded failures | All q/r/b/n promotions retained in enemy legal inventories |

Twenty positive policy leaves reach the actual terminal objective, with BOTH
tracked pawn squares null and the original bishop retained. The king and bishop
divide the workload; no claim says the bishop personally captures both pawns.
Matched controls establish bounded functional roles, not theoretical losses,
optimal defense or universal bishop superiority. Negative leaves are explicitly
bounded-unresolved, including any claim/terminal/frontier case without the goal.

## Collection and callable proof admission

Plan8b84b25; query/checker/collector freeze c813009; immutable observations and
own API/test freeze e457c0f. Fourteen queries complete once,234retained nodes,
2.150seconds INCLUDING independent proof replay. First smoke0.084seconds/12nodes;
slowest query0.145seconds/22nodes. All pass prospective3second/512node individual
and12second/7168node total caps. No retries/horizon increases/alternative roots
after inspection. Compressed complete archive8306bytes; final partial checkpoint
also retained. No engine searches, tablebase probes, game content or acquisition.

Deterministic fixed actual, actor OR choices and enemy AND domain; capture-first
actor ordering and lexical enemy ordering. All attempted prefixes are retained,
including failures before a choice, so independent replay checks exact visited
node accounting rather than accepting an asserted cost. Full FEN/counters and
tracked original identities follow genuine moves; reflection counters are
derived by execution. Current/intended claim-sensitive query states withhold
the goal; missing full earlier-game reachability is explicit.

`inspectJointBishopDefense` is default-disabled, strict ordinary input/options,
private fixed-archive/current-source admission and exact/short/zero logical
budgets. It returns complete admitted tree, terminal/frontier leaves, original
pawn/bishop IDs, source/model scope and actual accounting. Short budgets expose
no own views. No caller proof, cloned token or edited returned tree authorizes
observations. Negative admission never means a verified draw or loss.

The independent proof checker imports no own search/goal/tracker helper. It
reconstructs original units, legal domains, movement/promotion/capture history,
claim/terminal checks, AND/OR validity and exact cost. Independent result checker
replays those proofs and separately reconstructs output fields/leaves. Shared
Chess/history semantics limit independence; no independent chess truth is proved.

## Focused checks and retained state

Fourteen own saved result/proof reconstructions pass3.175seconds. Eight focused
checks pass6.521seconds: four joint positives/all ten controls, q/r/b/n inventories,
strict/history/schema/identity/private capabilities, disabled/missing/zero/short/
exact budgets, missing enemy branches/false goals/tracker/work mutations, result
claim/leaf/source/frame/accounting forgeries and owned copies. All14 saved results
independently replay again before build retention. Zero fresh focused queries.
Source verification and final diff checks pass; no cumulative/historical suite.

`build.json` and `evidence/focused/provenance.json` bind24source dependencies,
guarded D001 receipt, exact revisions, collection/output hashes and actual
environment/start records. New evidence before provenance66686bytes. D001
preflight passes54artifacts; all positions authored synthetic development,
not independent real-game/human confirmation.

Machine status:534additional candidate entries,912/1085accepted-or-candidate
(84.1%),157batches, zero stale,173without ready code. Accepted remains378/1085
(34.8%),328concepts/63completed studies. Full C0698 theoretical/advanced-pawn/
other-material/horizon defense, complete earlier history/adjudication, independent
truth and human usefulness remain open. Combined original-occurrence/priority/
history/terminal/budget integration, cumulative and changed main/repeat/clean
reproductions remain deferred. Full catalog goal stays active.

Next audit C0712/C0714 against retained E246/E247 failed obstruction mechanisms;
do not repeat those rejected explanations. A compatible C0713 both-wing bishop
preference study could use this genuine joint objective with material-matched
bishop/knight types and a same-material same-wing relocation control. Preregister
any prerequisite-driven scheduling deviation and full-root actor policies before
probing; favorable bishop geometry alone or incidental flank pawns cannot earn
the label. E253's eight descriptor prerequisites remain pending, not skipped.
