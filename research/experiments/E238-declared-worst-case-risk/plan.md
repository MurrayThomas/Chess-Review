# E238 — declared worst-case risk and bounded risk management

2026-10-11 before implementation/evaluation, parent02e360f. E237 made indexed
progress. Current queue still lacks C0797/C0831. Current-main research-only local
commits/no push. BUILD-FIRST focused checks; no cumulative or historical suite.
E189 requires declared loss/utility and decision context plus a nonprobabilistic
contract or calibrated probability evidence. This study supplies the former,
not inferred human risk tolerance or estimated practical response probabilities.

Explicit contract: two distinct legal policies from the SAME actor/root/history,
one actual, one reference; each has one actual action and a fixed followup after
every legal enemy reply, using unchanged E235 policy admission and checker.
Require both admitted sources to have complete terminal win/draw/loss leaves.
Unresolved/illegal followup leaves make the whole comparison unavailable. A
supplied malformed source is rejected, not silently discarded. Source budgets
and full logical costs remain explicit, combined own budget abstains atomically.

Caller supplies root-FEN/actor-qualified coaching model: integer win>draw>loss
utilities, a target outcome win or draw, nonnegative allowed shortfall, model
kind worst-case-shortfall, and explicit declared-coaching-input provenance.
For each possible outcome loss=max(0,utility(target)-utility(outcome)). Risk is
the maximum of these losses, not an average or branch-frequency probability.
Output best/worst shortfall, every adverse outcome/defense, units and threshold.
Missing declaration abstains. Invalid order/coercion/frame/actor is rejected.

Claims C0797: complete comparison under this explicit declared decision contract.
C0831 additionally requires ACTUAL worst loss<=allowed AND reference worst loss
>allowed, with a strictly lower actual worst loss. Reversed policy order must
withhold management even though risk assessment remains available. Equality or
both-inside/both-outside the threshold does not establish management. This is
certified choice relative to the supplied reference, not global optimality.

Important source limit: E235 permits optional draw claims to add draw choices
without invalidating nonloss. A risk score cannot ignore those choices. At the
enemy-to-move after-actual frame, conservatively ADD a draw outcome for incomplete
earlier history (unrecorded repetition/termination) or an available known fifty/
threefold claim. Immediate mate ends first and has no intervening enemy claim.
Own optional claims may be declined for the supplied followup. Output marks
these extra draws as conservative history/claim allowance, not certified played
leaves. Conditional ongoing supplied history is explicit; no actual adjudication.
If this allowance worsens an all-win policy, retain it rather than overstate risk.

Authored hypothesis reuses E235's exact board Kf7 Qe5 vs Kh7: actual Qg7# terminal
win versus reference Qf5+ with every defense/fixed Qg6 producing mate or stalemate.
Explicit win/draw/loss utilities2/1/0, win goal, allowed0: actual risk0, reference1.
Reverse policies, allow1, draw goal, scale utilities/limit, unresolved followup,
missing model, strict/default-disabled, same-action/frame mismatch, exact/short/
zero caps, ordinary clones and source/ledger/model/label mutations. Both colors
and genuine prefixes with replay-derived reflected endpoints. No engine,
tablebase, new game or proof collection. E235 source generation is cheap legal
enumeration only. Record full results/source outputs, receipts and failures
before assertions. First runtime+checker<=1second; focused tests<=30seconds.
Independent own checker uses the frozen E235 checker, independently reconstructs
own risk arithmetic, frame/domain/claim allowances and gates without importing
the new runtime/derive. Source shared Chess/admission limits remain explicit.

Practical chances, calibrated probability, subjective tolerance/difficulty,
general strategic risk, authenticated declarations, complete earlier history,
human utility and complete original scopes remain unresolved. Combined semantic/
integration/history/claim/terminal/budget/priority audits and changed exact
reproductions are deferred. Do not advance accepted tracker or production.
