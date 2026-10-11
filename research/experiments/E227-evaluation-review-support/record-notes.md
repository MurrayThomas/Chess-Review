# E227 provenance leaf binding correction,2026-10-11

Original frozen pilot6cccb26 and amended16/16checks atdcad907 remain unchanged.
First record-support invocation exited1 after source verification passed: the
regex import scanner recursively visited analysis.js, interpreted a quoted
placeholder in its import comment as a dependency and attempted to read the
nonexistent root path `...` (ENOENT). No support/provenance record was emitted.

analysis.js is category-policy source metadata only; E227 does not execute/import
its runtime or claim to authenticate/recompute its labels. Bind its normalized
bytes as an explicit metadata leaf instead. Keep full recursive closure for every
actually executed adapter/helper/check/scoring import. Bind this explanation and
the amended recorder. This metadata-only fix does not invalidate unchanged
pilot/behavior checks; no repeat pilot, searches or full suite is justified.
