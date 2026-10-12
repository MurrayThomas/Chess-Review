# Complete repaired-freeze input closure — 2026-10-12

Before creating any repaired source freeze or reconciling records, inspect the
original baseline closure. It binds the original plan/guard amendment and test
imports, but predates the later producer amendments and scoped stream-retention
attributes. The original baseline remains immutable.

The NEW repaired freeze must explicitly bind every E270 AMENDMENT*.md, the
original plan, root and E270 .gitattributes, both fixed artifact manifests,
source-epochs.json, all maintained test files and the complete imported source
closure. Reconciled affected records must bind the same current source/config
inputs, including the stdout-contract amendment. No behavioral or test limit
changes. Reconciliation and freeze code are not among the currently running
17-file retry's input bindings; verify this before editing them.

Also include the fixed complete-producer-repair/observations.json.gz as a
canonical immutable test input in the NEW freeze's archive list. It is consumed
by the new producer test/private reader and is already pinned by literal SHA.
This increases the new canonical inventory from1623 to1624; all1623original
archives remain unchanged. Do not include the new freeze itself recursively,
ongoing output logs or generated test outputs as canonical inputs. All original
source-freeze bytes, gate timing, test inventory and claims remain preserved.
