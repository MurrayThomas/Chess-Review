# E240 — covered reversible history and current/intended draw-claim risk

2026-10-11, BUILD-FIRST prototype extending E238 C0797/C0831. ZERO additional
covered occurrences. Plan44bc9f9, classifier/checker frozen4a2bd24; reference
correction frozen49fb6d1. Current main, research-only local commits/no push.
Original E238/E239 files and evidence remain unchanged. Numerical work paused;
accepted tracker and production unchanged.

E238 adds an unknown-repetition draw whenever history is not standard-start
complete. The new inspectCoveredRisk removes that allowance when the current
reversible segment is fully recorded: after-actual reversible counter <= number
of supplied history plies INCLUDING actual. Irreversible pawn/capture resets
exclude matching earlier boards. Every row exposes the actual counter, recorded
length and coverage. Unknown segments remain conservative; current/intended
known claims are included independently of coverage. This remains conditional
on an ongoing supplied custom start/history and trustworthy counters, not actual
game authentication, full standard-start reachability or prior adjudication.

Known claims include CURRENT third occurrence/fifty-move state and EVERY legal
INTENDED enemy reply that would create either. Each intended reply retains full
FEN, exact known occurrence count, counter and claim basis. Mate/automatic
termination after actual ends before the enemy gets a claim choice. Own optional
claims may be declined for the specified followup. Complete parent ordinary
terminal leaves remain unchanged; unresolved policies still withhold risk.
Explicit utility/target/loss-limit, worst-shortfall arithmetic and strict
actual-within/reference-outside management gate are retained from E238.

Authored E239 root Kf6 Qe5 versus Kh7/counter8/fullmove5: actual Qg5, fixed Qg7#.
Fully supplied no-repeat history removes E238's unnecessary draw allowance:
actual shortfall0 versus reference1, declared allowed0, management true. Fully
supplied repeating history keeps shortfall1 because actual Qg5 gives current
third occurrence. Empty/one-ply suffixes stay conservative and withhold management.
A zero-counter root already anchors the reversible segment and also removes
unnecessary unknown-history allowance. Both colors agree; reflected odd suffix
starts are derived from complete reflected history to preserve fullmove counters.

New registered intended-claim example starts Kf6 Qe3 versus Kg8, counter0:
Qg5+ Kh8 Qe5+ Kh7 Qg5 Kh8 Qe5+ Kh7. After actual Qg5 the CURRENT enemy frame is
only second occurrence, but intended ...Kh8 creates third. Complete history must
still retain risk1. Current-only inspection would miss this claim; independent
runtime/checker ledgers and mutations explicitly exercise it. Root counters98/99
separately test intended/current fifty claims, with uncovered history retained.
Original E238 immediate-mate versus mixed-policy examples preserve their decisions.

One registered reference hypothesis failed and is retained. Original Qf5+ with
fixed Qg6 permits ...Kg8, which remains live after Qg6; the first pilot correctly
abstained as unresolved. The dated reference-correction instead prospectively
places queen on g3 to cover g8: Qg3 leaves ...Kh6/...Kh8, and fixed Qg6 gives mate/
stalemate. The corrected exact hypothesis passed once; no classifier/checker,
actual/history/claim hypotheses, gates or budgets changed. Initial evidence/
started.json and pilot-failure.json remain untouched. Final outputs are in
evidence/reference-correction/, hash-bound alongside the failed original.

Final guarded authored pilot26cases passed3.2455088seconds total; first source+
runtime/checker0.2934305seconds, below registered1second. All9focused checks
passed9.0835844seconds (test duration8.9715962). Includes both colors/covered/
uncovered/zero anchors, current/intended repetition and fifty claims, old E238
semantic comparison/decisions, unresolved/missing/disabled/strict/getters/source
refusals, source+history+EVERY-reply logical charging, exact/short/zero atomic caps,
ordinary clones/nonmutation and coverage/current/intended/reply omission/clock/
risk/label/work forgeries. No cumulative or long historical suite ran.

Own checker independently enumerates legal enemy replies and reconstructs known
history counts/coverage/current/intended claims, risk and labels without importing
new runtime/derive. Both admit frozen E235 through its independent checker and
share Chess/schema, limiting independence. Saved replay rechecked all26rows before
registration. Six evidence files total557417bytes,33recursive source bindings,
full raw sources/results, process stdout/stderr, receipts/revisions/input/output
hashes and original failed reference. Slight soft-size overrun preserves complete
branches/diagnostics. Every executable entry point gates D001; authored synthetic
inputs only, zero fresh searches/engine/tablebase/game acquisition. Source
verification and final diff checks pass. No numerical fitting or production work.

Deferred: broader risk/management and strategic meanings, adverse/adaptive policies,
authenticated/validated human utility, calibrated practical probability, full
earlier reachability/adjudication, independent chess truth, human/real-game utility,
combined original occurrence/absence/history/claim/terminal/priority/budget/
integration/replay and changed exact reproductions; separate promotion.
Full catalog goal remains unfinished. Next: return to current needsCodeIds and
audit implementable strategic families without inventing human difficulty or
practical probabilities from these exact finite policies.
