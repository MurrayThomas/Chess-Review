# P005 — Fast concept curation and move-story coaching

Date: 2026-10-12. Implementation/presentation decision, not research acceptance.
Adopted locally in `6d382c1` (curation), `b72981d` (Fast coaching),
`e26ff18` (natural subjects) and `e40883a` (contributing source scopes).
No push or publication is authorized or performed.

## Problem and decision

Fast produced many correct but unhelpful routine outputs. The reply omitted useful
new attacks, defenses, cleared lines and structural consequences. Compact summaries
also omitted the E091 material-loss detail, allowing an interesting offensive
response threat to overshadow a proven loss caused by the same move.

Use the existing optional worker, staged detectors, exact input/profile caches,
main Concepts views and detected player handling. Curate Fast and its lighter
selections only; a selection containing a heavier group keeps the existing full
inspector and reply behavior. Source detector code and research acceptance remain
unchanged. This decision does not require completing the historical acceptance
or human-usefulness audit.

## Temporarily removed outputs

Settings → Concepts contains a dedicated list with reasons and execution status:

- Skip foundation/inventory tags: routine legal-move/coordinate descriptions,
  movement narration, material totals, pawn skeletons and raw army/count inventories.
  Actual move legality is still validated; captures/promotions and meaningful
  material consequences remain.
- Omit raw candidate/check/capture/tree counts and recorded-change counts. Their
  shared scans and change ledger still support mating warnings and coaching.
- Omit redundant square-color contact and line-opening aliases; retain the named
  attack or line-clearance observation and its compact evidence.
- Omit raw pawn-square change notices, phalanxes, bishop/pawn color counts and
  routine irreversible-move resets. Draw claims and concrete structure remain.
- Omit unattacked undefended units, such as starting rooks. Attacked undefended
  units remain inspectable and can support a changed-threat explanation.

These are temporary teaching decisions, not deletions or rejections of research
entries. The broader inventory and P001–P004 evidence are preserved.

## Reply policy

The presentation pass consumes the same findings and reconstructs the selected
before/after board, without running a detector, engine request or continuation
search. Piece names and colors come from that board; player ownership comes from
`S.meSide` and the existing identity-known flag, independently of mover/orientation.

Actual outcomes and mating warnings lead. Proven material losses outrank offensive
response threats. New attacks consider the actual target values, multiple targets
and missing defenders. New defense of an already attacked unit, disappearing pawn
support, cleared attacks, rook coordination, pawn tension, passers and changed
structure can provide useful quiet lessons. Category ranking does not select them.

Exact target matches let a pawn-capture certificate strengthen its attack. Two
independently witnessed effects of the same move can form one paragraph; they are
not described as causing each other. Aliases and supporting facts do not repeat
sentences. A separate urgent issue can produce a second item. Unchanged facts and
unsupported catalog/strategic claims abstain; missing identity stays explicit.

Compact E092/E096/E091 certificates retain selected capture/pressure/concession/
loss information. Event-specific guards prevent similarly named detail fields in
other, heavier detectors from being misinterpreted as these certificates. The
summary change regenerates the existing source/profile fingerprint for cache safety.

Turn-flipped opportunities describe this exact diagram. Legal availability next
turn alone cannot preserve the proof: an opponent may add a defender without
making the capture illegal. Short material calculations are explicitly bounded
and do not establish best play, lasting advantage or a winning continuation.
Research acceptance remains the E082 tracker: 378 accepted occurrences. Other
implemented provisional scopes and unavailable-input/search limitations remain.

## Validation

- Final `npm test`: 355/355 pass. This includes both player colors/opponent moves,
  perspective/orientation changes, variations, stale asynchronous results, profile
  and cache controls, combined explanations, aliases, unsupported claims, exact
  turn-flipped scope, material-loss precedence, lost pawn support, named-field
  isolation across heavier detectors and provisional/accepted source separation.
- `npm run test:layout`: 37 cases pass against the final packaged UI. Checked
  natural replies for both players, opponent defenses, shared cached results,
  expanded mixed-source evidence, the removal list, 320/390-pixel settings and
  main-panel bounds, scrolling, navigation, game replacement and both-color mates.
  Inspected the generated screenshots, including expanded source scopes.
- `npm run test:browsers -- chrome` and `-- firefox`: pass with the real local
  Stockfish 18 NNUE and Stockfish 19 Lite engines. 22 selected Fast positions per
  browser; no concept errors; view switches reuse results. Subsequent wording and
  source-scope presentation refinements pass the final production/layout suites.
- `npm run build`, `npm run verify:source` and final packaged Firefox lint pass.
  Lint: zero errors/notices, one pre-existing dynamic-innerHTML warning.

Retained local artifacts (ignored; not published):

- Final full-suite log: `scratch/curated-production-tests.log`.
- Final coach checks: `scratch/fast-narrative-tests.log` (10 focused tests).
- Chrome/Firefox real-engine checks: `scratch/curated-chrome.log` and
  `scratch/curated-firefox.log`.
- Final package: `web-ext-artifacts/release-0.3.0-Yk9D6M/release-record.json`.
- Final visual checks: `web-ext-artifacts/release-0.3.0-Yk9D6M/layout-5ICIJD/`
  (measurements and screenshots, including `coach-defense-evidence.png`).

The 22-position Fast fixture produced 163 retained findings. Chrome completed in
21.862 seconds (20.197 seconds worker work; first-response maximum 1.087 seconds).
Firefox completed in 33.469 seconds (31.980 seconds worker work; first-response
maximum 1.028 seconds). P004 measured 24.569/39.096 seconds and 461 findings on
this same authored fixture. The larger reduction is in low-value output; wall-time
improvement is modest and timings vary by machine and position. Presentation adds
no detector searches, and its focused test runs 2,200 replies across alternating
perspectives in under one second on this machine. Heavy profiles retain their
existing cost and scope, rather than receiving these Fast-only decisions.
The tests use authored legal positions/sequences and reuse existing production
regressions and retained source-identity checks. No external game corpus or
unchanged historical research experiment is acquired or rerun.
