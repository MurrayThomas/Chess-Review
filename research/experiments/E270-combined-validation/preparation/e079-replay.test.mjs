import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE079Pilot} from './e079-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E079_PHASE;assert.ok(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE079Pilot(process.env.CHESS_E079_PILOT_ATTEMPT,admission);
const [{explainMove},{replayResult},{fixtures,reflect},{Chess},{replay:replaySupport}]=await Promise.all([import('../../E079-central-king-support/code/center.mjs'),import('../../E079-central-king-support/code/replay.mjs'),import('../../E079-central-king-support/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('../../E039-king-promotion-support/code/replay.mjs')]);
const get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;},positive=get('support-centralization-unblocks-route'),history=get('valid-support-history'),negative=get('nonking-pawn-move');
const source=r=>r.events[r.kingCenterAnalysis.witness.sourceEvent];
const mutations=[
 ['center witness omitted',r=>r.kingCenterAnalysis.witness=null],
 ['whole claim omitted and laundered as negative',r=>{r.kingCenterAnalysis.witness=null;r.kingCenterAnalysis.status='no-new-fact';r.events=r.events.filter(e=>e.id!=='king-promotion-support');}],
 ['center square forged',r=>r.kingCenterAnalysis.witness.centerSquare='a1'],
 ['actor forged',r=>r.kingCenterAnalysis.witness.actor='b'],
 ['history forged',r=>r.kingCenterAnalysis.witness.history={fen:positive.fen,moves:['a1a8']}],
 ['legal move domain omitted',r=>r.kingCenterAnalysis.witness.legalMoves=[]],
 ['played move forged',r=>r.kingCenterAnalysis.witness.played.uci='a1a8'],
 ['played flags forged',r=>r.kingCenterAnalysis.witness.played.flags='fake'],
 ['before inventory incomplete',r=>r.kingCenterAnalysis.witness.before.pieces.pop()],
 ['after inventory incomplete',r=>r.kingCenterAnalysis.witness.after.pieces.pop()],
 ['before king forged',r=>r.kingCenterAnalysis.witness.before.king='a1'],
 ['after king forged',r=>r.kingCenterAnalysis.witness.after.king='a1'],
 ['before attackers invented',r=>r.kingCenterAnalysis.witness.before.attackers.push('a1')],
 ['after attackers invented',r=>r.kingCenterAnalysis.witness.after.attackers.push('a1')],
 ['source event index forged',r=>r.kingCenterAnalysis.witness.sourceEvent++],
 ['source id forged',r=>r.kingCenterAnalysis.witness.sourceId='forged'],
 ['prior failure proof omitted',r=>source(r).evidence.beforeProof=null],
 ['after success proof omitted',r=>source(r).evidence.afterProof=null],
 ['all after defender replies omitted',r=>source(r).evidence.afterProof.tree.branches=[]],
 ['one after defender reply omitted',r=>source(r).evidence.afterProof.tree.branches.pop()],
 ['after defender reply duplicated',r=>source(r).evidence.afterProof.tree.branches.push(structuredClone(source(r).evidence.afterProof.tree.branches[0]))],
 ['source proof depth forged',r=>source(r).evidence.afterProof.depth=1],
 ['source proof winner forged',r=>source(r).evidence.afterProof.win=false],
 ['source event omitted',r=>r.events.splice(r.kingCenterAnalysis.witness.sourceEvent,1)],
 ['source event duplicated',r=>r.events.push(structuredClone(source(r)))],
 ['quality claim forged',r=>source(r).qualityClaim=true],
 ['teaching label forged',r=>source(r).text='Always centralize the king.'],
 ['selected comment forged',r=>r.comment='Winning.'],
 ['node count forged',r=>r.kingCenterAnalysis.nodes++],
 ['budget limit forged',r=>r.kingCenterAnalysis.limit--]
];assert.equal(mutations.length,30);
const budget=f=>{const full=explainMove(f);for(let maxKingCenterNodes=0;maxKingCenterNodes<=full.kingCenterAnalysis.nodes;maxKingCenterNodes++){const i={...f,maxKingCenterNodes},r=explainMove(i);replayResult(i,r);if(maxKingCenterNodes<full.kingCenterAnalysis.nodes){assert.equal(r.kingCenterAnalysis.status,'exhausted');assert.equal(r.kingCenterAnalysis.witness,null);}else assert.equal(r.kingCenterAnalysis.status,full.kingCenterAnalysis.status);}};
if(phase==='pilot'){
 for(const f of [positive,reflect(positive)])test('pilot complete positive '+f.id,()=>{assert.equal(replayResult(f,explainMove(f)).state,'proven');});
 for(const index of [0,1,19])test('pilot rejects '+mutations[index][0],()=>{const r=explainMove(positive);replayResult(positive,r);const bad=structuredClone(r);mutations[index][1](bad);assert.notDeepEqual(bad,r);assert.throws(()=>replayResult(positive,bad));});
 test('pilot every integer wrapper budget',()=>budget(positive));
 test('pilot independent support tree requires every defender reply',()=>{const r=explainMove(positive),event=source(r);replaySupport(positive,event);const bad=structuredClone(event);bad.evidence.afterProof.tree.branches.pop();assert.throws(()=>replaySupport(positive,bad));});
}else if(phase==='smoke'){
 const outputs=new Map(),states={},centers={w:new Set(),b:new Set()};let errors=0,within=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),f.expectedError?new RegExp(f.expectedError):undefined);errors++;return;}const r=explainMove(f),checked=replayResult(f,r);assert.equal(checked.state,f.expectedStatus);states[checked.state]=(states[checked.state]||0)+1;outputs.set(f.id,r);for(const id of f.expected||[])assert.ok(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert.ok(!r.events.some(e=>e.id===id));const w=r.kingCenterAnalysis?.witness;if(w){centers[w.actor].add(w.centerSquare);assert.equal(source(r).qualityClaim,false);assert.equal(source(r).text,'King in the center: '+w.centerSquare+' secures a safe queening route for pawn '+source(r).evidence.pawn+'.');if(f.withinCenter){within++;assert.ok(['d4','e4','d5','e5'].includes(w.played.from));assert.equal(source(r).evidence.attributes.central,false);}}});
 for(const [name,mutate]of mutations)test('complete frame rejects '+name,()=>{const r=outputs.get(positive.id);assert.ok(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>replayResult(positive,bad));});
 for(const f of [positive,history,negative])test('every integer wrapper budget '+f.id,()=>budget(f));
 test('strict/default controls',()=>{for(const kingCenterTags of [false,undefined]){const f={...positive,kingCenterTags,maxKingCenterNodes:'ignored'};assert.equal(replayResult(f,explainMove(f)).state,'disabled');}for(const kingCenterTags of [null,0,'true',{},[]])assert.throws(()=>explainMove({...positive,kingCenterTags}),/boolean/);for(const maxKingCenterNodes of [null,-1,50001,0.5,NaN,'2'])assert.throws(()=>explainMove({...positive,maxKingCenterNodes}),/integer/);});
 test('normalized history metadata and actual repetition terminal',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(replayResult(f,r).state,'proven');assert.deepEqual(r.kingCenterAnalysis.witness.history,history.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const i={fen:c.fen(),history:{fen,moves},move:'f6g8',kingCenterTags:true,kingSupportDepth:1,scanReplies:false},actual=explainMove(i);assert.equal(replayResult(i,actual).state,'not-live');assert.equal(actual.kingCenterAnalysis.witness,null);assert(!new Chess(actual.after).isGameOver());});
 test('original state center/color and core-to-core coverage',()=>{assert.equal(errors,54);assert.deepEqual(states,{'no-new-fact':30,proven:22,disabled:2,unavailable:2,exhausted:6,'not-applicable':12,'not-live':10});for(const actor of ['w','b'])assert.deepEqual([...centers[actor]].sort(),['d4','d5','e4','e5']);assert.equal(within,8);});
}else{
 const {openE079Saved,checkE079Shape,checkE079Bytes}=await import('./e079-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs');const saved=await openE079Saved();console.log('# E079-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,passed:false};try{
  if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);assert.ok(!row.fixture.expectedError||failure.message.includes(row.fixture.expectedError));}
  else {audit.savedReplayAttempts++;audit.parentEvaluations++;const checked=replayResult(row.fixture,row.result);const at=saved.report.kingCenterReplays.find(r=>r.fixture===row.fixture.id);assert.deepEqual({fixture:row.fixture.id,...checked},at);assert.equal(checked.state,row.fixture.expectedStatus);if(row.fixture.parentSelectedId)assert.equal(row.result.events.find(e=>e.text===row.result.comment)?.id,row.fixture.parentSelectedId);}
  audit.passed=true;
 }finally{console.log('# E079-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['original result count',r=>r.newFixtureCases=1],['replay order',r=>r.kingCenterReplays.reverse()],['reply count',r=>r.kingCenterReplays[0].replies++],['leaf count',r=>r.kingCenterReplays[0].leaves++]];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE079Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE079Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE079Bytes(spec.file,raw),true);assert.throws(()=>checkE079Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
