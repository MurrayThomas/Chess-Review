import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../lib/chess.js';
import {app,loadGame} from './helpers/app.mjs';

async function setup(t) {
  const a=app(t);loadGame(a,'1. e4 e5 2. Nf3 Nc6');a.call('computeDerived');a.call('buildUI');a.call('renderAll');a.call('go',2);
  const sounds=[];a.state.settings.sound=true;a.replace('playEvent',event=>sounds.push(event));
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles:[{id:'unused'}]})}));
  await a.call('openLearning');const w=a.run('learningWorkspace'),doc=a.dom.window.document,board=doc.querySelector('.board');
  t.after(()=>w.close());
  board.getBoundingClientRect=()=>({left:0,top:0,width:800,height:800});
  const pointer=(type,sq)=>{const e=new a.dom.window.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:(sq.charCodeAt(0)-97)*100+50,clientY:(8-Number(sq[1]))*100+50});Object.defineProperty(e,'pointerId',{value:1});return e;};
  const down=sq=>board.querySelector(`[data-square=${sq}]`).dispatchEvent(pointer('pointerdown',sq));
  const up=sq=>a.dom.window.dispatchEvent(pointer('pointerup',sq));
  const clickMove=(from,to)=>{board.querySelector(`[data-square=${from}]`).click();board.querySelector(`[data-square=${to}]`).click();};
  const key=(value,target=doc,options={})=>target.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...options}));
  const drag=(from,to)=>{down(from);a.dom.window.dispatchEvent(pointer('pointermove',to));up(to);};
  return {a,w,doc,board,sounds,down,up,drag,clickMove,key};
}

test('the initial learning board accepts either colour and consecutive same-colour moves by drag and click',async t=>{
  const {a,w,board,sounds,down,drag,clickMove}=await setup(t);
  const review={fen:a.call('activePos').fen,positions:a.state.positions,idx:a.state.idx},progress=JSON.stringify(w.store.value);
  down('e7');assert.ok(board.querySelector('[data-square=e5].legal'));drag('e7','e5');
  assert.equal(new Chess(w.currentFen()).get('e5')?.color,'b');
  clickMove('g8','f6');clickMove('d2','d4');clickMove('g1','f3');
  const c=new Chess(w.currentFen());
  for(const [square,type,color] of [['e5','p','b'],['f6','n','b'],['d4','p','w'],['f3','n','w']])assert.deepEqual(c.get(square),{type,color});
  assert.deepEqual(sounds,['move','move','move','move']);assert.match(board.getAttribute('aria-label'),/Either colour can move/);
  const fen=w.currentFen();w.submitMove('d4d7');assert.equal(w.currentFen(),fen);assert.equal(sounds.length,4);
  assert.equal(w.activity,null);assert.equal(board.querySelector('.learn-move-nav'),null);
  assert.equal(JSON.stringify(w.store.value),progress);await w.close();
  assert.equal(a.call('activePos').fen,review.fen);assert.equal(a.state.positions,review.positions);assert.equal(a.state.idx,review.idx);
});

test('only Left and Right navigate free-board history, cancel pickup and preserve the review and tab state',async t=>{
  const {a,w,doc,sounds,down,key}=await setup(t),positions=[w.currentFen()],reviewIndex=a.state.idx;
  for(const move of ['e2e4','g1f3','e7e5']){w.submitMove(move);positions.push(w.currentFen());}
  down('b8');assert.ok(doc.querySelector('.drag-piece'));key('ArrowLeft');assert.equal(doc.querySelector('.drag-piece'),null);
  assert.equal(w.currentFen(),positions[2]);assert.equal(w.selected,null);
  key('ArrowLeft');assert.equal(w.currentFen(),positions[1]);key('ArrowLeft');assert.equal(w.currentFen(),positions[0]);
  const count=sounds.length;key('ArrowLeft');assert.equal(sounds.length,count);
  key('ArrowRight');assert.equal(w.currentFen(),positions[1]);
  key('Home');key('End');key('ArrowRight',doc,{ctrlKey:true});assert.equal(w.currentFen(),positions[1]);
  const range=w.root.querySelector('input[type=range]');key('ArrowRight',range);assert.equal(w.currentFen(),positions[1]);
  key('ArrowRight');assert.equal(w.currentFen(),positions[2]);
  await w.navigate('concepts');await w.navigate('openings');a.call('toggleFlip');assert.equal(w.currentFen(),positions[2]);
  key('ArrowRight');assert.equal(w.currentFen(),positions[3]);const end=sounds.length;key('ArrowRight');assert.equal(sounds.length,end);
  assert.equal(a.state.idx,reviewIndex);assert.equal(w.root.querySelector('.learn-move-nav'),null);
});

test('a new move after going back replaces the future continuation without changing saved learning progress',async t=>{
  const {w,sounds,key}=await setup(t),progress=JSON.stringify(w.store.value);
  w.submitMove('e2e4');const first=w.currentFen();w.submitMove('g1f3');key('ArrowLeft');assert.equal(w.currentFen(),first);
  w.submitMove('b1c3');const branch=w.currentFen();key('ArrowRight');assert.equal(w.currentFen(),branch);
  assert.equal(new Chess(branch).get('g1').type,'n');assert.equal(new Chess(branch).get('c3').type,'n');
  key('ArrowLeft');assert.equal(w.currentFen(),first);key('ArrowRight');assert.equal(w.currentFen(),branch);
  assert.equal(JSON.stringify(w.store.value),progress);assert.ok(sounds.length>=6);
});

for(const [name,fen,move,event] of [
  ['capture','4k3/8/8/3p4/4P3/8/8/4K3 b - - 0 1','e4d5','capture'],
  ['castling','r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1','e8g8','castle'],
  ['check','4k3/8/8/8/8/8/3R4/4K3 b - - 0 1','d2e2','check'],
  ['promotion','4k3/P7/8/8/8/8/8/4K3 b - - 0 1','a7a8q','check'],
  ['en passant','4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1','e5d6','capture'],
])test(`free-board ${name} and history use the existing sound and restore the complete position`,async t=>{
  const {w,sounds,key}=await setup(t);w.homePosition.load(fen);w.render();
  w.submitMove(move);const after=w.currentFen();assert.notEqual(after,fen);assert.deepEqual(sounds,[event]);
  key('ArrowLeft');assert.equal(w.currentFen(),fen);key('ArrowRight');assert.equal(w.currentFen(),after);assert.deepEqual(sounds,[event,event,event]);
});

test('free-board sounds respect mute and skipped turns expire en passant without allowing king captures',async t=>{
  const {a,w,sounds,key}=await setup(t);a.state.settings.sound=false;
  w.homePosition.load('4k3/8/8/8/3p4/8/4P3/4K3 w - - 0 1');w.render();
  w.submitMove('e2e4');assert.equal(w.currentFen().split(' ')[3],'e3');
  w.submitMove('e4e5');assert.deepEqual(sounds,[]);
  assert.equal(w.currentFen().split(' ')[3],'-');
  key('ArrowLeft');assert.equal(w.currentFen().split(' ')[3],'e3');assert.deepEqual(sounds,[]);
  w.homePosition.load('4k3/8/8/8/8/8/4R3/4K3 w - - 0 1');w.render();const before=w.currentFen();
  w.submitMove('e2e8');assert.equal(w.currentFen(),before);assert.deepEqual(sounds,[]);
});
