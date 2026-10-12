# Concepts integration and coaching

The main Concepts panel has **All concepts** and **Coach reply** views. Both use
one optional local worker and the same selected-move cache. All concepts shows
matched findings from enabled groups, not the catalog. Evidence and scope expands the exact original
explanation, research status, bounded observation and available supporting details.
Settings → Concepts uses the same compact rows and accordion sections as Visual
and Engine. It contains cost-ordered group checkboxes, Fast/All presets, and
collapsed selected-position diagnostics rather than a duplicate finding list.

## What is available

P003 adds 98 detector entrypoints (E081–E177 excluding E176/E140, plus FRIEND01–03),
eight later inspectors (E189/E199/E200/E201/E202/E206/E209/E237), and one E140
input-contract prerequisite stage. E020–E080's original promoted bytes and P001
provenance remain unchanged. The 300-module closure includes proof checkers and
shared machinery; module count is not detector count or concept coverage.

The latest accepted research tracker is E082: 378 original occurrences / 328
names. Acceptance is unchanged. The build-first inventory records 539 additional
provisional scopes, 127 separate support occurrences and 41 strategic/practical
prerequisites. Those inventory totals describe research implementation, **not**
findings available in every position or newly verified strategic claims.

New provisional findings use their exact emitted observation instead of claiming
the broader catalog name. Candidate study scopes are shown separately and are not
per-event assertions. Only the six E081/E082 accepted observation names are added
to canonical routing. Teaching usefulness, precision on real games and strategic
interpretation remain unmeasured. Existing engine grades and coach comments keep
their established algorithms.

The generated [integration inventory](../lib/concepts/integration-provenance.json)
records source hashes, adaptations, exact candidate scopes and disposition/blocker
for every E083–E269 study. Important unavailable inputs include:

| Family | Concrete blocker |
| --- | --- |
| Planned move order | A declared `orderFollowup`; subsequent played moves do not prove the intended order. |
| Comparative piece, weakness, sacrifice or plan policies | An explicit legal alternative, target/objective, context or full certified panel. The extension does not invent intent or a strategic objective. |
| Engine-panel adapters | A verified panel in the research certificate interface. An ordinary Stockfish score/PV is insufficient. |
| Real tablebases and named rook defenses | Admitted local WDL/DTZ files, subtable closure/probe, or private exact-source tokens. Research fixture results cannot be used for arbitrary positions. E140 has zero coverage credit. |
| Historical initiative/resource comparisons | Declared prior counterfactual and complete prior proof, beyond ordinary history. |
| Sustainable pressure, strongest defense, equality | Complete goal-specific finite-state/candidate policies or admitted source evidence. |
| Reference/support sessions, E221–E229 | Separate study/reference/report inputs; these are not played-move detectors. |
| Practical/strategic prerequisites | Validated outcome/timescale/rubric inputs; E253/E257 do not provide an independent detector. E260 is census metadata. |

Registered stages can also abstain because history is missing, the original
starting position is unavailable, the material/profile is outside scope, the
position is terminal, a claim rule needs separate treatment or a bounded search
is exhausted. These states are reported separately from an answered-empty result.
The later checks/captures inspector keeps its complete legal inventory even when
its deeper mating panel is unavailable. Supplemental two-ply panels run only in
live positions with history and at most ten pieces; larger positions retain the
chain's bounded searches and report the supplemental profile limit.

## Coach selection

`lib/coach-insights.js` is a pure presentation policy, separate from detector
proofs. It considers concrete consequences and ownership before category labels:
terminal results and immediate mate, certified bounded mating policies and missed
chances, defensive needs and conditional reply risks, then meaningful changed
piece/structure relationships. It emits at most two distinct compatible themes.

The reply uses actor/defender/target colors and actual transition evidence. A new
attack and an undefended observation may combine only for the same opposite-color
target. Loss of pawn support combines with an attacked undefended piece only when
the recorded attack ledger proves that support disappeared. These observations
explicitly do not establish a winning capture. Repeated aliases become supporting
evidence, not repeated sentences. Related mating labels share one theme.

Legal movement, material inventories, raw candidate counts, unchanged pawn chains
and unsupported general evaluations abstain. Lower-priority structure yields to
urgent tactics. Conditional and turn-flipped diagram resources stay conditional;
a hypothetical pass is never presented as an actual immediate reply. Exhaustion
never certifies safety or absence. An ordinary opening move can have many all-view
observations and an honest empty coach reply.

Player perspective comes from the unique username/saved player-name match and
`S.meSide`, independent of mover and board orientation. Opponent moves explain
what becomes available or dangerous for the player. Ambiguous or missing identity
uses neutral all-view labels and an explicit reply empty state. Share links keep
anonymous games anonymous while preserving board orientation.

