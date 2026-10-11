# E224: declared competition context and score-table support

Registered2026-10-11 after E223126437c. Previous turn made progress by committing
and indexing E223. BUILD-FIRST/approved phase6 support routing; current-main
research-only exception, local commits/no push. D001 test preflight passes;
only authored synthetic competition metadata/results, no acquired games.

Audit: E179/E180 still require independently validated strategic-quality targets
or suitable complete outcomes. E223 transports reports, not those targets.
E219's C0908 positional pawn-offer/nonmaterial-benefit requirement remains open.
No numerical calibration or strategic definition is weakened by this support work.

Preserve12 original occurrences C1047..C1058: tournament, round-robin, Swiss,
knockout, match, tiebreak, standings, norms, CM/FM/IM/GM. Implement default-disabled
inspectCompetitionSupport(input,options), NO build.json/detector credit. Formats
are explicit declarations, not inferred from boards/pairings. No pairing generator,
knockout advancement/champion, official final placing, title award or norm approval.

Strict plain input has source/eventId, players (id/name, optional reported titles),
games (id,round,slot,white,black,result,played), optional byes and normReports,
optional event {name,format}, scoring and tieBreak. Formats round-robin/swiss/
knockout/match/other. Games use white-win/black-win/draw/pending/cancelled. Pending
and cancelled are unplayed and award no points. Completed unplayed games remain
distinct from played games; no inferred flag/resignation/result cause. A player
may appear only once per round/slot including byes; separate slots support
multi-game matches. Unique IDs and all participant references required.

Scoring declares integer win/draw/loss units and denominator1..1000; never assume
1/half/0 when absent. Bye points are explicit integer awards in that unit, not
automatic wins. Bounded exact integer totals, played-game/win/draw/loss counters
and full per-player award ledger. Display declared-score-table ranks only, never
automatic knockout winners or official standings. Missing scoring yields an
unavailable table while preserving reports. Tiebreak fields are caller-supplied
integer-scaled columns (key,label,order higher/lower), values per player, source/
eventId and model name. Do not silently calculate Buchholz, direct encounter,
Sonneborn-Berger or adjustments for unplayed games.

Rank primary scores descending, then apply declared columns hierarchically within
each still-tied group. If ANY member lacks the next needed value, stop that group's
split and retain a shared rank; never skip the missing column or use ID/alphabet
as a hidden tiebreak. Other already-separated groups may continue. Competition
ranks account for all tied players; display IDs within ties use lexical order
only. Norm/title reports keep source/status and assessment:null. Unknown title
codes remain reports. No rating cutoff, norm count or evaluator certifies a title.

Shape limits64players,128games,64byes,64norm reports,8tiebreak columns. Options
enabled,maxPlayers0..64(default64),maxRecords0..256(default256), counting games+
byes+norms. Atomic cap exhaustion exposes no modules/routes; never drop players
or report a partial successful table. Input/result getters/custom prototypes and
unsafe/fractional/bound-overflow fields reject. Text is plain data, not HTML.

Primary reference metadata inspected2026-10-11:
https://handbook.fide.com/chapter/TieBreakRegulations032026 (effective2026-03-01)
and https://handbook.fide.com/chapter/B012024 (title regulations effective2024).
References motivate explicit event-specific policy/versioning; this contract is
not an implementation of FIDE tie-break or title regulations. No source examples,
games, positions or player records copied. No external service writes.

Freeze before decisive checks. First representative complete score-table plus
independent reconstruction<=2seconds. Focused synthetic positive/negative checks:
all formats, played/unplayed/bye/pending/cancelled, exact custom units, multiple
slots, resolved/shared/missing hierarchical tie values, reported titles/norms,
strict references/duplicates/collisions/getters, default disabled and exact/short/
zero caps, source/award/rank/quality forgeries and cloning. Independent checker
recomputes each player's totals by filtering raw records and derives ranking groups
separately; no own classifier/standings/ranking helpers. Shared strict schema
limits independence. Retain actual process outputs and source/evidence hashes.
No engine search, full cumulative suite or historical matrix.

External event/provenance authenticity, pairing/format verification, authoritative
tie calculations/official placings, title/norm qualification, human usefulness,
combined integration and separate production promotion remain open.
