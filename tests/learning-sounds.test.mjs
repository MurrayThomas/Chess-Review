import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../lib/chess.js';
import {app, loadGame} from './helpers/app.mjs';

function puzzle(fen,solution) {
  return {id:'sound-test',fen,solution,rating:1200,difficulty:'Introductory',phase:'Middlegame',theme:'hangingPiece',themes:[],source:{url:'https://lichess.org/training'}};
}
async function setup(t,p) {
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  const sounds=[];let wrong=0;
  a.state.settings.sound=true;a.state.settings.learningTransition='morph4';
  a.replace('playEvent',event=>sounds.push(event));a.replace('playWrongSound',()=>wrong++);
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles:[p]})}));
  await a.call('openLearning');const w=a.run('learningWorkspace');
  t.after(()=>w.close());await w.startPuzzleSelection([p]);
  return {a,w,sounds,wrong:()=>wrong};
}

for(const [name,fen,move,event] of [
  ['quiet move',new Chess().fen(),'e2e4','move'],
  ['capture','4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1','e4d5','capture'],
  ['castling','r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1','e1g1','castle'],
  ['check','4k3/8/8/8/8/8/3R4/4K3 w - - 0 1','d2e2','check'],
  ['promotion with check','4k3/P7/8/8/8/8/8/4K3 w - - 0 1','a7a8q','check'],
  ['en passant','4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1','e5d6','capture'],
])test(`a correct puzzle ${name} uses the existing ${event} sound`,async t=>{
  const p=puzzle(fen,[move]),{w,sounds,wrong}=await setup(t,p);
  await w.submitPuzzle(move);assert.deepEqual(sounds,[event]);assert.equal(wrong(),0);
});

test('wrong captures and castles play only the wrong-answer cue; illegal moves stay silent',async t=>{
  const p=puzzle('r3k2r/8/8/3p4/4P3/8/8/R3K2R w KQkq - 0 1',['a1a2']);
  const {w,sounds,wrong}=await setup(t,p);
  await w.submitPuzzle('e4d5');await w.submitPuzzle('e1g1');
  assert.deepEqual(sounds,[]);assert.equal(wrong(),2);
  await w.submitPuzzle('a1b8');assert.equal(w.feedback.status,'illegal');assert.deepEqual(sounds,[]);assert.equal(wrong(),2);
});

test('puzzle move sounds follow the existing mute setting',async t=>{
  const {a,w,sounds}=await setup(t,puzzle(new Chess().fen(),['e2e4']));
  a.state.settings.sound=false;await w.submitPuzzle('e2e4');assert.deepEqual(sounds,[]);
});

function replyPuzzle() {
  const c=new Chess();c.move('e4');c.move('d5');return puzzle(c.fen(),['e4d5','d8d5','b1c3']);
}
const afterReply=()=>new Promise(resolve=>setTimeout(resolve,140));
test('automatic opponent replies also play their normal sound after the accepted move',async t=>{
  const {w,sounds}=await setup(t,replyPuzzle());await w.submitPuzzle('e4d5');
  assert.deepEqual(sounds,['capture']);await afterReply();assert.deepEqual(sounds,['capture','capture']);
});

for(const action of ['wrong answer','navigation','close','mute'])test(`${action} prevents a pending opponent reply sound from playing`,async t=>{
  const {a,w,sounds,wrong}=await setup(t,replyPuzzle());await w.submitPuzzle('e4d5');
  if(action==='wrong answer')await w.submitPuzzle('b1a3');
  else if(action==='navigation')await w.navigate('puzzles');
  else if(action==='close')await w.close();
  else a.state.settings.sound=false;
  await afterReply();assert.deepEqual(sounds,['capture']);assert.equal(wrong(),action==='wrong answer'?1:0);
});
