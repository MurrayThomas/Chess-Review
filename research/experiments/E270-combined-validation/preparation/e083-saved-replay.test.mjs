import test from 'node:test';
import assert from 'node:assert/strict';
import {checkE083GameReceiptShape} from './e083-policy-epoch.mjs';
import {openFixedE083Report, checkE083ReportShape, checkE083ReportBytes} from './e083-saved-report.mjs';
const saved = await openFixedE083Report(process.env.CHESS_E083_CONTROL_ATTEMPT);
const [{openE083Replay}, {explainMove: parent}, {explainMove}] = await Promise.all([
  import('./e083-whole-result.mjs'), import('../../E082-rook-ending-facts/code/endings.mjs'),
  import('../../E083-contact-exchange-changes/code/changes.mjs')
]);
const replay = await openE083Replay();
assert.deepEqual(replay.receipt, saved.receipt);
const input = fixture => ({fen: fixture.fen, move: fixture.move, history: fixture.history, scanReplies: false, changeTags: true});
for (const [index, row] of saved.report.rows.entries()) test('saved whole row ' + index + ': ' + row.fixture.id, () => {
  const i = input(row.fixture), audit = {index, id: row.fixture.id, expectedError: Boolean(row.fixture.inputError),
    parentEvaluations: 0, parentErrorEvaluations: 0, candidateErrorEvaluations: 0, savedReplayAttempts: 0, passed: false};
  try {
    if (row.fixture.inputError) {
      for (const [candidate, count] of [[explainMove, 'candidateErrorEvaluations'], [parent, 'parentErrorEvaluations']]) {
        audit[count]++;
        assert.throws(() => candidate(i), error => {
          assert.equal(error.message, row.error);
          assert.ok(error.message.includes(row.fixture.inputError));
          return true;
        });
      }
    } else {
      audit.parentEvaluations++;
      const inherited = parent({...i, changeTags: false});
      audit.savedReplayAttempts++;
      const result = replay.check(i, row.result, inherited);
      assert.equal(result.exactResult, true);
      assert.equal(result.parentSemanticReplayRequired, true);
    }
    audit.passed = true;
  } finally {console.log('# E083-row-audit ' + JSON.stringify(audit));}
});
const mutations = [
  ['schema', report => { report.schema = 'E083-pretend'; }],
  ['role', report => { report.source = 'real games'; }],
  ['row missing', report => { report.rows.pop(); }],
  ['row duplicated', report => { report.rows.push(structuredClone(report.rows[0])); }],
  ['row order', report => { [report.rows[0], report.rows[1]] = [report.rows[1], report.rows[0]]; }],
  ['fixture changed', report => { report.rows[0].fixture.move = 'a1a8'; }],
  ['source hash changed', report => { report.inputHashes[Object.keys(report.inputHashes)[0]] = '0'.repeat(64); }],
  ['source omitted', report => { delete report.inputHashes[Object.keys(report.inputHashes)[0]]; }],
  ['source inserted', report => { report.inputHashes['unowned.mjs'] = '0'.repeat(64); }],
  ['receipt forged', report => { report.eligibilityReceipt.registrySha256 = '0'.repeat(64); }],
  ['error erased', report => { const row = report.rows.find(item => item.error); delete row.error; row.result = {}; }],
  ['result erased', report => { const row = report.rows.find(item => item.result); delete row.result; row.error = 'Invented'; }]
];
for (const [name, mutate] of mutations) test('saved admission rejection: ' + name, () => {
  assert.deepEqual(checkE083ReportShape(saved.report, saved.fixtures, saved.sourceHashes, saved.historicalReceipt), saved.summary);
  const forged = structuredClone(saved.report);
  mutate(forged);
  assert.throws(() => checkE083ReportBytes(Buffer.from(JSON.stringify(forged) + '\n')));
  assert.throws(() => checkE083ReportShape(forged, saved.fixtures, saved.sourceHashes, saved.historicalReceipt));
});
test('retained input and fixed-report snapshot are immutable', () => {
  assert.throws(() => {saved.report.rows.pop();}, TypeError);
  assert.throws(() => {saved.canonical.sha256 = '0'.repeat(64);}, TypeError);
});

for (const [name, mutate] of [
  ['wrong old policy', (old, current) => { old.policySha256 = '0'.repeat(64); }],
  ['missing old policy', (old, current) => { delete old.policySha256; }],
  ['changed non-policy field', (old, current) => { old.validatorSha256 = '0'.repeat(64); }],
  ['wrong current policy', (old, current) => { current.policySha256 = '0'.repeat(64); }]
]) test('receipt-epoch rejection: ' + name, () => {
  assert.equal(checkE083GameReceiptShape(saved.historicalReceipt, saved.receipt), true);
  const old = structuredClone(saved.historicalReceipt), current = structuredClone(saved.receipt);
  mutate(old, current);
  assert.throws(() => checkE083GameReceiptShape(old, current));
});