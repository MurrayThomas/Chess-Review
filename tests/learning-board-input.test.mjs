import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,settle} from './helpers/app.mjs';
import {Chess} from '../lib/chess.js';

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

test('the learning library board supports independent moves, arrows, marks and piece pickup',async t=>{
  const {a,w,doc,board,down,up,event}=await setup(t);await w.navigate('puzzles');
  const reviewFen=a.call('activePos').fen,reviewPositions=a.state.positions,progress=JSON.stringify(w.store.value);
  assert.equal(w.currentFen(),new Chess().fen());
  down('g1',2);up('f3',2);assert.ok(board.querySelector('.user-arrows'));
  down('e4',2);up('e4',2);assert.ok(board.querySelector('[data-square=e4].marked'));
  down('e2');assert.ok(doc.querySelector('.drag-piece'));assert.ok(board.querySelector('[data-square=e4].legal'));up('e2');down('e4');up('e4');
  assert.equal(new Chess(w.currentFen()).get('e4').type,'p');assert.equal(board.querySelector('.user-arrows'),null);
  down('e7');a.dom.window.dispatchEvent(event('pointermove','e5'));up('e5');
  const scratchFen=w.currentFen();assert.equal(new Chess(scratchFen).get('e5').color,'b');
  await w.navigate('concepts');await w.navigate('openings');assert.equal(w.currentFen(),scratchFen);
  a.call('toggleFlip');assert.equal(w.currentFen(),scratchFen);assert.equal(a.state.analysisMode,false);assert.equal(board.classList.contains('analysis'),false);
  assert.equal(a.call('activePos').fen,reviewFen);assert.equal(a.state.positions,reviewPositions);assert.equal(JSON.stringify(w.store.value),progress);
  await w.close();assert.equal(a.call('activePos').fen,reviewFen);assert.equal(doc.querySelector('.board'),board);
});

test('learning free play can promote through the same graphical picker',async t=>{
  const {w,doc,down,up}=await setup(t);await w.navigate('puzzles');
  w.homePosition.load('7k/P7/8/8/8/8/8/7K w - - 0 1');w.render();
  down('a7');up('a7');down('a8');up('a8');
  assert.deepEqual([...doc.querySelectorAll('.promotion-options img')].map(n=>n.dataset.piece),['wQ','wR','wB','wN']);
  doc.querySelector('[aria-label="Promote to knight"]').click();assert.equal(w.homePosition.get('a8').type,'n');assert.equal(w.activity,null);
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
  assert.ok(elo<1200);assert.ok(board.querySelector('[data-square=e2].puzzle-hint-square'));assert.equal(board.querySelector('.annotated, .puzzle-hint-arrow'),null);
  await w.hintPuzzle();const arrow=board.querySelector('.best-arrow');assert.ok(arrow);
  assert.equal(arrow.querySelector('g').getAttribute('fill'),'#123456');assert.equal(arrow.querySelector('g').getAttribute('opacity'),'0.7');
  assert.equal(w.store.value.puzzleRating.elo,elo);
  await w.submitPuzzle('e2e4');assert.equal(board.querySelector('.puzzle-hint-square, .puzzle-hint-arrow'),null);
  await w.hintPuzzle();assert.ok(board.querySelector('[data-square=g1].puzzle-hint-square'));assert.equal(board.querySelector('.puzzle-hint-arrow'),null);
  await w.hintPuzzle();assert.ok(board.querySelector('.puzzle-hint-arrow'));assert.equal(w.store.value.puzzleRating.elo,elo);
  await w.submitPuzzle('g1f3');assert.equal(w.store.value.puzzleRating.elo,elo);assert.equal(w.store.value.puzzles[puzzle.id].clean,0);
  await w.close();
});

test('puzzle hint highlights survive pickup, deselection, cancellation and wrong moves until the correct move',async t=>{
  const {a,w,doc,board,down,up,event}=await setup(t);
  const puzzle={id:'persistent-hint',fen:new Chess().fen(),solution:['e2e4'],rating:1200,themes:[],theme:'fork',source:{url:'https://lichess.org/training'}};
  w.puzzles=[puzzle];await w.startPuzzleSelection([puzzle]);await w.hintPuzzle();await w.hintPuzzle();
  const hinted=()=>board.querySelector('[data-square=e2].puzzle-hint-square');
  down('e2');assert.ok(doc.querySelector('.drag-piece'));assert.ok(hinted());up('e2');
  down('e2');assert.equal(w.selected,null);assert.ok(hinted());
  a.dom.window.dispatchEvent(event('pointercancel','e2'));assert.equal(doc.querySelector('.drag-piece'),null);assert.ok(hinted());
  down('g1');assert.equal(w.selected,'g1');assert.ok(hinted());
  a.dom.window.dispatchEvent(new a.dom.window.Event('blur'));assert.equal(w.selected,null);assert.ok(hinted());
  down('g1',2);assert.ok(hinted());up('g1',2);assert.ok(hinted());
  down('e2');a.dom.window.dispatchEvent(event('pointermove','e5'));up('e5');assert.equal(w.selected,null);assert.ok(hinted());
  down('e2');a.dom.window.dispatchEvent(event('pointermove','e3'));up('e3');await settle();
  assert.equal(w.activity.step,0);assert.ok(hinted());assert.ok(board.querySelector('.puzzle-hint-arrow'));
  down('e2');assert.ok(hinted());a.dom.window.dispatchEvent(event('pointermove','e4'));up('e4');await settle();
  assert.equal(w.feedback.status,'completed');assert.equal(board.querySelector('.puzzle-hint-square, .puzzle-hint-arrow'),null);
  await w.close();
});

