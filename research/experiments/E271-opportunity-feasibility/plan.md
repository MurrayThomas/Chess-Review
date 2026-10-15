# E271: opportunity-aware rating evidence feasibility

Registered 2026-10-15 before evaluation. Numerical research resumed by the user;
production scoring remains unchanged. This is a feasibility study, not a fit.

## Question and decision

Can existing, hash-matched SF19 complete-alternative observations support an
opportunity-aware game-level moves-only rating comparison, or only a collection
pilot? E019 proposed this distinct question after the E018 mixture failed its
uncertainty gate. Do not repeat that utility sweep or consume confirmation data.

Use D001/D002 eligibility preflight and `openResearchData(['D001','D002'])`.
Read D002 normalized metadata and the registered E008 SF19 observations through
the guarded loader. Analyze only train/validation games; do not inspect test
ratings/results or fit models. Both colors remain linked by game. Inspect player
identities only to count connected components; never export identities.

Primary feasibility gates, fixed before evaluation:

1. At least 300 development games with BOTH players each having at least ten
   nonforced, fully enumerated alternative vectors at the same 20k-node SF19
   protocol. Missing decisions count as missing, never as good moves.
2. Complete observed vectors reproduce their legal moves from actual history,
   every restricted search is bound to its move/history/configuration key, every
   score has valid CP/mate/WDL data, and elapsed times are finite/nonnegative.
3. Player-component splitting retains at least 300 independent components and
   the largest component contains at most 10% of the development games.

These are collection-readiness gates, not statistical power or rating-accuracy
gates. Report all denominators and failures. A failure stops model fitting and
triggers a reflection on acquisition cost. No cherry-picked case removal.

Secondary diagnostics: existing vectors/nonforced decisions per side; total
nonforced decisions and legal alternatives; complete-alternative query count
for full development games; reused exact query keys versus new 20k-node queries;
selected-only versus whole-game legal branching; elapsed-search distribution.
Estimate serial compute as missing unique queries times cached mean elapsed
time, disclose that extrapolation across phases can be wrong, report upper-tail
reference separately, and estimate uncompressed storage from raw query bytes.
No engine search is authorized by this study; a new collection needs its own
preregistered pilot and fresh publisher-terms check.

Budget: one guarded scan, at most two minutes of analysis after admission,
zero network acquisitions/searches/fits/labels, retained output target 250 KiB.
Smoke on first two train games precedes full audit; smoke is not a gate look.
The full audit runs once; subsequent runs reproduce the identical report.
No uncertainty interval is attached to census counts. Cost extrapolation is
planning evidence, not a representative population estimate.

## Verification and reflection

Retain exact source revision, code/input hashes, command, seed (none), dataset
receipt, engine configuration, environment and output hash. Verify counts with
an independent graph algorithm and per-side census, and exact repeat in a
separate output directory. Check all code committed before the decisive run.
Reuse one existing clean verification checkout if available; otherwise retain
a source-frozen portable reproduction and clearly leave clean replay unclaimed.
Do not copy a development repository or modify another task's working files.

At completion STOP new collection/fitting. Compare cached reuse value, measured
compute estimate and leakage components. State one recommended next experiment
and alternatives; do not launch it in this batch. Research-only commits may use
the current checkout (the E270 current-main/no-new-clone workflow); its dirty
application changes and staged video are excluded from every research commit.
No checkout switching, push, integration, reset or stash.

## Amendment, 2026-10-15, before a second full attempt

The original full attempt at source `60017b3` exceeded the 120-second analysis
budget and exited 1 before producing a census or cost report. The two-game smoke
had completed. Preserve the failed attempt in `evidence/initial-failure.json`.
No fit, complete-data gate result, rating, outcome or confirmation assessment was
exposed. Replace expensive pretty-move/SAN creation with the SAME chess library's
legal internal move generation and validated internal transitions. Explicitly
cross-check legal sets and resulting FENs against public APIs on authored normal,
castling, en-passant, underpromotion and check-evasion histories before retry.
Position-repetition counters are not used for legal moves; no draw/terminal or
history rule is inferred from the fast traversal. Full original history still
binds every cache key. Preserve the 120-second analysis limit, every game/query,
all feasibility gates, engine protocol and the original failure. Freeze changed
code before rerunning to a distinct output directory; no search-budget rescue.
