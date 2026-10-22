import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../lib/chess.js';
import {app,loadGame} from './helpers/app.mjs';

test('learning tabs lead the side panel, with Back in its footer across libraries and Statistics',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  const puzzles=[{id:'layout',fen:new Chess().fen(),solution:['e2e4'],rating:1200,themes:['fork'],source:{url:'https://lichess.org/training'}}];
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles})}));
  await a.call('openLearning');const w=a.run('learningWorkspace');t.after(()=>w.close());
  const check=()=>{
    assert.equal(w.shell.firstElementChild,w.root.querySelector('.learn-nav'));
    assert.ok(w.shell.lastElementChild.matches('footer.learn-footer'));
    assert.ok(w.shell.lastElementChild.querySelector('[data-focus=review]'));
  };
  check();assert.ok(w.root.querySelector('[data-focus=puzzle-statistics]'));
  w.showPuzzleStatistics(true);check();assert.equal(w.root.querySelector('[data-focus=review]').textContent,'← Back to puzzles');
  w.root.querySelector('[data-focus=review]').click();check();assert.equal(w.page,'puzzles');
  await w.navigate('concepts');check();await w.navigate('openings');check();
  const main=w.shell.querySelector('.learn-main');main.scrollTop=100;w.render();
  assert.equal(w.shell.querySelector('.learn-main').scrollTop,100);
});