test('learning promotion requires an explicit choice and Escape cancels without closing learning',async t=>{
  const {a,w,doc,board,down,up}=await setup(t);
  w.openingState.positions[0]='7k/P7/8/8/8/8/8/7K w - - 0 1';w.render();
  const moves=[];w.submitMove=move=>moves.push(move);
  down('a7');up('a7');down('a8');up('a8');
  assert.equal(doc.querySelectorAll('.learn-promotion .promotion-options button').length,4);
  assert.deepEqual([...doc.querySelectorAll('.promotion-options img')].map(n=>n.dataset.piece),['wQ','wR','wB','wN']);
  assert.ok([...doc.querySelectorAll('.promotion-options button')].every(n=>n.textContent===''));
  assert.deepEqual(moves,[]);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(doc.querySelector('.learn-promotion'),null);assert.equal(w.closed,false);
  down('a7');up('a7');down('a8');up('a8');
  doc.querySelector('[aria-label="Promote to rook"]').click();assert.deepEqual(moves,['a7a8r']);
  await w.close();assert.ok(board);
});

test('a picked-up solver piece survives the opponent introduction and reply without accepting early drops',async t=>{
  const {a,w,doc,board,down,up,event}=await setup(t);
  const before=new Chess();before.move('e4');const after=new Chess(before.fen());after.move('d5');
  const puzzle={id:'pickup-intro',fen:after.fen(),setup:{fen:before.fen(),move:'d7d5'},solution:['e4d5','d8d5','b1c3'],rating:1200,themes:[],theme:'fork',source:{url:'https://lichess.org/training'}};
  w.puzzles=[puzzle];a.state.settings.moveAnim=true;
  let advance,finishSlide;
  t.mock.method(w,'waitForPuzzleReply',()=>new Promise(resolve=>{advance=()=>resolve(true);}));
  a.dom.window.HTMLImageElement.prototype.animate=()=>({finished:new Promise(resolve=>{finishSlide=resolve;}),cancel(){finishSlide?.();}});
  const opening=w.startPuzzleSelection([puzzle]);await settle();
  down('e4');assert.ok(board.querySelector('[data-square=e4].sel'));assert.ok(doc.querySelector('.drag-piece'));
  a.dom.window.dispatchEvent(event('pointermove','d5'));up('d5');
  assert.equal(w.activity.step,0);assert.equal(w.store.value.puzzleRating.played,0);assert.equal(doc.querySelector('.drag-piece'),null);
  down('e4');const ghost=doc.querySelector('.drag-piece');advance();await settle();
  assert.equal(doc.querySelector('.drag-piece'),ghost);assert.equal(board.querySelector('[data-square=e4] img').style.visibility,'hidden');
  finishSlide();await opening;assert.equal(doc.querySelector('.drag-piece'),ghost);
  assert.equal(w.selected,'e4');assert.equal(w.busy,false);
  a.dom.window.dispatchEvent(event('pointermove','d5'));up('d5');await settle();
  assert.equal(w.activity.step,1);assert.equal(w.busy,true);assert.equal(doc.querySelector('.drag-piece'),null);
  assert.deepEqual([...board.querySelectorAll('.last-move')].map(n=>n.dataset.square).sort(),['d5','e4']);
  down('b1');const knight=doc.querySelector('.drag-piece');assert.ok(knight);advance();await settle();
  assert.equal(doc.querySelector('.drag-piece'),knight);assert.equal(w.activity.step,2);
  assert.deepEqual([...board.querySelectorAll('.last-move')].map(n=>n.dataset.square).sort(),['d5','d8']);
  finishSlide();await settle();assert.equal(w.busy,false);assert.equal(doc.querySelector('.drag-piece'),knight);
  a.dom.window.dispatchEvent(event('pointermove','c3'));up('c3');await settle();
  assert.equal(w.feedback.status,'completed');assert.equal(w.store.value.puzzleRating.played,1);
  assert.equal(doc.querySelector('.drag-piece'),null);await w.close();
});

test('puzzle promotion uses the graphical picker and submits the selected underpromotion',async t=>{
  const {w,doc,board,down,up}=await setup(t);
  const puzzle={id:'promote',fen:'7k/P7/8/8/8/8/8/7K w - - 0 1',solution:['a7a8r'],rating:1200,themes:[],theme:'promotion',source:{url:'https://lichess.org/training'}};
  w.puzzles=[puzzle];await w.startPuzzleSelection([puzzle]);down('a7');up('a7');down('a8');up('a8');
  assert.equal(w.activity.step,0);assert.deepEqual([...doc.querySelectorAll('.promotion-options img')].map(n=>n.dataset.piece),['wQ','wR','wB','wN']);
  doc.querySelector('[aria-label="Promote to rook"]').click();await settle();
  assert.equal(w.feedback.status,'completed');assert.equal(board.querySelector('[data-square=a8] img').dataset.piece,'wR');
});

test('a solver piece captured by the opponent cancels its pickup cleanly',async t=>{
  const {a,w,doc,down}=await setup(t);
  const before=new Chess();before.move('e4');before.move('d5');const after=new Chess(before.fen());after.move('exd5');
  const puzzle={id:'captured-pickup',fen:after.fen(),setup:{fen:before.fen(),move:'e4d5'},solution:['d8d5'],rating:1200,themes:[],theme:'fork',source:{url:'https://lichess.org/training'}};
  w.puzzles=[puzzle];a.state.settings.moveAnim=true;let advance;
  t.mock.method(w,'waitForPuzzleReply',()=>new Promise(resolve=>{advance=()=>resolve(true);}));
  const opening=w.startPuzzleSelection([puzzle]);await settle();down('d5');assert.ok(doc.querySelector('.drag-piece'));
  advance();await opening;assert.equal(doc.querySelector('.drag-piece'),null);assert.equal(w.selected,null);assert.equal(w.store.value.puzzleRating.played,0);
});
