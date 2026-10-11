# E214: paired named rook-defense hypotheses did not qualify

Date: 2026-10-11. State: **inconclusive**. Both registered family gates failed;
no C0670/C0671 code-ready credit, no detector build.json, no accepted/production
change. The retained support and observations are reusable development evidence.

## What ran and what was learned

The authored Philidor barrier root, white Kd5 Pe5 Rh2 versus black Ke8 Ra6,
black to move, is exactly drawn under WDL50. `...Rb6` and `...Rg6` preserve the
draw while controlling all three king-entry squares c6/d6/e6. Quiet same-rook
alternatives `...Ra7` and `...Ra8` lose without allowing immediate rook capture.
This first phase passed its registered gate.

The registered actual history `...Rb6 e6` produces the second root with pawn e6,
rook b6, black to move and clock0. `...Rb1` draws. However, no legal quiet losing
move that stays on the sixth rank meets the no-immediate-rook-capture requirement.
`...Ra6` still draws; the losing sixth-rank rook moves permit immediate capture
or capture the pawn themselves. The retreat contrast failed. Separate legal
`...Rb7`/`...Rb8` lose without immediate rook capture, but these are outside the
registered alternative class and do not repair E214's result.

The independently authored Vancura pressure root, white Ka5 Pa6 Ra8 versus black
Kg7 Rf6, black to move, is exactly drawn. Its sole drawing legal action is the
immediate lateral check `...Rf5+`, with four intervening squares to Ka5. No quiet
rook move maintaining sixth-rank side pressure draws; the proposed waiting-phase
gate failed. Losing quiet alternatives include `...Rf1`, `...Rf2`, `...Rf3`,
`...Rf4`, `...Rf7`, none immediately capturable. Geometric side pressure alone
does not identify the required drawing action in this position.

As registered, the Philidor family stopped after its retreat failure and Vancura
stopped after its first phase failure. No reflections or Vancura second-phase
panel were collected. No different position, outcome threshold or alternative
class was substituted after inspection. All three roots were authored; external
teaching metadata supplied terminology, not example/game positions.

## Evidence and cost

[Plan](plan.md), classifier and collector were committed at `f144221` before
evaluation. Raw observations and focused replay sources were frozen at `7f93778`.

- Three complete guarded V2 panels, 20 + 15 + 19 = 54 position probes, retaining
  EVERY legal successor and actual stdout/stderr/exit/signal/process-error data.
- Collection costs: barrier 1.608 seconds, retreat 1.665 seconds, pressure 1.873
  seconds, all below the unchanged three-second limit. No cost exception.
- Six focused saved-only checks passed in 1.684 seconds: waiting-ray reconstruction,
  actual history and missing retreat contrast, sole Vancura drawing check, family
  stop rules, complete process/domain accounting and artifact mutation rejection.
  Passing checks establish faithful retained negative results, not named-defense
  acceptance. They used zero fresh probes.
- Provenance binds 78 source inputs, exact panel hashes, current T002 data/
  runtime/vendor/program identities and original preregistered plan/Git bytes.
  Structural replay checks legality/perspective; it is not independent WDL truth.
- Source verification and diff checks passed. No cumulative suite, historical
  collection repeat, fresh main/repeat/clean run or push was performed.

See [decisions](evidence/decisions.json), [focused checks](evidence/focused-checks.json),
[provenance](evidence/provenance.json) and [support record](support.json).
`code/retained.mjs` authenticates the fixed observations before source/semantic
replay; arbitrary caller-supplied in-range WDL panels remain inadmissible.

## Resume state

Coverage stays 378/1085 accepted and 879/1085 accepted-or-candidate (81.0%),
with 206 entries lacking code. Both C0670/C0671 remain unready under this study's
paired phase gates. Sustainable policies, complete phase mechanisms, isolated
causality, arbitrary-clock/repetition/DTZ outcomes, independent tablebase truth,
human usefulness and combined acceptance remain open.

Next: preregister a new phase study that explicitly treats these observations as
already-exposed development evidence. Test the Philidor back-rank retreat against
the retained nonhanging seventh/eighth-rank losses, and Vancura's immediate lateral
check against quiet pressure alternatives. Require fresh color counterparts and
appropriate independent reconstruction; do not rewrite E214's failed gates or
claim these previously inspected observations as fresh confirmation.
