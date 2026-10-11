# E243 runner amendment — retain illegal hypotheses explicitly

2026-10-11, after initial source freeze d4f2fbb. The first pilot stopped before
producing a comparative tree: registered Rf1f8 is illegal. Pf2 blocks the rook
at f2 and Qf7 also blocks f7. The proposed Rf1f6 is likewise blocked by Pf2;
adding Ng5 does not clear either blocker. This avoidable authoring error is
retained in evidence/started.json and evidence/pilot-failure.json.gz. No other
preparation tree or test outcome was inspected before this amendment.

The plan already requires retaining illegal roles/failures, but orchestration
incorrectly treated strict input rejection as a fatal pilot error. Change ONLY
the orchestration/checks to record these original illegal hypotheses with a
complete independently reconstructed root legal inventory and explicit rejection.
Keep all eight hypotheses, their original moves, the collector/inspector, roles,
budgets and comparison gates unchanged. Do not substitute legal rook moves or
count a rejected preparation as a chess-policy refutation.

Evaluate h2h3 and its opposite-color counterpart as registered; run the neutral
positive control and focused controls. Update tests to distinguish rejected
inputs from legal comparative trees. Save all subsequent outputs under
evidence/amended/ so initial observations remain immutable. Source-freeze the
amendment and runner changes before evaluation. No final acceptance or new
readiness credit follows from this amendment.
