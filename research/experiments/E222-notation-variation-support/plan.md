# E222: notation and annotated variation support

Registered 2026-10-11 after E2211c31876. BUILD-FIRST, approved phase6 support
routing and current-main research-only exception; local commits/no push. The
previous goal turn made progress by indexing and committing E221. No running
collection remains. D001 test preflight passes; only authored synthetic PGNs
will be used. Existing notation serializers do not preserve this shared annotated
variation contract; no existing frozen result will be changed.

Preserve all22 original occurrences C0985..C1006. Build callable default-disabled
single-game PGN import/export, strict canonical SAN/legal-UCI correspondence,
full FEN and move-number frames, nested alternative variations, comments and
numeric/suffix annotations. Reference descriptions preserve descriptive notation
and position-evaluation glyphs without pretending to implement their parsers or
validate their claims. NO build.json, detector credit or production change.

Primary format reference: Steven J. Edwards PGN specification, sections7,
8.1,8.2.2..8.2.6,9.7,10,16.1, inspected2026-10-11 at
https://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm . Reference prose
and metadata only; no reference games/positions/examples may be imported.
RAV branches start before the preceding move. Preserve numeric annotations0..255
and comments as reports, never quality findings. Six suffix symbols normalize
to numeric annotations. Never equate a reported result with board adjudication.

Input {pgn,source,eventId}, strict plain data, no getters/custom prototypes;
nonempty provenance identifiers label caller reports, not trusted external truth.
Options {enabled,maxMoves,maxDepth,maxChars}; defaults false,256,8,65536;
maxMoves0..256,maxDepth0..8,maxChars0..65536. Hard input bound65536 UTF-16 code
units. Atomic budget failure exposes no tree/export/reference routes. Preserve
all legal branches and annotation order; never truncate an apparent success.
Required terminal result, exact optional move numbers, unique tags, tag/string
escapes, brace/semicolon comments, column-one percent escape lines, SetUp/FEN
pairing and Result consistency. Canonical English SAN only except six annotation
suffixes; noncanonical SAN/import dialects, multi-game input, variant/null moves
and malformed constructs fail explicitly. Reject continuation after automatic
terminal states, with branch-specific histories; optional draw claims may be
declined. Arbitrary-FEN prehistory is unavailable, not invented.

Canonical supported export emits seven tags with explicit unknown defaults,
additional tags sorted, escaped strings, bounded wrapped movetext, numeric
annotations, brace comments and all nested RAV. Preserve comments and reports
semantically; whitespace/comment syntax and skipped escape-line bytes are not
lossless archival preservation. Display/accessibility descriptions are plain
text, not HTML. Descriptive notation remains reference-only pending dialect and
disambiguation policy; no fabricated conversion.

Focused gates: authored positive/negative fixtures for both actors, custom
black-to-move fullmove, nested/sibling RAV branch attachment, annotations/comments,
escaping, special moves, strict ambiguity/check suffixes, malformed tags/results,
all zero/short/exact budgets, default-disabled, mutation and output-isolation.
Independent checker separately replays all branch histories and compares a raw
token/event ledger plus main line through the existing Chess PGN reader; shared
Chess/FEN primitives limit independence. Own parser/serializer helpers must not
be imported into checker. First representative full parse/export/check<=2seconds;
then focused checks only, no engine searches or cumulative historical suite.
Commit implementation before decisive run. Preserve failures and amend openly.

Retain complete small fixture outputs, process status, source/evidence hashes,
guard receipt and support.json coverageCredit:false. Broader dialects, descriptive
conversion, semantic quality of annotations, external metadata truth, real-file
interoperability, human usefulness, combined validation and promotion remain open.

Implementation clarification before evaluation: preserve comments, NAGs and RAVs
in one ordered annotation stream per move. Wrap only between tokens at a soft
80-column target; indivisible long comments/tags may exceed it. Semicolon comments
containing a closing brace export as semicolon lines rather than losing text.

Post-focused source-review amendment2026-10-11:18 pilot cases and12 checks passed.
The raw-token checker did not allow a comment between a move number and its move,
although the parser supports that placement. Before further checks, add two
authored placements (before the first move and before Black's move), separately
consume and validate their number tokens, and preserve all old outputs unchanged.
Audit original source933f753; only plan, checker and fixtures change in its pilot
closure. Retain the original focused process record and write a distinct second
focused record. No pilot collection is repeated. Near the hard input character
limit, normalized export may exceed that same import limit; this provisional
interoperability boundary remains explicit pending an output-budget policy.
