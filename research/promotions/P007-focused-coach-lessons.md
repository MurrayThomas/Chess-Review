# P007 — Focused coach lessons and a smaller default profile

Date: 2026-10-13. Production teaching and execution decision, not research acceptance.

## Problem and decision

Correct observations were competing with useful lessons. Routine opened diagonals
and pawn contacts filled quiet moves; unrelated effects of a move were appended
to the selected explanation. Proof caveats and repeated profile notices made the
Coach reply tab read like the inspector. The default also searched response-tempo
and conditional development constraints even when those findings were too weak
to appear in a reply.

Show one supported lesson per move, with a concrete thinking task where relevant.
Prioritize actual results and mating resources, material consequences, relevant
knight continuations, changed defenders and uncovered attacks. Quiet development,
pawn tension, rook access and changed pawn structure can supply a specific lesson.
Routine geometry below the teaching threshold and isolated guarded-pawn contacts
without development abstain. Absence of a reply never certifies safety or quality.
All enabled findings remain in All concepts, including facts excluded from replies.

The default selects features, pawns and immediate checks/exchanges. E091 short
exchange proofs remain enabled. E086 recorded-route and E096 development-tempo
proofs are optional in the history group. History remains compatible with focused
Fast presentation and P006 witnesses when enabled. Existing explicit saved group
choices are respected; Reset to default in Settings → Concepts adopts the smaller
profile. Heavy groups remain opt-in, with their existing proof scopes and costs.

## Coaching rationale

These are product choices informed by coaching sources, not a measured claim of
learning improvement:

- [FM chuddog, How to Think in Chess](https://www.chess.com/article/view/how-to-think-in-chess)
  emphasizes concrete threats and calculation. Replies therefore name the relevant
  piece, square or legal continuation before suggesting a thinking task.
- [Dan Heisman, The Improving Chess Thinker, publisher excerpt](https://mongoosepress.com/Excerpts/improving_thinker.pdf)
  distinguishes systematic thinking from memorized principles and discusses
  checking analysis before committing. Prompts focus on checking replies, changed
  defenders and lines left behind rather than generic praise or blanket rules.
- [International Chess School thinking process](https://www.chessmasterschool.com/download/ICS-thinking01.pdf)
  starts with opponent threats and links piece activity to decisions. Tactical
  warnings take precedence over unrelated development or pawn facts.

Examples: a knight developing to c6 explains the newly defended e5 pawn and asks
the learner to count the new defender before exchanging. A pawn chase that leaves
a fork available points to the knight's landing square. An uncovered attack asks
the learner to check the line left behind, not just the moving piece's destination.
The prompts are questions to investigate, not certified best-move recommendations.

## Presentation and scope

Coach reply keeps the move context, lesson and optional “Try this next time” prompt.
Repeated perspective labels, duplicate move assessments and routine diagnostics
are removed from the open reply. Source scopes remain under “Why this reply?”;
profile and availability notes are under “Analysis details.” Actual errors retain
a visible incomplete-analysis notice. Expanded state, navigation, variation,
identity handling and shared cache behavior are retained.

Conditional timing and short tactical horizons stay in the explanation. General
positional caveats move into the collapsed evidence. Synthesis retains original
source text, contributing scopes and provisional status. No source detector,
accepted evidence, numerical score, best-move policy or acceptance count changes.
Fix the persistent-fork sentence grammar and the pawn-tension evidence key.

## Work avoided

- P006 skips enemy knight scans on moves that cannot emit its persistence witness.
  For pawn moves, only attacked knights or the last-arriving knight are scanned.
  Existing 48-candidate and capture-proof caps remain; exhaustion cannot imply absence.
- Fast does not repeat the actual-turn mate scan through E209 when E201 is enabled.
  The other side's explicitly hypothetical diagram remains. Disabling E201 retains
  the corresponding E209 scan; heavy profiles retain their original scans.
- Fast calls E237 only at its exact root clock prerequisite, 149 reversible plies.
  Other clocks cannot emit this certificate. Its existing history and ongoing-root
  requirements still apply. The legacy parent already treats a claimable fifty-move
  draw as terminal; this change does not expand that admission contract.
- Cache fingerprints and individual controls are regenerated from the changed
  runtime and group routing. Frozen research modules remain byte-equivalent.

## Validation

Implementation checks use existing authorized regression sequences and authored
legal positions. No external game corpus is acquired, no historical experiment is
rerun, and no coaching-effectiveness result is claimed.

Completed implementation: `5f6820d` — feat: focus coach replies on one useful lesson.
Author T-Julsgaard, Codex co-author. Local main; no push or publication.

- Full production regression: 385/385 pass in the shared workspace
  (`scratch/coach-production-repaired.log`, 78.437 s). This includes unrelated
  completed scoring work; only the coach files are included in this commit.
- Focused coach, consequences and performance checks: 34/34 pass
  (`scratch/coach-focus-repaired.log`). New checks cover one-lesson selection,
  practical prompts, abstention, collapsed diagnostics, core development/draw
  routing with history off, optional history compatibility, relevant-knight work
  and exact clock gating. Existing mate, material-loss, both-color, variation,
  stale-result and evidence-scope regressions pass.
- Packaged Chrome layout: 42 cases pass, including new 320/390-pixel reply views,
  desktop layout, expanded evidence, reset, reload and shared cache behavior.
  Inspected the desktop defense, narrow reply and expanded-source screenshots.
  Record: `web-ext-artifacts/release-0.3.0-903W5o/layout-JfHNOM/results.json`.
- Firefox real-engine smoke passes with Stockfish 18 NNUE and Stockfish 19 Lite.
  All 22 selected Fast positions complete with no concept errors; first-response
  maximum 842 ms, worker total 21.971 s, wall total 23.296 s, 158 findings.
  `scratch/coach-firefox-verified.log` retains the detailed metrics and existing
  explicitly exhausted bounded-search diagnostics.
- Build, source verification, generated-control freshness and diff checks pass.
  Packaged Firefox lint has zero errors/notices and the existing dynamic-innerHTML
  warning. Package record: `web-ext-artifacts/release-0.3.0-903W5o/release-record.json`.

On the same 22-move authored opening sequence used by the Fast-coach regression,
the old/default run had 462 recorded stages and 617 words in main reply paragraphs;
the new/default run has 374 stages and 371 main-reply words. Practice prompts are
additional text and are excluded from that word count. One local Node run took
23.544 s before and 16.586 s after; these development timings vary with load and
are not a general latency or learning-effectiveness claim. Retained comparison:
`scratch/coach-baseline.json` and `scratch/coach-final.json`.

Initial checks exposed the legacy control-routing dependency and the old test's
assumption that every move should combine unrelated effects; both were corrected.
Sandboxed browser attempts failed because Windows denied browser graphics
subprocess access. Final packaged Chrome/Firefox checks passed outside that
sandbox using isolated temporary profiles; no browser timeout or proof budget was
increased. The unsuccessful static-preview fallback is not validation evidence.
