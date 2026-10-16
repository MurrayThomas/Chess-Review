# E276: reported Brilliant labels

2026-10-16. **Complete: the two cases have different verdicts.** Plan/code a355993
and input/source freeze1a4aeb7 precede searches. No production changes or fitted
model. These are complaint-selected diagnostics, not a precision sample.

| Report | Tactical conclusion | Current classifier, seven settings each |
| --- | --- | --- |
| A:13...Qg3 | Sound voluntary knight offer after the new h3 threat; both engines prefer it | Brilliant7/7 with visible preceding history; Best7/7 without it |
| B:19...Ke8 | Best check evasion but Black remains badly lost; e6 permits forced mate | Best7/7; Brilliant eligibility false7/7 |

## A: the offered piece is Ng4

[Original image](evidence/case-a.png). After the displayed move:

```text
r1b2rk1/1ppp1ppp/1p5n/1N2P3/5Pn1/2PB2qP/PP4P1/RN1Q1RK1 w - - 1 14
```

13.h3 newly attacks Ng4. Qg3 deliberately leaves it available rather than
retreating. A deeper principal line is:

```text
13...Qg3 14.hxg4 Nxg4 15.Rf3 Qh2+ 16.Kf1
```

The recapturing knight comes fromh6. Black gives a knight for a pawn, a net
two-pawn material cost. Ng4 supports Qh2; Rf3 vacatesf1 so the king can escape
that check. This is active compensation, not an undefended queen offer or proof
of forced mate. Both engines prefer hxg4 for White, so accepting the offer does
not refute its soundness.

The independent local exchange audit finds cost2 both before and after Qg3,
but0 before the visible h3. That history distinguishes ignoring a NEW threat
from inheriting unrelated hanging material. Without it, the current rule
conservatively withholds Brilliant. Full application replay agrees.

Independent after-position scores, from White's perspective:

| Engine | 200k nodes | 2m nodes | 8m nodes |
| --- | ---: | ---: | ---: |
| SF18 Lite | -1.22 | -.45 | -.35 |
| SF19 Lite | -1.15 | -.10 | -.25 |

Both engines prefer Qg3 at the original root at every configured budget and
SF18 depth16. At8m the original-root Black scores are+.44(SF18)/+.11(SF19).
This supports a satisfactory position and a real sacrifice. It does not prove
an exact draw or independent human judgments of difficulty/beauty. The shallow
advantage shrinks materially with budget; principal continuations remain search-
dependent. Do not suppress this label merely to fit a selected complaint.

Follow-ups expose dangerous queen captures: after hxg4 Nxg4, Qxg4 permits
...Qxg4 and gives away White's queen. At2m the restricted White move scores
-2.79(SF18)/-4.00(SF19). Immediate14.Qxg4 is also bad: SF18 prefers ...Qe3+
before taking the queen, while SF19 prefers ...Nxg4 directly. Do not claim
identical continuations for both engines or treat a finite PV as a solved tree.

## B: avoiding mate is insufficient for Brilliant

[Original image](evidence/case-b.png). After the displayed move:

```text
rnb1kbnr/pp2pN1p/1qp5/4QB2/5p2/3N2p1/P1PP1PPP/2B1RRK1 w - - 2 20
```

Black is checked by Bf5 and has exactly two legal moves: Ke8 and e6. The latter
permits this forced witness:

```text
19...e6 20.Qxe6+ Kc7 21.Qxc8#
```

Kc7 is the sole legal response to Qxe6+; Qxc8 leaves Black in check with zero
legal replies. Ke8 avoids that mate but exposes Bc8. Both engines prefer Bxc8
after Ke8 at all configured settings. Independent after-position White scores:

| Engine | 200k nodes | 2m nodes | 8m nodes |
| --- | ---: | ---: | ---: |
| SF18 Lite | +6.33 | +7.35 | +7.39 |
| SF19 Lite | +13.07 | +14.70 | +16.61 |

The magnitudes differ substantially, but both judge Black lost. SF18 depth16
gives+6.34 after Ke8 versus the image's approximately+5.93. Unknown original
history/hash/version/settings prevent exact historical search reproduction.
Current annotation uses original-root best/played scores; it does not subtract
independent before/after searches. Being best gives zero expected-point loss
even when the position remains bad. Best and Brilliant need distinct gates.

Local board evidence DOES detect an offer: Ke8 opens the diagonal to c8,
changing its local cost0→3. Requiring only a material offer would still allow
this false positive. Current mover-relative soundness rejects it for both
engines at every setting; the ordinary classification is Best.

## Historical mechanism and current application

