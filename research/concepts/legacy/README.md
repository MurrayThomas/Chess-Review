# Historical live concept-analysis prototype

Separated from the extension on 2026-10-23 at the user's request (organiser 8.1).
This workspace retains the detectors, provenance, worker, controls and former
review UI for inspection and reuse under the repository license. Scientific
acceptance and the original research evidence are unchanged. Nothing here is
imported by the extension or copied into release packages.

The original detector bytes and provenance hashes are preserved. `lib/chess.js`
is a bridge to the maintained chess library. `analysis.js` and the test harness
are historical fixtures, not an alternate shipped application.

Run the retained prototype checks from the repository root:

```sh
node --test --test-concurrency=1 research/concepts/legacy/tests/*.test.mjs
```

The interactive packaged-browser audit is retained as historical reference in
`release-layout.mjs`; the maintained release audit checks the current UI.
The authored learning lessons use a separate three-file rules subset under
`lib/learning/rules/`, with no registry, worker or live position scanning.

The archived generators in `scripts/` describe the historical promotion layout.
They are provenance references and are not part of the current release workflow.