## Runtime and maintenance

`node scripts/promote-concepts.mjs --integration` reproduces the browser closure,
entry registry, inventory and source/profile cache fingerprint. The legacy command
retains its original E080 promotion. Existing accepted modules are checked for byte
identity and never rewritten by the integration generator. Research files and
frozen evidence are not modified. Browser assertions fail closed on unsupported
certificate objects; checker data remain plain JSON.

Each controlled pass calls the existing E080 parent once and binds each new stage to the
completed parent for the identical full controlled input, including flags, budgets
and declared goals. Different-control or different-position calls
retain the original parent behavior. This avoids rerunning the entire cumulative
chain for every stage. Enabled bounded searches retain a 4,000-node cap; cheap checkpoints use reduced budgets; proofs and
prerequisite checks retain their source semantics. Later inspectors reuse complete
panels where available. Summaries retain compact ownership and details, not trees.

The default Fast profile enables attacks/lines/placement, pawn/board features,
recorded routes/development tempo and immediate checks/mating warnings. Tactical
proofs, pawn races/endgame policies, detailed positional comparisons and complete
candidate/objective policies are opt-in. All keeps the complete P003 collection
available with its existing bounds. Cost labels are relative work classes, not
promised durations. Actual work varies with legal branching, material and history.
Rule validation, meaningful structural and development observations remain available;
checkboxes control the additional detector families and their expensive searches.
Disabled groups are explicitly identified and are not treated as absent findings.

Unvisited moves consume no detector work. The selected move starts immediately;
navigation terminates unfinished work for the previous move, retaining its partial
observations until it is revisited. Completed entries are reused. At the starting
position and during practice, no selected concept job runs. The Fast profile runs
one controlled baseline, publishes successor checks/mates and recorded changes,
then runs only enabled stages. Heavy profiles retain a cheap first checkpoint
before the detailed parent searches. Successor bounded panels are only collected
when the complete-policy group is enabled. Player/color and view changes reuse
results; the normalized group selection is part of the input/cache key.

Fast stages publish at most every 125ms, and expensive stages renew the existing
five-second inactivity watchdog. A stalled stage is terminated with prior validated
findings retained and unfinished work explicitly unavailable. Such errors are not
cached as successful absence. Selected navigation renders immediately and preempts unfinished work. Disable/game replacement terminates the
worker; stale worker/key callbacks cannot update the new selection. Cache keys
include exact history, enabled groups and source/profile identity; changing player or view reuses
the same analysis. The UI thread does not import the detector collection.

See [P003](../research/promotions/P003-concept-integration.md) for the adoption
decision, checks, limitations and retained evidence links.

See [P004](../research/promotions/P004-concept-performance.md) for the performance
policy, before/after measurements and validation. Research acceptance is unchanged.

## Fast teaching policy (P005)

Fast and lighter selections now skip the routine foundation and inventory tags.
Legal-move validation remains mandatory, but legal movement, square coordinates,
raw material totals and pawn-square inventories are not teaching findings.
Settings → Concepts lists the temporary removals and distinguishes skipped work
from omitted summaries whose shared scans still support mate warnings or changes
in defenders. Unattacked undefended units and duplicate square-color/line labels
are omitted. Enabling a heavier group restores the full P003 inspector.

The Fast reply uses the same cached findings, compact named certificates and the
selected before/after board. It performs no proof search. Actual outcomes and mate
warnings lead; proven material losses outrank offensive response threats. A new
attack is weighted by its concrete targets, their value, missing defense and
multiple contacts. New defense of an already attacked unit, line clearance, rook
coordination, pawn tension and newly changed structure can produce quiet lessons.
Category rank alone does not choose the reply.

Exact target matches let a short pawn-capture certificate strengthen an attack.
Other independently witnessed effects of the same selected move can form a second
sentence, with their original explanations available in supporting evidence.
Aliases add no repeated prose. Unchanged structural observations cannot become
new threats. A separate urgent issue can produce a second item; ordinary replies
remain one coherent paragraph. Empty and unknown-player states remain explicit.

Piece names and ownership come from the actual board, with player identity from
S.meSide. A turn-flipped capture proof describes this exact diagram: the opponent
moves next and can change it, even if the capture remains legal. The reply never
claims that legal availability alone preserves the earlier material proof.
Short material calculations do not establish best moves, a lasting advantage or
a winning continuation. Accepted scopes and provisional study status are unchanged.

See [P005](../research/promotions/P005-fast-coach-curation.md) for decisions,
validation and limitations.
