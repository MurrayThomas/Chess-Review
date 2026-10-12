import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE067Pilot} from './e067-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE067Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE067Replay,tempoIds},{Chess},{priority:parentPriority,explainMove:parent}]=await Promise.all([import('../../E067-waiting-tempi/code/tempi.mjs'),import('../../E067-waiting-tempi/code/fixtures.mjs'),import('./e067-whole-result.mjs'),import('../../../../lib/chess.js'),import('../../E066-pawn-races/code/race.mjs')]);const {check}=await openE067Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>tempoIds.includes(e.id)),waiting=r=>own(r).find(e=>e.id==='waiting-move'),reserve=r=>own(r).find(e=>e.id==='reserve-pawn-tempo'),frame=r=>reserve(r).evidence,outputs=new Map(),audits=new Map(),states={};let errors=0,certificates=0,queries=0;
for(const f of all)test('original '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);audits.set(f.id,p);states[p.state]=(states[p.state]||0)+1;certificates+=p.certificates;queries+=p.queryProofReplays;for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const positive=get('reserve-single'),passRefuted=get('quiet-no-mating-opportunity'),actualRefuted=get('integral-queen-move');const mutations=[
 [positive,'before frame',r=>frame(r).beforeFen=frame(r).afterFen],
 [positive,'after frame',r=>frame(r).afterFen=frame(r).beforeFen],
 [positive,'pass frame',r=>frame(r).passFen=frame(r).beforeFen],
 [positive,'history inserted',r=>frame(r).history.push(frame(r).played)],
 [positive,'actual identity',r=>frame(r).played.to='a4'],
 [positive,'before root',r=>frame(r).beforeProof.rootFen=frame(r).afterFen],
 [positive,'before winner',r=>frame(r).beforeProof.winner='b'],
 [positive,'before plies',r=>frame(r).beforeProof.plies=2],
 [positive,'before outcome',r=>frame(r).beforeProof.tree.win=true],
 [positive,'before failure domain',r=>frame(r).beforeProof.tree.branches.pop()],
 [positive,'before leaf',r=>frame(r).beforeProof.tree.branches[0].child.kind='mate'],
 [positive,'pass defense domain',r=>frame(r).passProof.tree.branches.pop()],
 [positive,'pass defense order',r=>frame(r).passProof.tree.branches.reverse()],
 [positive,'pass defense edge',r=>frame(r).passProof.tree.branches[0].move='h7h4'],
 [positive,'pass mating choice',r=>frame(r).passProof.tree.branches[0].child.move='e3e4'],
 [positive,'pass mate terminal FEN',r=>frame(r).passProof.tree.branches[0].child.child.fen=frame(r).passFen],
 [positive,'pass outcome',r=>frame(r).passProof.tree.win=false],
 [positive,'actual root',r=>frame(r).actualProof.rootFen=frame(r).beforeFen],
 [positive,'actual defense domain',r=>frame(r).actualProof.tree.branches.pop()],
 [positive,'actual defense edge',r=>frame(r).actualProof.tree.branches[0].move='h7h4'],
 [positive,'actual outcome',r=>frame(r).actualProof.tree.win=false],
 [positive,'removed before frame',r=>frame(r).removedBeforeFen=frame(r).passFen],
 [positive,'removed after frame',r=>frame(r).removedAfterFen=frame(r).afterFen],
 [positive,'removed before root',r=>frame(r).removedBeforeProof.rootFen=frame(r).beforeFen],
 [positive,'removed after winner',r=>frame(r).removedAfterProof.winner='b'],
 [positive,'removed before defense domain',r=>frame(r).removedBeforeProof.tree.branches.pop()],
 [positive,'removed after outcome',r=>frame(r).removedAfterProof.tree.win=false],
 [positive,'text',r=>reserve(r).text='Best waiting move.'],
 [positive,'quality',r=>reserve(r).qualityClaim=true],
 [positive,'mandatory waiting omitted',r=>r.events=r.events.filter(e=>e.id!=='waiting-move')],
 [positive,'mandatory reserve omitted',r=>r.events=r.events.filter(e=>e.id!=='reserve-pawn-tempo')],
 [positive,'ledger',r=>r.waitingTempoAnalysis.nodes++],
 [positive,'status',r=>r.waitingTempoAnalysis.status='ineligible'],
 [positive,'limit',r=>r.waitingTempoAnalysis.limit--],
 [positive,'schema',r=>r.schema='coach-concepts-v999'],
 [positive,'selected comment',r=>r.comment='Best move.'],
 [positive,'inherited field',r=>r.san='Wrong'],
 [positive,'extra field',r=>r.unsupported=true],
 [passRefuted,'pass failure laundered',r=>r.waitingTempoAnalysis.status='ineligible'],
 [actualRefuted,'actual failure laundered',r=>r.waitingTempoAnalysis.status='ineligible']
];assert.equal(all.length,104);assert.equal(mutations.length,40);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const f of [positive,get('knight-wait'),get('immediate-mate-already-available'),actualRefuted,passRefuted,get('history-reserve'),get('actual-clock-terminal')])test('sampled query-stage budget '+f.id,()=>{const full=outputs.get(f.id),p=audits.get(f.id),needed=full.waitingTempoAnalysis.nodes,limits=new Set([0,1,needed,needed+1]);for(const q of p.queryAudits)for(const delta of [-1,0,1])limits.add(q.endNode+delta);for(const limit of [...limits].sort((a,b)=>a-b)){const input={...f,maxWaitingTempoNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.waitingTempoAnalysis.status,limit<needed?'exhausted':full.waitingTempoAnalysis.status);assert.equal(r.waitingTempoAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed)assert.equal(own(r).length,0);}});
test('strict null disabled options',()=>{for(const waitingTempoTags of [false,undefined,null]){const f={...positive,waitingTempoTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,maxWaitingTempoNodes:null},r=explainMove(f);assert.equal(r.waitingTempoAnalysis.limit,50000);check(f,r);for(const waitingTempoTags of [1,'true',{},[]]){const f={...positive,waitingTempoTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const maxWaitingTempoNodes of [-1,50001,0.5,NaN,Infinity,'10'])for(const waitingTempoTags of [true,false]){const f={...positive,maxWaitingTempoNodes,waitingTempoTags};assert.throws(()=>explainMove(f),/maxWaitingTempoNodes/);assert.throws(()=>check(f,{}),/maxWaitingTempoNodes/);}});
test('complete original statuses and certificate coverage',()=>{assert.equal(errors,4);assert.equal(certificates,56);assert.deepEqual(states,{'immediate-mate-available':12,'pass-refuted':20,ineligible:16,disabled:8,exhausted:8,proven:32,'actual-refuted':4});assert(queries>0);console.log('# E067-smoke-summary '+JSON.stringify({originalRows:104,errors,certificates,completedIndependentQueriesReplayed:queries,states,removedPawnKingExposureCoverage:false,removedPawnDeadFrameCoverage:false}));});
test('positive full history preserved both colors',()=>{const c=new Chess(positive.fen);c.remove('h8');c.put({type:'k',color:'b'},'g8');const fields=c.fen().split(' ');fields[1]='b';const history={fen:fields.join(' '),moves:['g8h8']},past=new Chess(history.fen);assert(past.isCheck());past.move('g8h8');const f={...positive,fen:past.fen(),history};for(const input of [f,reflect(f)]){const r=explainMove(input),p=check(input,r);assert.equal(p.state,'proven');assert.equal(p.certificates,2);assert.equal(frame(r).history.length,1);assert.equal(p.queryProofReplays,5);assert.equal(frame(r).history[0].piece,'k');}});
test('third repetition before actual refuses while fresh FEN qualifies',()=>{const moves=['e7c8','h8g8','c8e7','g8h8','e7c8','h8g8','c8e7','g8h8'],c=new Chess(positive.fen);for(const move of moves)c.move(move);assert(c.isThreefoldRepetition());const f={...positive,fen:c.fen(),history:{fen:positive.fen,moves}};assert.throws(()=>explainMove(f));assert.throws(()=>check(f,{}));const fresh={...f,history:undefined},r=explainMove(fresh);assert.equal(check(fresh,r).state,'proven');assert.equal(frame(r).history.length,0);});
test('castling before-check capture and promotion exclusions',()=>{for(const f of [{id:'castling',fen:'k7/p7/8/8/8/8/8/4K2R w K - 0 1',move:'e1g1',waitingTempoTags:true},{id:'before-own-check',fen:'k3r3/8/8/8/8/8/P7/4K2R w - - 0 1',move:'e1d1',waitingTempoTags:true}]){const r=explainMove(f),p=check(f,r);assert.equal(p.state,'ineligible');assert.equal(p.queryProofReplays,0);assert.equal(p.certificates,0);}for(const id of ['actual-promotion','actual-capture-not-waiting','actual-check-not-waiting'])assert.equal(own(outputs.get(id)).length,0);});
test('stalemated hypothetical pass refused despite legal live actual',()=>{const f={id:'stalemated-pass',fen:'7k/5K2/5N2/8/8/8/P7/8 w - - 0 1',move:'f6d5',waitingTempoTags:true},before=new Chess(f.fen);assert(!before.isGameOver());const fields=f.fen.split(' ');fields[1]='b';assert(new Chess(fields.join(' ')).isStalemate());const r=explainMove(f),p=check(f,r);assert.equal(p.state,'illegal-pass');assert.equal(p.certificates,0);assert.equal(p.queryProofReplays,1);assert.equal(p.queryAudits[0].win,false);assert(!new Chess(r.after).isGameOver());});
test('all-defense before failures and only-pawn removal identity',()=>{const r=outputs.get(positive.id),e=frame(r),p=audits.get(positive.id);assert.equal(e.beforeProof.tree.kind,'all-fail');assert.equal(e.beforeProof.tree.win,false);assert.deepEqual(p.queryAudits.map(q=>q.role),['before','pass','actual','removed-before','removed-after']);for(const proof of [e.passProof,e.actualProof,e.removedBeforeProof,e.removedAfterProof]){assert.equal(proof.tree.kind,'all');assert.equal(proof.tree.branches.length,2);assert.deepEqual(proof.tree.branches.map(b=>b.move).sort(),['h7h5','h7h6']);assert(proof.tree.branches.every(b=>b.child.kind==='choice'&&b.child.child.kind==='mate'&&b.child.child.win));}assert.deepEqual(e.removedBeforeFen.split(' ').slice(0,4),e.removedAfterFen.split(' ').slice(0,4));const a=new Chess(e.passFen),b=new Chess(e.removedBeforeFen);for(const rank of '12345678')for(const file of 'abcdefgh'){const square=file+rank;if(square==='a2')assert.equal(b.get(square),undefined);else assert.deepEqual(a.get(square),b.get(square));}assert.equal(waiting(outputs.get('knight-wait')).id,'waiting-move');assert.equal(reserve(outputs.get('knight-wait')),undefined);});
test('immutable result and parent priority',()=>{const before=explainMove(positive),bad=structuredClone(before);frame(bad).actualProof.tree.branches=[];bad.events=[];assert.deepEqual(explainMove(positive),before);check(positive,before);for(const f of [positive,passRefuted,actualRefuted,get('knight-wait')]){const r=outputs.get(f.id),base=parent(f);assert.deepEqual(r.events.filter(e=>!tempoIds.includes(e.id)),base.events);const priority=e=>e.id==='waiting-move'?159.01:e.id==='reserve-pawn-tempo'?159.02:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);}});
