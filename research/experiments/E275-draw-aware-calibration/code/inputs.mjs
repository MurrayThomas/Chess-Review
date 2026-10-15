import assert from 'node:assert/strict';
import path from 'node:path';
import {Chess} from '../../../../lib/chess.js';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {sha256} from '../../../data-policy.mjs';
import {prepare} from '../../E008-human-quality-curves/code/prepare.mjs';
import {queryKey,validateSearch} from '../../E008-human-quality-curves/code/queries.mjs';
import {selectGames} from '../../E009-search-stability/code/method.mjs';
import {SPEC} from './model.mjs';
export const prefix='research/experiments/E275-draw-aware-calibration/';
export const PARENTS=['research/datasets/D002-fresh-prefix/games.json.gz',
  'research/experiments/E008-human-quality-curves/evidence/sf19-observations.json.gz',
  'research/experiments/E009-search-stability/evidence/sf19-observations.json.gz',
  'research/experiments/E008-human-quality-curves/evidence/verification.json'];
export function foldsFor(games){
  const sorted=games.filter(g=>g.split==='train').map(g=>({id:g.id,key:sha256(SPEC.foldSeed+g.id)})).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
  return Object.fromEntries(sorted.map((g,i)=>[g.id,i%SPEC.folds]));
}
export async function loadParents(access,root){
  const [dataset,low,high,verified]=await Promise.all(PARENTS.map(p=>access.readJson(p)));assert.ok(verified.passed);
  const games=dataset.filter(g=>['train','validation'].includes(g.split));assert.equal(games.length,600);assert.equal(new Set(games.flatMap(g=>g.players.map(p=>p.id))).size,1200);
  const file=path.join(root,'engine/stockfish-19-lite-single.js'),configLow=await engineConfig(file,{kind:'nodes',value:20000}),configHigh=await engineConfig(file,{kind:'nodes',value:80000});
  const prepared=prepare(low,dataset,configLow);assert.ok(high.complete);assert.equal(high.schema,'E009-search-observations-v1');
  assert.deepEqual(high.engineConfig,configHigh);assert.equal(high.configHash,sha256(JSON.stringify(configHigh)));assert.equal(high.baselineConfigHash,low.configHash);
  assert.deepEqual(high.games,selectGames(low.games));assert.equal(high.positions.length,45);
  const outcomes=prepared.outcomes.map(r=>({gameId:r.gameId,split:r.split,ply:r.ply,color:r.color,score:r.score,target:r.target===1?0:r.target===.5?1:2,weight:r.weight}));
  const queries=[low,high].map(raw=>new Map(raw.searches.map(q=>[q.key,q]))),positions=new Map(low.positions.map(p=>[p.gameId,p]));
  const stability=high.positions.map((p,i)=>{
    assert.equal(p.gameId,high.games[i].id);const old=positions.get(p.gameId);
    for(const k of ['gameId','split','ply','history','color','played','legalMoves'])assert.deepEqual(p[k],old[k]);
    assert.equal(p.baselineRootKey,old.rootKey);const board=new Chess();for(const u of p.history)board.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});
    const scores=[p.baselineRootKey,p.rootKey].map((key,j)=>{const row=queries[j].get(key);assert.ok(row);validateSearch(row);
      assert.equal(key,queryKey(j?high.configHash:low.configHash,p.history));assert.deepEqual(row.history,p.history);assert.equal(row.restricted,null);
      const pvBoard=new Chess(board.fen());for(const u of row.pv.split(' '))pvBoard.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});return row.score;});
    return {gameId:p.gameId,split:p.split,ply:p.ply,low:scores[0],high:scores[1]};
  });
  const folds=foldsFor(games);assert.equal(Object.keys(folds).length,450);for(let f=0;f<5;f++)assert.equal(Object.values(folds).filter(x=>x===f).length,90);
  return {schema:'E275-input-v1',spec:SPEC,outcomes,stability,folds,cohort:games.map(g=>({gameId:g.id,split:g.split})),
    configurations:[configLow,configHigh],diagnostics:prepared.diagnostics,exclusions:prepared.exclusions,
    inputSha256:Object.fromEntries(PARENTS.map(p=>[p,access.receipt.inputHashes[p]]))};
}
export async function loadFrozen(access){
  const input=await access.readJson(prefix+'evidence/inputs.json.gz');assert.equal(input.schema,'E275-input-v1');assert.deepEqual(input.spec,SPEC);
  for(const [p,h] of Object.entries(input.inputSha256))assert.equal(access.receipt.inputHashes[p],h);
  assert.equal(input.cohort.filter(g=>g.split==='train').length,450);assert.equal(input.cohort.filter(g=>g.split==='validation').length,150);
  assert.deepEqual(foldsFor(input.cohort.map(g=>({id:g.gameId,split:g.split}))),input.folds);return input;
}
