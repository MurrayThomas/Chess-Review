# E263 — factorial quiet outpost space-access comparison

2026-10-12. **Prototype; not accepted evidence.** C0887 gains one narrowly
scoped provisional implementation. All original broader space-imbalance meaning
remains open. Plan d91aab9, collection freeze3207f6a, first comparison freezef34dd56,
strict/diagnostic correction1fc42c9, final quiet-label freeze9ef3b7e. Recorded
current-main exception; research only/local commits/no push. Production and
numerical scoring unchanged.

## Complete matrix

Fixed White Ka1/Nc3/Pe4 versus Black king/knight as listed plus Pc6/Pg5.
Main/control differs ONLY by Pc6→a6; material and pawn advancement unchanged.
Both sides have the same four-ply objective: quiet king/knight maneuvers to an
original-knight enemy-half post with legal pawn support, surviving all legal
opponent replies and excluding every enemy pawn's conservative prepromotion
challenge route. Pawn moves/captures are outside the actor objective, never
rated inferior. Hypothetical actor turns are explicit, not actual game history.

| Black king / knight | Main White | Main Black | Control White | Control Black | Joint/reflected gate |
| --- | --- | --- | --- | --- | --- |
| a8 / h6 | false | false | true | false | fails |
| a8 / g6 | false | true | false | true | fails |
| a8 / f8 | false | false | true | false | fails |
| h8 / h6 | false | false | true | false | fails |
| h8 / g6 | false | true | false | true | fails |
| h8 / f8 | false | true | true | true | passes |

Every reflected four-policy result matches. All six contexts retained; no failed
control removed or promoted to success. This outcome-informed synthetic matrix
is development evidence, not independent confirmation or universal space value.
It separates pawn restriction from independently decisive knight routes and
king-check interference with the strict legal-support counterframe.

For the qualifying context, Black's selected first move is Nf8g6 in main AND
control; White's control selects Nc3d5. Black retains access while releasing
only the c-pawn clamp gives White the same finite quiet objective. Complete
actor alternatives and full enemy policies, including failed exploratory
prefixes, are physically retained. Main White's10 eligible first maneuvers all
fail; no failure means chess loss/draw or inferior pawn/capture alternatives.

48 main/control policies:32 fresh,16 exact E261/E262 policies reused, plus4
unchanged neutral policies. Fresh queries77455ticks; collection14.963seconds
including independent replay/source-admitted reuse;234235gzip bytes. No error,
incomplete query, cap, changed root/horizon/order or after-result gate relaxation.
Exact unchanged E261 query/checker and E070 goal reused through imports.

## Callable and checks

`code/comparison.mjs` exports default-disabled inspectSpaceAccess. Input is an
exact saved main/control FEN pair and four-ply bound. Enabled missing proof
abstains; cloned/forged/cross-input capabilities reject. Private immutable
source/archive-admitted panels require all four policies AND reflected gate.
All12 saved comparisons independently reconstruct; only the h8/f8 pair in each
orientation emits C0887. Five failed contexts emit no claim/comment. Ordinary
plain fields only; explicit null, unknown options, getters and invalid roots/
bounds reject. Returned view/proof evidence is cloned.

One atomic budget accounts for the eight admitted policy node sets plus eight
comparison charges; it is certificate accounting, not fresh-search CPU cost.
Exact budget passes; short/zero withhold all view/evidence/comment and charge no
partial result. Disabled/missing panels preserve empty behavior. Comment explicitly
says QUIET supported post access in TWO actor turns, qualityClaim:false. No whole-
position advantage, durable support/safety, all-piece mobility, best move, broader
C0972/C0973 or human usefulness claim.

- First12 output reconstructions7.489seconds pass, but frozen14-test process
  times out at30seconds. Original pilot/start/SIGTERM/ETIMEDOUT retained; success
  not claimed for that process.
- Dated amendment preserves exact deep equality using concise boolean failure
  diagnostics for large forged outputs; explicit-null options corrected in both
  callable/checker without weakening the frozen tests. Same14 tests pass8.568s,
  saved pilot7.638s; no fresh chess query.
- Final displayed-label clarification adds 'quiet', preserving prior outputs and
  build snapshot. Same14 tests pass8.447s,12 output reconstructions7.943s; affected
  E261/E26217 tests pass6.516s. Complete final build closure38source/config/test
  hashes, including explicit affected tests, current matched/source/archive locks.
- Mutations cover all cells/absence on failed controls, negative OR and positive
  AND completeness, source/ownership/identity/frame/goal/reflection, output proof/
  archive/source/quality/comment/budget forgeries, strict/default/getter/unknown,
  clone isolation and exact/short/zero atomic budgets. No focused fresh queries.

Final provenance/check stdout/status/source hashes:
[evidence/focused-label/build-provenance.json](evidence/focused-label/build-provenance.json).
Full collection: [evidence/collection.json.gz](evidence/collection.json.gz).
Original failed focused run and subsequent successes remain separate directories.
Current build.json supersedes the retained pre-label snapshot; historical
build-status observations do not imply current source compatibility.

D001 test guards, authored synthetic only; no games, engines, acquisitions or
new tablebase probes. Maintained source/diff checks pass. Latest current build
status verifies158 ready batches/zero stale;535additional provisional entries,
913/1085 accepted-or-candidate (84.1%),172without ready detector code. Accepted
E082 stays378/1085(34.8%),328names/63completed studies.127separate support
occurrences remain outside detector coverage;45 strategic occurrences lack ready
code, while broader scopes also remain open for accepted/provisional entries.
The historical E26046-row prerequisite census is preserved, not rewritten.

## Resume

Next fixed-rank C0890 initiative imbalance: audit E143/E183/E204/E210 mechanisms
against genuine two-army response obligations and a common nonmating objective,
then preregister matched threat removal/context controls. Existing checking-mate
initiative/turnover proofs do not establish whole-position initiative imbalance;
do not substitute another own-piece mate proxy or forced label. Keep unsupported
strategic utility/assessment prerequisites explicit and continue other implementable
work. Full original space meaning remains unresolved despite this bounded code.

Combined original-occurrence/full-scope audit, cumulative coach regression,
independent saved semantic cross-check, history/terminal/priority/budget integration,
changed main/repeat/initially clean reproductions, arbitrary real-game adapters,
independent strategic truth and human usefulness remain required under BUILD-FIRST.
Saved synthetic comparisons are not extension behavior or final catalog acceptance.
Overall goal active; this prototype does not finish the concepts.
