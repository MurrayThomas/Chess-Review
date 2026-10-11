# E241 — reported automatic recapture/exchange with concrete adverse contrast

2026-10-11 before implementation/evaluation, parentb3cc5cc. E240 made indexed
progress extending existing scopes. Current queue lacks C0863/C0864. E108/E193
explicitly require suitable player/interaction evidence rather than inference
from moves. This batch uses an explicit caller report of the decision rule and
alternative exclusion, alongside verified chess consequences. Report authenticity
and actual private cognition remain unverified; output MUST say reported, never
claim to observe automatic thinking from a capture. Broader concepts stay open.
Current main, research-only local commits/no push, BUILD-FIRST/no long suites.

Input {decision:E233 exchange input, report?}. Report exact before-actual full
FEN, actor, eventId matching decision.id, source declared-coaching-input, policy
recapture-without-comparison|exchange-without-comparison|compare-alternatives|
unknown, alternative matching decision.alternative, and disposition excluded|
considered|unknown. Missing report abstains. Stale frame/player/event/alternative
rejects. Explicit automatic policy AND excluded alternative required; compared/
unknown reports suppress both claims despite unchanged positive mechanics.

Reuse unchanged E233 source/checker: actual captures enemy minor/major unit,
the same original actual mover has an immediate noncapturing mating alternative,
and a legal enemy recapture of that actual mover gives mate against its own king.
This certifies an available enemy resource, not forced recapture or global loss.
Provided malformed source rejects; unavailable/nonpositive source never promotes.
No search or new mate proof collection is needed: full legal moves are replayed.

C0864: exchange-without-comparison report/excluded same-piece mate plus complete
E233 contrast. C0863: recapture-without-comparison report AND the exact last
recorded enemy move captured an original-actor unit; actual capture takes THAT
newly arrived enemy capturer on its exact destination. Replay real prefix and
retain previous before/after, move, captured/mover identities and all own gates.
No invented previous move, artificial turn change, EP or promotion identity shortcut.
Distinct report policies give distinct scopes, not two labels from one report.

Prospective positive recapture fixture: original E233 board Ka/g1 Rf1 Rh1 Pf2 Ph2
Ph7 Qf7 versus Kh8 Qh6 Bg7, preceded by Black Be5xNg7. Construct earlier board
by moving Bg7 back to e5, adding White Ng7 and setting real Black turn; replay
...Bxg7 and derive full current FEN/counter before evaluation. Actual Qf7xg7 permits
...Qh6xg7#; Qf7g8# was available. Exchange-only positive reuses E233 original
authored root with empty history and explicit exchange rule. Both colors; derive
reflected history counters by replay, update report frame/actor afterward.

Controls: previous ...Bg7 WITHOUT capture (same endpoint board except counter),
empty preceding history, comparison/unknown/considered reports, absent report,
unprotected mate alternative/changed recapture source negatives from E233,
stale report/source/history strictness, disabled/exact/short/zero caps, ordinary
clones and previous identity/report/frame/source/label mutations. Original source
positive must remain genuine for report-only and previous-quiet controls. Avoid
fabricated numeric scores or response frequencies. Source and own checker must
be separate; own checker imports E233 independent checker and independently
reconstructs report and previous capture/identity gates, not new runtime/derive.

Default-disabled strict plain data; own maxWork<=8192, charge2+source.work+
133+history.length for exact prior-frame/legal-domain and report replay. Exhaustion
drops all own context/labels atomically. Parent uses original default4096 cap.
First source/runtime/checker<=1second, focused test process<=30seconds. Stop and
retain any failed hypothesis, register corrections before reevaluation. Record
raw sources/results, receipts, revisions/input/output hashes and process output.
No engine/tablebase/game acquisition, full historical suite, accepted tracker or
production changes. Shared Chess/schema/parent admission limit independence.
Authenticated interaction/private-intent causality, nonmating strategic exchange
quality, full original scopes, independent chess truth, human/real-game precision,
combined occurrence/history/claim/terminal/priority/budget/integration/replay and
changed exact reproductions remain deferred. Full catalog goal remains active.
