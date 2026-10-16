# E275: draw-aware calibration — working record

Updated2026-10-16. State: **training-only models fitted/registered; performance not evaluated**.
Plan df50362 and code d424fca precede any new fit or categorical performance look.
No production changes. Current-main research exception; dirty application work
and staged video remain excluded, no push/new development checkout.

Frozen inputs:600 D002 development games (450 train,150 exposed validation),
3,640 original finite/nonmate roots,54 preserved original mate-root exclusions,
five90-game train folds and45 configured20k/80k root pairs. All1,200 development
player identities are distinct; IDs define provenance/folds only, ratings are
not predictor inputs. Human W/D/L targets are decoded in the mover's perspective.
No consumed reserved300 target is used. Thirteen synthetic tests pass, including
derivatives/Hessian, independent optimality, mean preservation, color symmetry,
target orientation, game weighting, fold isolation, sparse groups and unchanged
summary-origin admission.

[Inputs](evidence/inputs.json.gz) and [freeze receipt](evidence/freeze-run.json)
retain original source/config/query hashes, data eligibility and code bytes.
The specification fixes one two-parameter candidate and three controls, all
gates and multiplicity before fitting. Full-distribution prediction is distinct
from mean points, move consequences, displayed accuracy, rating or human labels.
Existing label exposure remains development; successful replay cannot confirm
the scientific claim or repair E011's failed confirmation.

Input-freeze commit3985423 completes after an automatic permission-review deadline
expired on the original attempt. Authoritative Git status/no fit directory confirm
that the initial commit and fit never ran; one permitted commit retry succeeds.
No unsafe-action decision or duplicate fit. [Timeout metadata](evidence/approval-timeout.json)
and a prospective plan amendment preserve this. The original scientific code and
October15 study-date receipts remain unchanged. A provenance-only launcher records
actual UTC execution dates for stages resumedOctober16; its hash accompanies each
execution record. Re-run data admission before the first fit.

Training-only stage from3453ec6 onOctober16 completes18 numerical fits and six
constant controls. All converge; all six candidate fits are interior. Final
candidate a=.1146858304,b=-2.5538008887; temperature a=.0801837225; CP draw
r=.0579465591. These are training parameters/diagnostics, not held-out evidence.
The final candidate projected gradient9.94423e-10 meets the frozen1e-9 threshold;
no tolerance, penalty, bound or family change. No failed numerical attempts.

[Models](evidence/models.json), [fit receipt](evidence/fit-run.json) and
[actual fit execution](evidence/fit-execution.json) retain all six training sets,
code/input hashes and actual UTC dates. The scientific entry point's date is the
October15 registration date, as prospectively documented; the launcher records
theOctober16 execution separately. Neither omitted-fold nor validation metrics
have been assessed. No searches, human annotations or production updates.

Next: commit registered fitted models, perform the single fixed development/
cross-fit/stability comparison, preserve every gate and then independently replay.
