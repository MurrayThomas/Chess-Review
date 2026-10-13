# Learn with Chess Review — objective and progress

## Implementation tracker

Started 2026-10-14. This file travels with the repository so work can continue on another computer. Learning progress stays local to the browser; this development tracker records implementation progress.

- [ ] Stage 1: Isolated learning workspace, review-state preservation, home and navigation.
- [ ] Stage 2: Structured lessons, exact-scope validation and exercise feedback. Content and pure validators implemented: 23 lessons, 216 puzzles, 12 opening courses / 24 lines. Content and progress tests pass; UI integration remains in progress.
- [ ] Stage 3: Verified varied puzzle library, practice, timed challenges and meaningful totals.
- [ ] Stage 4: Instructional openings, variations, practice from both sides and bookmarks.
- [ ] Stage 5: Responsive visual review, interaction checks, regression checks and release packaging.

## Original objective (verbatim)

I want to expand Chess Review beyond reviewing games by adding a dedicated learning experience called “Learn with Chess Review.”
The current concept experience isn’t achieving what I wanted, but we’ve invested substantial work in the concept catalog, detectors, and proofs. Preserve that work and reuse the relevant parts as the foundation for interactive lessons and exercises.

1. Entry point and learning workspace
Add a “Learn with Chess Review” button at the bottom of the review layout, to the right of the backward/play/pause/forward controls and below the Engine panel.
Clicking it should open a spacious learning workspace over the existing review interface, with a polished, subtle transition. It should feel like another part of Chess Review, with enough room for a board, lesson content, and navigation.
Provide a clear “Back to review” action. Preserve the current game, selected move, board orientation, and review state so the user can return exactly where they left off.
The learning home should offer three main destinations:
- Puzzles
- Chess Concepts
- Openings
Also show useful personal progress and a “Continue learning” action for unfinished activities.

2. Chess Concepts: understand, observe, practise
Build a searchable lesson library from our existing concept catalog, organized into understandable categories such as fundamentals, tactics, mating patterns, pawn structures, positional play, defense, and endgames. Arrange lessons from introductory to advanced, with prerequisites where useful.
Use familiar chess terminology in the interface. Related detector variants should become one coherent lesson where appropriate, rather than separate lessons with technical research names.
Each lesson should include:
- A clear explanation of the concept and why it matters.
- Interactive board examples with short explanations, move navigation, and selective arrows or square highlights.
- Common mistakes and examples showing when the concept does not apply.
- Exercises where the user identifies, creates, prevents, or executes the concept.
- Helpful feedback explaining why their answer works or what they missed.
Match the exercise to the concept. A fork might require playing a move; a weak square might require selecting a square; a pawn structure might require identifying its defining features. Avoid forcing every lesson into “find the best move.”
Reuse our existing detectors and proofs to validate exercises within the exact scope they support. Check concept recognition separately from move quality and the exercise’s objective. Accept alternative valid answers when the exercise allows them. An inconclusive or unsupported validation result must not be treated as an incorrect answer.
Track lesson progress as not started, in progress, and completed, and let users revisit exercises they struggled with.

3. Puzzles: regular practice and timed challenges
Create a substantial, varied puzzle library with verified legal positions, solutions, and explanations.
Provide filters for difficulty, tactical theme, game phase, and solved/unsolved status. Allow users to practise a specific theme, play a mixed selection, or revisit previous mistakes.
Regular practice should offer hints, retries, a solution reveal, and an explanation connecting the solution to its underlying concepts. Keep engine evaluations and solution arrows hidden until appropriate.
Add three timed challenge modes:
- 1 minute
- 5 minutes
- 10 minutes
The objective is to solve as many puzzles as possible before time expires. State the rules before starting, including how mistakes, skips, and hints affect the result. Start the clock only when the first puzzle is ready, and ensure loading or validation delays do not unfairly consume time.
Afterward, show puzzles solved, mistakes, accuracy, personal best, and an option to review missed puzzles.
Persist progress locally. Distinguish unique puzzles solved, repeat completions, and assisted solutions so the totals remain meaningful.

4. Openings: learn the ideas behind the moves
Create a searchable opening library organized by opening family, variation, and playing color. Reuse our existing offline opening book where suitable, while recognizing that opening names and move sequences still need instructional content.
Each opening should provide:
- An interactive main line and selected important variations.
- Explanations of the moves, typical plans, and resulting pawn structures.
- Common mistakes and thematic tactics.
- Practice from either side, with automatic opponent replies.
- Saved study progress and optional bookmarks.
Prioritize understanding over memorization. Handle transpositions where supported, and distinguish a move outside the selected line from an objectively bad move.

5. Visual quality and interaction
Follow Chess Review’s existing typography, colors, panels, board themes, piece sets, and user preferences.
Make the experience feel premium through careful spacing, readable content, responsive boards, and consistent interaction. Use restrained animations for workspace transitions, navigation, moves, feedback, and progress updates. Respect reduced-motion preferences.
Give the board and learning content visual priority. Every visible control should work, and loading, empty, error, and completion states should receive the same care as the main screens.
6. Implementation and content quality
Build this in coherent stages, beginning with the workspace and a complete path through each destination, then expanding the libraries.
Keep lessons, puzzles, opening content, validation, and progress storage structured so we can add material without rebuilding the interface. Reuse existing chess rules, board behavior, engine infrastructure, and concept logic where appropriate.
Use original or suitably licensed content with recorded sources. Do not inflate the libraries with duplicates, unverified exercises, generic filler, or unfinished lesson pages. Report what is fully usable and what still needs content or validation.
The intended result is a learning experience where users can understand chess ideas, practise them on the board, and see their progress, all within the familiar Chess Review environment.

Please make sure to do a .md file that both saves this prompt and tracks our progress so that i can continue from other pc's in the future.

