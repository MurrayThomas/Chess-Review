# Bind the actual topology parser entry — 2026-10-12

The first source-only inventory completed at82b6a11,171origins/1556owned modules,
with all active-freeze source hashes unchanged and zero candidate executions.
Post-collection inspection finds require.resolve('acorn') binds dist/acorn.js,
while the tool's ESM import actually executes dist/acorn.mjs. Preserve the first
collection as an unqualified diagnostic; do not claim its parser binding proves
exact reproducibility. Both entries belong to the same installed package, but
that is not a substitute for the actual executed module hash.

Before a separately retained corrected collection, resolve the ESM import using
import.meta.resolve and fileURLToPath; bind its actual module bytes, package and
lockfile. Also label computed namespace calls unknown unless the property is a
literal: module[variable] must not be reported as the export named 'variable'.
This corrects metadata extraction, never a detector or scientific gate. Same
complete171record inventory and zero engine/game/tablebase/detector execution.
Write evidence/topology-corrected separately, retain original topology archive.
Require all frozen module/record/source bindings before and after again; compare
unchanged origin claims, module identities, exports and chain topology between
collections, with any changed computed-call labels explicitly reported.
The already-running cumulative source freeze and test inventory remain untouched.
