# E235: explicit two-result goal with a complete finite nonloss policy

Registered2026-10-11 after E2341824d83 (indexed progress). Current-main research
exception/local commits/no push. BUILD-FIRST, D001 test preflight54artifacts/
unchanged registry. C0826 E192 prerequisite requires explicit goal plus validated
win/draw nonloss policy, not one winning move or failed enemy mate. Prospective
deviation from earlier E147/E179/E188 unresolved positional-quality prerequisites:
service this genuine complete branching-policy family, not more terminal captures.

No own result inspected. Authored White Kf7 Qe5 versus Kh7, White to move:
Qf5+ should allow exactly ...Kh8 or ...Kh6. Fixed Qg6 should stalemate Kh8 and
mate Kh6, supported by Kf7. Both reflected colors. Every actual defender move
must be enumerated and replayed; no assumed defense, source search or old changed-
board observation reused. Stop this authored family if no positive; preserve
failure/no readiness rather than search for passing fixtures.

Default-disabled inspectTwoResultPolicy(input,options), strict ordinary input
{id,source,fen,history?,move,followup,goal?}; bounded text/UCI fields. Goal exact
{frame:before-actual,fen:canonical-full-root,actor:w|b,outcomes:[win,draw],
source:declared-coaching-input}. No goal/history means unavailable. Goal is input,
not observed mental intent. Options enabled,maxWork0..20000 default20000,
maxReplies0..256 default256. Reuse E210 genuine supplied history/full canonical
endpoint/known current actor claim/automatic terminal handling. Earlier history
completeness explicit; no actual-game adjudication claim. Disabled schema-only.

Actual legal move followed by EVERY legal enemy reply and the fixed legal actor
followup. Every resulting leaf must positively certify actor mate or board/known
automatic draw; an earlier enemy mate is a losing refutation, a live leaf or
illegal followup is unresolved, never a draw. Early automatic/board draws stop
the branch, never continue. Known legal draw claims, including prospective claims,
can only add draw choices and cannot turn this policy into a loss; no certification
of arbitrary missing claim eligibility. Report this monotonicity/limit explicitly,
not an assertion that no earlier/current claim exists. Current root actor-claim
prerequisite conservative abstention unchanged. Require BOTH a positive win leaf
and a positive draw leaf in the ordinary-move policy for C0826; all-win or all-draw
policies alone receive no candidate label. Complete nonloss is conditional on
following supplied policy in the live supplied segment, not best/necessary play.

Context includes complete actual defender domain, all replayed frames/followup
legality/terminal bases/responses and goal proof counts. Own checker imports no
own inspector/classifier/features; independently reconstructs history/known
occurrences, complete defense inventory, legal fixed followup and terminal facts.
Shared Chess/schema/legal-position validation limit independence. No new engine.
Conservative logical work133+history plies+130*defender count: two64-square root/
actual allocations, five setup/move/guard units; each defense/followup two64-square
allocations and two moves. Reserve full branch work and maxReplies atomically,
hide all context/witness on exhaustion; not engine nodes/time. Minimum reserve
checked before board replay; full defender reservation before branch replay.

Freeze before decisive evaluation. Representative+checker<=1second. Tiny both-
color positives; weakened king support/additional defense/unresolved followup,
one immediate mate/all-win alone, direct stalemate/all-draw alone, missing/foreign
goal, genuine4ply prefix, known repetition/fifty/automatic75/missing history,
strict/default-disabled/illegal frames/endpoints, exact/short/zero work/reply caps,
clones and valid-baseline defense omission/leaf/basis/goal/mental/work forgeries.
Retain outputs/receipts/revisions/source/evidence hashes before assertions.
Source verification/diff, build only on genuine two-result positive/separating
checks, RESULT/INDEX/local commit. No historical suite/search or production work.

Open: richer adaptive/longer nonterminal policies, useful/optimal drawing margins
and practical strategy, full original two-result teaching scope, arbitrary complete
earlier history and claim/terminal/priority matrices, independent chess truth,
eligible real-game precision/human usefulness, combined semantic/integration and
changed exact reproductions, separate promotion. Numerical research stays paused.
