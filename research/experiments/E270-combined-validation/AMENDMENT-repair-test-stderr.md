# Repair test correction — 2026-10-12

At08546cd first repair check:11/12new tests pass; no downstream file was run,
all1623canonical artifacts unchanged. Failure was an incorrect test assumption:
a successful process with retained nonempty stderr is permitted by original
E211 observed-process contract (its checker deliberately preserves stderr rather
than declaring every warning a failure). Do not change that contract or suppress
stderr to pass. Correct the one mutation test: missing successor/failed execution
still reject; retained successful stderr remains permitted by structural checker.
Public historical admission accepts NO supplied bundle and remains fixed-SHA
archive owned, so callers cannot inject arbitrary stderr/data. All producer,
WDL, source-epoch, ownership and clone tests retained. Implementation unchanged.
Rerun all12checks and13total affected files in repair-checks-retry, same budgets.
Original failure preserved; no new chess collection or relaxed scientific gate.
