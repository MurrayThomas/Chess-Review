# E200 — recorded last-move changes

2026-10-11 BUILD-FIRST prototype for C1060, What changed after the last move?
Plan committed40af717 after E199c6d01a0, before decisive evaluation. Current main
under standing user checkout exception; research-only local commits/no push.

Callable `lastMoveChanges(input)` describes the last genuine recorded move into
current input.fen. It never applies input.move. Complete original-unit ledgers
retain previous captures, en-passant victims, promotion identities/types and
both castling units. Before/after armies, conventional material counts/values,
all FEN fields, history-aware library rule flags and complete both-color geometric
attack maps are retained, with exact unit/attack-edge changes. Each frame includes
complete actual-side legal moves/checks/captures; actors differ, so these lists
do not establish same-player improvement or strategic consequences.

Reused E024 history validation and E020 position/nominal-value definitions.
Audited E083/E086: their proposed-move interfaces cannot answer this recorded-last
question directly; E086's identity method is embedded, not exported. New ledger
extends that method without duplicating inherited detectors or editing sources.
Independent checker rebuilds square-map identities and coordinate/ray geometry
without runtime helpers or Chess.attackers; legality/FEN/rule library is shared.

28/28 focused checks passed2.166seconds on19 authored synthetic histories:
quiet/capture/EP, all four promotions and capture promotion, black promotion,
both castling directions/colors, final mate/threefold/fifty-move condition,
pinned defense, rights loss and previously captured identity. Strict/getter/cycle,
missing/empty/disabled, exact/short/zero atomic budgets, ignored proposed move,
endpoint/illegal/terminal rejection, cloned output and nine proof mutations pass.
No failed decisive run; no engine/tablebase search, real-game input or historical
collection/repetition. Current D001 eligibility preflight and guarded entrypoints
pass. Three compact saved EP/promotion/castling answers independently reconstructed;
plan/focused-source hashes and provenance verified. Source/diff checks pass.

Evidence: `evidence/focused-checks.json`, `evidence/examples.json.gz` (ordinary gzip
JSON; code fixtures reconstruct inputs), `evidence/provenance.json`, `build.json`.
Own full source closure27bindings; retained files approximately67KB. Explicit
admission ledger costs2L+260 for L recorded moves, not internal search nodes or a
wall-clock guarantee. Exhaustion emits no partial answer.

Supplied-start repetition only; claim flags are not actual adjudication. E024's
existing terminal contract disallows continuing after a library claimable draw.
Geometry includes pinned attackers and does not establish legal recapture/safety.
Full strategic consequences, broader history/rule contracts, human utility and
real-game precision remain open in PREREQUISITES.md. Cumulative integration,
independent inherited replay, exhaustive matrices and changed main/repeat/clean
reproductions remain deferred. No accepted/human-validity/production claim.

Machine status:378/1085 accepted unchanged;487 pending occurrences with candidate
code,119 ready batches,0 stale;865/1085 accepted-or-candidate (79.7%),220 without
candidate code. Broader original meanings are not completed by these counts.

Next: audit C1061 Are there checks, captures, or threats? Reuse exact current
legal options and full bounded tactical resource proofs; preserve unavailable
nonmating/general threats rather than asserting their absence.
