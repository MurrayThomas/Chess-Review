# E223: typed engine diagnostic and principal-variation support

Registered2026-10-11 after E222b8484dd. Previous turn made progress by committing
and indexing E222. BUILD-FIRST, approved phase6 support routing, current-main
research-only exception; local commits/no push. D001 test preflight passed.
Only newly authored synthetic reports; no engine acquisition/search or games.

Preserve ten original occurrences C1011..C1020, including both principal-variation
contexts C1011/C1018. E138's frozen parser admits a pinned MultiPV1 complete
panel, not general partial/bounded diagnostic reports. Reuse its legal-PV replay
helper, not its authenticated/completeness claims. E140/tablebase/mate/alternative
capabilities remain unchanged. NO build.json or detector coverage credit.

Callable default-disabled inspectEngineDiagnosticSupport(input,options). Strict
plain input: full fen, optional history {fen,moves}, source/eventId, declared
engine {name,version}, multiPV1..32, scorePerspective:'root-side-to-move', optional
wdlModel string, frames [{id,lines:[raw strings]}]. Reports and frame IDs are
caller declarations, never authenticated engine output. At most16frames,
32lines/frame,128total lines, each4096characters, PV1..64plies when supplied.
Options enabled, player w/b (default actual root actor), maxRecords0..128 default128,
maxPvPlies0..4096 default4096 (total across all rows). Atomic exhaustion exposes
no partial observations or routes. Default-disabled still validates input shape.

Parse supported info depth/seldepth/nodes/nps/time/hashfull/tbhits/multipv,
score cp/mate with exact/lower/upper bound, optional reported WDL triple and PV.
Preserve all raw rows; missing quantities remain null, opaque string/unsupported
rows never fabricate numeric observations. Duplicate/malformed known fields
reject. No score/PV is inferred from another row. Replay every PV with genuine
supplied history where present using E210 actual-history rules and unchanged
E138 line helper; report root-only or supplied-segment history coverage.
Requested-player sign reversal swaps score bounds and WDL order, never actors,
PV moves or MultiPV ranks. Mate distance is reported moves, not proof, and mate0
is not silently classified as a win. CP is an engine/model unit, not a literal
material balance or universal probability. Reported NPS remains distinct from
nodes/time; do not enforce an invented equality or sum cumulative node counters.

Within each caller frame, a reported menu needs distinct legal first moves,
one common reported depth and complete ranks1..min(requestedK,legalRootMoves),
with score and PV on every row. Missing/opaque/mixed-depth rows are incomplete;
duplicate ranks or repeated first moves conflict. Never borrow another frame's
row, choose newest unrelated records, re-sort scores as exact truth, infer full
legal candidate coverage from K, or claim independent optimality. Preserve all
rows and failures in their original order. Evaluation function is reference-only;
an info score is a search report, not a decomposition of the engine evaluator.

Primary references inspected2026-10-11: UCI April2006 specification
https://backscattering.de/chess/uci/ (info/score/PV/MultiPV sections), and official
Stockfish command documentation
https://official-stockfish.github.io/docs/stockfish-wiki/UCI-Protocol-and-Stockfish-Commands.html
(MultiPV, UCI_ShowWDL, diagnostic output). Format prose/metadata only, no examples,
games, diagrams or positions copied. Source-dependent models remain explicit.

Freeze implementation before decisive checks. First representative synthetic
complete-menu parse/replay/independent check<=2seconds; then cheap focused
positive/negative, both actors/perspectives, CP/mate/bounds, incomplete/conflicting
frames, partial/opaque diagnostics, strict/getter/disabled and exact/short/zero
budgets, source/frame/score/PV/result mutations. Independent checker separately
parses raw fields, replays all PVs and reconstructs menus/accounting without own
classifier/parser/score helpers. Shared schema/Chess/FEN/history limits remain.
Retain actual process outputs, hashes and guard receipt. No cumulative suite.

External engine identity/process/options/search-cycle authentication, arbitrary
dialects and diagnostic extensions, independent score/mate/WDL truth, hardware
benchmarking, evaluator internals, human usefulness, combined integration and
production promotion remain open. Keep every strategic quality prerequisite.
