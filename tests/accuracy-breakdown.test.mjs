import test from 'node:test';
import assert from 'node:assert/strict';
import { app, loadGame } from './helpers/app.mjs';

test('expanded Accuracy puts Book last and keeps all categories', t => {
  const a = app(t); loadGame(a, '1. e4 e5'); a.call('computeDerived'); a.call('buildUI');
  a.state.qbreakExpanded = true; a.call('renderStats');
  const labels = [...a.dom.window.document.querySelectorAll('.qbreak [data-category]')].map(n => n.dataset.category);
  assert.equal(labels.length, 10); assert.equal(new Set(labels).size, 10);
  assert.equal(labels.at(-1), 'book'); assert.equal(labels[2], 'best');
});

test('compact Accuracy shows every category the move list badges, so inaccuracies are counted at a glance', t => {
  const a = app(t), S = loadGame(a, '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5'); a.call('computeDerived');
  S.classif = [null, 'best', 'best', 'inacc', 'best', 'inacc', 'blunder'];
  for (const side of ['w', 'b']) S.counts[side] = Object.fromEntries(a.run('QUALITY_ORDER').map(k => [k, 0]));
  Object.assign(S.counts.w, { best: 1, inacc: 2 }); Object.assign(S.counts.b, { best: 2, blunder: 1 });
  a.call('buildUI'); a.call('renderAll');
  const doc = a.dom.window.document;
  const badged = new Set([...doc.querySelectorAll('.ml-move [data-badge-category]')].map(n => n.dataset.badgeCategory));
  const rows = [...doc.querySelectorAll('.qbreak [data-category]')].map(n => n.dataset.category);
  assert.deepEqual([...badged].sort(), ['blunder', 'inacc']);
  assert.deepEqual(rows, ['brilliant', 'great', 'inacc', 'mistake', 'miss', 'blunder']);
  const inacc = doc.querySelector('.qbreak [data-category="inacc"]').closest('.qbreak-row');
  assert.equal(inacc.querySelector(S.meSide === 'w' ? '.ct.left' : '.ct:not(.left)').textContent, '2');
});
