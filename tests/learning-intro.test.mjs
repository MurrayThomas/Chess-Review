import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';
import {app} from './helpers/app.mjs';

const before=new Chess();before.move('e4');const after=new Chess(before.fen());after.move('d5');
const puzzle={id:'intro',fen:after.fen(),setup:{fen:before.fen(),move:'d7d5'},solution:['e4d5','d8d5','b1c3'],rating:1200,themes:['fork'],theme:'fork',source:{url:'https://lichess.org/training'}};
const settle=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
async function setup(t,{settings={moveAnim:true},item=puzzle}={}) {
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data={},sounds=[];
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles:[item]})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){Object.assign(data,structuredClone(values));}};
  const w=new LearningWorkspace({document:dom.window.document,storage,settings:()=>settings,onPuzzleMove:san=>sounds.push(san),makePiece:()=>dom.window.document.createElement('img')});
  t.after(async()=>{await w.close();dom.window.close();});await w.open();return {w,dom,data,sounds};
}

test('fresh puzzles show and animate the recorded opponent move before enabling the solver',async t=>{
  const {w,dom,data,sounds}=await setup(t);let showMove,finishMove;
  t.mock.method(w,'waitForPuzzleReply',delay=>{assert.equal(delay,450);return new Promise(resolve=>{showMove=()=>resolve(true);});});
  dom.window.HTMLImageElement.prototype.animate=()=>({finished:new Promise(resolve=>{finishMove=resolve;}),cancel(){finishMove?.();}});
  const opening=w.startPuzzleSelection([puzzle]);await settle();
  assert.equal(w.currentFen(),puzzle.setup.fen);assert.equal(w.busy,true);assert.equal(w.activity.step,0);
  assert.ok(w.root.querySelector('[data-focus="puzzle-hint"]').disabled);
  await w.submitPuzzle(puzzle.solution[0]);await w.hintPuzzle();assert.equal(w.store.value.puzzleRating.played,0);
  showMove();await settle();assert.equal(w.currentFen(),puzzle.fen);assert.equal(w.busy,true);assert.deepEqual(sounds,['d5']);
  finishMove();await opening;
  assert.equal(w.busy,false);assert.equal(w.lastMove,'d7d5');assert.equal(data['learning:v1'].resume.step,0);
  assert.equal(w.store.value.puzzleRating.played,0);
});

for(const step of [0,2])test(`resuming a puzzle from step ${step} replays the introduction and restarts the full line`,async t=>{
  const {w,sounds,data}=await setup(t);let showMove;
  t.mock.method(w,'waitForPuzzleReply',()=>new Promise(resolve=>{showMove=()=>resolve(true);}));
  const opening=w.startPuzzleSelection([puzzle],{id:puzzle.id,step,assisted:true,mistakes:2,rated:true});await settle();
  assert.equal(w.currentFen(),puzzle.setup.fen);assert.equal(w.activity.step,0);assert.equal(w.busy,true);assert.deepEqual(w.puzzleMoves,[]);
  assert.equal(w.activity.assisted,true);assert.equal(w.activity.mistakes,2);
  showMove();await opening;
  assert.equal(w.currentFen(),puzzle.fen);assert.equal(w.busy,false);assert.deepEqual(sounds,['d5']);
  assert.equal(data['learning:v1'].puzzleResume.step,0);assert.equal(w.store.value.puzzleRating.played,1);
});

test('closing during the introductory pause cancels it and preserves a stable solver resume',async t=>{
  const {w,data,sounds}=await setup(t);
  const opening=w.startPuzzleSelection([puzzle]);await settle();assert.equal(w.replyPending,true);
  await w.close();await opening;assert.equal(w.replyTimer,null);assert.deepEqual(sounds,[]);
  assert.equal(data['learning:v1'].resume.step,0);assert.equal(w.store.value.puzzleRating.played,0);
});

test('the challenge clock waits until the opponent introduction is complete',async t=>{
  const {w}=await setup(t);let release;
  t.mock.method(w,'waitForPuzzleReply',()=>new Promise(resolve=>{release=()=>resolve(true);}));
  const starting=w.startChallenge(60);await settle();assert.equal(w.run.clock.started,false);
  release();await starting;assert.equal(w.run.clock.started,true);clearInterval(w.ticker);
  assert.equal(w.store.value.puzzleRating.played,0);
});

