# E247 — pawn ownership and king-entry obstruction with a blocked bishop ray

2026-10-11. Preregistered after indexed E246722c8f0, before evaluating these
new authored roots. BUILD-FIRST, current-main user exception, research-only
local commits, no push. Numerical research stays paused. This is a causal
prerequisite study, not permission to narrow C0712/C0714 or count neutral code.

## Exposure and hypotheses

E246's exposed closed f7 goal has a blocked d6-e7-f8 bishop ray but both pieces
convert. Pf7 forbids ...Kd8e8. Relocating enemy Pe7 opens ...Kd8e7 against the
knight; removing only own Pe6 changes fixedness but preserves both conversions.
Those old observations are development evidence only, not new confirmation.

New root: White Kh4/Nc8/Pf7/Pd3/Ph6 versus Black Kd7/Bh3/Pd4/Pe7,
actual Nc8d6. Move the old king to d7 and the own e6 partner to h6 so an own
e7 pawn would not illegally check that king. Original d3/d4 lock stays; this
is NOT E186's fully closed taxonomy. Preserve all material in the paired root
by swapping pawn ownership on e7 and h6: White Pe7, Black Ph6, other units
unchanged. The d6-e7-f8 ray stays blocked by a pawn in BOTH frames. Actual Nd6
and artificial same-square Bd6 replacement are compared in each root.

H1: enemy-owned e7 occupancy prevents ...Kd7e7 and BOTH minor types achieve
the unchanged H2 tracked-f7 surviving-profitable-queen-or-mate objective against
every legal enemy reply. When e7 is actor-owned, ...Kd7xe7 is legal against
Nd6 and positively refutes conversion through f7f8q ...Ke7xf8. Bd6 protects
that occupied square, forbids the SAME capture and still converts against ALL
legal replies. The pawn counts, nominal material per color, pawn square set,
goal pawn, move and bishop-ray obstruction are identical across the pair.
All these gates must hold, not merely a changed win bit or a blocked ray.

H2 goal-specificity control: replace only Pf7 with Pb7 in BOTH ownership roots.
Do not preregister a preferred piece outcome here; retain all four outcomes and
all defenses. The specific ...Kxe7/b8 promotion/capture refutation must be absent
because Ke7 cannot immediately capture Qb8. No universal piece preference may
be inferred even if a different bounded refutation exists. Reflect all inputs
by rank/color with genuine counters; no treating reflections as independent
population samples. Expected8root/type comparisons per color,16raw queries.

## Implementation, cost and gates

Commit plan before decisive evaluation, then freeze collector. Guard every
entry point with D001 eligibility. No external games, engines, acquisition or
numerical fitting. Source collector uses unchanged E184 tracedConversionQuery
and unchanged E186 verifyPolicy, baseline original root before the actual move,
H2 only, atomic50000tick cap per two-type group. Retain full policies/attempted
prefixes/counters/identity/material and independently verified cost/claims.
Cheap first group including both policies <=1second; all groups <=3seconds;
whole focused subprocess <=30seconds. Preserve failures, no silent retries.

Callable default-disabled audit admits only the registered structural interface:
strict ordinary input plus genuine history, actor-owned tracked pawn, actual
quiet knight move, exactly named material-matched pawn-ownership counterpart
and optional saved policies. Construct both roots and same-square equal-value
bishop frames explicitly as hypothetical; no caller-labelled causal conclusion.
Replay all4policies with exact baseline/H2/frame/actor/goal and full charged cost.
Reconstruct pawn owners, protected king-entry legality and exact follow-up
promotion/capture. Report H1 established only when ALL registered gates hold.
Always leave C0712/C0714/C1070 readiness false; no build.json for this support
audit. Broader strategy, two-army benefit and fixedness remain unresolved.

An independent own result checker imports no own assay/features; share only
ordinary validation, Chess/legal/history and unchanged semantic policy verifier.
Representative both-color/goal-control, material/pawn-square invariance,
disabled/prerequisite/strict/history/claim, zero/exact/short budget, and admitted-
baseline frame/type/owner/goal/value/cost/ray/king-entry/label forgeries. Reuse
saved raw queries after collection; no historical or cumulative suite. Keep
source/input/revision/output hashes, raw focused output and receipts, then
source verification/diff check, RESULT/INDEX and coherent local commit.

Deferred: combined source freeze/cumulative regression/exact main-repeat-clean
reproduction, full original occurrence/history/terminal/priority/budget matrices,
independent chess truth and human validity. No acceptance or production change.
