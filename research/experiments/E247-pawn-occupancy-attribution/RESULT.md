# E247 — blocked bishop ray and protected king-entry occupancy

2026-10-11. Completed bounded causal prerequisite study, with callable neutral
research audit. Both-color registered H1 passes; goal controls retain different
refutations. C0712/C0714/C1070 remain unready, zero new detector IDs, no build.json
or accepted tracker/production/numerical change. Current-main user exception;
research-only local commits, no push.

## Question and outcome

Following negative E246, the new authored root is White Kh4/Nc8/Pf7/Pd3/Ph6
versus Black Kd7/Bh3/Pd4/Pe7, actual Nc8d6. The paired root swaps ownership of
the pawns on e7/h6 while preserving each color's nominal material, all occupied
pawn squares, king/minor locations, goal and actual move. Bd6 replacement is
same-square/equal-value. Ownership swaps and piece replacement are explicitly
hypothetical comparisons, not legal game continuations. Only the d3/d4 central
lock remains: these are NOT E186's fully closed positions.

| Root and goal | Knight | Bishop |
| --- | --- | --- |
| Enemy Pe7, f7 goal | converts | converts |
| Own Pe7, material-matched ownership swap, f7 goal | no bounded conversion | converts |
| Enemy Pe7, b7 goal control | no bounded conversion | converts |
| Own Pe7, b7 goal control | no bounded conversion | converts |

All values use unchanged H2 tracked-pawn surviving-profitable-queen-or-mate
semantics and complete legal enemy reply domains. Failed finite conversion is
not a forced loss, draw or generic piece-quality judgment. Both rank/color
reflections reproduce every value; different traversal costs remain explicit.

The d6-e7-f8 bishop ray is blocked by a pawn in BOTH f7 ownership frames.
With enemy Pe7, ...Kd7e7 is forbidden by the king's own pawn. With own Pe7,
...Kd7xe7 is legal against Nd6; f7f8q then permits ...Ke7xf8. That exact king
capture is the saved knight counterchoice, with the complete failed actor
response policy independently replayed. Bd6 protects e7 and forbids the same
king entry despite its still-blocked ray to f8; its complete conversion policy
passes against all legal replies. H1's outcome, ownership/material/ray and
positive route gates therefore pass together, in both colors.

The b7 control retains ...Kd7xe7 followed by legal b7b8q but Ke7 cannot capture
Qb8. The knight instead fails through ...Kd7c7 in both ownership roots; the
bishop succeeds in both. H2's specified e7/promotion-capture refutation is absent
as registered. No preferred control outcome was selected after observation.

This establishes a LOCAL protected-entry/occupancy explanation, not a sole
global causal attribution. The material-matched swap also changes the remote
h6 pawn's owner and other legal replies (all retained). It does not establish
that fixedness, closure or generic bishop quality caused the outcome. A blocked
promotion diagonal alone is insufficient to infer useful bishop obstruction.
No original strategic concept is discharged by this prerequisite audit.

## Build, checks and provenance

Plan frozen defbad7, collector bab509d, callable audit/checker77d38f7. Four paired
panels16raw queries were collected once in0.677seconds; first two-type group
0.197seconds, every group0.036..0.197seconds, all under registered limits.
Raw E184 policies preserve all attempted prefixes, full legal inventories and
queen-survival responses. Unchanged E186 semantic policy replay admits every
frame/actor/goal/baseline/horizon/value/claim and exact cost. E246 observations
guided design only; no incompatible old proof was reused for these new roots.

`inspectPawnOccupancy` is strict and default-disabled. It replays genuine input
history, requires the actual quiet knight move and correctly owned specified
pawns, constructs legal hypothetical ownership/type frames, independently admits
all saved policies and derives all geometry/king routes. It always withholds
strategic claims and readiness. Full work is charged; exact complete budgets
are1600/1561ticks for f7/f2 and629/589for b7/b2; one-short/zero budgets suppress
every observation atomically. The own checker imports no own runtime, frame
constructor, ray or route function. Shared Chess/history/source proof machinery
is explicit; independent chess truth remains deferred.

Four independent own saved-result replays passed0.711seconds. Ten focused checks
passed6.511seconds with zero fresh queries: both colors and goal controls,
material/pawn-square/blocked-ray invariance, defaults/missing inputs, ordinary
strict controls/legal actual/history, claim abstention, full/short/zero budgets,
input immutability, and admitted-baseline source frame/actor/horizon/goal/material/
domain/value plus output ownership/ray/entry/promotion-capture/domain/accounting/
claim mutations. Source verification and research diff checks passed. No full
cumulative or historical suite/reproduction.

32recursive source bindings; six lossless evidence artifacts88184bytes total.
D001 guard receipts and source/input/revision/output hashes retained. Replay:

- `node --test research/experiments/E247-pawn-occupancy-attribution/code/assay.test.mjs`
  admits retained policies and checks callable behavior, without new searches.
- `evidence/started.json`, `panels.json.gz`: collector revision/bindings/receipt,
  all raw policies, exact frames/audits and per-group timings.
- `evidence/focused/started.json`, `pilot.json.gz`, `focused-checks.json`,
  `provenance.json`: audit source freeze, reconstructed results, full test output,
  independently replayed policies and exact artifact hashes. Writers use exclusive
  creation; later reproductions require a distinct prospectively recorded path.

Accepted/provisional coverage is unchanged:378/1085accepted (34.8%),530additional
provisional entries,908accepted-or-code-ready (83.7%),152ready batches,0stale,
177without ready code. Code availability does not prove the original definition.

## Resume state

E246's failed explanation is preserved and its local occupancy confound now has
a positive mechanism/control audit. Do not repeat the forbidden ...Ke8 argument
or count this as closed/fixed-pawn preference. The remaining strategic claims
require their genuine original objectives and controlled adaptive alternatives.
The fresh canonical queue has no needs-code entries in phases1–4; this denotes
available accepted/provisional scopes, not full validation of every definition.
The earliest remaining original claims are C0170 opening equalization (rank307)
and C0276 positional advantage (rank314). Next: audit E147 and the E220 equality
prerequisite records against those ORIGINAL opening/positional objectives,
identify an independently justified evaluation target and adaptive alternatives,
then preregister a compatible batch or explicitly record the missing evidence.
Do not substitute geometric symmetry, a one-move material gain or this local
occupancy explanation for either original claim. Use these exposed observations
as development evidence only where relevant.

Full original-occurrence/history/claim/terminal/priority/budget matrices, combined
source freeze/cumulative suite/exact main-repeat-clean reproductions, independent
chess truth, two-army strategic benefit and human usefulness remain deferred.
