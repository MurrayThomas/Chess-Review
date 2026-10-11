# E246 — central obstruction did not establish the registered strategic cause

2026-10-11. Negative causal audit, with callable neutral research observations.
C0712/C0714 remain unready. No build.json, new detector IDs, accepted tracker
change, numerical fitting or production change. Current-main user exception;
research-only local commits, no push.

## Registered hypothesis and result

The preregistered closed root was White Kh4/Nc8/Pf7/Pd3/Pe6 versus
Black Kd8/Bh3/Pd4/Pe7, actual Nc8d6. Both central pawn pairs are locked.
Equal-value Bd6 replacement and material-preserving pawn relocations are explicit
hypothetical frames, not legal continuations. H1 expected knight conversion,
bishop failure, then both types converting in the open frame. That hypothesis
failed in both colors under the unchanged H2 tracked-pawn/surviving-profitable-
queen-or-mate objective:

| Frame | Knight | Bishop |
| --- | --- | --- |
| Original closed position | converts | converts |
| All four central pawns relocated | no bounded conversion | converts |
| Only enemy blocker relocated | no bounded conversion | converts |
| Only own locking partner relocated | converts | converts |
| Goal pawn changed from f7 to b7, original central locks | no bounded conversion | converts |

The bishop d6-e7-f8 ray really is blocked, but the proposed ...Kd8e8 entry
is illegal in BOTH closed piece frames: Pf7 itself attacks e8. The claimed
bishop refutation therefore does not exist. Opening the enemy e7 occupancy
instead admits the knight's saved counterchoice ...Kd8e7; Bd6 covers e7.
Removing only the own locking partner preserves both successful conversions.
The b7 functional control preserves the same central locks but favors the bishop
under this goal; the knight's saved counterchoice is ...Kd8c7. Rank/color
reflections reproduce every value. These are finite objective results, not
general piece quality, forced-loss/draw or long-term strategic judgments.

H1 and its specified king-route mechanism fail, so the registered H2 fixedness
attribution cannot advance readiness. An enemy pawn can obstruct both a bishop
ray and its own king; that interaction is an exploratory explanation of retained
outcomes, not a replacement successful hypothesis. No post-result gate changes,
discarded observations or silent retries.

## Implementation and evidence

Plan freeze ea4599f, unchanged-source collector freeze927e275, neutral audit
freeze485e7f8. Collection retained four complete five-policy panels plus eight
factor policies:28queries,0.714seconds total; first source smoke0.244seconds.
All source policies use unchanged E186/E184 proof machinery. The source
five-policy checker and independent full policy replayer admitted all outcomes.

`inspectPawnObstruction` defaults disabled, validates ordinary inputs and genuine
source histories, requires complete saved proofs, binds factor names to the
actual opposing blocker/own locking partner, reconstructs equal-value frames,
diagonal occupancy and exact king-entry/promotion/capture legality. It charges
full source and factor work. Zero/short caps atomically hide observations;
complete costs are2005ticks for each main panel and415for each goal control.
It provides no strategic readiness; any new causal positive requires a separate
prospective registration. The own checker reconstructs the output independently
without importing this assay or its feature functions; Chess and unchanged
source semantic verification remain shared dependencies.

Four saved-result independent replays passed in0.549seconds;8focused checks
passed in4.626seconds with zero fresh queries. Checks cover both colors,
functional controls, default/prerequisite abstention, ordinary/schema/history
validation, exact/one-short/zero budgets, input immutability, and source/factor
goal/frame/value/role/accounting plus output ray/legality/label forgeries.
`npm run verify:source` and research diff checks passed. No cumulative suite.
34source bindings; five run artifacts73068bytes before the provenance record.
D001 eligibility receipts and immutable source/input/output hashes are retained.

Evidence and replay commands, from repository root:

- `evidence/started.json` and `evidence/panels.json.gz`: original collection,
  full proof trees, factor queries, source bindings and guard receipt.
- `evidence/focused/started.json`, `pilot.json.gz`, `focused-checks.json` and
  `provenance.json`: frozen audit inputs, independently checked outputs, raw test
  stdout/stderr, costs, output hashes and deferred checks.
- `node --test research/experiments/E246-central-pawn-obstruction/code/assay.test.mjs`
  verifies the retained proofs without collecting fresh observations.
- `run-focused.mjs` and `record-evidence.mjs` are immutable-output writers;
  existing output paths must not be overwritten for a later reproduction.

Canonical metadata remains378/1085accepted (34.8%),530additional provisional
entries,908accepted-or-code-ready (83.7%),152ready batches,0stale,177without
ready code. Availability is not scientific acceptance or whole-definition proof.

## Resume state

The study is closed as negative evidence for its registered explanation. Full
original-occurrence/history/claim/terminal/priority/budget integration matrices,
combined source freeze/cumulative regression/main-repeat-clean reproductions,
independent chess truth and human utility remain deferred under BUILD-FIRST.
Broad closed/fixed-position benefits and C1070 remain unresolved.

Next concrete step: prospectively investigate whether the SAME enemy pawn's
king-entry obstruction, separated from its bishop-ray obstruction, explains
the observed equality/reversal using legal material-matched controls and both
colors. Register the causal hypothesis before any new decisive evaluations;
reuse these exposed observations only as development evidence. Do not retry
the original forbidden ...Ke8 mechanism or rebrand this audit as C0712/C0714.
