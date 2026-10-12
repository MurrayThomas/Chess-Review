// Fixed policy provenance only; no general receipt or tablebase admission.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
const oldRevision = '43fdad510b5ccf8ab8e590b841559159d0c41438';
const newRevision = 'ea1e96e256485a1b01bef65bec1f5bb52099c624';
const oldHash = '9e6e2e256958657981c680d3678a07ebf28f94c99c809652453004cf161204b6';
const newHash = 'b9f78bc7e345dc2d5fea681b16f801d85c808ae2173cf8b44ece30ba99e2298f';
const addendum = `Computed-tablebase addendum, 2026-10-10: [TABLEBASE_DATA_POLICY.md](TABLEBASE_DATA_POLICY.md)
defines a separate, explicitly registered namespace for generated endgame tables.
This is a policy revision for those non-game artifacts only. Their permission,
exact exports and origin format must pass \`openResearchTablebases()\`; a game-data
receipt cannot admit them. Existing \`public-data-v1\` game registry/validator,
origins and archived receipt meanings remain unchanged. Requirements below for
game-derived data continue unchanged. The old document fingerprint remains part
of historical evidence; do not rewrite archived receipts to hide this addendum.

`;
/** Neutral diagnostic field checker. Does not authenticate an artifact/receipt. */
export function checkE083GameReceiptShape(historical, current) {
  const {policySha256: historicalPolicy, ...historicalFields} = historical;
  const {policySha256: currentPolicy, ...currentFields} = current;
  assert.equal(historicalPolicy, oldHash, 'Unregistered historical policy');
  assert.equal(currentPolicy, newHash, 'Unregistered current policy');
  assert.deepEqual(historicalFields, currentFields, 'Non-policy receipt fields differ');
  return true;
}
/** Called only AFTER exact E083 canonical bytes have authenticated ownership. */
export async function proveE083PolicyEpoch(historical, current) {
  checkE083GameReceiptShape(historical, current);
  const before = execFileSync('git', ['show', oldRevision + ':research/DATA_POLICY.md'], {windowsHide: true});
  const after = execFileSync('git', ['show', newRevision + ':research/DATA_POLICY.md'], {windowsHide: true});
  assert.equal(sha256(before), oldHash); assert.equal(sha256(after), newHash);
  assert.equal(sha256(await readFile('research/DATA_POLICY.md')), newHash);
  const newer = after.toString('utf8');
  assert.equal(newer.split(addendum).length, 2, 'Exact addendum absent or repeated');
  assert.equal(newer.replace(addendum, ''), before.toString('utf8'), 'Other policy changes present');
  return {historical: {revision: oldRevision, policySha256: oldHash},
    current: {revision: newRevision, policySha256: newHash},
    change: 'Exact computed-tablebase addendum only; original game policy body byte-identical',
    allOtherReceiptFieldsIdentical: true, receiptsRemainDistinct: true, tablebaseAdmission: false};
}
