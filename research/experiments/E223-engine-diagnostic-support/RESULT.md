# E223: typed engine diagnostic and principal-variation support

2026-10-11. Prototype, support only. Ten original occurrences C1011..C1020,
including both principal-variation contexts C1011/C1018. No build.json, detector
credit, accepted tracker advancement or production change. Current-main
research-only exception; local commits/no push. Plan c1f2249, implementation and
decisive synthetic checks frozen5d61e04. Existing E138/E140/E210 files unchanged.

## Callable support and explicit source limits

`code/support.mjs` exports default-disabled `inspectEngineDiagnosticSupport`.
Strict full-FEN inputs carry optional genuine history, report source/event IDs,
declared engine/version, requested MultiPV and separate caller frames. Typed
diagnostics preserve raw lines, missing fields, depth versus selective depth,
nodes, NPS, time, hash occupancy, table hits, CP/mate units, score bounds and
optional labelled WDL output. Opaque strings and unsupported rows remain visible
without extracting embedded scores. Malformed known fields and illegal PVs reject.

All observations have authentication:'caller-report-only'. Engine names and
frame boundaries are not independently authenticated. CP is not literal material
balance; reported NPS is not a benchmark or an exact nodes/time equation.
Cumulative counters are never summed across rows. Requested-player perspective
reverses score sign, bound direction and WDL ordering without changing root actors,
legal moves or candidate ranks. Mate0 remains a reported score without an invented
win/proof. No reported mate or WDL becomes independent outcome truth.

Unchanged E138 legal-PV replay and E210 history rules are reused. Every supplied
PV is replayed with its own root/history; full SAN/FEN/actor/terminal flags remain
available. History coverage is labelled root-only or supplied-segment. Optional
draw claims are not mandatory endings, and arbitrary earlier history is not
invented. No engine or tablebase search was performed or regenerated.

Each caller frame qualifies as a reported menu only with complete distinct ranks,
distinct legal first moves and common reported depth, with score/PV on every row.
Mixed depths, missing or unsupported rows remain incomplete; repeated ranks/first
moves conflict. Rows from different frames never combine. Menu order is reported
rank order, not a new score ranking, complete legal breadth or proof of optimality.
Evaluator internals C1013 remain reference-only. All ten teaching contexts and
qualityClaim:false boundaries are preserved.

## Focused evidence

Twenty authored synthetic cases passed in0.175642seconds total. First complete
two-candidate menu plus independent check took0.055291seconds, also the maximum
case time, below the unchanged2second representative gate. Twelve focused checks
passed in1.778662seconds, zero searches. Complete/partial/conflicting/mixed-depth
and separately framed reports, both root actors/requested perspectives,
CP/mate0/bound/WDL interpretation, literal unsupported strings, large safe
counters, supplied history, mate/en-passant/promotion/castling PVs,19 malformed
diagnostic controls, getter/schema/history failures, default-disabled and
exact/short/zero budgets, cloning and source/score/bound/WDL/PV/menu/accounting/
quality forgeries are covered. All20 saved outputs independently replay unchanged.

The own checker imports no own parser/classifier/score helpers. It reconstructs
raw fields separately, replays legal branch histories and derives complete
output/menu/accounting independently. Shared Chess/FEN/schema primitives limit
independence. It checks report interpretation and legality, not engine truth or
human utility. No historical or cumulative regression suite was run.

`support.json` binds31 current source dependencies. `evidence/provenance.json`
retains source/evidence hashes, exact frozen revision, guarded synthetic-data
receipt and reference metadata. Pilot/start/partial records and actual focused
process stdout/stderr/exit/signal/error are retained. Primary UCI/Stockfish
references informed format semantics only; no games, examples or positions were
copied. This is exposed synthetic development, not fresh real-game confirmation.
Source verification and diff checks pass.

## Remaining work

Executable/process/options/search-cycle and frame authentication, broader UCI
extensions/variant/interoperability handling, independent score/mate/WDL truth,
hardware/evaluator assessment, human usefulness, combined validation and separate
production promotion remain open. Typed reports do not discharge general strategic
evaluation, advantage, planning or practical-quality prerequisites.

Next audit remaining strategic prerequisites against the newly available typed
inputs, alongside approved competition-context support. Preserve the unresolved
broad meanings and use compatible implementation batches with focused checks.
