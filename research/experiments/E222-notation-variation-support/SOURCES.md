# E222 format reference

Primary specification: Steven J. Edwards, Portable Game Notation Specification
and Implementation Guide, sections7,8.1,8.2.2..8.2.6,9.7,10,16.1.
https://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
Inspected2026-10-11. Used only for format rules/metadata, not games or positions.

The parser preserves recursive alternatives, numeric annotations, tag pairs and
reported results; SAN resolves against legal moves. Export normalizes supported
syntax. Catalog symbol meanings remain teaching references, not validated board
evaluations. Descriptive notation conversion is outside this contract.

All chess fixtures are newly authored synthetic development inputs. No source
game, diagram, position or example is copied. Existing local lib/chess.js and
strict FEN validation supply legal move mechanics.
