import test from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {queryKey} from '../../E008-human-quality-curves/code/queries.mjs';
import {components,audit,legalRecords} from './audit.mjs';
function fixture(){
  const board=new Chess(), history=[], configHash='a'.repeat(64), searches=[], positions=[];
  const game={id:'synthetic',split:'train',players:[{id:'authored-white'},{id:'authored-black'}],moves:['e2e4','e7e5']};
  for(const [i,played] of game.moves.entries()){
    const legal=board.moves({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).sort();
    const records=[null,...legal].map(restricted=>{const bestmove=restricted||played;
      return {key:queryKey(configHash,history,restricted),history:[...history],restricted,bestmove,pv:bestmove,
        score:{cp:0,wdl:[200,600,200]},nodes:20000,elapsedMs:10,rawInfo:`info depth 10 nodes 20000 score cp 0 wdl 200 600 200 pv ${bestmove}`,finalSearchInfo:'info nodes 20000'};});
    searches.push(...records);positions.push({gameId:game.id,ply:i+1,color:board.turn(),history:[...history],played,legalMoves:legal,
      rootKey:records[0].key,alternatives:records.slice(1).map(r=>({move:r.restricted,key:r.key}))});
    board.move({from:played.slice(0,2),to:played.slice(2,4)});history.push(played);
  }
  return {games:[game],evidence:{configHash,positions,searches,engineConfig:{synthetic:true}}};
}
test('connected components join both colors across shared players',()=>{
  const g=(a,b)=>({players:[{id:a},{id:b}]});
  assert.deepEqual(components([g('a','b'),g('c','d'),g('b','c'),g('e','f')]),{players:6,components:2,largest:3,largestFraction:.75,independentGraphCheck:true});
});
test('exact query reuse and side census on authored legal histories',()=>{
  const f=fixture(),r=audit(f.games,f.evidence);
  assert.equal(r.completeVectors,2);assert.equal(r.nonforcedDecisions,2);assert.equal(r.legalAlternatives,40);
  assert.equal(r.queries.fullUnique,42);assert.equal(r.queries.missingUnique,0);assert.equal(r.gamesWithTenVectorsBothSides,0);
  assert.equal(r.passed,false);assert.equal(r.cost.cachedMeanMs,10);
});
test('missing alternatives and wrong histories fail closed',()=>{
  const f=fixture();f.evidence.positions[0].alternatives.pop();assert.throws(()=>audit(f.games,f.evidence));
  const q=fixture();q.evidence.positions[0].history=['a2a3'];assert.throws(()=>audit(q.games,q.evidence));
});
test('reserved roles and malformed timing cannot enter census',()=>{
  const f=fixture();f.games[0].split='test';assert.throws(()=>audit(f.games,f.evidence));
  const q=fixture();q.evidence.searches[0].elapsedMs=-1;assert.throws(()=>audit(q.games,q.evidence));
});
test('fast legal generation and transitions match public APIs including special moves',()=>{
  const fixtures=[
    {fen:undefined,moves:['e2e4','e7e5','g1f3','b8c6','f1c4','g8f6','e1g1']},
    {fen:undefined,moves:['e2e4','a7a6','e4e5','d7d5','e5d6']},
    {fen:'7k/P7/8/8/8/8/8/7K w - - 0 1',moves:['a7a8n']},
    {fen:'4k3/8/8/8/8/8/4r3/4K3 w - - 0 1',moves:['e1e2']},
  ];
  for(const f of fixtures){const fast=new Chess(f.fen),reference=new Chess(f.fen);
    for(const u of f.moves){const rows=legalRecords(fast);
      assert.deepEqual(rows.map(r=>r.uci),reference.moves({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).sort());
      const chosen=rows.find(r=>r.uci===u);assert.ok(chosen);fast._makeMove(chosen.move);
      reference.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});assert.equal(fast.fen(),reference.fen());
    }
  }
});
