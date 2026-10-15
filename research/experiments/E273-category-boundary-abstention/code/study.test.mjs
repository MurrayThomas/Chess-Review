import test from 'node:test';
import assert from 'node:assert/strict';
import {SPEC,band,select,scoreLoss,bootstrap,summarize,evaluate} from './method.mjs';
import {audit} from './audit.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12);
const obs=(root,played,top=false)=>({root:{cp:root},played:{cp:played},top});
test('ordinary bands retain all four boundaries and equality conventions',()=>{
  assert.deepEqual([0,.02,.05,.1,.2,1].map(band),['excellent','good','inacc','mistake','blunder','blunder']);
  for(const x of [-1,NaN,Infinity,1.01])assert.throws(()=>band(x));
});
test('closed margin rejects on both sides of every boundary, including endpoints',()=>{
  for(const t of SPEC.boundaries)for(const d of [-.01,-.005,0,.005,.01])assert.equal(select(t+d),null);
  assert.equal(select(0),'excellent');assert.equal(select(.3),'blunder');assert.equal(select(1),'blunder');
  assert.equal(select(.009999),'excellent');assert.equal(select(.030001),'good');
});
test('loss handles root perspective, top moves, negative residuals and signed mate',()=>{
  assert.equal(scoreLoss(obs(0,100)),0);assert.equal(scoreLoss(obs(200,-200,true)),0);
  near(scoreLoss(obs(100,0)),1/(1+Math.exp(-.368208))-.5);
  assert.equal(scoreLoss({root:{mate:2},played:{mate:-3},top:false}),1);
  assert.equal(scoreLoss({root:{mate:-2},played:{cp:0},top:false}),0);
  for(const r of [{root:{mate:0},played:{cp:0},top:false},{root:{cp:1,mate:2},played:{cp:0},top:false},obs(NaN,0)])assert.throws(()=>scoreLoss(r));
});
test('all-case cost accounts for stable labels withheld, not only errors avoided',()=>{
  const rows=[{emitted:false,disagrees:true},{emitted:false,disagrees:false},{emitted:true,disagrees:false},{emitted:true,disagrees:false}];
  const s=summarize(rows);near(s.policyGain,.2);near(s.coverage,.5);assert.equal(s.withheldStable,1);near(s.breakEvenAbstentionCost,.5);
  const all=summarize(rows.map(r=>({...r,emitted:false})));assert.equal(all.candidateRisk,null);near(all.candidatePolicyLoss,.1);
  const none=summarize(rows.map(r=>({...r,emitted:true})));assert.equal(none.breakEvenAbstentionCost,null);assert.equal(none.policyGain,0);
  assert.throws(()=>summarize([]));
});
test('selection cannot depend on the higher-budget comparison',()=>{
  const row={gameId:'authored',split:'train',ply:1,low:obs(100,0),high:obs(100,0)};
  const a=evaluate([row]);const b=evaluate([{...row,high:obs(1000,-1000)}]);
  assert.equal(a.records[0].candidate,b.records[0].candidate);assert.equal(a.records[0].emitted,b.records[0].emitted);
  assert.notEqual(a.records[0].reference,b.records[0].reference);
});
test('bootstrap has fixed seed and exact constant-value endpoints',()=>{
  const a=bootstrap([.9,-.1,0,0],1000);assert.deepEqual(a,bootstrap([.9,-.1,0,0],1000));
  const b=bootstrap([.25,.25],100);near(b.lower,.25);near(b.upper,.25);assert.throws(()=>bootstrap([]));
});
test('reserved roles and duplicate games cannot enter evaluation',()=>{
  const row={gameId:'authored',split:'test',ply:1,low:obs(0,0),high:obs(0,0)};assert.throws(()=>evaluate([row]));
  row.split='train';assert.throws(()=>evaluate([row,row]));
});
test('adequately sized empty retained groups fail the declared coverage guard',()=>{
  const rows=Array.from({length:10},(_,i)=>({gameId:'authored-'+i,split:'train',ply:1,low:obs(100,0),high:obs(100,0)}));
  const {result}=evaluate(rows);assert.equal(result.summary.coverage,0);assert.equal(result.gates.subgroups,false);assert.equal(result.gates.coverage,false);
  assert.equal(result.groups.find(g=>g.name==='role/train').passed,false);
});
test('independent scorer, interval margin, counts and BigInt bootstrap reject forged results',()=>{
  const rows=[
    {gameId:'authored-1',split:'train',ply:1,low:obs(100,0),high:obs(1000,-1000)},
    {gameId:'authored-2',split:'train',ply:1,low:obs(100,0),high:obs(100,0)},
    {gameId:'authored-3',split:'validation',ply:1,low:obs(0,0),high:obs(0,0)},
    {gameId:'authored-4',split:'validation',ply:1,low:obs(1000,-1000),high:obs(1000,-1000)}];
  const {result,records}=evaluate(rows);assert.equal(audit(rows,result,records).passed,true);near(result.summary.policyGain,.2);
  for(const field of ['policyGain','withheldDisagreements']){const forged=structuredClone(result);forged.summary[field]+=1;assert.throws(()=>audit(rows,forged,records));}
  const wrong=structuredClone(records);wrong[0].emitted=true;assert.throws(()=>audit(rows,result,wrong));
});
