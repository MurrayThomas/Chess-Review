# E085 foundation-control correction — 2026-10-12

The initial smoke at da9df6f passed63/64 in26.465seconds. The last authored control supplied a FEN missing the black king and expected an E085 not-applicable result. The parent rejects that malformed board by throwing before E085 runs; this was an invalid expectation in the new control, not a candidate/oracle discrepancy. Preserve all initial stdout/stderr/start/final/process artifacts.

Prospectively replace only that control with the existing valid quiet fixture, enable foundationTags and play illegal e2e5. The foundation interface then returns a rejected result that E085 must inherit with zero nodes and not-applicable status. Keep all64 tests, the oracle, candidate, gates, canonical fixtures and saved cohort unchanged. Bind this amendment into new preparation input hashes before retrying the full bounded smoke.
