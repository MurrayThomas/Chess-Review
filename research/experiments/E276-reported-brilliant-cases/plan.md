# E276: reported Brilliant labels — diagnostic protocol

Registered2026-10-16 before engine evaluation. User supplies two screenshots and
explicitly requests thorough tactical analysis and investigation of incorrect
Brilliant awards, with compute authorized. This takes priority over the queued
draw-allocation design. Preserve research-only scope; no runtime change in this
study. Future implementation needs a concrete reviewed promotion decision.

Inputs are exactly the two explicitly supplied images and transcribed boards,
not a public dataset or a sample for measuring population precision. The user's
specific instruction authorizes inspection, engine analysis and retention of
derived diagnostic evidence for these two cases; this narrow instruction takes
precedence over research/DATA_POLICY.md's general public-data-only rule. Do not
claim a public license, add these to approved public sources, ingest other games,
or use screenshot names/ratings as training labels. Hash original images, retain
anonymous board/move transcription and exact authorization/provenance. Use a
separate strict hash-bound case loader; do not falsely claim openResearchData
admits these images. D001/D002 preflight passes but neither dataset is used.

Case A: diagram after13...Qg3, White to move; source squareh4 highlighted.
Shown13.h3 provides a preceding position to distinguish a newly threatened
knight from inherited hanging material. Visible moves3–13 and a plausible
1.e4 e5 2.Nf3 Qf6 opening can reconstruct a consistent full board, but unseen
opening plies remain inferred, not authenticated. Primary search uses transcribed
FEN; reconstructed full-history search is sensitivity evidence only.
Case B: diagram after19...Ke8, White to move; source squared7 highlighted.
19.Bf5+ and18...Kd7 visible. Black castling rights are absent; complete history
and actual move counters/repetition state cannot be recovered from an image.
Use reversible FEN reconstruction for the displayed move and verify legal checks,
piece inventory and complete legal move lists. Do not invent a complete game.

Freeze inputs and code before decisive searches. Use the exact bundled SF18 and
SF19 Lite builds with hash/identity/NNUE verification, one thread, Hash32, Skill20,
no limiting strength or tablebases, cold reset per query, WDL on. Adapt the
maintained Engine transport to position fen; explicitly record this difference
from full-history dataset studies. Retain complete raw scored lines and commands.

Fixed primary grid: both cases x both engines x200k/2m/8m nodes. At each point
search original root unrestricted, original root restricted to the reported move,
and after-move root unrestricted. Root unrestricted MultiPV3, restricted/after
MultiPV1; retain only exact completed observations matching bestmove, with a
separate restricted recovery if necessary. Do not treat MultiPV scores as
equal-cost single-PV runs. Initial200k SF19 three-query caseA pilot must complete
within60s; estimate entire grid from it. Total20min collection cap, per-search
120s; retain failures/partial results and stop rather than silently weakening
budgets. Repeat final primary case roots at2m for deterministic numerical replay;
also collect both cases' best/played/after searches with SF18 depth16 to check
the engine/depth combination visible in the second screenshot. Retain source
images locally for visual replay; names/ratings are not prediction inputs.
the8m tier is a budget-sensitivity check, not perfect truth. Keep checks separate
from engine estimates. Investigate tactical acceptance with exact legal lines;
separately preregister any additional branch searches justified by primary data.

Replay current actual classifier against root best/played exact observations,
including soundness, move-attributable sacrifice, real-choice and already-winning
gates. Recompute with/without the visible preceding history where recoverable.
Use synthetic score/orientation/missing-evidence controls only to check mechanics,
not as independent engine or human evidence. Preserve legitimate-sacrifice,
losing-offer, forced-evasion, persistent-hanging and both-color controls from the
existing Brilliant suite. Record source hashes including dirty application/helper
bytes; no unrelated work is committed or overwritten.

Question: does each reported label violate the current stated sacrifice/soundness
policy, and does the current source reproduce it? No assumed answer, no fitted
threshold or global precision claim from two selected complaints. Distinguish
confirmed tactical defect, historical-only symptom, unreproduced behavior and
subjective brilliance. A passing numerical replay is not independent human
agreement. Failures and unverified original engine/settings/history remain.

Stop and reflect after both cases, source/current-label replay and focused
regressions. If current behavior already rejects a case, retain it as a permanent
diagnostic guard rather than claiming a new fix. If a general failure reproduces,
implement a candidate only under this research folder and test mechanism-matched
negative/positive controls before recommending production work. No acceptance
based solely on changing these two selected outputs. Commit all results locally
with the human author and Codex co-author; no push. Respect10%/99% usage sleep.
