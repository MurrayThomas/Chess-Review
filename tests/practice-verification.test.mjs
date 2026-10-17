import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,fakeEngine,deferred,settle} from './helpers/app.mjs';
function practice(t,build='nnue'){
  const a=app(t);loadGame(a,'1. e4 e5');Object.assign(a.state.settings,{enginePath:build,engineDepth:16,engineHash:16,engineSkill:20,engineLines:1,classifyLines:1});
  a.state.bests[0]={bestmove:'e2e4',score:{cp:40},lines:[{multipv:1,score:{cp:40},pv:'e2e4'}]};a.call('computeDerived');a.call('buildUI');a.call('renderAll');a.state.practice={spots:[1],i:0,solving:true,busy:false};return a;
}
for(const build of ['nnue','sf19lite'])test(`${build}: a measured good alternative passes without modifying original review evidence`,async t=>{
  const a=practice(t,build),root=a.state.bests[0],original=JSON.stringify(root),calls=[];let options;
  const engine=fakeEngine(async(...args)=>{calls.push(args);return {bestmove:'d2d4',score:{cp:30},lines:[]};});
  a.replace('createPracticeEngine',async(key,value)=>{assert.equal(key,build);options=value;return engine;});
  if(build==='sf19lite')Object.assign(a.state.settings,{engineDepth:8,engineHash:256,engineSkill:3});
  await a.call('practiceAttempt','d2','d4');assert.equal(a.state.practice.solving,false);assert.equal(engine.dead,true);assert.equal(JSON.stringify(root),original);
  assert.equal(calls[0][3].initialFen,a.state.positions[0].fen);assert.equal(calls[0][5].searchMove,'d2d4');assert.equal(calls[0][5].requireExact,true);assert.equal(calls[0][5].cold,true);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][5].budget)),build==='sf19lite'?{kind:'nodes',value:20000}:{kind:'depth',value:16});assert.equal(options.Hash,build==='sf19lite'?32:16);assert.equal(options['Skill Level'],20);
});
test('verified inferior moves fail, while engine failure remains ungraded and retryable',async t=>{
  const a=practice(t);a.replace('createPracticeEngine',async()=>{throw Error('Unavailable');});await a.call('practiceAttempt','d2','d4');assert.equal(a.state.practice.solving,true);assert.equal(a.state.practice.fails||0,0);assert.match(a.state.practice.checkError,/verify/);
  a.replace('createPracticeEngine',async()=>fakeEngine(async()=>({bestmove:'d2d4',score:{cp:-400},lines:[]})));await a.call('practiceAttempt','d2','d4');assert.equal(a.state.practice.fails,1);assert.equal(a.state.practice.solving,true);
});
test('leaving practice cancels verification and cannot complete a newer session',async t=>{
  const a=practice(t),ready=deferred(),started=deferred(),engine=fakeEngine(()=>{started.resolve();return ready.promise;});a.replace('createPracticeEngine',async()=>engine);
  const checking=a.call('practiceAttempt','d2','d4');await started.promise;a.call('exitPractice');await checking;assert.equal(engine.dead,true);assert.equal(a.state.practice,null);
  ready.resolve({bestmove:'d2d4',score:{cp:30},lines:[]});await settle();assert.equal(a.state.practice,null);
});
test('queen stalemate fails and rook promotion is accepted as a distinct move',async t=>{
  const a=app(t);loadGame(a,'[SetUp "1"]\n[FEN "8/k1P5/2K5/8/8/8/8/8 w - - 0 1"]\n\n1. Kb5');a.state.bests[0]={bestmove:'c7c8r',score:{mate:2},lines:[{score:{mate:2},pv:'c7c8r'}]};a.call('computeDerived');a.call('buildUI');a.call('renderAll');a.state.practice={spots:[1],i:0,solving:true,busy:false};
  await a.call('practiceAttempt','c7','c8','q');assert.equal(a.state.practice.solving,true);assert.equal(a.state.practice.fails,1);
  await a.call('practiceAttempt','c7','c8','r');assert.equal(a.state.practice.solving,false);assert.equal(a.run('sqByName.c8').querySelector('.piece-img').dataset.piece,'wR');
});
