# Puzzle Elo and practice

Puzzle Elo is saved on this device with learning progress. Existing lessons,
opening progress and puzzle records remain intact when upgrading.

## Results

- New players start at 1200. The first 20 rated puzzles are provisional.
- Solving the full line without mistakes or help increases Elo.
- The first wrong legal move decreases Elo immediately. The board resets to
  the current position and the player can try again. The loss stays: further
  mistakes, completing the line, retrying or reopening that puzzle cannot
  change its rating result a second time.
- A hint, revealed solution or skip also counts as one loss. The solving UI
  explains this before those controls are used. Illegal input has no effect.
- Previously rated or completed puzzles remain available for unrated review.
  Puzzle records from before this feature are not rated retroactively.
- These rules also apply to first encounters during timed challenges. Challenge
  scores remain separate from Elo. Completion after a mistake is recorded as
  recovered practice rather than a clean solve.

## Calculation and pairing

Expected score is `1 / (1 + 10 ** ((puzzleRating - playerElo) / 400))`.
The update is `K * (actualScore - expectedScore)`, rounded to whole points with
a minimum magnitude of one. K is 48 during provisional play and 24 afterward.
Beating harder puzzles earns more; missing easier puzzles costs more. Imported
puzzle difficulty ratings remain fixed.

"Solve a puzzle" selects an unseen puzzle within 200 points of the current
Elo and recalculates the pool after every result. If that band is exhausted,
it chooses among the ten nearest available puzzles. Known solutions and puzzles
already visited in the session are excluded. Optional minimum/maximum Elo
sliders and puzzle-type checkboxes constrain this pool throughout the session.
The default selection includes all ratings and types. The page shows only the
player's Elo and count of cleanly solved puzzles; pairing still uses current Elo.

Rating and the per-puzzle result are written in the same locked progress
transaction. The saved result prevents duplicate updates from repeated input,
save recovery and concurrent review tabs. Failed writes retain the existing
unsaved-progress banner and recovery path.

Check with `node --test tests/learning-rating.test.mjs` and
`npm run test:learning-browser` (isolated Chrome profile).
