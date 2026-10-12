# Guard setup amendment — 2026-10-12

First guard test at67723a1:2pass/1fail, exit1, child ESM import rejected the
Windows absolute C: path before loading the preload. Original child-result.json
copied byte-identically from the test's run directory into failure-import-url;
this provenance note is assembled after the observed failure, not a fabricated
contemporaneous run receipt. Frozen original source retained in Git67723a1.
Use pathToFileURL for Node --import. No experiment/source/archive changed.
Also distinguish read-only fs.open from mutations in the new guard, preserving
canonical reads. Keep test-generated output roots beneath parent combined output
when inherited so full-run artifacts can be collected together. No gate weakened.
Rerun all guard tests in a separately recorded attempt, then registered pilots.
