import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {createHash} from 'node:crypto';
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-9);
const digest=s=>createHash('sha256').update(s).digest('hex');
const points=s=>s.mate!=null?Number(s.mate>0):(2*s.wdl[0]+s.wdl[1])/2000;
const cp=s=>s.mate!=null?Number(s.mate>0):1/(1+Math.exp(-.368208*s.cp/100));
export function independentAudit(dataset,selection,raw,cached,result){
  const games=dataset.filter(g=>g.split==='train').sort((a,b)=>digest('E274-games-v1:'+a.id).localeCompare(digest('E274-games-v1:'+b.id))).slice(0,2);
  assert.deepEqual(games.map(g=>g.id),selection.games.map(g=>g.gameId));let legalChecks=0;
  for(const game of games){const board=new Chess(),all={w:[],b:[]};
    for(let i=0;i<game.moves.length;i++){const legal=board.moves({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).sort(),color=board.turn();
      if(legal.length>1)all[color].push({ply:i+1,legal,fen:board.fen()});const u=game.moves[i];board.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});}
    for(const color of ['w','b']){const wanted=[];for(let j=0;j<10;j++)wanted.push(all[color][Math.floor((2*j+1)*all[color].length/20)]);
      const selected=selection.positions.filter(p=>p.gameId===game.id&&p.color===color);assert.deepEqual(selected.map(p=>p.ply),wanted.map(p=>p.ply));
      for(let j=0;j<10;j++){assert.deepEqual(selected[j].legalMoves,wanted[j].legal);assert.equal(selected[j].fen,wanted[j].fen);legalChecks++;}}
  }
  const requested=new Map();for(const p of selection.positions)for(const move of [null,...p.legalMoves]){
    const key=digest(JSON.stringify({configHash:selection.configHash,history:p.history,restricted:move}));if(!requested.has(key))requested.set(key,{p,move});}
  assert.equal(requested.size,selection.queries.length);for(const q of selection.queries)assert.ok(requested.has(q.key));
  const actual=new Map(selection.queries.filter(q=>q.cached).map(q=>[q.key,cached.get(q.key)]));let sumMs=0,engineMs=0,requests=0;
  for(const row of raw.newSearches){const want=requested.get(row.key);assert.ok(want&&!actual.has(row.key));assert.deepEqual(row.history,want.p.history);assert.equal(row.restricted,want.move);
    assert.ok(!cached.has(row.key));assert.equal(row.pv.split(' ')[0],row.bestmove);if(want.move)assert.equal(row.bestmove,want.move);
    assert.ok(!/\b(lowerbound|upperbound)\b/.test(row.rawInfo));const pvBoard=new Chess(want.p.fen);
    for(const move of row.pv.split(' '))pvBoard.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});
    const score=/\bscore (cp|mate) (-?\d+)/.exec(row.rawInfo);assert.ok(score);assert.equal(row.score[score[1]],Number(score[2]));
    if(row.score.mate==null){const w=/\bwdl (\d+) (\d+) (\d+)/.exec(row.rawInfo);assert.ok(w);assert.deepEqual(row.score.wdl,w.slice(1).map(Number));}
    sumMs+=row.callerWallMs;engineMs+=row.elapsedMs;requests+=row.exactRecovery?2:1;actual.set(row.key,row);
  }
  assert.equal(requests+(raw.failedObservation?.requestCount||0),result.queryCounts.requests);near(result.timing.callerSumMs,sumMs);near(result.timing.engineReturnSumMs,engineMs);
  if(raw.newSearches.length){near(result.timing.callerWall.mean,sumMs/raw.newSearches.length);near(result.extrapolation.currentCallerHoursForOriginalMissing,result.extrapolation.historicalMissingQueries*(sumMs/raw.newSearches.length)/3600000);}
  let complete=0,varied=0;
  for(let i=0;i<selection.positions.length;i++){const p=selection.positions[i],rows=p.alternatives.map(a=>actual.get(a.key)),root=actual.get(p.rootKey),v=result.vectors[i];
    if(!root||rows.some(r=>!r)){assert.equal(v.complete,false);continue;}complete++;assert.equal(v.complete,true);
    const w=rows.map(r=>points(r.score)),c=rows.map(r=>cp(r.score)),range=Math.max(...w)-Math.min(...w);near(v.rangeWdl,range);near(v.rangeCp,Math.max(...c)-Math.min(...c));
    const nondegenerate=Math.round(range*2000)>=40;assert.equal(v.varied,nondegenerate);if(nondegenerate)varied++;
  }
  assert.equal(result.completeVectors,complete);assert.equal(result.variation.variedVectors,varied);
  for(const s of result.sides){const vs=result.vectors.filter(v=>v.gameId===s.gameId&&v.color===s.color);assert.equal(s.complete,vs.filter(v=>v.complete).length);assert.equal(s.varied,vs.filter(v=>v.complete&&v.varied).length);}
  assert.equal(result.passed,Object.values(result.feasibilityGates).every(Boolean));
  return {passed:true,independentLegalVectors:legalChecks,independentQueryKeys:requested.size,independentNewRecords:raw.newSearches.length,
    independentWdlCpVectors:complete,independentTimingAccounting:true,interpretation:'Independent selection/legal/cost/consequence-variation audit; no rating-prediction or human-validity proof.'};
}
