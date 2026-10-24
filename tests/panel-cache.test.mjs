import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,fakeEngine,deferred,settle} from './helpers/app.mjs';
import {Chess} from '../lib/chess.js';

function review(t){
  const a=app(t);loadGame(a,'1. e4 e5 2. Nf3 Nc6');a.call('computeDerived');a.call('buildUI');
  a.state.settings.engineLines=2;return a;
}
function lines(fen){return new Chess(fen).moves({verbose:true}).slice(0,2).map((m,i)=>({score:{cp:-i},pv:m.from+m.to+(m.promotion||''),depth:16,multipv:i+1}));}
test('backtracking reuses exact panel results and settings or history changes miss the cache',async t=>{
  const a=review(t),S=a.state;let searches=0;
  a.replace('ensureLiveEngine',async()=>fakeEngine(async fen=>{searches++;return {lines:lines(fen)};}));
  for(const idx of [0,1,0]){S.idx=idx;await a.call('requestPanelLines');}assert.equal(searches,2);
  S.settings.engineHash=32;await a.call('requestPanelLines');assert.equal(searches,3);
  a.call('resetLiveEngine');await a.call('requestPanelLines');assert.equal(searches,4);
  for(let n=0;n<20;n++){S.settings.engineHash=64+n;await a.call('requestPanelLines');}
  assert.equal(a.run('panelLineCache.size'),16);
});
test('pending searches join, and navigation to a cached position rejects obsolete completions',async t=>{
  const a=review(t),S=a.state,ready=deferred();let searches=0;
  const engine=fakeEngine(async fen=>{if(++searches===2)return ready.promise;return {lines:lines(fen)};});
  S.liveEngine=engine;a.replace('ensureLiveEngine',async()=>engine);
  await a.call('requestPanelLines');S.idx=1;
  const first=a.call('requestPanelLines');await settle();const second=a.call('requestPanelLines');await settle();assert.equal(searches,2);
  S.idx=0;await a.call('requestPanelLines');ready.resolve({lines:lines(S.positions[1].fen)});await Promise.all([first,second]);
  assert.equal(S._panelCache.idx,0);assert.equal(searches,2);
});
test('same board with different game history never reuses panel evidence',async t=>{
  const a=review(t),S=a.state;let searches=0;a.replace('ensureLiveEngine',async()=>fakeEngine(async fen=>{searches++;return {lines:lines(fen)};}));
  loadGame(a,'1. Nf3 Nf6 2. Nc3 Nc6');S.idx=4;await a.call('requestPanelLines');const fen=S.positions[4].fen;
  loadGame(a,'1. Nc3 Nc6 2. Nf3 Nf6');S.idx=4;assert.equal(S.positions[4].fen,fen);await a.call('requestPanelLines');assert.equal(searches,2);
});
