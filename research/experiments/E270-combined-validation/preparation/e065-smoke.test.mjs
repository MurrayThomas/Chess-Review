import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE065Pilot} from './e065-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE065Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE065Replay,triangleIds},{explainMove:parent,priority:parentPriority},{Chess}]=await Promise.all([import('../../E065-king-triangulation/code/triangle.mjs'),import('../../E065-king-triangulation/code/fixtures.mjs'),import('./e065-whole-result.mjs'),import('../../E064-blocked-position/code/blocked.mjs'),import('../../../../lib/chess.js')]);
const {check}=await openE065Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),outputs=new Map(),audits=new Map(),get=id=>{const f=all.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>triangleIds.includes(e.id)),positive=get('king-return'),negative=get('missing-history'),exhausted=get('zero-new-budget'),frame=r=>own(r)[0].evidence;
for(const f of all)test('original whole '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);audits.set(f.id,p);for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const mutations=[
 [positive,'before',r=>frame(r).beforeFen=frame(r).afterFen],
 [positive,'after',r=>frame(r).afterFen=frame(r).beforeFen],
 [positive,'history',r=>frame(r).history.pop()],
 [positive,'actual',r=>frame(r).played.to='a2'],
 [positive,'segment index',r=>frame(r).segmentIndex++],
 [positive,'segment record',r=>frame(r).segment[1].san='wrong'],
 [positive,'start frame',r=>frame(r).startFen=frame(r).beforeFen],
 [positive,'king route',r=>frame(r).route[1]='c1'],
 [positive,'signed area',r=>frame(r).area2=0],
 [positive,'enemy type',r=>frame(r).enemy.piece='n'],
 [positive,'enemy color',r=>frame(r).enemy.color='w'],
 [positive,'enemy route',r=>frame(r).enemy.route[2]='g8'],
 [positive,'start pieces',r=>frame(r).startPieces.pop()],
 [positive,'after pieces',r=>frame(r).afterPieces.pop()],
 [positive,'placement',r=>frame(r).state.placement='8/8/8/8/8/8/8/8'],
 [positive,'castling',r=>frame(r).state.castling='K'],
 [positive,'EP',r=>frame(r).state.ep='a3'],
 [positive,'before turn',r=>frame(r).state.beforeTurn='b'],
 [positive,'after turn',r=>frame(r).state.afterTurn='w'],
 [positive,'before halfmove',r=>frame(r).state.beforeHalfmove++],
 [positive,'after halfmove',r=>frame(r).state.afterHalfmove++],
 [positive,'before fullmove',r=>frame(r).state.beforeFullmove++],
 [positive,'after fullmove',r=>frame(r).state.afterFullmove++],
 [positive,'reply domain',r=>frame(r).responses.pop()],
 [positive,'reply order',r=>frame(r).responses.reverse()],
 [positive,'reply record',r=>frame(r).responses[0].reply.san='wrong'],
 [positive,'reply frame',r=>frame(r).responses[0].reply.after=frame(r).beforeFen],
 [positive,'reply terminal',r=>frame(r).responses[0].terminal=!frame(r).responses[0].terminal],
 [positive,'text',r=>own(r)[0].text='Winning triangulation.'],
 [positive,'quality',r=>own(r)[0].qualityClaim=true],
 [positive,'mandatory tag',r=>r.events=r.events.filter(e=>!triangleIds.includes(e.id))],
 [positive,'ledger',r=>r.triangulationAnalysis.nodes++],
 [positive,'status',r=>r.triangulationAnalysis.status='exhausted'],
 [positive,'limit',r=>r.triangulationAnalysis.limit--],
 [positive,'schema',r=>r.schema='v999'],
 [positive,'comment',r=>r.comment='Winning move.'],
 [positive,'inherited SAN',r=>r.san='wrong'],
 [positive,'extra field',r=>r.unsupported=true],
 [negative,'unsolicited negative tag',r=>r.events.push(structuredClone(own(outputs.get(positive.id))[0]))],
 [exhausted,'incomplete exhausted tag',r=>r.events.push(structuredClone(own(outputs.get(positive.id))[0]))]
];assert.equal(all.length,120);assert.equal(mutations.length,40);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const name of ['king-return','queen-return','terminal-repetition-reply','terminal-clock','expired-ep-state','short-history','missing-history'])test('exhaustive small budget '+name,()=>{const f=get(name),full=outputs.get(f.id),needed=full.triangulationAnalysis.nodes;for(let limit=0;limit<=needed+1;limit++){const input={...f,maxTriangulationNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.triangulationAnalysis.status,limit<needed?'exhausted':full.triangulationAnalysis.status);assert.equal(r.triangulationAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed)assert.equal(own(r).length,0);}});
test('strict null and disabled options',()=>{for(const triangulationTags of [false,undefined,null]){const f={...positive,triangulationTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,maxTriangulationNodes:null},r=explainMove(f);assert.equal(r.triangulationAnalysis.limit,50000);check(f,r);for(const triangulationTags of [1,'true',{},[]]){const f={...positive,triangulationTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const maxTriangulationNodes of [-1,50001,0.5,NaN,Infinity,'10'])for(const triangulationTags of [true,false]){const f={...positive,maxTriangulationNodes,triangulationTags};assert.throws(()=>explainMove(f),/maxTriangulationNodes/);assert.throws(()=>check(f,{}),/maxTriangulationNodes/);}});
test('original counts and positive replay metadata',()=>{assert.equal(outputs.size,116);const states={},metrics={replies:0,leaves:0,historyPlies:0};let certificates=0;for(const p of audits.values()){states[p.state]=(states[p.state]||0)+1;certificates+=p.certificates;for(const m of p.replayMetadata)for(const key of Object.keys(metrics))metrics[key]+=m[key];}assert.deepEqual(states,{complete:108,disabled:4,exhausted:4});assert.equal(certificates,40);assert.deepEqual(metrics,{replies:464,leaves:464,historyPlies:192});console.log('# E065-smoke-summary '+JSON.stringify({originalRows:120,errors:4,certificates,states,metrics}));});
test('enemy unit families signed triangles and restored rule fields',()=>{const units={},signs=new Set();for(const r of outputs.values())for(const e of own(r)){const x=e.evidence;units[x.enemy.piece]=(units[x.enemy.piece]||0)+1;signs.add(Math.sign(x.area2));assert.deepEqual(x.startPieces,x.afterPieces);assert.notEqual(x.state.beforeTurn,x.state.afterTurn);assert.equal(x.state.afterHalfmove,x.state.beforeHalfmove+5);assert.equal(x.state.afterFullmove,x.state.beforeFullmove+(x.played.color==='w'?2:3));assert.equal(x.segment.length,5);}assert.deepEqual(units,{k:20,r:4,n:4,b:4,q:8});assert.deepEqual([...signs].sort(),[-1,1]);});
test('physical full-history terminal reply reasons captures and fresh FEN distinction',()=>{const counts={terminal:0,repetition:0,clock:0,mate:0,captures:0,freshRepetitionMiss:0};for(const f of all){const r=outputs.get(f.id);if(!r||!own(r).length)continue;const c=new Chess(f.history.fen);for(const move of f.history.moves)c.move(move);c.move(f.move);for(const {reply,terminal}of frame(r).responses){assert.equal(c.fen(),reply.before);c.move(reply.move);assert.equal(c.isGameOver(),terminal);counts.terminal+=+terminal;counts.repetition+=+c.isThreefoldRepetition();counts.clock+=+c.isDrawByFiftyMoves();counts.mate+=+c.isCheckmate();counts.captures+=+!!reply.captured;if(c.isThreefoldRepetition()){const fresh=new Chess(reply.before);fresh.move(reply.move);assert(!fresh.isGameOver());counts.freshRepetitionMiss++;}c.undo();}}assert.deepEqual(counts,{terminal:20,repetition:4,clock:12,mate:4,captures:8,freshRepetitionMiss:4});});
test('incomplete nonking pawn capture promotion missing short and older routes refuse own labels',()=>{for(const name of ['triangle-incomplete','own-back-and-forth','enemy-does-not-return','short-history','nonking-actual','own-nonking-middle','enemy-pawn-moves','enemy-capture','actual-king-capture','promotion-actual','older-triangle-not-current','missing-history']){const r=outputs.get(name);assert.equal(r.triangulationAnalysis.status,'complete');assert.equal(own(r).length,0);}for(const name of ['missing-history','short-history'])assert.equal(outputs.get(name).triangulationAnalysis.nodes,1);assert.throws(()=>explainMove(get('illegal-actual-step')),/^Error: Illegal move/);});
test('standard rights EP loss and actual terminal clock repetition suppress labels',()=>{for(const f of all.filter(f=>f.id.includes('rights-lost'))){const r=outputs.get(f.id);assert.equal(r.triangulationAnalysis.status,'complete');assert.equal(own(r).length,0);}for(const name of ['expired-ep-state','terminal-clock','terminal-repetition'])assert.equal(own(outputs.get(name)).length,0);for(const name of ['terminal-clock','terminal-repetition']){const f=get(name),c=new Chess(f.history.fen);for(const move of f.history.moves)c.move(move);assert(!c.isGameOver());c.move(f.move);assert(c.isGameOver());}});
test('specific selected maneuver and urgent mate warning with valid triangle',()=>{for(const name of ['king-return','reverse-triangle','central-triangle','rook-return','knight-return','bishop-return','queen-return'])assert.match(outputs.get(name).comment,/^Triangulation:/);const r=outputs.get('mate-reply-check-evasions');assert.equal(own(r).length,1);assert.match(r.comment,/^Watch out:/);assert(frame(r).segment[1].san.includes('+'));assert(frame(r).segment[3].san.includes('+'));assert(frame(r).responses.some(x=>x.reply.move==='b4b2'&&x.terminal));});
test('input result immutability inherited event order priority and comment',()=>{const input=structuredClone(positive),snapshot=structuredClone(input),r=explainMove(input),bad=structuredClone(r);frame(bad).responses=[];bad.events=[];assert.deepEqual(input,snapshot);assert.deepEqual(explainMove(input),r);check(input,r);for(const name of ['king-return','missing-history','terminal-repetition-reply','mate-reply-check-evasions','profile-disabled']){const f=get(name),r=outputs.get(name),base=parent(f);assert.deepEqual(r.events.filter(e=>!triangleIds.includes(e.id)),base.events);const priority=e=>e.id==='king-triangulation'?101.015:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);}});