for(const item of [{...puzzle,setup:null},{...puzzle,setup:{fen:before.fen(),move:'a1a8'}}])test('missing or invalid setup data opens directly to the solver position',async t=>{
  const {w,sounds}=await setup(t,{item});t.mock.method(w,'waitForPuzzleReply',()=>{throw Error('Unexpected intro');});
  await w.startPuzzleSelection([item]);assert.equal(w.currentFen(),item.fen);assert.equal(w.busy,false);assert.deepEqual(sounds,[]);
});

test('reduced motion applies the setup without a pause or sliding animation',async t=>{
  const {w,dom}=await setup(t);dom.window.matchMedia=()=>({matches:true});
  t.mock.method(w,'waitForPuzzleReply',()=>{throw Error('Unexpected delay');});
  dom.window.HTMLImageElement.prototype.animate=()=>{throw Error('Unexpected animation');};
  await w.startPuzzleSelection([puzzle]);assert.equal(w.currentFen(),puzzle.fen);assert.equal(w.lastMove,'d7d5');assert.equal(w.busy,false);
});

test('a previously attempted puzzle replays its setup without awarding another result',async t=>{
  const {w,sounds}=await setup(t);await w.persist(p=>{p.puzzles[puzzle.id]={attempts:1,clean:1};});
  t.mock.method(w,'waitForPuzzleReply',async()=>true);
  await w.startPuzzleSelection([puzzle]);assert.equal(w.currentFen(),puzzle.fen);assert.equal(w.activity.rated,false);assert.deepEqual(sounds,['d5']);
  assert.equal(w.store.value.puzzleRating.played,0);assert.equal(w.store.value.puzzles[puzzle.id].attempts,1);
});

test('a castling setup animates both the king and rook',async t=>{
  const fen='r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1',c=new Chess(fen);c.move('O-O');
  const item={...puzzle,setup:{fen,move:'e8g8'},fen:c.fen(),solution:['a1a2']};
  const {w,dom}=await setup(t,{item}),destinations=[];t.mock.method(w,'waitForPuzzleReply',async()=>true);
  dom.window.HTMLImageElement.prototype.animate=function(){destinations.push(this.closest('[data-square]').dataset.square);return {finished:Promise.resolve(),cancel(){}};};
  await w.startPuzzleSelection([item]);assert.deepEqual(destinations,['g8','f8']);assert.equal(w.currentFen(),item.fen);assert.equal(w.busy,false);
});

for(const speed of [1,7,10])test(`puzzle loading keeps its original timing while replies match review speed ${speed}`,async t=>{
  const settings={moveAnim:true,animSpeed:speed},a=app(t);
  a.state.settings.animSpeed=speed;
  const duration=a.call('animDuration');
  assert.equal(duration,440-speed*40);
  const {w,dom}=await setup(t,{settings}),animations=[];
  t.mock.method(w,'waitForPuzzleReply',async()=>true);
  dom.window.HTMLImageElement.prototype.animate=function(frames,options){
    animations.push({square:this.closest('[data-square]').dataset.square,options});
    return {finished:Promise.resolve(),cancel(){}};
  };
  await w.startPuzzleSelection([puzzle]);
  await w.submitPuzzle('e4d5');
  assert.deepEqual(animations.map(a=>a.square),['d5','d5']);
  assert.deepEqual(animations[0].options,{duration:420,easing:'ease-out'});
  assert.deepEqual(animations[1].options,{duration,easing:'cubic-bezier(.22,.61,.36,1)'});
  settings.moveAnim=false;
  await w.preparePuzzle(puzzle);assert.equal(animations.length,2);
});

test('closing while the setup piece is sliding cancels the animation without changing progress',async t=>{
  const {w,dom}=await setup(t);let finish,cancelled=false;t.mock.method(w,'waitForPuzzleReply',async()=>true);
  dom.window.HTMLImageElement.prototype.animate=()=>({finished:new Promise(resolve=>{finish=resolve;}),cancel(){cancelled=true;finish();}});
  const opening=w.startPuzzleSelection([puzzle]);await settle();assert.ok(finish);assert.equal(w.busy,true);
  await w.close();await opening;assert.equal(cancelled,true);assert.equal(w.store.value.puzzleRating.played,0);assert.equal(w.activity.step,0);
});