Exact historical functions from5b170eb (parent of the October1 soundness-rule
commit52be78c) lack the satisfactory-position gate in their main Brilliant rule.
On this legal Ke8 board with explicitly SYNTHETIC preceding-label context,
changing the prior label Excellent→Inaccuracy changes the old output Best→Brilliant
despite constant White+5.93 evaluations. Git blob/source hashes and the control
are in [integration.json](evidence/integration.json). This demonstrates a failure
mechanism, not the unknown original session or its exact preceding evaluations.

Full actual application computeDerived with canonical calibration agrees with
the extracted production functions for both engines at2m: A=Brilliant, B=Best.
No current Ke8 false award reproduces under these frozen inputs. Old installed
code, a different score/cache path or differing original input remain possible;
none is established by the images. Original app revision/date remain unknown.

## Verification, cost and limitations

Primary46 searches take292.627seconds; follow-up12 take52.719seconds. All complete
without engine failures or weakened budgets. The2.0second pilot passes its60s
gate; rough node-grid projection407.8seconds exceeds the actual primary time.
Exact bundled engine identities/loader/wasm/network, options, perspective, source
bytes and returned raw evidence are retained. No names/ratings fitted.

Four cold2m root repeats match score/bestmove/PV/depth/nodes exactly. Offline
report repeats byte-for-byte. Independent primary parsing verifies46 observations,
1,474 legal PV lines/14,673 moves and nine exhaustive local exchange comparisons.
Follow-up replay verifies12 observations,394 PV lines/4,008 moves and the full
mate witness. Primary/branch queries retain all returned UCI lines; four full-
history checks retain the maintained harness's selected exact/final info records.

ForA unseen move numbers1 and2 (four plies) are inferred, not authenticated.
Frozen cases.json loosely calls these "Plies1-2"; that means move numbers,
not a claim that only two half-moves were inferred. Preserve its original bytes.
Full-
startpos sensitivity searches still select Qg3/hxg4, with matching after-root
scores. Before-root comparisons ALSO change MultiPV1 versus3, so they do not
isolate a history effect. Original repetition state and exact screenshot
environment are unknown. No clean-checkout replay, forced-draw proof, independent
tactical oracle, population precision/recall or human agreement is claimed.

Thirty focused checks pass:23 existing Brilliant controls, four setup/parser/
orientation checks and three saved real-engine regressions. Source verification
and diff checks pass. New regression code stays in research; runtime, numerical
accuracy/rating models and unrelated dirty files/staged video are untouched.
Commits credit T-Julsgaard and Codex. Frozen analysis.js includes pre-existing
dirty source, so an unmodified clean HEAD cannot reproduce the entire original
environment. Exact relevant scientific declarations are also archived separately,
excluding unrelated dirty UI work, for replay after the live app changes.
[Saved-declaration replay](evidence/saved-replay.json) reproduces28 history/no-
history rows without reading live analysis.js. This is pure classifier replay,
not a clean full-application reproduction. [Manifest](evidence/manifest.json)
binds17 payload artifacts and all research code; retained evidence586,384bytes
including the manifest is below the soft2MiB target.

The explicit user request authorizes these two supplied cases and diagnostic
derivatives. [cases.json](evidence/cases.json) and the strict image/case hash
loader document that narrow exception; no public-source eligibility or training/
confirmation cohort is claimed. D001/D002 preflight passes; neither dataset used.
Original images remain locally available for visual replay. No push.

## Reflection and next action

Keep both complementary regression guards and the current soundness gate. No
new runtime fix is claimed: current source blocks the historical Ke8 failure
while Qg3 satisfies our stated policy. Do not tune thresholds or ban defensive
sacrifices from two complaint-selected cases.

Next audit Brilliant evidence across stored, streamed and variation analysis,
including stale/mixed engine metadata and both score perspectives. A reproducing
current defect should precede a candidate fix/promotion. Keep draw-allocation
design deferred while this user-prioritized investigation continues. Broader
rarity/difficulty changes still need independent labels and a separate protocol.

Replay with new output directories:

```text
node research/experiments/E276-reported-brilliant-cases/code/run.mjs report research/runs/E276/another-report
node research/experiments/E276-reported-brilliant-cases/code/audit.mjs research/runs/E276/another-verification
node research/experiments/E276-reported-brilliant-cases/code/integration.mjs research/runs/E276/another-integration
node research/experiments/E276-reported-brilliant-cases/code/audit-tactics.mjs research/runs/E276/another-tactical-verification
node research/experiments/E276-reported-brilliant-cases/code/replay-saved.mjs research/runs/E276/another-saved-replay
node --test research/experiments/E276-reported-brilliant-cases/code/regression.test.mjs
```
