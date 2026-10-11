# Dated missing-history reflection correction

2026-10-11 after ea1b8ed. The corrected pilot passed its positive histories,
prefixes and valid functional controls, then failed in its eighteenth/final
missing-history Black control. Its reflected goal actor was only updated inside
the helper's history-present branch. When observed history was absent, completion
source generation retained the White goal and correctly rejected frame/actor.
Preserve evidence/control-correction/ unchanged. Update goal FEN/actor for all
reflected policies, including missing observed history. No classifier/checker,
claim/uncertainty gates, histories or budgets change. New outputs are separately
retained under evidence/missing-history-correction/, with all prior failures
hash-bound in final provenance. This repairs fixture generation rather than
weakening missing-history/source admission.
