# E239 — witnessed history uncertainty in a declared policy risk

2026-10-11 before implementation/evaluation, parent5614618. Previous E238 turn
made indexed progress. Current queue lacks C0802; C0798/C0800/C0801 still need
human/response/rubric evidence. Current main, research-only/local commits/no push.
BUILD-FIRST, focused checks, no cumulative or long historical suite.

E189 requires an estimand, information regime, source of uncertainty and validated
reporting. Estimand: E238-style declared worst shortfall of ONE finite all-win
ordinary policy, allowing enemy repetition/50-move claims. Information regime:
the exact supplied observed history suffix, board, reversible counter, actor,
policy and declared utilities, but missing preceding reversible history. Source
of uncertainty: two positively supplied legal earlier histories matching that
same suffix/end frame, with different enemy claim eligibility after actual move.
Never turn an unresolved search into a probability or draw.

Reuse unchanged E235 admission/checker for observed policy and both completion
policies (same root/action/fixed followup). Require complete ordinary terminal
WIN leaves in all three. Other terminal outcomes or unresolved leaves withhold
this specific uncertainty scope. Two completion histories must start at reversible
counter0, contain only reversible legal moves, replay without earlier automatic
termination, cover the entire current reversible segment, and exactly include
the observed suffix with matching intermediate FEN/counters/fullmove. These are
authored possible histories, not recovered actual game provenance or a claim of
full reachability from the standard initial position. Conditional ongoing supplied
start/root remains explicit. The zeroing anchor excludes earlier repetitions of
these exact boards; prior outside-game adjudication is not certified.

At after-actual enemy turn, recompute true known occurrences and halfmove clock
for each completion. Known third occurrence or counter>=100 adds an optional
enemy draw; own optional claims can be declined. In a complete ordinary all-win
policy there is no later live enemy turn. Compute worst shortfall from the win
outcome plus that positive claim choice. Require two DIFFERENT attained risk
values for C0802. Equal histories/risks are negative controls. Output both full
histories, count/claim ledgers and risk values, their discrete attained set and
min/max enclosure, declared units and whether the caller's allowed limit lies
between them. This is witnessed nonidentifiability under the specified missing
history, not a statistical confidence interval, probability or generic uncertainty.

Prospective authored hypothesis: White Kf6 Qe5 versus Kh7, counter8/fullmove5;
actual Qg5 leaves sole enemy Kh8 and fixed Qg7#. Earlier start Kf6 Qe3 vs Kh7,
counter0/fullmove1, both histories8plies ending at the exact root:
A: Qe4 Kh8 Qd4 Kh7 Qd5 Kh8 Qe5 Kh7 (no repetition claim after Qg5).
B: Qg5 Kh8 Qe5 Kh7 Qg5 Kh8 Qe5 Kh7 (Qg5 now produces third occurrence).
Same empty observed suffix, declared win/draw/loss utilities2/1/0, targetwin,
allowed0; anticipated worst losses0/1. Both colors with replay-derived endpoints.
Stop on failed positive; retain failure and diagnose without trying diagrams until
success. Record legality/source/raw ledgers before assertions. First source+
runtime/checker<=1second, focused process<=30seconds, no proof/engine/tablebase
collection. No real games or human claims.

Controls: identical completions, draw target, changed utility scale, revealed
suffix excluding a completion, nonzero/uncovered anchor, illegal/zeroing path,
fullmove/actor mismatch, missing model/history/completions/source, non-all-win
or unresolved ordinary policy, strict/default-disabled, exact/short/zero combined
budget, source/history/count/claim/risk/interval/label mutations. Independent own
checker admits original source proofs and recomputes own histories/suffix/claim
ledgers and arithmetic without new runtime/derive imports. Shared Chess, schema
and parent checker limit independence. Retain receipts/revision/hash closure/raw
source/results/process outputs. No accepted tracker or production change.

Full earlier-game authentication/reachability/adjudication, alternative uncertainty
sources and strategic estimands, practical chances/difficulty/complexity, human
validation, combined original occurrence/history/terminal/priority/budget/claim
integration/replay and changed exact reproductions remain deferred. Full catalog
and all broader meanings remain in scope.
