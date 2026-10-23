# Organiser report-only findings

Checked 23 October 2026 through the GitHub connector and current local source.
No GitHub comments, labels, issue states, PR branches or dependencies were changed.

## Item 9 — issues and pull requests

The open queue contains three issues and two PRs. Priorities below are recommendations,
not confirmed reproductions of the screenshot-only reports.

| Item | Finding | Recommended next step |
| --- | --- | --- |
| [#24: totals and move labels](https://github.com/T-Julsgaard/Chess-Review/issues/24) | Highest user-facing priority: accuracy totals need to agree with the game. Current totals count the original game's classification array; the compact summary hides Excellent, Good, Inaccuracy and Book. That explains some apparent missing categories, but does not establish the cause of the reported nine Best moves. | Obtain the original PGN, installed version, engine settings, selected side and whether a variation was active. After analysis completes, expand all categories and compare each original move with the totals. Add a regression for the reproduced game before fixing anything. |
| [#19: forced king moves marked Brilliant](https://github.com/T-Julsgaard/Chess-Review/issues/19) | Current code already labels an only-legal move Best before checking Brilliant; sacrifice detection also checks whether the offered piece could actually have been saved. These overlap with the complaint, but there is no PGN in the issue to establish that its exact position is resolved. The sole comment acknowledges the report. | Reproduce the position and forced king evasion with the current version; verify inherited hanging material is excluded. Keep the issue open until its game is verified. |
| [#22: checkmate indication on the board](https://github.com/T-Julsgaard/Chess-Review/issues/22) | A distinct board-level terminal marker for explored variations is still a reasonable UI enhancement. The rules layer already recognizes actual checkmate. | Add a losing-king marker and accessible Checkmate status using legal position state; distinguish actual mate from an engine prediction such as M1. Check both colors, board flip, review and variation navigation, and stalemate. |
| [PR #25: web-ext 10.7 → 10.8](https://github.com/T-Julsgaard/Chess-Review/pull/25) | Changes package.json and its lockfile. GitHub currently reports mergeable=false. The maintained-source job passed; the research job failed. | Resolve the research/checkout blockers below, refresh the dependency PR against the chosen base, then rerun lint, package builds and browser smoke checks. This is the smaller tooling update to take first. |
| [PR #26: jsdom 26.1 → 30.1](https://github.com/T-Julsgaard/Chess-Review/pull/26) | Changes the same two package files and currently reports mergeable=false. Maintained-source tests passed on CI, but research failed. The new lockfile requires Node ^22.22.2, ^24.15.0 or >=26.0.0 for jsdom and related packages; this machine is on 24.14.1. | Treat this as a separate major test-runtime migration. Upgrade the local runtime first, review upstream breaking changes, then run the DOM/interaction suite and compare with the real-browser audits. Do not assume success on CI's newer Node makes it compatible locally. |

### Why both dependency PRs are red

The [#25 run](https://github.com/T-Julsgaard/Chess-Review/actions/runs/39214760432)
and [#26 run](https://github.com/T-Julsgaard/Chess-Review/actions/runs/39812273057)
both passed the maintained-source verify job, including npm test. Each research
job reported 33 failures. Their logs show the same families of problems:

- Historical Git objects/files are unavailable, including 05d3ff0 and historical
  engine-host/source-epochs inputs. Research checkout currently uses the default
  shallow fetch while the verify job explicitly uses full history. Full history
  is a first diagnostic step; it may not resolve genuinely missing historical paths.
- Research validation rejects a changed E184 dependency, package.json. An ordinary
  tooling bump therefore intersects byte-bound research provenance. Investigate
  the binding/update policy; do not regenerate retained evidence simply to turn CI green.
- E211's observed-process output differs from retained evidence. The pinned Python
  setup succeeds, so this needs its own environment/output comparison.

These observations do not prove every failure is unrelated to the updates. They
show why merging or blindly rerunning either PR is premature. Refreshing both
PRs will also be necessary after the local organiser changes are eventually
published by the repository owner. No remote mutation was performed here.
