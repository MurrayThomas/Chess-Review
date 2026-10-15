import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {sha256} from '../../../data-policy.mjs';
import {queryKey,validateSearch} from '../../E008-human-quality-curves/code/queries.mjs';
import {legalRecords} from '../../E271-opportunity-feasibility/code/audit.mjs';
export const prefix='research/experiments/E274-opportunity-collection-pilot/';
export const PARENTS=['research/datasets/D002-fresh-prefix/games.json.gz',
  'research/experiments/E008-human-quality-curves/evidence/sf19-observations.json.gz',
  'research/experiments/E271-opportunity-feasibility/evidence/results.json',
  'research/experiments/E011-outcome-confirmation/evidence/sf19-observations.json.gz'];
export const SPEC=Object.freeze({games:2,decisionsPerSide:10,gameSeed:'E274-games-v1:',nodes:20000,
  smokeNewQueries:32,smokeProjectionMs:480000,maxCollectorMs:600000,maxNewQueries:2500,maxRequests:5000,
  variationRange:.02,variationFraction:.6,variationPerSide:5});
export function mergeCaches(original,extra,config){
  assert.deepEqual(original.engineConfig,config);assert.ok(original.complete&&extra.complete);
  assert.deepEqual(extra.engineConfigs['20k'],config);const hash=sha256(JSON.stringify(config));assert.equal(extra.configHashes['20k'],hash);
  const cache=new Map(original.searches.map(q=>[q.key,{...q,reuseSource:PARENTS[1]}]));
  for(const row of extra.searches){if(row.configHash!==hash)continue;assert.equal(row.restricted,null);
    if(cache.has(row.key)){const prior=cache.get(row.key);for(const field of ['score','bestmove','pv','rawInfo','history','restricted','nodes','finalNodes','finalSearchInfo'])assert.deepEqual(row[field],prior[field]);}
    else cache.set(row.key,{...row,reuseSource:PARENTS[3]});
  }
  return cache;
}
export function spread(n,k=10){assert.ok(Number.isInteger(n)&&Number.isInteger(k)&&k>0&&n>=k);return Array.from({length:k},(_,j)=>Math.floor((j+.5)*n/k));}
export function select(dataset,config,cachedKeys){
  const ordered=dataset.filter(g=>g.split==='train').map(g=>({game:g,key:sha256(SPEC.gameSeed+g.id)})).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
  assert.ok(ordered.length>=SPEC.games);const games=ordered.slice(0,SPEC.games).map(r=>r.game);
  const players=games.flatMap(g=>g.players.map(p=>p.id));assert.equal(new Set(players).size,4);
  const positions=[],counts=[];
  for(const game of games){
    const board=new Chess(),history=[],all={w:[],b:[]};
    for(let i=0;i<game.moves.length;i++){
      const records=legalRecords(board),legalMoves=records.map(r=>r.uci),played=game.moves[i];assert.ok(legalMoves.includes(played));
      if(legalMoves.length>1)all[board.turn()].push({gameId:game.id,split:game.split,color:board.turn(),ply:i+1,history:[...history],fen:board.fen(),played,legalMoves});
      board._makeMove(records.find(r=>r.uci===played).move);history.push(played);
    }
    assert.deepEqual({w:all.w.length,b:all.b.length},game.decisionCounts);
    const chosen=['w','b'].flatMap(color=>spread(all[color].length,SPEC.decisionsPerSide).map(j=>all[color][j])).sort((a,b)=>a.ply-b.ply);
    positions.push(...chosen);counts.push(...['w','b'].map(color=>({gameId:game.id,color,actualNonforced:all[color].length,selected:10})));
  }
  const configHash=sha256(JSON.stringify(config)),seen=new Set(),queries=[];
  for(let i=0;i<positions.length;i++){
    const p=positions[i];p.rootKey=queryKey(configHash,p.history);p.alternatives=p.legalMoves.map(move=>({move,key:queryKey(configHash,p.history,move)}));
    for(const [key,restricted] of [[p.rootKey,null],...p.alternatives.map(a=>[a.key,a.move])]){
      if(!seen.has(key)){seen.add(key);queries.push({key,positionIndex:i,restricted,cached:cachedKeys.has(key)});}
    }
  }
  return {schema:'E274-selection-v1',spec:SPEC,config,configHash,games:games.map(g=>({gameId:g.id,split:g.split})),sides:counts,positions,queries,
    newQueries:queries.filter(q=>!q.cached).length,reusedQueries:queries.filter(q=>q.cached).length};
}
export function validateObservation(row,selection){
  const planned=selection.queries.find(q=>q.key===row.key);assert.ok(planned,'Unexpected query');
  const p=selection.positions[planned.positionIndex];assert.deepEqual(row.history,p.history);assert.equal(row.restricted,planned.restricted);
  assert.equal(row.key,queryKey(selection.configHash,p.history,planned.restricted));validateSearch(row);
  assert.equal(row.nodes,Number(/\bnodes (\d+)/.exec(row.rawInfo)?.[1]));assert.equal(row.depth,Number(/\bdepth (\d+)/.exec(row.rawInfo)?.[1]));
  assert.equal(row.finalNodes,Number(/\bnodes (\d+)/.exec(row.finalSearchInfo)?.[1]));assert.ok(row.finalNodes>0);assert.ok(row.elapsedMs>=0);
  const board=new Chess(p.fen);for(const u of row.pv.split(' '))board.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});
  if(row.callerWallMs!==undefined){assert.ok(Number.isFinite(row.callerWallMs)&&row.callerWallMs>=row.elapsedMs-1e-6);assert.equal(row.requestCount,row.exactRecovery?2:1);}
  return true;
}
export function smokeDecision(walls,totalMissing){assert.ok(walls.length&&walls.every(x=>Number.isFinite(x)&&x>=0));
  const mean=walls.reduce((a,b)=>a+b,0)/walls.length,projectedMs=mean*totalMissing;
  return {newQueries:walls.length,meanCallerWallMs:mean,projectedTotalMs:projectedMs,passed:walls.length>=SPEC.smokeNewQueries&&projectedMs<=SPEC.smokeProjectionMs};
}
export function stopReason(elapsed,newQueries,requests){
  if(elapsed>=SPEC.maxCollectorMs)return 'time-cap';if(newQueries>=SPEC.maxNewQueries)return 'query-cap';if(requests+2>SPEC.maxRequests)return 'request-cap';return null;
}
