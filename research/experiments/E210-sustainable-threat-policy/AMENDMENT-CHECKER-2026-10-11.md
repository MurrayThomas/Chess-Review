# Strict threat-code verifier parity

The revised pilot passes0.072seconds; all15 focused checks pass2.744seconds.
Preserve exact pre-hardening source in pre-hardening-sources.json.gz, plus the
passing focused result and six policy observations before this correction.

Final source audit finds the independent checker accepts SAN via Chess.move
for mateThreat whereas runtime explicitly requires a UCI member of the legal
diagram domain. A forged certificate/result replacing g6h6 with Rh6# can thus
evade the checker although runtime rejects it. The registered strict-interface
gate already requires rejecting that mismatch. Add an explicit UCI pattern and
legal UCI-domain assertion to the independent checker only. Runtime/rules/model/
fixtures/claim theorem/ledger unchanged.

Add ONE targeted check: admit the valid proof, require runtime rejection of the
SAN certificate, mutate the matching result fields consistently, and require
independent rejection. Run only this new check. Retain the15 existing passes on
their exact recorded source; no final whole-file pass or policy recollection.
