import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,settle} from './helpers/app.mjs';

async function setup(t) {
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  a.state.settings.learningTransition='morph3';
  const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({schema:1,puzzles:[{}]})});
  t.after(()=>{globalThis.fetch=original;});
  await a.call('openLearning');const w=a.run('learningWorkspace'),doc=a.dom.window.document;
  await w.startOpening('italian',{practice:true,color:'w'});
  const board=doc.querySelector('.board');board.getBoundingClientRect=()=>({left:0,top:0,width:800,height:800});
  const point=sq=>({clientX:(sq.charCodeAt(0)-97)*100+50,clientY:(8-Number(sq[1]))*100+50});
  const event=(type,sq,button=0)=>{const e=new a.dom.window.MouseEvent(type,{bubbles:true,cancelable:true,button,...point(sq)});Object.defineProperty(e,'pointerId',{value:1});return e;};
  const down=(sq,button=0)=>board.querySelector(`[data-square=${sq}]`).dispatchEvent(event('pointerdown',sq,button));
  const up=(sq,button=0)=>a.dom.window.dispatchEvent(event('pointerup',sq,button));
  return {a,w,doc,board,down,up,event};
}

test('learning immediately lifts pieces, shares review drag tracking, and restores pieces on cancellation',async t=>{
  const {a,w,doc,board,down,up,event}=await setup(t);
  down('e2');assert.equal(doc.querySelectorAll('.drag-piece img').length,1);
  assert.equal(board.querySelector('[data-square=e2] img').style.visibility,'hidden');
  assert.ok(board.querySelector('[data-square=e4]').classList.contains('legal'));
  a.dom.window.dispatchEvent(event('pointermove','e4'));up('e4');await settle();
  assert.equal(w.activity.ply,2);assert.equal(doc.querySelector('.drag-piece'),null);
  down('g1');a.dom.window.dispatchEvent(event('pointercancel','g1'));
  assert.equal(doc.querySelector('.drag-piece'),null);assert.equal(w.selected,null);
  assert.equal(board.querySelector('[data-square=g1] img').style.visibility,'');
  down('b8');assert.ok(doc.querySelector('.drag-piece'));a.dom.window.dispatchEvent(event('pointermove','c6'));up('c6');
  assert.equal(w.activity.ply,2,'Wrong-side pieces must snap back');
  down('g1');await w.close();assert.equal(doc.querySelector('.drag-piece'),null);
});

test('learning supports click moves, toggled right-click markup, and clears annotations on a left click',async t=>{
  const {w,doc,board,down,up}=await setup(t);
  down('g1',2);up('g1',2);assert.ok(board.querySelector('[data-square=g1]').classList.contains('marked'));
  down('g1',2);up('g1',2);assert.equal(board.querySelector('[data-square=g1]').classList.contains('marked'),false);
  down('g1',2);up('f3',2);assert.equal(board.querySelectorAll('.user-arrows').length,1);
  down('e2');up('e2');assert.equal(board.querySelector('.user-arrows'),null);
  down('e4');up('e4');await settle();assert.equal(w.activity.ply,2);
  assert.equal(doc.querySelector('.drag-piece'),null);await w.close();
});

test('clicking a selected piece again hides destinations while preserving drag and keyboard input',async t=>{
  const {w,board,down,up}=await setup(t);
  down('e2');up('e2');assert.equal(w.selected,'e2');assert.ok(board.querySelector('.legal'));
  down('e2');up('e2');assert.equal(w.selected,null);assert.equal(board.querySelector('.legal, .legal-cap, .sel'),null);
  down('e2');up('e2');assert.equal(w.selected,'e2');
  board.querySelector('[data-square=e2]').click();assert.equal(w.selected,null);
  down('e2');down('e2',2);up('e2',2);assert.equal(w.selected,null);
  assert.equal(board.querySelector('.legal, .legal-cap, .sel'),null);
  await w.close();
});

test('puzzle hints use the configured best-move arrow and reset for the next solver turn',async t=>{
  const {a,w,doc,board}=await setup(t);
  const puzzle={id:'hint-line',fen:w.openingState.positions[0],solution:['e2e4','e7e5','g1f3'],rating:1200,themes:[],theme:'fork',source:{url:'https://lichess.org/training'}};
  w.puzzles=[puzzle];a.state.settings.bestArrowColor='#123456';a.state.settings.arrowOpacity=.7;
  await w.startPuzzleSelection([puzzle]);
  assert.equal(doc.querySelector('.learn-board-caption'),null);
  await w.hintPuzzle();const elo=w.store.value.puzzleRating.elo;
  assert.ok(elo<1200);assert.ok(board.querySelector('[data-square=e2].annotated'));assert.equal(board.querySelector('.puzzle-hint-arrow'),null);
  await w.hintPuzzle();const arrow=board.querySelector('.best-arrow');assert.ok(arrow);
  assert.equal(arrow.querySelector('g').getAttribute('fill'),'#123456');assert.equal(arrow.querySelector('g').getAttribute('opacity'),'0.7');
  assert.equal(w.store.value.puzzleRating.elo,elo);
  await w.submitPuzzle('e2e4');assert.equal(board.querySelector('.annotated, .puzzle-hint-arrow'),null);
  await w.hintPuzzle();assert.ok(board.querySelector('[data-square=g1].annotated'));assert.equal(board.querySelector('.puzzle-hint-arrow'),null);
  await w.hintPuzzle();assert.ok(board.querySelector('.puzzle-hint-arrow'));assert.equal(w.store.value.puzzleRating.elo,elo);
  await w.submitPuzzle('g1f3');assert.equal(w.store.value.puzzleRating.elo,elo);assert.equal(w.store.value.puzzles[puzzle.id].clean,0);
  await w.close();
});

test('learning promotion requires an explicit choice and Escape cancels without closing learning',async t=>{
  const {a,w,doc,board,down,up}=await setup(t);
  w.openingState.positions[0]='7k/P7/8/8/8/8/8/7K w - - 0 1';w.render();
  const moves=[];w.submitMove=move=>moves.push(move);
  down('a7');up('a7');down('a8');up('a8');
  assert.equal(doc.querySelectorAll('.learn-promotion .promotion-options button').length,4);
  assert.deepEqual(moves,[]);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(doc.querySelector('.learn-promotion'),null);assert.equal(w.closed,false);
  down('a7');up('a7');down('a8');up('a8');
  doc.querySelector('[aria-label="Promote to rook"]').click();assert.deepEqual(moves,['a7a8r']);
  await w.close();assert.ok(board);
});
