import assert from 'node:assert/strict';
import path from 'node:path';
import {Chess} from '../../../../lib/chess.js';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {sha256} from '../../../data-policy.mjs';
import {queryKey,validateSearch} from '../../E008-human-quality-curves/code/queries.mjs';
import {selectGames} from '../../E009-search-stability/code/method.mjs';
import {SPEC,scoreLoss} from './method.mjs';
export const prefix='research/experiments/E273-category-boundary-abstention/';
export const parents=['research/experiments/E008-human-quality-curves/evidence/sf19-observations.json.gz',
  'research/experiments/E009-search-stability/evidence/sf19-observations.json.gz',
  'research/experiments/E009-search-stability/evidence/results.json',
  'research/experiments/E009-search-stability/evidence/verification.json',
  'research/experiments/E009-search-stability/evidence/clean-replay.json'];
export async function loadParents(access,root){
  const [low,high,saved,verified,clean]=await Promise.all(parents.map(p=>access.readJson(p)));
  assert.ok(verified.passed&&clean.passed);assert.equal(low.schema,'E008-engine-observations-v1');assert.equal(high.schema,'E009-search-observations-v1');
  assert.ok(low.complete&&high.complete&&!low.smoke);assert.equal(low.positions.length,600);assert.equal(high.positions.length,45);
  const engine=path.join(root,'engine/stockfish-19-lite-single.js'),configs=[];
  for(const [raw,nodes] of [[low,20000],[high,80000]]){const config=await engineConfig(engine,{kind:'nodes',value:nodes});assert.deepEqual(config,raw.engineConfig);assert.equal(raw.configHash,sha256(JSON.stringify(config)));configs.push(config);}
  assert.equal(high.baselineConfigHash,low.configHash);assert.deepEqual(high.games,selectGames(low.games));
  assert.equal(saved.records.length,45);assert.deepEqual(high.positions.map(p=>p.gameId),saved.records.map(r=>r.gameId));
  const base=new Map(low.positions.map(p=>[p.gameId,p])),queries=[low,high].map(raw=>new Map(raw.searches.map(q=>[q.key,q])));
  const rows=[];
  for(let i=0;i<high.positions.length;i++){
    const p=high.positions[i],l=base.get(p.gameId),archive=saved.records[i];
    for(const k of ['gameId','split','ply','history','color','played','legalMoves'])assert.deepEqual(p[k],l[k]);
    assert.ok(['train','validation'].includes(p.split));assert.equal(p.ply,p.history.length+1);
    assert.equal(p.baselineRootKey,l.rootKey);assert.deepEqual(p.alternatives.map(a=>({move:a.move,key:a.baselineKey})),l.alternatives);
    const board=new Chess();for(const m of p.history)board.move({from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]});
    assert.deepEqual(board.moves({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).sort(),p.legalMoves);
    assert.ok(p.legalMoves.length>1&&p.legalMoves.includes(p.played));
    const values=[];
    for(const [j,position,raw] of [[0,l,low],[1,p,high]]){
      const rootQuery=queries[j].get(position.rootKey),playedKey=position.alternatives.find(a=>a.move===p.played)?.key,playedQuery=queries[j].get(playedKey);
      for(const [q,restricted] of [[rootQuery,null],[playedQuery,p.played]]){
        assert.ok(q);validateSearch(q);assert.deepEqual(q.history,p.history);assert.equal(q.restricted,restricted);
        assert.equal(q.key,queryKey(raw.configHash,p.history,restricted));assert.ok(p.legalMoves.includes(q.bestmove));
        assert.equal(q.finalNodes,Number(/\bnodes (\d+)/.exec(q.finalSearchInfo)?.[1]));
      }
      const value={root:rootQuery.score,played:playedQuery.score,top:rootQuery.bestmove===p.played,
        sourceKeys:{root:rootQuery.key,played:playedQuery.key}};
      assert.equal(scoreLoss(value),archive[j?'high':'low'].cpLoss);values.push(value);
    }
    rows.push({gameId:p.gameId,split:p.split,ply:p.ply,low:values[0],high:values[1]});
  }
  assert.equal(new Set(rows.map(r=>r.gameId)).size,45);assert.equal(rows.filter(r=>r.split==='train').length,30);assert.equal(rows.filter(r=>r.split==='validation').length,15);
  return {rows,freeze:{schema:'E273-input-freeze-v1',spec:SPEC,configurations:configs,
    inputSha256:Object.fromEntries(parents.map(p=>[p,access.receipt.inputHashes[p]])),
    cohort:rows.map(r=>({gameId:r.gameId,split:r.split,ply:r.ply})),newSearches:0,fits:0,bandEvaluations:0}};
}
export async function loadFrozen(access){
  const rows=await access.readJson(prefix+'evidence/inputs.json.gz'),freeze=await access.readJson(prefix+'evidence/freeze.json');
  assert.deepEqual(freeze.spec,SPEC);assert.equal(rows.length,45);assert.deepEqual(rows.map(r=>({gameId:r.gameId,split:r.split,ply:r.ply})),freeze.cohort);
  for(const [p,h] of Object.entries(freeze.inputSha256))assert.equal(access.receipt.inputHashes[p],h);
  return {rows,freeze};
}
