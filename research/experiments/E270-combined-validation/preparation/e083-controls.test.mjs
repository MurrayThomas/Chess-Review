// Execute only through run-e083-controls.mjs after the cumulative terminal PASS.
import test from 'node:test';
import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';
await admitTerminalRegression();
// Dynamic candidate imports are deliberately AFTER the terminal/hash/data gate.
const [{openE083Replay}, {explainMove}, {explainMove: parent}, {bothColors}, {checkWitness}, {Chess}] = await Promise.all([
  import('./e083-whole-result.mjs'),
  import('../../E083-contact-exchange-changes/code/changes.mjs'),
  import('../../E082-rook-ending-facts/code/endings.mjs'),
  import('../../E083-contact-exchange-changes/code/fixtures.mjs'),
  import('../../E083-contact-exchange-changes/code/check-witness.mjs'),
  import('../../../../lib/chess.js')
]);
const replay = await openE083Replay();
const input = fixture => ({fen: fixture.fen, move: fixture.move, history: fixture.history, scanReplies: false, changeTags: true});
const base = i => parent({...i, changeTags: false});
const get = id => input(bothColors.find(fixture => fixture.id === id));
const check = async (i, result = explainMove(i), inherited = base(i)) => replay.check(i, result, inherited);
const own = r => r.events.filter(event => event.evidence?.experiment === 'E083');

for (const fixture of bothColors) test('authored positive/error control: ' + fixture.id, async () => {
  const i = input(fixture);
  if (fixture.inputError) {
    assert.throws(() => explainMove(i), new RegExp(fixture.inputError));
    assert.throws(() => base(i), new RegExp(fixture.inputError));
  } else {
    const result = explainMove(i);
    await check(i, result);
    for (const id of fixture.expected) assert.ok(own(result).some(event => event.id === id));
    if (!fixture.expected.length) assert.equal(own(result).length, 0);
  }
});

const mutationControls = [
  ['regional-double', 'contact frame and all contact claims omitted', r => {
    delete r.changeAnalysis.witness.hypotheticalActorFen;
    r.changeAnalysis.witness.contacts = [];
    r.events = r.events.filter(event => event.evidence?.experiment !== 'E083');
    r.changeAnalysis.status = 'no-new-fact';
    r.changeAnalysis.witness = null;
  }],
  ['queen-recapture', 'exchange frame and all exchange claims omitted', r => {
    r.events = r.events.filter(event => event.evidence?.experiment !== 'E083');
    r.changeAnalysis.witness = null;
    r.changeAnalysis.status = 'no-new-fact';
  }],
  ['regional-double', 'required hypothetical actor frame omitted', r => { delete r.changeAnalysis.witness.hypotheticalActorFen; }],
  ['queen-recapture', 'required exchange frame omitted', r => { r.changeAnalysis.witness.exchange = null; }],
  ['regional-double', 'entire event omitted', r => { r.events.splice(r.events.findIndex(e => e.evidence?.experiment === 'E083'), 1); }],
  ['regional-double', 'entire event duplicated', r => { r.events.push(structuredClone(own(r)[0])); }],
  ['regional-double', 'events reordered', r => { const indices = r.events.flatMap((e, index) => e.evidence?.experiment === 'E083' ? [index] : []); [r.events[indices[0]], r.events[indices[1]]] = [r.events[indices[1]], r.events[indices[0]]]; }],
  ['regional-double', 'target type forged', r => { r.changeAnalysis.witness.contacts[0].type = 'q'; }],
  ['regional-double', 'actor forged', r => { r.changeAnalysis.witness.actor = 'b'; }],
  ['regional-double', 'move capture forged', r => { r.changeAnalysis.witness.played.captured = 'q'; }],
  ['regional-double', 'move promotion forged', r => { r.changeAnalysis.witness.played.promotion = 'n'; }],
  ['regional-double', 'unregistered move flags inserted', r => { r.changeAnalysis.witness.played.flags = 'c'; }],
  ['regional-double', 'inventory omitted', r => { r.changeAnalysis.witness.beforePieces.pop(); }],
  ['queen-recapture', 'history omitted', r => { r.changeAnalysis.witness.history = null; }],
  ['regional-double', 'before position forged', r => { r.changeAnalysis.witness.before = r.changeAnalysis.witness.after; }],
  ['regional-double', 'after position forged', r => { r.changeAnalysis.witness.after = r.changeAnalysis.witness.before; }],
  ['regional-double', 'region label forged', r => { own(r).find(e => e.id.includes('-attack-contact')).id = 'central-attack-contact'; }],
  ['regional-double', 'complex label forged', r => { own(r).find(e => e.id.includes('-square-contact')).id = 'dark-square-contact'; }],
  ['regional-double', 'comment forged', r => { r.comment = 'Unjustified winning attack.'; }],
  ['regional-double', 'quality assertion forged', r => { own(r)[0].qualityClaim = true; }],
  ['unchanged-contact', 'spurious claim on negative', r => { r.events.push({id: 'double-legal-contact', text: 'Invented.', qualityClaim: false, evidence: {experiment: 'E083'}}); }],
  ['regional-double', 'status forged', r => { r.changeAnalysis.status = 'no-new-fact'; }],
  ['regional-double', 'nodes forged', r => { r.changeAnalysis.nodes++; }],
  ['regional-double', 'limit forged', r => { r.changeAnalysis.limit--; }],
  ['regional-double', 'inherited result forged', r => { assert.ok(r.events.some(e => e.evidence?.experiment !== 'E083')); r.events.find(e => e.evidence?.experiment !== 'E083').text = 'Forged inherited event.'; }]
];
for (const [id, name, mutate] of mutationControls) test('whole-result rejection: ' + name, async () => {
  const i = get(id), genuine = explainMove(i), inherited = base(i);
  await check(i, genuine, inherited); // Positive pair prevents blanket rejection.
  const forged = structuredClone(genuine);
  mutate(forged);
  assert.notDeepEqual(forged, genuine, 'Mutation did not change a result');
  await assert.rejects(() => check(i, forged, inherited), /whole result differs/);
});

