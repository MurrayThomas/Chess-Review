# E251 — authenticated current-position static evaluation

2026-10-11 before any new engine observation. Follows E2503d766e4.
Original C0569 static evaluation rank411. Existing E223 caller reports and
E147 finite search estimates do not provide this operation. Reuse unchanged
maintained Engine/engineConfig and exact bundled SF19 Lite/embedded network.
Current-main authorization, research-only/no push, BUILD-FIRST.

Target: callable default-disabled authenticated evaluator of the CURRENT board
without playing/searching continuations. This implements the computational
meaning of static evaluation, not universal strategic truth or a human rubric.
Do not relabel search CP, table WDL, nominal material or supplied reports.

H1: genuine pinned process produces exactly one numeric Final evaluation line
for each of four prospectively authored standard-start histories: empty,
e2e4, e2e4/e7e5, d2d4/d7d5/c1f4. Both root actors are represented. Retain
all trace text; numeric grammar requires explicit white-side marker and two
decimal printed precision. Derive exact printed hundredths without floating
rounding; expose white and requested-player perspectives. Units are engine
displayed pawn-scale evaluation, not literal material/probability/search CP.
Values/signs are NOT acceptance thresholds and are not known beforehand.

H2: genuine check history e2e4/f7f6/d1h5 and terminal f2f3/e7e5/g2g4/d8h4
withhold static score and issue NO eval command. Default-disabled, missing
capability/history, short/zero budget, source/command/raw-frame/config/input/
output mutations cannot produce authenticated observation. Caller reports are
not evidence capabilities. Strict legal full-start history and ordinary schema.
Every eligible result charges one retained eval invocation, no cache discount.

One guarded process, four evals, ZERO go/search commands. Source/config/hash/UCI
identity/options, actual commands and per-exchange raw lines, complete process
stdout/stderr/exit/signal/error are retained. Primary references:
https://github.com/official-stockfish/Stockfish/blob/master/src/evaluate.cpp
https://github.com/nmrugg/stockfish.js/blob/master/src/evaluate.cpp
https://github.com/nmrugg/stockfish.js/blob/master/src/uci.cpp
References inform command semantics only; no positions/games copied. Our pinned
binary's actual output is authoritative for format, not moving upstream code.

Freeze plan before implementation/evaluation, collector/source before decisive
run. D001 preflight and guarded entrypoints; authored synthetic fixtures only,
no acquisition/game contents/numerical fitting. First complete eval <=5seconds,
all collection <=15seconds, per exchange timeout5seconds; retain/stop on failure,
no retries or additional fixtures selected after scores. Raw output <=1MiB.
Independent result checker separately parses exact summary line and reconstructs
perspective/frame/accounting; shares source admission and legal Chess/history,
not own classifier/parser. Saved observations only in focused <=30second process.
No cumulative or inherited historical suite. Source verification/diff checks.

C0569 candidate build only if H1/H2 and focused guards pass. No C0570 dynamic
evaluation, C0572 slight/C0573 clear advantage or evaluator-internal attribution
credit. Preserve full original teaching meaning: strategic factor decomposition,
engine-independent validity, useful explanation and human utility remain open.
Also defer combined occurrence/history/terminal/priority/budget integration,
full cumulative checks and exact changed main/repeat/clean reproduction. No
accepted tracker or production promotion. Complete RESULT/INDEX/provenance/local
commit, keep catalog goal active, then audit next ranked unmet prerequisite.
