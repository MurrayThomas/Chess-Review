# Learning content sources and validation

## Puzzle library

`puzzles.json` contains 216 distinct positions from the
[Lichess puzzle database](https://database.lichess.org/#puzzles), whose exports are
dedicated to the public domain under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
Every record retains its original puzzle ID, game URL, training URL and a SHA-256
of its source CSV row. The archive URL, retrieval timestamp and imported row count
are in the JSON header. The app never downloads puzzles during use.

The importer selects six puzzles in each of three difficulty bands for each of
twelve themes, requiring at least 500 plays, popularity 85 and rating deviation
at most 100. These are source puzzle ratings, not estimated user ratings.
Positions are deduplicated by the first four FEN fields; reflected copies are
not used to increase the library count. Every setup move and continuation is
legally replayed and every position passes the existing exact-position admission
check. The content tests additionally require advertised mate continuations to
end in checkmate.

Lichess supplies the solutions and themes from its Stockfish puzzle-generation
pipeline. We do not claim independent engine reproduction of its original
40-meganode searches. As documented by Lichess, player moves are unique winning
continuations except that mate-in-one puzzles can admit multiple mating moves.
The runtime accepts every legal checkmate, and otherwise follows the retained
solution. No runtime engine evaluation is exposed while solving.

To refresh deliberately, use Node 24 and run
`node scripts/import-learning-puzzles.mjs`, then run the learning content tests.
This maintenance command downloads at most an 8 MiB archive prefix; ordinary
tests, builds and application use stay offline. A refresh changes source IDs and
should be reviewed before committing. Existing progress remains keyed by ID.

The displayed solution commentary is original to Chess Review, derived from
the actual moves and their captures, checks, promotions and tactical targets.

## Lessons and opening courses

The explanations, common mistakes, plans, annotations and composed teaching
positions in `lib/learning/content.js` are original project content under the
repository's GPL-3.0 license. Standard opening sequences are legally replayed
and matched against the existing offline `data/book.json` from
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings), CC0.
Every variation has one annotation per move. Courses teach plans for both colors;
the offline book supplies names and position recognition, not instructional text.

Each lesson records related existing concept IDs. Technical catalog variants are
grouped into familiar topics instead of presented as research-named lessons.
Rules such as castling, promotion and checkmate use the bundled chess.js. Static
pawn, file, bishop-pair and opposition facts reuse E021 features. Tactical move
exercises reuse E020/E022 mechanics and their exact bounded scopes. Recognition,
objective satisfaction and move quality are separate result fields. None of
these exercises claims an engine-ranked best move. Search exhaustion, invalid
position admission, unsupported objectives and worker failures return
inconclusive, never an incorrect answer.

These are 23 fully authored lessons, not a claim that every entry in the large
research catalog has become a lesson. Provisional research remains preserved and
is not used to certify broader strategic benefit. Further topics can be added
through the same content schema only when their instruction and validation are
complete.
