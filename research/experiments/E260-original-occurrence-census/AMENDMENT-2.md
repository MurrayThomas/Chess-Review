# E260 amendment 2 — respect E227's registered metadata leaf

2026-10-11 after corrected census completed: all1085 entries partitioned, but
E227 closure enumeration failed on the literal `...` in an analysis.js import
comment. That file is already an explicitly bound, unexecuted category-policy
metadata leaf in E227 code/record-support.mjs and record-notes.md. This is not a
missing executable dependency. The catch replaced the closure map with {},
so its per-path 'missing' entries mean enumeration unavailable, not actual file
absence. Preserve that report unchanged; do not present these as missing files.

Freeze a supplemental auditor before execution. Read only this study's saved
metadata census; verify its retained SHA, original source bindings and current
tracker hash. Recompute E227 closure excluding ONLY the declared analysis.js
leaf, then add its normalized byte hash. Require exact equality with all40
recorded hashes and no missing imports. Verify all other eight support records
have zero issues. Emit separate corrected census and provenance, preserve all
original rows/counts/scopes and failed observations. No chess or build-status
rerun, no support contract/source edit, zero new coverage or semantic evidence.
Bind E227 recorder/record-notes and new auditor/amendments. Record actual failure
of this supplement if any; do not weaken mismatch checks. Retain focused test
output at the frozen source and source verification. Original scientific limits
and combined validation deferrals remain unchanged.
