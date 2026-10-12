# E085 history envelope normalization — 2026-10-12

The corrected smoke at4426928 passed64/64 in24.788seconds. Before opening the saved cohort, source review identified an adapter-only compatibility gap: validateHistory accepts additional properties on the caller's history object but emits only its fen and moves in E085 evidence. The new adapter copied the entire caller envelope. This did not affect the completed smoke or any original fixture, but would falsely reject an otherwise supported input carrying unrelated history metadata.

Prospectively change the new adapter to construct exactly {fen,moves} and extend the existing repetition-history control with an additional caller metadata property. Require that property absent from result evidence. Keep the64-test count and all scientific gates; preserve both prior attempts and rerun the bounded smoke under a new source closure before saved admission. Candidate and frozen sources/canonical artifacts remain untouched. No accepted credit.
