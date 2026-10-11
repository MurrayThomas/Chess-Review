# E266 — two-army useful pawn-weak knight-entry resource

2026-10-12. **Prototype; not accepted evidence.** One bounded C0892 candidate.
Planf0135cb, collector/checker74151b7, callable/check66a5cb9, build-recorder2283ea7,
metadata-count audit5fabe92. Current-main exception; research/local commits/no push.
Accepted tracker, extension and numerical behavior unchanged. Full original
weak-square imbalance remains open.

## Reuse audit and controlled matrix

E070 proves legal pawn support and conservative prepromotion enemy-pawn route
absence for a knight post. E132 immediate capture of entries and E162 conditional
queen denial prove different scopes; E178's useful E174+E070 conjunction is the
relevant precedent. E263 enemy-half access is not automatically useful weak-square
exploitation. This study reuses maintained E070 explainMove DIRECTLY and unchanged
E265 query/checkProof; no new solver or copied private pawn-route helper.

Fixed White Kb1/Nf3/Pc3-or-c2/Pf4 versus Black Kh8/Na8/Pa6-or-c6/Pf5. Both
hypothetical actor turns and vertical/color reflections =16full censuses. Roots
canonical/legal/live/quiet, equal material, one original knight and two pawns per
army, fresh halfmove0/no rights/EP. Authored diagrams; no actual history invented.

| White pawn / Black pawn | White joint resource | Black joint resource | White finite capture resource | White supported pawn-weak posts |
| --- | --- | --- | --- | --- |
| c3 / a6 | true | false | true | Nd4, Ne5, Ng5 |
| c3 / c6 | false | false | true | Ne5, Ng5 |
| c2 / a6 | false | false | true | Ne5, Ng5 |
| c2 / c6 | false | false | true | Ne5, Ng5 |

Black has neither material resource nor supported pawn-weak first entry in these
contexts. All16 registered eligibility/material/post/joint/reflection gates pass;
all source positives have failed joint alternatives. Both armies use the SAME
objective, not one side's square count. Reflecting swaps the actual beneficiary
color while preserving the original actor correspondence.

The joint resource requires the SAME original-knight noncapture/nonpromotion/
NONCHECKING relocation to meet BOTH contracts. E070: relative rank4..6, legal
pawn support in explicitly counterfactual own-turn knight-replacement frame,
complete occupancy-independent forward/capture-file/double-step prepromotion
pawn-route DAG absence, and all actual legal enemy replies retained. E265:
original-root no already-profitable original-knight capture; one fixed ORIGINAL
enemy target nominated before replies, capturable by that SAME knight after
EVERY actual legal defense with live nominal gain>=1 after EVERY immediate
counterreply. Capture choice can depend on defense. All quiet original-knight
entries/targets/defenses/capture choices/counters retained, including failures,
checks and countercaptures of other units. King/pawn/capturing/checking first
moves remain outside this declared objective, not rated inferior.

Main White Nd4 has genuine c3xd4 support in the replacement frame, no current
enemy pawn can ever acquire a prepromotion attack on d4 under the conservative
route superset, and Nd4 then Nxf5 secures the finite gain through every defense/
counter. Nh4 has the capture resource but no legal pawn support. Ne5 and Ng5 have
supported pawn-weak entry but fail the capture objective. Thus neither finite
activity nor supported occupancy alone supplies the joint claim.

Relocate ONLY White Pc3→c2: Nd4/Nh4 capture availability remains, but Nd4 loses
pawn support. Relocate ONLY Black Pa6→c6: the same capture availability remains,
but ...c5 can attack d4 in the future even though Pc6 does not attack d4 now.
Both controls still have other supported pawn-weak entries. These matched pawn
PLACEMENTS are counterfactual interventions, not claimed actual legal turns.
The capture continuation may leave d4: the finding concerns a useful entry,
NOT lasting occupation, permanent safety or long-term strategic exploitation.

## Collection and independent reconstruction

Four c3/a6 material inputs exactly match E265 f3/a8; their original queries are
reused only after archive SHA/current source binding and semantic replay. Twelve
other material inputs freshly collected with UNCHANGED E265 source and bounds.
80 maintained E070 contracts (64 original White-actor,16 Black-actor, including
reflections) evaluated for EVERY eligible quiet entry, not selected successes.

Complete matrix1.657seconds including each new joint reconstruction; initial
archive/source admission is outside that timing.7384exact charged nodes:
5176material (3978fresh/1198reused),2192outpost and16joint-root charges. Collection
62019gzip bytes. All18positive post certificates and2useful entries (Nd4 and its
reflection) retained, plus every non-support/rank/future-pawn refutation. Positive
certificates retain18legal supporting captures/100actual enemy replies. Independent
pawn proofs across positives/refutations include670nodes/1210edges. No failed
query, incomplete run, budget cap, post-observation tuning or relaxed gate.

