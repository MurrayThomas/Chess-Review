# E224: declared competition context and score-table support

2026-10-11. Prototype, support only. Twelve original occurrences C1047..C1058
retained. No build.json, detector coverage credit, accepted tracker change or
production integration. Current-main research-only exception; local commits/no
push. Plan664c38e, implementation and decisive checks frozenac38847.

## Strategic prerequisite audit and chosen support scope

E179/E180 still require independently validated quality/uncertainty targets or
suitable complete outcomes for their unresolved strategic concepts. E223's typed
reports do not supply this evidence. E219's C0908 positional pawn-offer with
nonmaterial benefit remains uncredited. No threshold or broader definition was
changed. The approved phase6 competition/reference route is independently
implementable while these strategic requirements remain in scope.

`code/support.mjs` exports default-disabled `inspectCompetitionSupport`.
Strict bounded plain inputs carry caller report IDs, roster, reported event
format, games, explicit scoring, optional byes, ordered tie-break values, title
reports and norm reports. Every source is labelled caller-report-only. All
formats remain declarations; schedule/pairing validity is not inferred.

Exact integer score units retain their declared denominator. Each player's full
award ledger distinguishes played games, completed unplayed decisions, explicit
byes, pending games and cancellations. Missing scoring leaves the table unavailable
rather than assuming standard points. Byes do not become played wins; pending and
cancelled games earn no points. Separate round/slot identifiers support multi-game
matches while duplicate participant slots and unknown references reject.

Primary-score groups are refined by caller-declared numeric tie columns in order
and in their declared direction. If any member lacks the next needed value, that
group remains tied; later columns are not substituted. Already-separated groups
continue independently. Shared competition ranks account for every tied player;
lexical ID display order never breaks a tie. No authoritative Buchholz/direct-
encounter/Sonneborn-Berger or unplayed-game policy is invented.

The result is a declared-score table, not official final standings. Even a
reported knockout yields champion:null and officialPlacement:null. Titles,
including unknown codes, retain their reports and assessment:null. Claimed,
reported-certified and rejected norms likewise remain unassessed. No title,
norm approval, match victory or advancement is awarded by this adapter.

## Focused evidence and source accounting

Eighteen authored synthetic cases passed in0.019713seconds total. The first
complete score table and independent reconstruction took0.003869seconds, also
the maximum case time, below the unchanged2second gate. Twelve focused checks
passed in1.513369seconds, zero searches. All18 saved observations independently
replay unchanged. No real event/player/game data or reference example was acquired.

Checks cover exact/custom score units, all declared formats, played/unplayed/
bye/pending/cancelled distinctions, multiple slots, resolved/shared/hierarchical
missing tie values, unassessed title/norm statuses, participant/ID/slot collisions,
strict numeric/schema/getter controls, disabled and zero/short/exact budgets,
source/award/rank/missing-data/champion/quality forgeries and output isolation.
Atomic cap failure emits no partial view or routes.

The independent checker filters raw records per player and refines ranking groups
iteratively; it imports no own scoring/classifier/ranking helper. Shared schema
validation limits independence. Arithmetic and interpretation checks do not
establish event authenticity, FIDE conformance or practical usefulness.

`support.json` binds22 current source dependencies. `evidence/provenance.json`
retains source/evidence hashes, exact frozen revision, guarded synthetic-data
receipt and primary reference metadata. Complete pilot/start/partial records and
actual focused stdout/stderr/exit/signal/error are retained. FIDE2026 tie-break
and2024 title references informed explicit policy/version boundaries only; this
is not an implementation of those regulations. No cumulative/historical suite
or engine search was run.
Source verification and diff checks pass.

## Remaining work

External event/player/report provenance, live platform adapters, pairing/format
verification, authoritative tie-break calculations, official placings, knockout/
match advancement, title/norm qualification, human usefulness/accessibility,
combined validation and separate production promotion remain open. The full
teaching catalog and unresolved strategic claims are preserved.

Next inspect approved training-activity/thinking-skill support for coherent
exercise/session contracts, retaining the distinction between recorded answers
and unobservable mental states. Continue checking strategic prerequisites when
newly available evidence can satisfy them; do not relabel reports as validation.
