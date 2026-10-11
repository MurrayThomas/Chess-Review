# E222: notation and annotated variation support

2026-10-11. Prototype, support only. All22 original occurrences C0985..C1006
retained. No build.json, detector coverage credit, accepted tracker advancement
or production integration. Current-main research-only exception, local commits
and no push. Plan99c73bb; original implementation/pilot933f753; original passing
evidence plus declared comment-number checker amendment frozene05754d.

## Callable notation contract

`code/support.mjs` exports default-disabled `inspectNotationSupport` with strict
plain {pgn,source,eventId} inputs and bounded move/depth/character options.
The single-game parser resolves canonical English SAN to legal UCI moves and
preserves full before/after FENs, actor and fullmove counters, main line, nested
and sibling alternatives, comments, numeric annotations and reported result.
Every RAV begins before its preceding move; comments/NAGs/branches share one
ordered stream. Castling, promotion, legal disambiguation and en-passant are
supported. Tag escapes, SetUp/FEN/Result consistency and supplied move numbers
are checked. Illegal/unsupported syntax rejects; budget exhaustion emits no
partial tree/export/routes. Source identifiers transport reports, not trusted
external metadata. Reported results never adjudicate a winner from the board.

Canonical supported serialization emits the seven-tag roster with explicit
unknown defaults, sorted additional tags and all branches/annotations. It
normalizes six move suffixes to numeric annotations and preserves other numeric
values without inventing position meanings. Comments containing closing braces
use semicolon output; other comments use braces. Whitespace/comment syntax and
skipped percent escape-line bytes are not lossless archival preservation. The
soft80-column target wraps between tokens; indivisible long tokens may exceed it.

All22 plain-text teaching references remain accessible. Descriptive notation
C0986 and evaluation-symbol C1001..C1006 are reference-only: no fabricated
conversion, position-quality inference or equivalence between uncertain meanings.
Main line means recorded main line, not best play; a variation is hypothetical
legal syntax, not a useful or forced continuation. All qualityClaim flags are
false. Existing detector/classifier evidence is unchanged.

## Focused evidence and interpretation checks

Eighteen newly authored synthetic inputs passed in0.253141seconds total,
maximum case0.041401seconds; ZERO searches. Initial12 focused checks passed
in1.791788seconds. Source review then identified an independent-checker gap for
comments between a move number and its move. The dated amendment preceded two
new authored controls and the second run; parser/output behavior did not change.
All18 original saved outputs independently replay unchanged. Original pilot and
initial process bytes remain frozen, with source hashes audited against933f753.
Only plan/checker/fixtures differ in the original pilot closure, as declared.

Thirteen final focused checks passed in4.849138seconds, including all supported
exports round-tripping nested/sibling branches, ordered comments/NAGs, both-side
move-number placement, black-start custom FEN, special moves, literal escapes,
31 malformed/illegal/unsupported/automatic-terminal controls, optional draw claims
declined, source/result/branch/frame/export/accounting/quality forgeries, strict
getter inputs, cloning, disabled behavior and zero/short/exact limits.

The own checker imports no own parser/lexer/serializer/classifier/reference
helpers. Its separate scanner matches the raw token stream to every branch,
replays each history and checks exported events. The bundled Chess PGN reader
provides another main-line check. Shared Chess, FEN and schema primitives limit
independence; neither path establishes annotation usefulness or metadata truth.
Automatic-terminal checks cover known local histories; arbitrary-FEN prehistory
is unavailable. Optional draw claims are not treated as mandatory endings.

`support.json` binds30 current source dependencies. `evidence/provenance.json`
retains complete evidence hashes, original/current source amendments, guarded
synthetic-data receipt and both new comment-boundary examples. Original pilot,
partial pilot and focused process output are retained rather than overwritten;
no pilot recollection or historical/cumulative suite was run.
Source verification and diff checks pass.

## Remaining work

Descriptive dialect/disambiguation/conversion, alternative import dialects,
multi-game input, variants/null moves, external-file interoperability, independent
annotation truth, human usefulness/accessibility, combined validation and separate
production promotion remain open. Near the hard input character limit, normalized
export may exceed that same import limit; an explicit export-budget policy is
still needed. This prototype does not discharge those broader format claims.

Next audit the approved engine diagnostic/reference inputs C1012..C1020 for
compatible typed support, preserving tablebase/alternative/mate capabilities and
all remaining strategic quality prerequisites. Detector coverage is unchanged.
