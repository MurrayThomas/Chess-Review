# Dated negative-control classification correction

2026-10-11 after bb94a33 pilot. Both base positives and observed-prefix positives
passed. The eleventh row, the proposed immediate-mate control Qe5-g7, failed E235
source admission as Illegal actual: the own Kf6 blocks its diagonal. That move
was mistakenly expected to produce a valid negative result. Retain all initial
and prefix-correction evidence unchanged. Move this exact malformed control to
an explicit strict-rejection check for both colors; do not relabel it as a legal
chess outcome or search for a replacement diagram. The valid pilot now contains
18cases; the focused strict-input check must exercise the removed illegal case.
No classifier, independent checker, positive histories, source admission,
uncertainty gate or budget changes. Freeze before reevaluation; new outputs use
evidence/control-correction/. Bind both corrections and all prior failed outputs
in final provenance. No inherited/full suite or source collection.
