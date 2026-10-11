# Authored route correction after failed admission pilot

Initial pilot retained in admission-pilot.json: rejected in0.038seconds with
Illegal diagram threat. Ra6-h6 is blocked by the white king on f6; the other
Ra5-h5 route also crosses Nf5. The original authored hypothesis is invalid.
No accepted proof or readiness result exists; exact initial own source is kept
in initial-sources.json.gz before correction. Do not overwrite the failed pilot.

Revised prospective hypothesis: keep Kf6,Bc4,Nf5,Kh8 but move the white rook
to g5. Choose Rg6, ...Kh7, Rg5, ...Kh8. Conditional diagram threats Rh6/Rh5
now traverse only adjacent g-h squares, avoiding the blocked a-file routes.
Test this revised graph in revised-admission-pilot.json under the same2second
gate before expanding. Both colors/history/clock/escape controls retain their
original gates. Runtime/checker/rules and certificate claims are unchanged.

This corrects an authored illegal route, not a weaker definition or relaxed
threat/closure/claim criterion. General perpetual attack/policy discovery remain
open as originally registered. Rule-page direct requests timed out; official
FIDE indexed text was read for the rule metadata in SOURCES.md. No positions or
policy routes were imported from web results; secondary snippets are not evidence.
