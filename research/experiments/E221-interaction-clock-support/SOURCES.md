# Versioned rule metadata

Official [FIDE Laws effective1January2023](https://handbook.fide.com/chapter/e012023),
inspected2026-10-11. Sections4.2..4.4,5.1.1..5.1.2,6.3.1..6.3.2,A.1,B.1.

Rapid/blitz use allotted time plus60increments: blitz at most10minutes; rapid
above10 and below60. Delay protects an initial interval on each move. Stage
time may carry forward. Resignation and checkmate have separate termination
conditions; resignation has a possible-mate exception. Touch obligations require
interaction context. This implementation reports observations and compatible
legal choices, without arbitrating these termination/touch rules.

Only rule prose/metadata was inspected. No external game, position or diagram
was acquired. Fixture positions and clock reports are newly authored synthetic
inputs. Device/platform semantics and actual trusted event provenance remain
integration prerequisites; source strings identify reports, not verified truth.
