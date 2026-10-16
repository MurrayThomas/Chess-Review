import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {loadCases} from './cases.mjs';
import {parseLine} from './engine.mjs';
import {currentClassifier,replayLabel} from './classifier.mjs';

test('two specifically authorized image hashes bind legal board and preceding-move reconstructions',async()=>{
  const {input,receipt}=await loadCases();assert.equal(receipt.cases,2);assert.equal(input.authorization.publicDatasetEligible,false);
  assert.deepEqual(new Chess(input.cases[1].before).moves(),['Ke8','e6']);
  assert.equal(new Chess(input.cases[1].before).isCheck(),true);
});
test('UCI parser keeps rank, bound, perspective, WDL and mate explicitly',()=>{
  const p=parseLine('info depth 16 multipv 2 score cp -593 wdl 0 10 990 nodes 12345 pv d7e8 f5c8');
  assert.equal(p.score.cp,-593);assert.deepEqual(p.score.wdl,[0,10,990]);assert.equal(p.multipv,2);assert.equal(p.bound,'exact');
  assert.equal(parseLine('info depth 12 score mate -4 lowerbound nodes 42 pv d7e8').bound,'lowerbound');
  assert.equal(parseLine('bestmove d7e8'),null);
});
test('exact production declarations retain synthetic sound Black offers and reject losing ones',async()=>{
  const {api}=await currentClassifier();const ch=new Chess('k2q4/8/8/8/8/4P3/8/7K b - - 0 1'),m=ch.move('Qd4');
  const c={before:m.before,after:m.after,uci:m.lan};
  const root={score:{cp:0},bestmove:m.lan,lines:[]},played={score:{cp:0}},after={score:{cp:0}};
  assert.equal(replayLabel(api,c,root,played,after,19).category,'brilliant');
  const losing=replayLabel(api,c,{...root,score:{cp:-600}},{score:{cp:-600}},after,19);
  assert.equal(losing.sacrifice,true);assert.notEqual(losing.category,'brilliant');assert.equal(losing.brilliantEligibility,false);
});
test('reported losing-side score cannot earn Brilliant merely by being best',async()=>{
  const {input}=await loadCases(),{api}=await currentClassifier(),c=input.cases[1];
  const root={score:{cp:-593},bestmove:c.uci,lines:[]};
  for(const engine of [18,19]){const r=replayLabel(api,c,root,{score:{cp:-593}},{score:{cp:593}},engine);assert.notEqual(r.category,'brilliant');assert.equal(r.brilliantEligibility,false);}
});
