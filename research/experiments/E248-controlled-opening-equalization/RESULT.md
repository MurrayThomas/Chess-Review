# E248 — genuine controlled opening-equalization estimates

2026-10-11. Code-ready provisional C0170 candidate, ONE new original entry.
Two prospectively registered genuine positives pass unchanged E147 numerical
gates and new same-root alternative controls. Original E147 failures retained.
C0276 positional advantage stays unready. No accepted tracker, production or
numerical-research change; authorized current main/research-only commits/no push.

## Question and retained outcomes

The latest ranked needs-code audit identified C0170 opening equalization and
C0276 positional advantage. E147 implemented finite opening-estimate rules but
its two genuine hypotheses failed. E220's source-qualified endgame draws cannot
fill that opening gap. E248 preregistered exactly TWO new authored roots and
same-root alternatives, with no later line hunting or threshold tuning.

The unchanged initial best recorded White scores are+32/+18cp at1000/2000
requested nodes. H1: Black actual candidate White CP inside[-30,+30] and at
least15cp below the initial best White score at BOTH budgets, initial>=15.
H2: nominated SAME-root legal ...a6 alternative White>=15cp and at least15cp
above the actual candidate at BOTH budgets. All legal choices, ties, PVs and
budget disagreements remain retained.

| Standard-start root / actual | Actual White CP | Alternative ...a6 White CP | Initial decline | Alternative contrast | H1/H2 |
| --- | --- | --- | --- | --- | --- |
| 1.a3 / ...e5 | -5/-5 | +33/+24 | 37/23 | 38/29 | pass/pass |
| 1.h3 / ...d5 | -16/-12 | +19/+27 | 48/30 | 35/39 | pass/pass |
| Original E147 1.e4 / ...e5 | +15/+31 | retained in full panel | 17/-13 | passes H2 | fail/pass |
| Original E147 Italian / ...Bc5 | +28/+23 | retained in full panel | 4/-5 | fails H2 | fail/fail |

These are actual restricted ROOT candidate scores, not separately searched
PV endpoint scores. White CP is the exact negation of Black root CP. Mate is
never converted to CP; claim-sensitive panels abstain. Each new root has all20
legal Black choices at both budgets. After1.a3, ...d5 tops both budgets even
though nominated ...e5 qualifies. After1.h3, top ...e5 at1000 changes to ...d5
at2000. The candidate does not claim actual optimality or stable root ordering.

H2 controls the immediate move choice at the same root; it does NOT show that
Black alone removed White's initial advantage. White's earlier flank tempo is
explicit. No theoretical opening equality, independent positional quality,
human consensus/win probability or stronger-budget robustness is established.
The original C0170 broad teaching meaning remains open beyond this model scope.

## Implementation and source admission

Plan freeze f824a60; initial collector3fd4c08; repaired collectorfc71409; estimator
freeze7c90e35; targeted fixture-repair freeze1f9029c. Unchanged pinned Stockfish19
Lite single-thread JS/WASM, nn-61e7af4bb97d.nnue, Hash32/MultiPV1/full strength/
ShowWDL/no tables,1000/2000requested nodes, fresh game/Clear Hash/isready per
search. Dynamic engine-host.cjs is explicitly bound contemporaneously here.

Two complete new panels84calls,126000requested/95145observed nodes, collected
once in10.844seconds total. First child including guard/admission5.506seconds
passes unchanged10second smoke gate; second5.272seconds. Inner collection+
source checks3.706/3.531seconds. Each subprocess has30second cap, with a25second
maintained-engine await deadline that would preserve a partial ledger before the
outer fallback. No timeout occurred. Requested/observed nodes remain distinct.
Baseline and two old failed-root panels independently replayed from fixed-hash
E147 archives; no old engine search repeated and no raw negative result changed.

`inspectOpeningEqualization(input,options,token)` defaults disabled; strict
ordinary FEN/move/history/options; genuine standard-start first20plies and Black
actor; exact actual and nominated alternative. Private capabilities arise only
from current-source/hash-bound/D001-guarded saved archives and complete independent
E138 wire/ledger/PV/domain/config/score replay. Caller values/mock bundles/copied
tokens cannot authenticate an estimate. Returned snapshots cannot alter private
observations. Runtime launches no engine and consumes only admitted observations.

