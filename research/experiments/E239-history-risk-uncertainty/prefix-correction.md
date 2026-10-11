# Dated fixture and output amendment

2026-10-11 after initial frozen2bf345f pilot. First three cases passed, including
both base-history actors and White's observed prefix. Fourth case failed in E235
source generation: reflected one-move suffix endpoint had fullmove4, while its
reflected complete histories ended at fullmove5. Reflecting an odd Black-move
suffix without realigning its starting fullmove counter caused the discrepancy.
Initial source binding and pilot failure remain untouched under evidence/.

Derive the reflected observed suffix's starting FEN from the already reflected
full completion, then replay that suffix and use its genuine endpoint. No board,
move, repetition hypothesis, classifier, checker, acceptance gate or budget is
changed. Prior positive base hypotheses remain valid. Freeze corrected fixtures
and output routing before reevaluation. New outputs use evidence/prefix-correction/
and preserve the first failure. Record-build binds the amendment and both runs;
no source/query collection or full historical test is introduced.
