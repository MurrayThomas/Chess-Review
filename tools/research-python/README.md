# Frozen research Python runtime

The E211 tablebase observations and dependent studies bind the original Windows
Python executable's SHA-256, executable path, and complete version string.
Their saved replay currently requires that original runtime, including for tests
that perform no fresh probes. A generic Ubuntu Python installation cannot meet
those identities. Replacing the runtime identity in saved evidence would rewrite
the observations and invalidate downstream source bindings.

`python.exe` retains the 106,448-byte, OpenAI-signed CPython executable from
Codex primary runtime 26.1007.11041, win32-x64. Its existing evidence hash is in
`runtime.json`. It is redistributed under the included Python license. The
matching upstream Python Build Standalone archive supplies the DLLs and standard
library; its release URL and SHA-256 are pinned separately. The executable's
signature changes its hash from the upstream executable, so merely downloading
the upstream archive is insufficient.

`scripts/setup-research-python.ps1` verifies both hashes and the complete version
string and restores the runtime at the existing frozen path on a clean Windows
CI runner. It refuses to overwrite an existing runtime. Optional `Destination`
and `ArchivePath` arguments support isolated setup validation with a previously
downloaded, identically hashed archive.

The research CI job runs the complete existing `npm run test:research` suite.
No tests are omitted and no research source, data, receipts, or saved observations
are rewritten. This runtime is development/test infrastructure only, outside the
extension package's maintained calibration directory.