Full baseline+current logical ledger cost charged without cache discounts:
84calls for each new root and old...e5,103for the old Italian. Zero/one-short
caps atomically suppress ALL own observations/claims. Independent own checker
imports no own runtime, opening-frame or numerical convention helper; it derives
history/frame/actors/domains/signs/tops/H1/H2/explanations/accounting, with fresh
source-panel semantic replay. Shared Chess, fixed admission and source verifier
are explicit; independent engine/outcome truth remains unresolved.

## Failures, focused checks and evidence

Initial collector failed before any fresh engine call: compact borrowed-result
adapter omitted required `after`. Original start/failure retained; dated
amendment restores only the exact existing field, keeps every chess gate and
uses distinct evidence/v2. No source checker was weakened.

Own four-row independent saved pilot passes7.674seconds, zero fresh searches.
Initial focused subprocess17.160seconds passes7of8checks; late-history fixture
incorrectly continued beyond threefold and was correctly refused by E024 before
the intended opening-window gate. Dated second amendment replaces only that
fixture with a legal nonrepeating20-ply line and legal21st-ply Nf1g3. Runtime,
checker, admission, engine observations and all research hypotheses unchanged.
The failed process/old test bytes remain frozen. Source audit proves the other
seven check bodies AND behavioral dependency hashes unchanged. Only the failed
named check reruns and passes7.379seconds (actual check0.090seconds; cold saved
archive admission included). This is7+1combined coverage, not a new all-eight
success. Four own results independently replay again before build retention.

Checks cover prospective positives/original failures, full domains and changing
tops, strict/getter/private-capability/mock controls, missing/White/nonstandard/
late histories, exact/short/zero full-ledger budgets, raw CP/mate/PV claim/domain/
ledger/endpoint forgeries, output sign/gate/domain/top/label/accounting mutations
and isolation. Source verification and research diff checks pass. No cumulative
suite, historical reconstruction or repeated engine search.

169current source bindings. Own evidence297646bytes before provenance; existing
E147 observations/audit remain borrowed by exact hash, not copied. D001 test
receipts, original/repair revisions, source/input/output hashes, raw engine
wire/ledger/config and full test stdout/stderr retained:

- `evidence/started.json`, `admission-failure.json`: first failed source admission.
- `evidence/v2/`: frozen repaired collector start, borrowing manifest, collection
  summary, two complete compressed panels and raw child-process records.
- `code/archive-lock.json`: fixed evidence hashes and complete collector source
  bindings, including old failures and E147 borrowed provenance.
- `evidence/focused/`: original own source start/pilot,7pass/1fail raw output,
  final provenance linking both attempts and repaired input bindings.
- `evidence/focused-repair/`: new source start, test-body/source audit and raw
  single-check passing output. Both original and repair revisions are explicit
  in their own records; provenance's revision identifies the original own pilot.
- `build.json`: bounded C0170 scope, all current source dependencies, actual7+1
  check history and deferred gates. All writers create outputs exclusively.

Replay current focused behavior, without engine searches:
`node --test research/experiments/E248-controlled-opening-equalization/code/opening.test.mjs`.
That complete current-file run was NOT repeated at this boundary; only the
recorded named repair ran after the audited fixture-only change.

Canonical metadata:378/1085accepted (34.8%),531additional provisional entries,
909accepted-or-code-ready (83.8%),153ready batches,0stale,176without ready code.
Availability is not scientific acceptance or proof of the full original scope.

## Resume state

Next earliest original claim is C0276 positional advantage. Audit E213/E217
same-material king-choice/outcome comparisons for a justified lasting positional
target and adaptive alternatives before preregistration. Require a sustained
positive advantage and causal positional controls; do not retag a one-move CP,
nominal pawn edge, technical draw or local tactical gain as general positional
advantage. If those sources do not supply the target, record the precise missing
evidence and continue independent compatible work in approved rank order.

Deferred: broader opening/positional meanings, stronger budgets/independent engine
and outcome truth, human/real-game utility, exhaustive original occurrence/
history/claim/terminal/priority/budget integration, combined source freeze/full
cumulative suite/exact changed main-repeat-clean reproductions. Goal remains
active; no push, production change or numerical work.
