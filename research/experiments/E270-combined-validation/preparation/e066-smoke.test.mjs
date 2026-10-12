import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE066Pilot} from './e066-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE066Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE066Replay,raceIds},{explainMove:parent,priority:parentPriority},{Chess}]=await Promise.all([import('../../E066-pawn-races/code/race.mjs'),import('../../E066-pawn-races/code/fixtures.mjs'),import('./e066-whole-result.mjs'),import('../../E065-king-triangulation/code/triangle.mjs'),import('../../../../lib/chess.js')]);
const {check}=await openE066Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),outputs=new Map(),audits=new Map(),get=id=>{const f=all.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>raceIds.includes(e.id)),positive=get('one-push-first'),negative=get('rival-first-all-underpromotions'),frame=r=>own(r)[0].evidence,root=r=>frame(r).tree,push=r=>root(r).branches[0].child,leaf=r=>push(r).child;
for(const f of all)test('original whole '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);audits.set(f.id,p);for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const mutations=[
 [positive,'before',r=>frame(r).beforeFen=frame(r).afterFen],
 [positive,'after',r=>frame(r).afterFen=frame(r).beforeFen],
 [positive,'history',r=>frame(r).history.push({move:'a1a2'})],
 [positive,'actual record',r=>frame(r).played.san='wrong'],
 [positive,'material identity',r=>frame(r).pieces.pop()],
 [positive,'own pawn',r=>frame(r).pawn.square='a7'],
 [positive,'rival pawn',r=>frame(r).rival.square='a2'],
 [positive,'passed flag',r=>frame(r).passed.own=false],
 [positive,'push distance',r=>frame(r).pushes++],
 [positive,'evidence depth',r=>frame(r).depth--],
 [positive,'tree root',r=>root(r).fen=frame(r).beforeFen],
 [positive,'defense domain',r=>root(r).branches.pop()],
 [positive,'defense order',r=>root(r).branches.reverse()],
 [positive,'defense record',r=>root(r).branches[0].move.san='wrong'],
 [positive,'defense child frame',r=>push(r).fen=frame(r).beforeFen],
 [positive,'defense child outcome',r=>push(r).win=false],
 [positive,'own push',r=>push(r).move.move='b7b8n'],
 [positive,'first leaf kind',r=>leaf(r).kind='terminal'],
 [positive,'first leaf square',r=>leaf(r).square='a8'],
 [positive,'queen promotion type',r=>push(r).move.promotion='n'],
 [positive,'first terminal flag',r=>leaf(r).terminal=!leaf(r).terminal],
 [positive,'continuation domain',r=>leaf(r).continuations.pop()],
 [positive,'continuation order',r=>leaf(r).continuations.reverse()],
 [positive,'continuation record',r=>leaf(r).continuations[0].reply.san='wrong'],
 [positive,'queen presence',r=>leaf(r).continuations[0].queenPresent=!leaf(r).continuations[0].queenPresent],
 [positive,'continuation terminal',r=>leaf(r).continuations[0].terminal=!leaf(r).continuations[0].terminal],
 [positive,'text',r=>own(r)[0].text='Winning pawn race.'],
 [positive,'quality',r=>own(r)[0].qualityClaim=true],
 [positive,'mandatory tag',r=>r.events=r.events.filter(e=>!raceIds.includes(e.id))],
 [positive,'ledger',r=>r.pawnRaceAnalysis.nodes++],
 [positive,'status',r=>r.pawnRaceAnalysis.status='ineligible'],
 [positive,'analysis depth',r=>r.pawnRaceAnalysis.depth--],
 [positive,'limit',r=>r.pawnRaceAnalysis.limit--],
 [positive,'schema',r=>r.schema='v999'],
 [positive,'comment',r=>r.comment='Winning move.'],
 [positive,'inherited SAN',r=>r.san='wrong'],
 [positive,'extra field',r=>r.unsupported=true],
 [negative,'negative status',r=>r.pawnRaceAnalysis.status='ineligible'],
 [negative,'negative domain',r=>r.pawnRaceAnalysis.refutationTree.branches.pop()],
 [negative,'negative child',r=>r.pawnRaceAnalysis.refutationTree.branches.find(b=>!b.child.win).child.win=true]
];assert.equal(all.length,140);assert.equal(mutations.length,40);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const name of ['one-push-first','two-push-first','three-push-blocked-rival','rival-first-all-underpromotions','promotion-stalemate-leaf','history-pawn-step','own-king-blocks-promotion'])test('sampled budget '+name,()=>{const f=get(name),full=outputs.get(f.id),p=audits.get(f.id),needed=full.pawnRaceAnalysis.nodes,limits=new Set([0,1,needed-1,needed,needed+1]),branches=p.branchEnds.filter(b=>b.root);for(const edge of [branches[0],branches.at(-1),p.continuationEnds[0],p.continuationEnds.at(-1)].filter(Boolean))for(const delta of [-1,0,1])limits.add(edge.endNode+delta);for(const limit of [...limits].sort((a,b)=>a-b)){const input={...f,maxPawnRaceNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.pawnRaceAnalysis.status,limit<needed?'exhausted':full.pawnRaceAnalysis.status);assert.equal(r.pawnRaceAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed){assert.equal(own(r).length,0);assert.equal(r.pawnRaceAnalysis.refutationTree,null);}}});
test('strict null and disabled options',()=>{for(const pawnRaceTags of [false,undefined,null]){const f={...positive,pawnRaceTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,pawnRaceDepth:null,maxPawnRaceNodes:null},r=explainMove(f);assert.equal(r.pawnRaceAnalysis.depth,6);assert.equal(r.pawnRaceAnalysis.limit,50000);check(f,r);for(const pawnRaceTags of [1,'true',{},[]]){const f={...positive,pawnRaceTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const [field,values]of [['pawnRaceDepth',[-1,7,0.5,NaN,Infinity,'6']],['maxPawnRaceNodes',[-1,50001,0.5,NaN,Infinity,'10']]])for(const value of values)for(const pawnRaceTags of [true,false]){const f={...positive,pawnRaceTags,[field]:value};assert.throws(()=>explainMove(f),new RegExp(field));assert.throws(()=>check(f,{}),new RegExp(field));}});
test('original counts and positive proof metadata',()=>{assert.equal(outputs.size,136);const states={},metrics={replies:0,leaves:0,continuations:0,terminalPromotions:0,rivalPromotions:0,queenCaptures:0,historyPlies:0};let certificates=0;for(const p of audits.values()){states[p.state]=(states[p.state]||0)+1;certificates+=p.certificates;for(const m of p.replayMetadata||[])for(const key of Object.keys(metrics))metrics[key]+=m[key];}assert.deepEqual(states,{proven:44,refuted:28,ineligible:44,'short-profile':12,disabled:4,exhausted:4});assert.equal(certificates,44);assert.deepEqual(metrics,{replies:872,leaves:756,continuations:3440,terminalPromotions:4,rivalPromotions:16,queenCaptures:0,historyPlies:8});console.log('# E066-smoke-summary '+JSON.stringify({originalRows:140,errors:4,certificates,states,metrics,directPositiveQueenCaptureContinuationCoverage:false}));});
test('full positive history both colors and historical threefold own-label suppression',()=>{for(const name of ['history-pawn-step','history-king-step'])for(const f of [get(name),reflect(get(name))]){const r=explainMove(f),p=check(f,r);assert.equal(p.state,'proven');assert.equal(frame(r).history.length,1);}const c=new Chess(positive.fen),moves=['a1b1','h8g8','b1a1','g8h8','a1b1','h8g8','b1a1','g8h8'];for(const move of moves)c.move(move);assert(c.isThreefoldRepetition());const f={...positive,fen:c.fen(),history:{fen:positive.fen,moves}},r=explainMove(f);check(f,r);assert.equal(r.pawnRaceAnalysis.status,'ineligible');assert.equal(r.pawnRaceAnalysis.nodes,9);assert.equal(own(r).length,0);const fresh={...positive,fen:c.fen()},rr=explainMove(fresh);check(fresh,rr);assert.equal(rr.pawnRaceAnalysis.status,'proven');});
test('terminal promotion and all next rival promotion types are retained',()=>{const r=outputs.get('promotion-stalemate-leaf'),leaves=[];function visit(n){if(n.kind==='first')leaves.push(n);for(const b of n.branches||[])visit(b.child);if(n.child)visit(n.child);}visit(frame(r).tree);assert(leaves.some(l=>l.terminal&&new Chess(l.fen).isStalemate()));const next=[];for(const f of all){const r=outputs.get(f.id);if(r&&own(r).length){const walk=n=>{if(n.kind==='first')for(const c of n.continuations)if(c.reply.promotion)next.push(c.reply.promotion);for(const b of n.branches||[])walk(b.child);if(n.child)walk(n.child);};walk(frame(r).tree);}}assert.deepEqual([...new Set(next)].sort(),['b','n','q','r']);});
test('exact material passed geometry and fifth rank exclusions',()=>{for(const name of ['early-own-pawn','early-rival-pawn','unpassed-early-rival','extra-own-pawn','extra-enemy-piece','missing-rival']){const r=outputs.get(name);assert.equal(r.pawnRaceAnalysis.status,'ineligible');assert.equal(own(r).length,0);}for(const name of ['same-file-passed','adjacent-file-passed'])assert.equal(outputs.get(name).pawnRaceAnalysis.status,'proven');});
test('actual king captures EP promotion and illegal move exclusions',()=>{for(const name of ['actual-king-move','actual-pawn-capture','actual-promotion','actual-ep-capture']){const r=outputs.get(name);assert.equal(r.pawnRaceAnalysis.status,'ineligible');assert.equal(own(r).length,0);}assert.throws(()=>explainMove(get('illegal-actual-step')),/^Error: Illegal move/);});
test('minimum horizon profiles and complete negative outcomes',()=>{for(const [name,depth]of [['one-push-first',2],['two-push-first',4],['three-push-blocked-rival',6]]){const f={...get(name),pawnRaceDepth:depth},r=explainMove(f);check(f,r);assert.equal(r.pawnRaceAnalysis.status,'proven');const short={...f,pawnRaceDepth:depth-1},rr=explainMove(short);check(short,rr);assert.equal(rr.pawnRaceAnalysis.status,'short-profile');assert.equal(rr.pawnRaceAnalysis.refutationTree,null);}for(const name of ['enemy-king-captures-pawn','enemy-king-blocks-square','own-king-blocks-promotion','rival-pawn-check-refutes']){const r=outputs.get(name);assert.equal(r.pawnRaceAnalysis.status,'refuted');assert(r.pawnRaceAnalysis.refutationTree);}});
test('immutability inherited parent order priority and selected comment',()=>{const input=structuredClone(positive),snapshot=structuredClone(input),r=explainMove(input),bad=structuredClone(r);frame(bad).tree.branches=[];bad.events=[];assert.deepEqual(input,snapshot);assert.deepEqual(explainMove(input),r);check(input,r);for(const name of ['one-push-first','rival-first-all-underpromotions','urgent-mate-extra-material','profile-disabled']){const f=get(name),r=outputs.get(name),base=parent(f);assert.deepEqual(r.events.filter(e=>!raceIds.includes(e.id)),base.events);const priority=e=>e.id==='pawn-race'?157.05:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);}});
