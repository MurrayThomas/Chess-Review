# Fixed E083 game-receipt policy epoch — 2026-10-12

Prospective repair after retained initial saved replay admission FAIL. Only
policySha256 differs; no saved semantic tests/candidate evaluations ran. Old/new
hashes are genuinely distinct, not equivalent serialization or producer identities.
Current DATA_POLICY.md explicitly preserves historical game receipt meanings.

For ONLY fixed E083 canonical report SHA4c707a81419070c274c3fae99d2c330da1b4fe645f27d323ccd044cbb0d2fe83,
allow historical policy hash9e6e2e256958657981c680d3678a07ebf28f94c99c809652453004cf161204b6
and current policy hashb9f78bc7e345dc2d5fea681b16f801d85c808ae2173cf8b44ece30ba99e2298f.
Authenticate exact Git policy documents at43fdad510b5ccf8ab8e590b841559159d0c41438
and ea1e96e256485a1b01bef65bec1f5bb52099c624. After removing the exact literal
nine-line computed-tablebase addendum from the latter, require byte equality to
the former. Require current physical policy hash to equal that exact latter blob.
No changed D001 game requirements, sources, permissions, validator, registry,
manifest/artifact/origin fields: require ALL remaining receipt fields deep-equal.
Preserve the original receipt intact; expose original/current receipts and the
explicit policy-epoch proof separately. No relabeling or generic caller override.
Fixed ownership/raw hash checks still precede this private admission.

Neutral decoded shape checking uses the authenticated historical receipt as its
expected value, never claims to authenticate caller bytes. Current guarded replay
session still uses current receipt. Forge/missing old policy, changed non-policy
field, changed current policy and other-receipt forgeries must reject; positive
fixed artifact must admit. Add these four concrete receipt mutations to the
existing12saved mutations, making50tests for33rows+16mutations+immutable snapshot.
Record exact attempted counts as before. Existing65controls are unchanged and
reused by their full source/log hashes; do not rerun them or the unchanged full
regression. The new private helper was not in their closure and needs new own
checks.600-second replay cap,19-scoped original IDs/full broader meanings and
all other semantic/integration/reproduction/strategic/human gates unchanged.
Retry in NEW semantic-e083-replay-policy-epoch using qualified controls-tap.
