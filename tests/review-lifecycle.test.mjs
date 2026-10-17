import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,deferred,fakeEngine,settle} from './helpers/app.mjs';

function review(t){const a=app(t);loadGame(a,'1. e4 e5');a.state.meta={gameId:'initial'};a.call('computeDerived');a.call('buildUI');a.call('buildBoard');a.replace('startAnalysis',()=>{});return a;}
test('concurrent helper requests share startup and stale startup is terminated',async t=>{
  const a=review(t),ready=deferred();let starts=0;a.replace('createEngine',()=>{starts++;return ready.promise;});
  const first=a.call('getHelperEngine'),second=a.call('getHelperEngine');assert.equal(starts,1);
  const firstRejected=assert.rejects(first,/cancelled/),secondRejected=assert.rejects(second,/cancelled/);
  await a.call('applyGame',{pgn:'1. d4 d5',meta:{gameId:'new'},analysis:null});
  const old=fakeEngine();ready.resolve(old);await Promise.all([firstRejected,secondRejected]);assert.equal(old.dead,true);assert.equal(a.state.helperEngine,null);
  const fresh=fakeEngine();a.replace('createEngine',async()=>fresh);assert.equal(await a.call('getHelperEngine'),fresh);
});
test('dead and failed helpers can be recreated',async t=>{
  const a=review(t),old=fakeEngine();old.terminate();a.state.helperEngine=old;let starts=0;
  a.replace('createEngine',async()=>{if(++starts===1)throw Error('Unavailable');return fakeEngine();});
  await assert.rejects(a.call('getHelperEngine'),/Unavailable/);const fresh=await a.call('getHelperEngine');assert.equal(fresh.dead,false);assert.equal(starts,2);
});
test('turning threats off invalidates a pending result',async t=>{
  const a=review(t),ready=deferred(),started=deferred();a.state.idx=1;a.state.settings.showThreat=true;
  a.state.helperEngine=fakeEngine(()=>{started.resolve();return ready.promise;});
  const rendering=a.call('renderThreatArrow');await started.promise;a.state.settings.showThreat=false;await a.call('renderThreatArrow');
  ready.resolve({bestmove:'e7e5',score:{cp:0},lines:[]});await rendering;assert.equal(a.dom.window.document.querySelector('.threat-arrow'),null);
});
test('latest library selection wins even when an earlier lookup resolves last',async t=>{
  const a=review(t),ready=deferred(),started=deferred();a.context.browserAPI.storage.local.get=async key=>{if(key==='analysis:A'){started.resolve();await ready.promise;}return {[key]:null};};
  const first=a.call('openLibraryGame',{id:'A',pgn:'1. d4 d5',meta:{gameId:'A'},meSide:'w'});await started.promise;
  await a.call('openLibraryGame',{id:'B',pgn:'1. c4 e5',meta:{gameId:'B'},meSide:'w'});ready.resolve();await first;
  assert.equal(a.state.meta.gameId,'B');assert.equal((await a.call('loadJob')).meta.gameId,'B');
});
test('selecting the displayed game cancels an older pending library selection',async t=>{
  const a=review(t),ready=deferred();a.context.browserAPI.storage.local.get=async key=>{await ready.promise;return {[key]:null};};
  const first=a.call('openLibraryGame',{id:'A',pgn:'1. d4 d5',meta:{gameId:'A'},meSide:'w'});
  await a.call('openLibraryGame',{id:'initial'});ready.resolve();await first;assert.equal(a.state.meta.gameId,'initial');
});
test('drag cancellation owns its pointer, restores the piece and cancels on navigation',t=>{
  const a=review(t),doc=a.dom.window.document,win=a.dom.window;
  const event=(type,id)=>{const e=new win.Event(type);Object.assign(e,{pointerId:id});return e;};
  a.call('startDrag',{clientX:20,clientY:20,pointerId:7},'e2');const original=a.run('sqByName.e2').querySelector('.piece-img');assert.equal(original.style.visibility,'hidden');
  win.dispatchEvent(event('pointercancel',8));assert.equal(doc.querySelectorAll('.drag-piece').length,1);
  win.dispatchEvent(event('pointercancel',7));assert.equal(doc.querySelector('.drag-piece'),null);assert.equal(original.style.visibility,'');
  a.call('startDrag',{clientX:20,clientY:20,pointerId:9},'e2');a.call('go',1);assert.equal(doc.querySelector('.drag-piece'),null);assert.equal(a.state.idx,1);
  win.dispatchEvent(event('pointerup',9));assert.equal(a.state.analysisMode,false);
});
test('display cache cannot relabel an old build or depth as current',t=>{
  const a=review(t);a.state.settings.engineLines=1;
  a.call('renderEngine',[{score:{cp:777},pv:'e2e4 e7e5',depth:16,multipv:1}]);assert.match(a.dom.window.document.querySelector('#engineMount').textContent,/7\.77/);
  a.state.settings.engineDepth=20;a.call('renderEngine',null);assert.doesNotMatch(a.dom.window.document.querySelector('#engineMount').textContent,/7\.77/);
});
