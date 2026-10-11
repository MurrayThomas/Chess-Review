# E217: defensive exchange sacrifice to technical draw

Date: 2026-10-11. State: prototype. New bounded original scopes **C0092/C0907**.
Accepted mechanics and production unchanged. General positional compensation,
strategic exchange quality, C0280 long-term compensation and C0908 positional
pawn sacrifice remain open; the latter two receive no credit here.

## Demonstrated defensive resource

Authored white Kf7 Bc1 Rg7 versus black Kh8 Rh5 Bh7, actual Rxh7+.
Complete independent legal enumeration yields exactly Rxh7+ and Kxh7; EVERY
reply captures the same offered rook. Both leave nonterminal K+B versus K+R,
two nominal points below the initial material balance, with no immediate legal
capture of the remaining enemy rook. Both authenticated WDL50 observations draw.

The registered actual quiet Ke8 is legal and nonchecking in both branches.
Both resulting enemy-turn roots draw; all31 legal enemy continuations preserve
the original bishop and enemy rook, material deficit and nonlosing actor WDL.
Exact rank/color reflection passes the same complete conditions, using Ke1.
No acceptance or quiet defense is omitted. No terminal equality, immediate
material recovery or finite mating payoff is used as positional compensation.

This certifies a defensive exchange resource for a declared technical-draw goal.
The initial six-piece position was NOT probed: its outcome, best move and whether
a sacrifice was necessary are unknown. WDL50 supplies zero-counter observations,
not arbitrary-clock/repetition adjudication. Actual capture clocks0 and quiet
clocks1/history remain intact; no FEN clocks are silently reset. This small
quiet continuation does not establish indefinite practical strategic compensation.

## Implementation and evidence

`code/resources.mjs` exports `inspectDefensiveExchange(input, options, token)`.
Input contains full FEN, genuine history, actual offered move and nominated quiet
king move. Default disabled; options `enabled` and `maxRecords`0..256, default256.
Private fixed-artifact/current-source guarded admissions authenticate outcomes;
caller panels or cloned tokens cannot supply WDL. Each saved family costs52
observation records to admit. Insufficient budget returns no branches/sources.
This counts admitted observations, not fresh computation or a search-node budget.

The separate checker imports no classifier/pilot. It independently reconstructs
all legal acceptances and quiet defenses, original identities, nominal ledger,
actual histories/FENs and actor perspectives, then checks the entire explanation.
Fixed raw artifacts, current source/table/vendor/runtime bindings and actual V2
stdout/stderr/exit/signal/error are retained. This is independent explanation
reconstruction, NOT independent retrograde verification of tablebase truth.

Plan `c4f315c`; collector frozen `b36861c` before observations; implementation,
artifacts and initial focused checks frozen `876a7d9`. Eight new guarded panels,
104 root/successor records; individual costs1.375..1.658seconds below unchanged
3second limit. No game/engine acquisition, promotion search or historical rerun.
Initial14 focused checks pass in2.053seconds with zero new probes.

Before indexing, review found the test's exclusive example writer would prevent
later combined-suite replay once its saved examples already existed. The writer
was changed to verify existing examples and create only if missing. Initial
successful checks are retained separately; the small source change justifies one
fresh focused run, without repeating any tablebase collection. Final timing and
source fingerprints are recorded in `evidence/focused-checks.json` and provenance.
Checks cover both colors, all acceptance/defense branches, strict/history/getter
inputs, disabled behavior, atomic exact budgets, source/ledger/frame/outcome
mutations, ordinary quiet rook moves and immediate bishop-recapture negatives.

## Remaining work

Full original strategic meanings, other goals/material/configurations and
declined offers, initial-position comparisons, persistent compensation,
independent outcome truth and arbitrary-clock/DTZ claims remain unresolved.
Combined original-occurrence/regression/interaction/history/budget semantic
checks and changed main/repeat/clean reproductions remain deferred under
BUILD-FIRST; real-game precision, human usefulness and promotion remain open.

Next: inspect ranked remaining strategic prerequisites for persistent
compensation and positional pawn sacrifices; reuse complete certificates when
their actual scope suffices, otherwise preregister a distinct cheap hypothesis.
Continue current user-authorized main checkout, research-only local commits/no push.
