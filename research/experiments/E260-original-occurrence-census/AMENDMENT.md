# E260 amendment — nullable completed-group queue metadata

2026-10-11 after first run at frozen 1f3557d stopped in census construction.
Accepted catalog groups may have proposedWork:null; that field is scheduling
metadata, not occurrence membership. The auditor incorrectly dereferenced it.
No census result/counts were emitted; preserve evidence/started.json and
failed.json. Use optional phase/rank for already completed groups; continue
requiring phase5 for every genuinely unbuilt strategic occurrence. Add a focused
mixed-group regression with absent scheduling metadata on an accepted group.
No original text/status/claims or chess inputs change. Freeze repaired source
before one rerun under evidence/corrected/ with the same budget and gates.