for (const id of ['regional-double', 'queen-recapture', 'ordinary-pawn']) test('every budget boundary: ' + id, async () => {
  const i = get(id), inherited = base(i), full = explainMove(i);
  assert.equal(full.changeAnalysis.status, 'proven');
  for (let limit = 0; limit <= full.changeAnalysis.nodes; limit++) {
    const bounded = {...i, maxChangeNodes: limit}, result = explainMove(bounded);
    await check(bounded, result, inherited);
    if (limit < full.changeAnalysis.nodes) {
      assert.equal(result.changeAnalysis.status, 'exhausted');
      assert.equal(result.changeAnalysis.nodes, limit + 1);
      assert.equal(result.changeAnalysis.witness, null);
      assert.deepEqual(result.events, inherited.events);
      assert.equal(result.comment, inherited.comment);
    } else assert.equal(result.changeAnalysis.status, 'proven');
  }
});

test('focused-checker omissions remain distinct from whole-result verification', async () => {
  for (const [id, mutate] of [
    ['regional-double', w => { delete w.hypotheticalActorFen; w.contacts = []; }],
    ['queen-recapture', w => { w.exchange = null; }]
  ]) {
    const i = get(id), result = explainMove(i), forged = structuredClone(result);
    mutate(forged.changeAnalysis.witness);
    assert.equal(checkWitness(forged.changeAnalysis.witness), true);
    await assert.rejects(() => check(i, forged), /whole result differs/);
  }
});

test('default/disabled and malformed controls', async () => {
  const i = get('regional-double');
  for (const changeTags of [false, undefined]) await check({...i, changeTags});
  for (const changeTags of [null, 0, 'true', {}, []]) assert.throws(() => explainMove({...i, changeTags}), /boolean/);
  for (const maxChangeNodes of [null, -1, 50001, 1.5, NaN, '2']) assert.throws(() => explainMove({...i, maxChangeNodes}), /integer/);
  assert.throws(() => explainMove({...i, history: {fen: i.fen, moves: ['a1a8']}}), /history/);
  assert.throws(() => explainMove({...i, move: 'e1f2'}), /Illegal|illegal/);
});

test('terminal root/result; full equality and suppression', async () => {
  for (const i of [
    {fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1', move: 'g6g7', changeTags: true, scanReplies: false}
  ]) {
    const result = explainMove(i);
    await check(i, result);
    assert.equal(own(result).length, 0);
    assert.ok(['not-live', 'not-applicable'].includes(result.changeAnalysis.status));
  }
  // E020 validates the UCI and refuses a terminal root before E083 can return.
  const terminal = {fen: '7k/6Q1/5K2/8/8/8/8/8 b - - 1 1', move: 'h8h7', changeTags: true, scanReplies: false};
  assert.throws(() => explainMove(terminal), /terminal|Illegal/);
  assert.throws(() => base(terminal), /terminal|Illegal/);
});

test('prospective unpinning distinction: geometric-before versus legal-before', async () => {
  for (const [fen, pinned] of [
    ['7k/8/8/8/4r3/8/4Q1b1/4K3 w - - 0 1', true],
    ['7k/8/8/8/8/8/4Q1b1/4K3 w - - 0 1', false]
  ]) {
    const before = new Chess(fen);
    assert.equal(before.isCheck(), false);
    assert.equal(before.isGameOver(), false);
    assert.ok(before.attackers('g2', 'w').includes('e2'));
    assert.equal(before.moves({verbose: true}).some(m => m.from === 'e2' && m.to === 'g2'), !pinned);
    before.move('e2e4');
    assert.equal(before.isCheck(), false);
    assert.equal(before.isGameOver(), false);
    const fields = before.fen().split(' '); fields[1] = 'w'; fields[3] = '-';
    assert.ok(new Chess(fields.join(' ')).moves({verbose: true}).some(m => m.from === 'e4' && m.to === 'g2'));
    const i = {fen, move: 'e2e4', changeTags: true, scanReplies: false}, result = explainMove(i);
    await check(i, result);
    assert.equal(own(result).length, 0, 'Historical geometric exclusion must be reported unchanged');
  }
});
