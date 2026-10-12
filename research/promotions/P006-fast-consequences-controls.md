# P006 — Fast consequence witnesses and individual concept controls

Date: 2026-10-13. Production implementation decision, not research acceptance.

## Decision

Continue the existing Fast worker, findings, player perspective and shared panel
views. Add seven provisional local witness types: a next knight jump with a
queen/rook or queen/king fork pattern, a legal alternative fork not played,
played-capture material gain, offered material loss, an unprotected pawn offer
without an immediate recapture, conditional c-pawn preparation of a central
d-pawn advance, and an opening minor-piece contact permitting an equal exchange.
No frozen detector, acceptance record, scoring method or engine setting changes.

Use the game supplied directly in the implementation request as a local
regression fixture, not as a research dataset or a coaching-effectiveness result.
No external game acquisition or exhaustive historical audit is needed for this
implementation. Existing P001–P005 evidence and unavailable research prerequisites
remain intact.

## Scope and safeguards

- Capture proofs reuse E022 `certifyCapture`, covering every immediate legal
  counterreply. Offered-loss amounts account for the selected move's own capture
  and promotion material. Queen recaptures are excluded from windfall narration;
  en-passant victims are named on their actual square. Longer compensation,
  recovery, engine advantage and best-move status are not established.
- Knight patterns use legal moves and actual piece ownership. Only high-value
  queen/rook or royal pairs are considered. A legal immediate capture of the
  forking knight rejects the pattern. A pattern still does not prove a material
  win. A mover-turn diagram is labelled hypothetical, and the defender's move
  comes first. Persistence is tied to an attacked knight or its recorded last
  arrival, rather than repeating every unchanged board feature.
- The alternative-jump explanation establishes a passed-up pattern. The existing
  engine quality label remains separate; the pattern cannot assign a Miss label.
- The opening plan requires initial-position history, an early c-pawn advance,
  a legal mover-turn d-pawn advance and actual pawn support of its destination.
  This is a conditional board plan, not additional opening-theory coverage or
  inferred intention. Development reuses the original minor-development witness;
  rim-knight geometry is qualified, not a blanket bad-move verdict.
- Witnesses bind the input FEN, played UCI and successor FEN. Presentation rejects
  stale bindings. Player wording continues to use the detected S.meSide, never
  orientation or the moving side. Unknown-player behavior is unchanged.
- Capture proofs have a 128-work-unit limit, offers at most four candidates, and
  knight scans at most 48 candidates per move. Exhausted work is reported through
  the existing diagnostics; useful partial findings are retained. Expensive
  full winning-fork proofs remain in the optional Tactical proof searches group.

## Controls and presentation

Settings → Concepts puts Excluded concepts at the top, outside the exclusive
settings accordion. Concept groups expand independently into individual finding
controls. Groups and entries use rough computation-cost ordering. The generated
539-entry routing metadata describes existing emitted finding IDs and the new
witnesses; it is not a catalog-acceptance count or an independent detector system.
Core validation, checks, captures and terminal outcomes remain on.

Individual disabled IDs are normalized, persisted and included in cache identity.
They are removed before strict research-source input validation. Known group and
item filters apply to both views. Entire study/flag owners are skipped when all
of their controlled outputs are disabled; shared prerequisite scans may still be
needed by other findings. Each new witness can be disabled independently.

Reset to default restores Fast groups and individual defaults while retaining the
analysis switch, chosen view and unrelated settings. Closed groups do not create
hundreds of DOM inputs; expanded state, focus and scroll survive result refreshes.

Coaching prioritizes actual mate/defensive certificates and material consequences,
then relevant legal continuations and alternatives, ahead of ordinary contacts
and structural observations. Quiet development has a purposeful fallback. Opening
equal-exchange contacts and quiet batteries do not displace stronger lessons.
Overlap suppression prevents repeating the pawn attack already explained by a
surviving fork. Related facts retain their original scopes and provisional status.

## Validation

Validation records are implementation checks, not scientific acceptance. Final
commands, timings, browser results and local commit are recorded below after the
checks finish. Earlier concurrent browser/engine runs exhausted the existing
five-second wall watchdog in one layout case; isolated rerunning passed. The
watchdog was not extended or bypassed. Both real-engine Chrome and Firefox suites
passed with Stockfish 18 NNUE and Stockfish 19 Lite; scoring and release-reset
regressions stayed intact.

Completed implementation: `3a3c838` — feat: explain Fast move consequences and
expose individual concept controls. Author T-Julsgaard; Codex co-author. No push.

Final checks:

- `npm test`: 366/366 pass, 54.551 s (`scratch/followup-pass-tests.log`). Covers
  both colors, opponent moves, branch/history identity, stale worker results and
  stale witness bindings, individual toggles/reset, overlapping stories, quiet
  development/rim lessons, unsafe captures, pinned knights, queen recaptures and
  en-passant ownership. Replay of the actual pawn-capture witness checks every
  legal immediate reply independently.
- Added Fast consequence work over all 57 supplied plies: 1.575 s, 1,364 bounded
  work units. This measures the added pass, not total concept or engine time.
- Chrome/Firefox real-extension smoke suites pass with both bundled engines
  (`scratch/followup-chrome.log`, `scratch/followup-firefox.log`). The numerical
  engines and scoring code were unchanged by subsequent presentation/control
  refinements; those checks are reused rather than repeated historical research.
- Final packaged Chrome layout: 40 cases pass, including the real-worker
  Nd5/e4/Nb6 story for both perspectives, Nxc6 capture, individual controls and
  reset/cache reuse. Desktop and 320/390-pixel panel screenshots were inspected.
  Final settings screenshot confirms checkbox rows beside their labels.
- Four-move layout fixture: concept work 2.294 s, visited-position wall 3.111 s,
  first response maximum 0.792 s, cached navigation 105.5 ms, UI tick gap maximum
  56.3 ms. The three-ply fork story uses 2.386 s total concept work with first
  response maximum 0.637 s. These are fixture/environment observations, not a
  per-concept timing promise.
- `npm run build`, `npm run verify:source`, routing generator `--check`, integration
  fingerprint checks and `git diff --check` pass. Packaged Firefox lint: 0 errors,
  0 notices, one pre-existing dynamic-innerHTML warning.

Final packaged artifacts and layout evidence:
`web-ext-artifacts/release-0.3.0-3Mpyr8/layout-CuLeHg/` (ignored local outputs).
`results.json` includes source package record and measurements. Existing accepted
378 occurrences / 328 names are not changed or augmented by this decision.
