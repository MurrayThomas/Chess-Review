# E192 — outcome safety, declared win goals and position stakes

2026-10-11. Prospective BUILD-FIRST batch after E19189fb0c6. Current main,
research-only local commits/no push under standing checkout exception. Published
E145/E189 panels and development outcome summaries inspected; exposed synthetic
development, not confirmation. Scheduling proceeds beyond timing; practical
move/complication/two-result/chance/risk ideas need independent human/utility or
nonloss-policy prerequisites and receive no substitute geometric readiness.

Four distinct original occurrences, with broader meanings explicitly retained:
- C0823 Safe move: actual has positive complete actor mating certificate and
  a distinct legal alternative has positive complete enemy mating certificate
  at the SAME continuation H. Thus actual avoids the certified loss through an
  explicit winning policy, not mere failure to find enemy mate. Limited to
  this objectively winning alternative contrast; no practical ease or general
  safe/draw/low-risk claim. Selected actor policy must cover every enemy reply.
- C0828 Playing for a win: as an explicit coaching goal tool, require supplied
  goal exactly {frame:'before-actual',fen:canonicalRoot,actor:rootActor,
  outcome:'win',source:'declared-coaching-input'}. Actual must have full actor
  mate and at least one distinct certified losing alternative. Report declared
  goal and certificate-backed fulfillment, never infer private intent from moves.
  Missing goal withholds only C0828; wrong FEN/actor or malformed schema rejects.
- C0979 Lost position: require explicit view {frame:'after-actual',perspective:
  'w'|'b'}. Actual has positive complete certificate for the OTHER side from
  that exact frame. Losing relative to that declared perspective; bounded failed
  search, root losing alternative and undeclared perspective cannot label it.
- C0984 Critical position: BEFORE-actual full root legal inventory has certified
  actor-mate and enemy-mate alternatives at the SAME H. Original position-type
  occurrence, independent of which actual move was selected; difficulty,
  strategic/nonmating criticality and private thought remain open.

Saved-only inspectOutcomeDecisions(input,options,panel). Input legal FEN, actual
UCI, genuine complete history. Default enabled=false, plies integer0..2 default1,
maxNodes integer0..50000 default50000; optional view/goal as above. Strict ordinary
values; supplied unknown option/nested fields reject. Missing history/panel
abstain. Live genuine historical root and legal actual required when enabled.
Any visited fifty/threefold source claim suppresses all four labels atomically.

Reuse frozen E189 context prepare and E143 independent verifyPanel. Both new
runtime and own checker semantically admit distinct panels in separate exact
ordinary-value clone caches [fen,history,H,panel]; no persistent cached success,
no cached own labels. Full source legal inventory and discarded exploration are
replayed. Cached source admission cannot bypass changed ordinary content/history/H.
Own checker imports NO E192 runtime/context/derivation/collector; independently
validates controls/root/goal/view, classifies source outcomes and reconstructs
selected policy frames/roles/all-enemy defenses. Shared frozen admission, Chess
and E189 context semantics are declared limitations.

Own witness carries explicit original occurrence contexts, four complete root
partitions, after-actual winner and optional view, selected actual mating policy
edges with color/winner/defender roles, plus explicit goal fulfillment. Actor OR
enemy selected positive certificate is walked, retaining every enemy-of-winner
defense and selected winner edge; terminal mate must be real. Ownwork=2+each
root row+each visited selected-policy node (zero if actual unresolved or claim).
Total=2+history.length+verified source.nodes+ownwork. Exact/short/zero caps atomic,
all own panel/witness/labels cleared on exhaustion. No fresh searches expected.

Fixed both-color representatives reuse E189 saved root/H keys: actual immediate
win with matching goal and actor view: C0823/C0828/C0984; losing actual with actor
view: C0979/C0984; unresolved checking actual: only C0984; winning actual with
opposite view: C0823/C0828/C0979/C0984. H0 win and no-enemy-queen root have no
certified enemy alternative and withhold safety/goal/stakes. Earlier source
decision has only certified losing actual, hence C0979. Also missing goal/view
withholds only respective scope. Reuse genuine two-move E145 current histories
for representative full-prefix cases; exact archived keys only. Existing E187
tiny visited-fifty H0 panel suppresses all. Expected 20 role cases (ten/color),
ten distinct nonclaim parent panels plus one tiny claim; no inherited bulk replay.

Guarded D001-test entrypoints verify frozen archive lineage/source closure and
receipt. Small smoke first, focused file ONCE with representative each-scope
functional negatives, strict/missing/disabled, opposite view/goal identity,
exact/short/zero budgets and valid-baseline own/source mutations. Retain actual
command/output/source hashes/receipts/archive hashes and refs; soft own500KB.
Unexpected failures retained before repair. Source/diff checks; no cumulative
suite or repeated historical tests. Full integrated replay and original
occurrence/absence/priority/history/budget/terminal/claim matrix plus changed
main/repeat/initially clean reproduction deferred to combined freeze. No game,
engine/tablebase, human usefulness, speedup or statistical precision claims.