Own checker imports no E070 candidate/query/fixture/derive. It independently
reconstructs exact E070 analysis/events/accounting, legal support replacement
frame/captures, ALL route nodes/edges using rank/file-distance enumeration rather
than candidate BFS, actual reply frames/flags, relative rank and scope. It uses
E265 independent checker for the unchanged full material policy. Shared Chess/
legalPosition and reused independent verifier limit independence; strategic or
human truth remains unproven. Counterfactual support never supplies an actual
extra turn to the alternating capture proof. No game data, engine, acquisition
or tablebase used; D001test receipts/environment/source/input/output hashes saved.

## Callable comparison, checks and metadata

Default-disabled inspectWeakSquareResource in code/comparison.mjs admits private
immutable archive/source-bound comparisons ONLY after all16matrix and exact-reuse
provenance gates. All8 directed single-pawn neighbor interventions in both
orientations retained:16outputs,4qualifying. Source c3/a6→c2/a6 and c3/a6→c3/c6,
plus reflections, qualify; reverse/nonremoving/neither-active cases abstain.
Main has exactly one joint-resource army, control neither; source successful AND
failed joint alternatives and same-original-owner reflection mandatory. Both
actor roots have identical placement with only hypothetical turn changed.

Missing proof abstains, forged/cloned/cross-input capability rejects, returned
evidence cloned. Plain strict input/options, explicit null/getter/unknown/array/
invalid root rejection. Charge all8admitted joint proof ledgers plus8comparison
charges, not fresh CPU time. Exact budget passes; short/zero atomically withhold
claim/comment/view/evidence with used0. Text names legal pawn support, prepromotion
pawn unreachability and finite nominal gain through every defense/counterreply,
24words, qualityClaim:false. No whole-army/general weak-square/quality claim,
C0895 color-complex/C0904 maximal-activity credit, or duplicate E070/E178 IDs.

24focused checks pass5.157seconds;16saved output reconstructions2.621seconds;
24affected E265 checks pass2.882seconds. Both interventions/beneficiaries through
reflection, all abstentions, same-entry conjunction separators, legal support,
future-not-current pawn challenge, complete route nodes/edges/attacks, support
counterframe/captures, all actual post replies/flags and full material domains,
original baseline/material/terminal/tick mutations, failed alternatives, strict/
null/getter/default behavior, private ownership/source/cloning, atomic budgets
and independent output forgeries exercised. No failed scientific/focused run;
zero fresh focused queries. Source verification and diff checks pass.

Build writer prose initially said64contracts, omitting16Black-actor contracts in
that DESCRIPTION. All80 were already collected and independently checked; no
scientific domain or source changed. AMENDMENT.md and code/count-audit.mjs
preserve original build/provenance bytes under evidence/count-correction, compute
the exact80count and refresh metadata only. Frozen original writer stays intact;
regeneration requires its appended count audit. No queries/tests repeated for
that descriptive correction; original focused-source hashes verified unchanged.

Final closure132source/config/test hashes includes maintained E070 dependency
closure, full64-input E265 prior closure, affected test and count amendment/audit.
All fingerprints current. evidence/focused/build-provenance.json retains frozen
commands/status/stdout/source/evidence hashes. evidence/manifest.json covers
15files798984bytes including original count metadata; gzip artifacts decode via
JSON.parse(gunzipSync(await readFile(path))). Soft storage target satisfied.

Current coverage538additional provisional occurrences,161ready batches/zero stale;
916/1085accepted-or-candidate(84.4%),169without ready code. Accepted E082 unchanged
378/1085(34.8%),328names/63completed studies.127support occurrences separate;
42strategic occurrences lack ready code. Narrow candidates do not finish their
broader original definitions. No cumulative acceptance suite run at this stage.

## Resume

Next C0895 color-complex imbalance rank510, then C0896 good-piece/bad-piece
imbalance. Audit maintained color/pawn structure and E156/E159/E178 objective/
piece comparisons before preregistering. Define one common nonmating useful
COLOR-COMPLEX occupation/denial/exploitation objective for both armies with
matched pawn/guard/color intervention, full meaningful alternatives and enemy
responses. A bishop's square color, two selected same-color squares, weak-square
counts or this single d4 post are insufficient evidence of general color-complex
imbalance. Preserve independent rubric/usefulness prerequisites if a bounded
objective cannot establish the original claim; continue other implementable work.
Do not rename E266 as C0895 or collapse the distinct original targets.

Combined original-occurrence/full-scope/cumulative/semantic/history/terminal/
priority/budget validation and changed main/repeat/clean reproduction stay required
under BUILD-FIRST. Combined genuine pins/multiple supporters/EP/promotion/terminal/
claim/history transition matrices, arbitrary real-game adapters and independent
strategic/chess/human usefulness remain open. The overall goal stays active.
