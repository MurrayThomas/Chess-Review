# E199 — concrete answers to board questions

2026-10-11 prospective BUILD-FIRST after E198d99074e, current main under user
exception, research-only local commits/no push. E178/E174/E094 sources inspected.
Reuse compatible mechanics for three original higher-level question occurrences;
no new engine, query, acquired game or repeat historical acceptance run.

inspectQuestion(id,input,options,source?) supports C1062/C1066/C1067 only. Explicit
question/context/frame/coverage/limitations in result, default enabled=false,
maxNodes0..50000 default50000, no other options; strict ID/ordinary value/types/
FEN/history. Atomic exhaustion discards answers/own witness/source, nodes=cap+1.
QualityClaim false. Terminal current roots abstain. Missing source for source-
based questions or missing genuine history reports prerequisites, not a negative
strategic judgment. A proved empty domain answer is distinct from unavailable.

C1062 Which pieces are undefended?: enumerate EVERY current N/B/R/Q of BOTH
colors, its complete geometric friendly-defender and enemy-attacker origin lists.
Return undefended nonpawn/nonking subset and all evaluated units, including quiet
unattacked undefended pieces and attacked defended pieces. Snapshot is input FEN
before any supplied move; optional supplied history must be genuine. Pinned own
defenders count geometrically; no legal recapture, hanging/material-loss assertion.
Runtime uses existing Chess.attackers; own independent checker enumerates pawn/
knight/king/slider attacks from board coordinates and blocker rays, without that
API or own runtime/helpers. Work=3+history length+ALL root units+one per evaluated
nonpawn/nonking target+one per each root unit examined for that target. Kings and
pawns may defend/attack but do not appear in queried piece subset. No source input
permitted for C1062; malformed provided source rejects.

C1066 Where are the weak squares?: admit a full enabled E174 source result with
exact input/history/cap via frozen independent checkWitness, then require its
joint improved AND outpost gate. Answer actor's newly occupied knight square at
source AFTER frame with complete pawn support/no-future-pawn-challenge and
profitable all-defense policy versus quiet alternative. Reuse E178 conjunction,
retain original source, no copied unvalidated label. Coverage is supplied occupied
square only, never complete all-board absence/generic weak-square classification.
No support/future pawn challenge/independent defender withholds this answer even
if material improvement alone passes. Source missing history/disabled/malformed
cap/proof distinctions explicit; source exhausted/unavailable gives no own answer.

C1067 Where are the pawn breaks?: full enabled E094 source independently admitted
via frozen checkWitness, exact FEN/actual/history/cap/after frame. Answer COMPLETE
fresh own candidate set of E094 legal straight pawn advances creating NEW legal
capture contacts with enemy pawns on c-f files, at source AFTER position. Preserve
every advance/contact including labelled hypothetical next-actor-turn capture FEN;
no assertion opponent grants the turn or leaves position unchanged, safe progress,
profitable break, noncentral/blocked/sacrificial/general breakthrough completeness.
An empty complete E094 domain list is an answered question, not strategic no-break.
Full genuine history required for this adapter, even where old E094 allows FEN-only.

Source questions share wrapper3+history length+source.analysis.nodes+ownwork;
ownwork=3+one per returned answer. Source control cap0..50000 enforced separately.
Separate runtime/checker exact ordinary-value clone admission caches, no own label
cache. Own checker imports NO own runtime/adapter/geometry/collector, duplicates
control/root/frame/answer/cost logic and calls same frozen source admissions.
Shared Chess legality/history and source admission remain explicit limitations.
Source caller object retained as cloned proof, never modified. Missing witnesses
must have no source events, declared exhausted nodes exactlycap+1 or no-source
work within cap; changed source result/input fails semantic admission. No cached
success or source hashes substitute for replay.

Reuse hash-matched E174/E094 exact result archives, receipts, full original source
closures and output hashes. Cheap smoke for supported/no-support outpost, Benoni
candidate and Panov empty-domain distinction, and authored defended/undefended
piece inventory. Focused once: eight outpost roles both colors for positive,
no support, future challenge, extra defender; four pawn-break roles Benoni/Panov
both colors; four small static profiles including blocked ray/pinned defender;
strict/missing/disabled/source absence, exact/short/zero, actual histories/frame
references, empty versus unavailable, source/answer/geometry/cost mutations and
caller clones/getters. No full pilot/replay/historical tests. Fresh field/priority/
terminal/claim exhaustive matrices, combined independent replay/cumulative and
changed main/repeat/initially clean reproductions deferred. Preserve full original
question/strategic usefulness meanings and unimplemented prerequisites; no
acceptance/promotion. Source/diff checks, source-bound output/build/index/result
and local commit at safe boundary.
