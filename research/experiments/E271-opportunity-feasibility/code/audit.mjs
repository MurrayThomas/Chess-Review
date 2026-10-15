import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {queryKey, validateSearch} from '../../E008-human-quality-curves/code/queries.mjs';

const moveKey = m => m.from + m.to + (m.promotion || '');
const sum = xs => xs.reduce((a, b) => a + b, 0);
function quantile(xs, p) { const s = [...xs].sort((a,b) => a-b); return s[Math.floor((s.length-1)*p)] ?? null; }

export function components(games) {
  const parent = games.map((_, i) => i), owner = new Map();
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  games.forEach((g, i) => g.players.forEach(p => {
    assert.equal(typeof p.id, 'string'); assert.ok(p.id.length);
    if (owner.has(p.id)) parent[find(i)] = find(owner.get(p.id)); else owner.set(p.id, i);
  }));
  const sizes = new Map();
  games.forEach((_,i) => sizes.set(find(i), (sizes.get(find(i)) || 0) + 1));
  // Independent adjacency traversal checks the union-find component census.
  const byPlayer = new Map();
  games.forEach((g,i) => g.players.forEach(p => byPlayer.set(p.id, [...(byPlayer.get(p.id) || []), i])));
  const seen = new Set(), other = [];
  for (let i=0;i<games.length;i++) {
    if (seen.has(i)) continue;
    const queue=[i]; seen.add(i); let count=0;
    while(queue.length) { const j=queue.pop(); count++;
      for (const p of games[j].players) for (const k of byPlayer.get(p.id)) if (!seen.has(k)) { seen.add(k); queue.push(k); }
    }
    other.push(count);
  }
  const actual=[...sizes.values()].sort((a,b)=>b-a); assert.deepEqual(actual,other.sort((a,b)=>b-a));
  return {players: owner.size, components: actual.length, largest: actual[0] || 0,
    largestFraction: (actual[0] || 0) / games.length, independentGraphCheck: true};
}

export function audit(games, evidence) {
  assert.ok(games.length); assert.ok(games.every(g => ['train','validation'].includes(g.split)));
  assert.equal(new Set(games.map(g=>g.id)).size,games.length);
  const ids=new Set(games.map(g=>g.id)), positions=evidence.positions.filter(p=>ids.has(p.gameId));
  const queries=new Map();
  for(const r of evidence.searches) {
    assert.ok(!queries.has(r.key)); validateSearch(r);
    assert.ok(r.elapsedMs>=0); assert.equal(r.key,queryKey(evidence.configHash,r.history,r.restricted));
    queries.set(r.key,r);
  }
  const vectors=new Map();
  for(const p of positions) {
    const key=p.gameId+':'+p.ply; assert.ok(!vectors.has(key)); vectors.set(key,p);
  }
  const allKeys=new Set(), reusedKeys=new Set(), sides=[], lengths=[], branches=[];
  let legalDecisions=0, legalAlternatives=0, validatedVectors=0;
  const started=performance.now();
  for(const game of games) {
    const board=new Chess(), history=[], counts={w:0,b:0}, available={w:0,b:0};
    for(let i=0;i<game.moves.length;i++) {
      if(performance.now()-started>120000) throw Error('Analysis time budget exceeded');
      const legal=board.moves({verbose:true}).map(moveKey).sort(), color=board.turn(), ply=i+1;
      assert.ok(legal.includes(game.moves[i]),'Illegal played move');
      const p=vectors.get(game.id+':'+ply);
      if(p) {
        assert.deepEqual(p.history,history); assert.deepEqual(p.legalMoves,legal); assert.equal(p.color,color);
        assert.equal(p.played,game.moves[i]); assert.equal(p.ply,history.length+1);
        assert.equal(p.rootKey,queryKey(evidence.configHash,history)); assert.ok(queries.has(p.rootKey));
        assert.deepEqual(p.alternatives.map(a=>a.move),legal);
        for(const a of p.alternatives) { assert.equal(a.key,queryKey(evidence.configHash,history,a.move)); assert.ok(queries.has(a.key)); }
        validatedVectors++; if(legal.length>1) available[color]++;
      }
      if(legal.length>1) {
        counts[color]++; legalDecisions++; legalAlternatives+=legal.length; branches.push(legal.length);
        for(const restricted of [null,...legal]) {
          const k=queryKey(evidence.configHash,history,restricted); allKeys.add(k); if(queries.has(k)) reusedKeys.add(k);
        }
      }
      const u=game.moves[i]; board.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}); history.push(u);
    }
    lengths.push(game.moves.length);
    sides.push(...['w','b'].map(color=>({gameId:game.id,color,required:counts[color],available:available[color]})));
  }
  assert.equal(validatedVectors,positions.length);
  assert.equal(sum(sides.map(s=>s.required)),legalDecisions);
  assert.equal(sum(sides.map(s=>s.available)),validatedVectors);
  const ready=new Map(); for(const s of sides) ready.set(s.gameId,(ready.get(s.gameId) ?? true)&&s.available>=10);
  const readyGames=[...ready.values()].filter(Boolean).length, graph=components(games);
  const times=evidence.searches.map(r=>r.elapsedMs), meanMs=sum(times)/times.length;
  const meanBytes=sum(evidence.searches.map(r=>Buffer.byteLength(JSON.stringify(r)+'\n')))/times.length;
  const missing=allKeys.size-reusedKeys.size;
  const config=evidence.engineConfig;
  return {schema:'E271-feasibility-v1',role:'exposed development feasibility; no fits or performance evaluation',
    games:games.length,splits:Object.fromEntries(['train','validation'].map(s=>[s,games.filter(g=>g.split===s).length])),
    sides:sides.length,nonforcedDecisions:legalDecisions,legalAlternatives,
    completeVectors:validatedVectors,availablePerSide:{min:Math.min(...sides.map(s=>s.available)),max:Math.max(...sides.map(s=>s.available))},
    gamesWithTenVectorsBothSides:readyGames,eligibleSides:sides.filter(s=>s.required>=10).length,
    branching:{selectedMean:sum(positions.map(p=>p.legalMoves.length))/positions.length,
      fullGameMean:sum(branches)/branches.length,fullGameP95:quantile(branches,.95)},
    plies:{mean:sum(lengths)/games.length,max:Math.max(...lengths)},playerComponents:graph,
    queries:{fullUnique:allKeys.size,compatibleReusedUnique:reusedKeys.size,missingUnique:missing,existingCached:queries.size},
    cost:{cachedMeanMs:meanMs,cachedMedianMs:quantile(times,.5),cachedP95Ms:quantile(times,.95),
      missingSerialHoursMean:missing*meanMs/3600000,missingSerialHoursP95Reference:missing*quantile(times,.95)/3600000,
      cachedMeanJsonBytes:meanBytes,missingUncompressedGiB:missing*meanBytes/2**30,
      interpretation:'Planning extrapolation from historical cached selected/outcome searches; machine, phase, branching and recovery costs may differ; p95 is not a bound.'},
    engineConfig:config,gates:{enoughCompleteGameEvidence:readyGames>=300,completeVectorBindings:true,
      playerComponents:graph.components>=300&&graph.largestFraction<=.1},
    passed:readyGames>=300&&graph.components>=300&&graph.largestFraction<=.1,
    modelFits:0,engineSearches:0,newAcquisitions:0,humanLabels:0,confirmationGamesUsed:0};
}
