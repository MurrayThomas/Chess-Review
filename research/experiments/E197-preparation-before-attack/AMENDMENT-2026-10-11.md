# Focused test expectation repair

Initial focused run passed15/16checks (test duration17.936seconds, process18.051).
The strict test wrongly
expected a valid zero-move history rooted in the current middlegame FEN to throw.
The runtime correctly returns standard-start-prerequisite, because the legal
history is valid but not orthodox-start opening evidence. No detector, gate,
source panel, fixture or budget changes. Preserve original full test source and
initial run before the correction. Replace only that throws-case with an explicit
standard-start-prerequisite/no-claim assertion checked independently. Rerun only
the affected strict test; do not repeat15 unchanged passed checks. Verify the
exact source replacement and original hashes to establish unchanged other tests.
One repaired test plus15 prior unchanged passed checks is focused development
evidence, not a full final-source run or combined acceptance/reproduction.
