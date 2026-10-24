import test from 'node:test';
import assert from 'node:assert/strict';
import { app, loadGame, branch } from './helpers/app.mjs';

const FOOLS_MATE = '1. f3 e5 2. g4 Qh4#';
function review(t, pgn = FOOLS_MATE) {
  const a = app(t);
  loadGame(a, pgn); a.call('computeDerived');
  a.call('buildUI'); a.call('buildBoard');
  return a;
}
const squares = a => [...a.dom.window.document.querySelectorAll('.mate-badge')].map(n => n.closest('.sq'));
const sqName = (a, node) => Object.entries(a.run('sqByName')).find(([, sq]) => sq === node)?.[0];

test('the final mated position marks the mated king with a glow and a "#" badge', t => {
  const a = review(t);
  a.state.idx = a.state.total; a.state.classif[a.state.idx] = 'best'; a.call('paintBoard');
  const marked = squares(a);
  assert.equal(marked.length, 1);
  assert.equal(sqName(a, marked[0]), 'e1');
  assert.ok(marked[0].querySelector('.mate-glow'));
  assert.ok(marked[0].classList.contains('has-badge'));
  assert.equal(marked[0].querySelector('.mate-badge').getAttribute('aria-label'), 'Checkmate');
  // The mating queen keeps its own grade badge.
  assert.ok(a.run('sqByName').h4.querySelector('.sq-badge[data-badge-category="best"]'));
});

test('the mark is on the same square when the board is flipped and clears when navigating away', t => {
  const a = review(t);
  a.state.idx = a.state.total; a.state.flipped = true; a.call('buildBoard');
  assert.equal(sqName(a, squares(a)[0]), 'e1');
  a.state.idx -= 1; a.call('paintBoard');
  assert.equal(a.dom.window.document.querySelectorAll('.mate-glow, .mate-badge').length, 0);
  assert.equal(a.run('sqByName').e1.classList.contains('has-badge'), false);
  a.state.idx += 1; a.call('paintBoard'); a.call('paintBoard');
  assert.equal(a.dom.window.document.querySelectorAll('.mate-glow').length, 1);
});

test('a mate reached in a variation is marked, while plain check is not', t => {
  const a = review(t, '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6');
  const v = branch(a, a.state.total, 0);
  a.call('paintBoard');
  assert.equal(squares(a).length, 0);
  v.positions.push({ ...v.positions[0], fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4', from: 'h5', to: 'f7', san: 'Qxf7#' });
  v.idx = 1; a.call('paintBoard');
  assert.equal(sqName(a, squares(a)[0]), 'e8');
  v.positions[1] = { ...v.positions[1], fen: 'rnbqkbnr/ppp2ppp/8/1B1pp3/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 3', from: 'f1', to: 'b5', san: 'Bb5+' };
  a.call('paintBoard');
  assert.equal(a.dom.window.document.querySelectorAll('.mate-glow, .mate-badge').length, 0);
});

test('the learning board marks a mate played on the free board', async t => {
  const a = review(t);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ schema: 1, puzzles: [{ id: 'unused' }] }) }));
  await a.call('openLearning');
  const w = a.run('learningWorkspace'), doc = a.dom.window.document;
  t.after(() => w.close());
  for (const move of ['f2f3', 'e7e5', 'g2g4']) w.submitMove(move);
  assert.equal(doc.querySelectorAll('.learn-square .mate-badge').length, 0);
  w.submitMove('d8h4');
  const marked = doc.querySelector('.learn-square .mate-badge')?.closest('.learn-square');
  assert.equal(marked?.dataset.square, 'e1');
  assert.ok(marked.querySelector('.mate-glow')); assert.ok(marked.classList.contains('has-badge'));
});
