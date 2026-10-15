import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {SPEC,spread,select,mergeCaches,smokeDecision,stopReason,validateObservation} from './protocol.mjs';
import {sha256} from '../../../data-policy.mjs';
import {assess} from './method.mjs';
import {independentAudit} from './audit.mjs';
const moves=['e2e4','e7e5','g1f3','b8c6','f1c4','g8f6','d2d3','f8c5','c2c3','d7d6','e1g1','e8g8','f1e1','a7a6','c4b3','c5a7','b1d2','h7h6','d2f1','c8e6'];
function fixture(){
  const games=['a','b'].map((id,i)=>({id:'authored-'+id,split:'train',moves,decisionCounts:{w:10,b:10},players:[{id:'white-'+i},{id:'black-'+i}]}));
  const config={synthetic:true,budget:{kind:'nodes',value:20000}},selection=select(games,config,new Set());
  const newSearches=selection.queries.map(q=>{
    const p=selection.positions[q.positionIndex],bestmove=q.restricted||p.legalMoves[0],top=bestmove===p.legalMoves[0],cp=top?100:-100,wdl=top?[1000,0,0]:[0,0,1000];
    const rawInfo=`info depth 12 nodes 20000 score cp ${cp} wdl ${wdl.join(' ')} pv ${bestmove}`;
    return {key:q.key,history:p.history,restricted:q.restricted,score:{cp,wdl},bestmove,pv:bestmove,depth:12,nodes:20000,finalNodes:20000,
      rawInfo,finalSearchInfo:rawInfo,elapsedMs:15,callerWallMs:20,requestCount:1};
  });
  const raw={schema:'E274-collection-v1',configHash:selection.configHash,newSearches,newUniqueQueries:newSearches.length,requests:newSearches.length,
    smoke:smokeDecision(newSearches.slice(0,32).map(q=>q.callerWallMs),selection.newQueries),collectorWallMs:20*newSearches.length+500,startupWallMs:100,
    error:null,stopReason:'complete',complete:true,failedObservation:null,pendingQuery:null};
  const historical={queries:{missingUnique:100000},cost:{missingSerialHoursMean:18.792}};return {games,config,selection,raw,historical};
}
test('spread selects distinct evenly spaced indices including the small admissible case',()=>{
  assert.deepEqual(spread(10),Array.from({length:10},(_,i)=>i));assert.deepEqual(spread(20),[1,3,5,7,9,11,13,15,17,19]);
  for(let n=10;n<100;n++){const s=spread(n);assert.equal(new Set(s).size,10);assert.ok(s.every(i=>i>=0&&i<n));}
  assert.throws(()=>spread(9));
});
test('selection is score/outcome free, train-only and deterministically deduplicates keys',()=>{
  const f=fixture(),other=f.games.map(g=>({...g,rating:9999,result:'irrelevant'}));other.push({id:'reserved',split:'test'});
  assert.deepEqual(select(other,f.config,new Set()),f.selection);assert.equal(f.selection.positions.length,40);
  assert.equal(f.selection.queries.length*2,f.selection.positions.reduce((n,p)=>n+1+p.legalMoves.length,0));
});
test('exact compatible cache keys are reused without adding or removing vectors',()=>{
  const f=fixture(),keys=new Set(f.selection.queries.slice(0,12).map(q=>q.key)),r=select(f.games,f.config,keys);
  assert.equal(r.reusedQueries,12);assert.equal(r.newQueries,f.selection.newQueries-12);assert.deepEqual(r.positions,f.selection.positions);
});
test('compatible E011 roots merge without rereading targets or accepting conflicting duplicates',()=>{
  const f=fixture(),root=f.raw.newSearches.find(r=>r.restricted===null),hash=sha256(JSON.stringify(f.config));
  const original={complete:true,engineConfig:f.config,searches:[root]},extra={complete:true,engineConfigs:{'20k':f.config},configHashes:{'20k':hash},searches:[{...root,configHash:hash}]};
  assert.equal(mergeCaches(original,extra,f.config).size,1);extra.searches[0].score={cp:900,wdl:[1000,0,0]};assert.throws(()=>mergeCaches(original,extra,f.config));
});
test('smoke and hard query/request/time limits follow frozen inclusive rules',()=>{
  assert.equal(smokeDecision(Array(32).fill(480),1000).passed,true);assert.equal(smokeDecision(Array(32).fill(481),1000).passed,false);
  assert.equal(smokeDecision(Array(31).fill(1),1000).passed,false);
  assert.equal(stopReason(600000,0,0),'time-cap');assert.equal(stopReason(0,2500,0),'query-cap');assert.equal(stopReason(0,0,4999),'request-cap');assert.equal(stopReason(10,1,1),null);
});
test('complete authored collection passes coverage and preserves measured overhead',()=>{
  const f=fixture(),r=assess(f.selection,f.raw,new Map(),f.historical);assert.equal(r.passed,true);assert.equal(r.completeVectors,40);
  assert.equal(r.variation.variedVectors,40);assert.equal(r.variation.passed,true);assert.equal(r.timing.callerWall.mean,20);assert.equal(r.timing.overheadOutsideCallerMs,500);
  assert.equal(r.queryCounts.observedNew,f.selection.newQueries);
});
test('partial and failed observations remain incomplete with all40 denominators',()=>{
  const f=fixture();f.raw.newSearches=f.raw.newSearches.slice(0,16);f.raw.newUniqueQueries=16;f.raw.requests=16;f.raw.smoke=null;f.raw.complete=false;f.raw.stopReason='time-cap';
  const r=assess(f.selection,f.raw,new Map(),f.historical);assert.equal(r.passed,false);assert.ok(r.completeVectors<40);assert.equal(r.variation.plannedDenominator,40);
});
test('recovery uses caller timing and two requests; malformed raw records fail closed',()=>{
  const f=fixture(),r=f.raw.newSearches[0];r.exactRecovery=true;r.requestCount=2;r.callerWallMs=40;f.raw.requests++;f.raw.collectorWallMs+=20;
  f.raw.smoke=smokeDecision(f.raw.newSearches.slice(0,32).map(q=>q.callerWallMs),f.selection.newQueries);
  const result=assess(f.selection,f.raw,new Map(),f.historical);assert.equal(result.timing.recoveries,1);assert.ok(result.timing.callerWall.mean>result.timing.engineReturn.mean);
  const bad=structuredClone(r);bad.history=['a2a3'];assert.throws(()=>validateObservation(bad,f.selection));
  const illegal=structuredClone(r);illegal.pv+=' a1a8';assert.throws(()=>validateObservation(illegal,f.selection));
});
test('independent public-API/keys/consequence/timing audit rejects forged counts',()=>{
  const f=fixture(),r=assess(f.selection,f.raw,new Map(),f.historical),a=independentAudit(f.games,f.selection,f.raw,new Map(),r);
  assert.equal(a.passed,true);assert.equal(a.independentLegalVectors,40);const bad=structuredClone(r);bad.completeVectors=39;assert.throws(()=>independentAudit(f.games,f.selection,f.raw,new Map(),bad));
});
