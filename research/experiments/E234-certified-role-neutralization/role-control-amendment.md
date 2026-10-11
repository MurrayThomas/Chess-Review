# Strengthening the distinct-unit negative control

2026-10-11 after88b2607. Revised26case pilot passes; focused checks11/12 pass.
The strong assertion that BOTH mates pass in the distinct-unit control fails:
WhiteNf4 blocks the actual ...Qxf7 file, so it was correctly negative but did not
isolate named-unit identity. Retain evidence/revised/pilot.json and
focused-failure.json unchanged. Candidate runtime/checker and tests unchanged.

Prospective replacement of this negative ONLY: WhiteNf8 plus WhiteRh2, remove
the added Nf4; quiet ...Qa5 instead of ...Qh4, threat Nf8g6# instead of Nf4g6#.
Rh2 should protect Ph7 after the queen leaves the h-file, while Pg2 prevents Rh2
from interposing on the f-file after actual ...Qxf7#. This requires actual mate,
other-unit threat mate, captured target and same actor quiet mover all true;
named-target role remains false. Preserve the unchanged stronger test, not just
negative status. Reflected endpoint replay remains in place.

This repairs a separating fixture, not a failed detector-positive hypothesis;
the original positives passed both retained pilots. No candidate gate, budget,
expected label or assertion relaxation. Freeze and rerun only this tiny own
pilot/focused suite under evidence/role-control/, keeping both prior failures.
Bind this amendment along with the first. No searches or historical collection.
