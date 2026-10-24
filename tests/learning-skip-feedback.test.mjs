import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';

async function setup(t) {
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data={},sounds=[];
  const puzzles=['first','second'].map(id=>({id,fen:new Chess().fen(),solution:['e2e4'],rating:1200,themes:[],source:{url:'https://lichess.org/training'}}));
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(value){Object.assign(data,structuredClone(value));}};
  const w=new LearningWorkspace({document:dom.window.document,storage,settings:()=>({moveAnim:false}),makePiece:()=>dom.window.document.createElement('img'),onPuzzleWrong:()=>sounds.push('wrong')});
  w.shuffle=items=>[...items];
  t.after(async()=>{await w.close();dom.window.close();});
  await w.open();await w.startPuzzleSelection(puzzles);
  return {w,dom,sounds};
}

test('skipping charges one Elo loss and carries its delta to the next puzzle without wrong-move feedback',async t=>{
  const {w,sounds}=await setup(t);
  await Promise.all([w.skipPuzzle(),w.skipPuzzle()]);
  assert.equal(w.activity.id,'second');assert.equal(w.store.value.puzzleRating.elo,1176);
  assert.equal(w.store.value.puzzleRating.losses,1);
  assert.equal(w.store.value.puzzles.first.ratingResult.reason,'skip');
  assert.equal(w.root.querySelector('.puzzle-elo-change.loss').textContent,'-24 rating');
  assert.equal(w.root.querySelector('.puzzle-practice-status').textContent,'White to move');
  assert.equal(w.root.querySelector('.puzzle-result-badge, .puzzle-wrong'),null);assert.deepEqual(sounds,[]);
  await w.submitPuzzle('e2e4');
  assert.equal(w.root.querySelector('.puzzle-elo-change.loss'),null);
});

test('the last skip returns to the puzzle library and never charges an already failed puzzle twice',async t=>{
  const {w}=await setup(t);
  await w.submitPuzzle('d2d4');assert.equal(w.store.value.puzzleRating.elo,1176);
  await w.skipPuzzle();assert.equal(w.store.value.puzzleRating.elo,1176);
  await w.skipPuzzle();assert.equal(w.activity,null);
  // The library shows no rating panel; the rating and its changes appear only during puzzle play.
  assert.equal(w.root.querySelector('.puzzle-elo-panel'),null);
  assert.equal(w.store.value.puzzleRating.losses,2);assert.equal(w.root.textContent.includes('Wrong move'),false);
});

test('hint and skip keep their DOM identity while saving, rerendering and loading another puzzle',async t=>{
  const {w}=await setup(t),hint=w.root.querySelector('.puzzle-hint'),skip=w.root.querySelector('.puzzle-skip');
  const same=()=>{assert.equal(w.root.querySelector('.puzzle-hint'),hint);assert.equal(w.root.querySelector('.puzzle-skip'),skip);};
  await w.hintPuzzle();same();w.render();same();
  const pending=w.skipPuzzle();same();assert.equal(hint.disabled,true);assert.equal(skip.disabled,true);
  await pending;same();assert.equal(hint.disabled,false);assert.equal(skip.disabled,false);
});
