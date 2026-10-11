# Honest process-output retention

Final provenance audit identifies a gap in frozen collector V1: execFileSync
retains stdout and throws on failure, so successful completion establishes exit0,
but success stderr was not retained. Its rawStderr:'' field is a legacy marker,
not evidence that stderr was empty. Preserve the existing130 actual WDL records,
raw stdout, exact V1 source and14passed checks; do not rewrite old output or claim
stderr was captured. Table/vendor/program byte checks and outcome origin are
unchanged; this is a process-provenance limitation, not fabricated WDL data.

Add a separate observed V2 collector using spawnSync to retain actual stdout,
stderr, exit status, signal and process error on success/failure. Leave V1/source
closure and fixed archive anchor unchanged. Use the same guarded admission,
material/legal domains, budgets, probe program/vendor and WDL model. Independent
V2 checker first validates execution metadata, then adapts explicitly to frozen
legal-panel checking; no new retrograde truth claim.

Run one new focused check: one genuine17-position V2 query equals the frozen V1
WDL panel, captures actual exit0/stderr and passes independent execution/legal
admission; mutate exit/signal/probe count and reject. Check a short-budget query
has no process/partial result. No repeat of the matrix or14checks. Retain this
new V2 panel separately for future use and bind both observation versions in the
support record. Saved V1 loader remains safe for anchored WDL reuse with the
explicit legacy-stderr limitation. Future collections use observed V2.
