# Extension performance review — 2026-10-23

Follow-up: [whole-extension audit, 2026-10-24](PERFORMANCE_AUDIT_2026-10-24.md)
records additional candidates after the two larger options below were declined.

Organiser 8.2 requests optimizations without feature loss. No search depth,
scoring rules, engine choices, animation options or puzzle content were reduced.

## Implemented

- Load the learning workspace on demand, while retaining the tiny presentation
  preference helper at review startup. Concurrent entry clicks share one load;
  failed loads can be retried. Review panels stay mounted during loading.
- Cache puzzle rating bounds and one filter selection; reuse the current puzzle
  lookup across board/input updates. Refresh caches on library replacement,
  append and session entry. Return independent filter arrays to callers.
- Replace large rating-array spreads with bounded loops, including run puzzle
  selection, to avoid temporary arrays and JavaScript argument-count limits.

## Measurements

Measured against 4de6c0a8 on this machine with the real 50,000-puzzle corpus.
Timing values are warmed Node microbenchmarks, median of seven batches of
100 operations; they are not promises of end-to-end browser latency.

| Measurement | Before | After |
| --- | ---: | ---: |
| Eager review JavaScript module graph | 29 modules / 757,659 bytes | 16 modules / 482,708 bytes |
| 100 unchanged fork/rating filter counts (3,798 matches) | 499.29 ms | 0.14 ms |
| 100 lookups of the final library puzzle | 76.37 ms | 0.012 ms |

Learning defers about 275 kB of source until it is opened. The filter cache keeps
only one selection, and the lookup cache retains one puzzle rather than building
a second 50,000-entry map. Puzzle order and random-selection rules are unchanged.

## Larger options for the user's decision

1. **Load puzzle details in smaller offline chunks.** The current corpus JSON is
   27,581,671 bytes. A compact index plus lazy detail files could reduce learning
   entry parsing and memory while retaining all 50,000 puzzles offline. This
   needs a data-format/packaging migration and content equivalence checks; it
   has deliberately not been implemented in this pass.
2. **An opt-in laptop engine preset.** The default can run four Stockfish workers,
   each with its own 16 MB hash plus engine memory. A one- or two-worker preset
   would leave more CPU available to the UI, at the cost of longer reviews.
   Existing manual worker controls remain available. Defaults are unchanged.

The older live concept prototype was already removed from runtime in organiser
8.1, taking about 2.2 MB of prototype code out of extension packages.

## Verification

Focused board/input, run, transition, learning, review and settings regressions
pass after adapting the loading test to await module acquisition. A dedicated
entry test covers duplicate clicks, retry after module failure and game changes
during loading. Source verification and lint pass with two existing warnings.
The real Chrome audit opens learning successfully; both this working tree and
the unchanged prior package stop at the same return-scroll assertion.
The two unrelated baseline test failures remain recorded in ORGANISER_PROGRESS.md.
