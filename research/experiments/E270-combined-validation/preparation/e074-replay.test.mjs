import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE074Pilot} from './e074-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E074_PHASE;assert(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE074Pilot(process.env.CHESS_E074_PILOT_ATTEMPT,admission);
const [{explainMove},{replay:replayEvent},{fixtures,reflect},{Chess},{openE074Replay,centerIds}]=await Promise.all([import('../../E074-french-scheveningen/code/centers.mjs'),import('../../E074-french-scheveningen/code/replay.mjs'),import('../../E074-french-scheveningen/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e074-whole-result.mjs')]);
const {check}=await openE074Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},french=get('french-advanced-e-completes'),base=get('french-base-e-completes'),schev=get('scheveningen-recorded-exchange'),ep=get('scheveningen-original-exchange-ep'),negative=get('french-own-support-pinned'),own=r=>r.events.filter(e=>centerIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence;
const mutations=[
 [french,'before inventory omitted',r=>frame(r).beforeInventory.own.pop()],
 [french,'after inventory omitted',r=>frame(r).inventory.enemy.pop()],
 [french,'own core forged',r=>frame(r).ownCore[0]='a4'],
 [french,'enemy core forged',r=>frame(r).enemyCore[0]='a5'],
 [schev,'control target omitted',r=>frame(r).targets.pop()],
 [french,'role forged',r=>frame(r).role='base'],
 [french,'ram omitted',r=>frame(r).rams.pop()],
 [french,'invented forward move',r=>frame(r).pawnTurns[0].moves.push({move:'d4d5'})],
 [french,'pawn turn domain omitted',r=>frame(r).pawnTurns.pop()],
 [french,'pawn turn fen forged',r=>frame(r).pawnTurns[0].counterFen='forged'],
 [french,'support frame omitted',r=>frame(r).counterframes.pop()],
 [french,'support sources omitted',r=>frame(r).counterframes[0].sources=[]],
 [french,'support side forged',r=>frame(r).counterframes[0].color='b'],
 [french,'support target forged',r=>frame(r).counterframes[0].target='a5'],
 [french,'replacement victim forged',r=>frame(r).counterframes[0].removed.type='q'],
 [french,'legal capture omitted',r=>frame(r).counterframes[0].captures.pop()],
 [french,'legal capture invented',r=>frame(r).counterframes[0].captures.push({move:'a2a8'})],
 [french,'support counterfen forged',r=>frame(r).counterframes[0].counterFen='forged'],
 [schev,'exchange order forged',r=>frame(r).exchange.order='enemy-d-takes-own-c'],
 [schev,'exchange first ply forged',r=>frame(r).exchange.firstPly++],
 [schev,'exchange recapture delayed',r=>frame(r).exchange.recapturePly++],
 [schev,'exchange pawn identity forged',r=>frame(r).exchange.capture.piece='n'],
 [schev,'exchange recapture origin forged',r=>frame(r).exchange.recapture.from='a1'],
 [schev,'complete history omitted',r=>frame(r).history.pop()],
 [schev,'history move forged',r=>frame(r).history[0].move='a2a8'],
 [french,'played move forged',r=>frame(r).played.move='e4e6'],
 [french,'played piece forged',r=>frame(r).played.piece='n'],
 [french,'reply domain incomplete',r=>frame(r).replies.pop()],
 [french,'reply move forged',r=>frame(r).replies[0].response.move='a2a8'],
 [french,'reply inventory forged',r=>frame(r).replies[0].inventory.own=[]],
 [french,'reply surviving core forged',r=>frame(r).replies[0].ownPresent=[]],
 [french,'reply shape flag forged',r=>frame(r).replies[0].shape=!frame(r).replies[0].shape],
 [french,'reply check flag forged',r=>frame(r).replies[0].check=!frame(r).replies[0].check],
 [french,'reply terminal flag forged',r=>frame(r).replies[0].gameOver=!frame(r).replies[0].gameOver],
 [french,'own text forged',r=>event(r).text='Winning structure.'],
 [french,'quality claim forged',r=>event(r).qualityClaim=true],
 [french,'schema forged',r=>r.schema='coach-concepts-v99'],
 [french,'selected comment forged',r=>r.comment='Winning.'],
 [french,'inherited SAN forged',r=>r.san='forged'],
 [french,'omitted proof laundered as ineligible',r=>{r.events=r.events.filter(e=>!centerIds.includes(e.id));r.centerAnalysis.status='ineligible';}],
 [french,'own proof duplicated',r=>r.events.push(structuredClone(event(r)))],
 [french,'ledger forged',r=>r.centerAnalysis.nodes++],
 [french,'limit forged',r=>r.centerAnalysis.limit--],
 [french,'unsupported own field',r=>event(r).invented=true],
];assert.equal(mutations.length,44);
function budget(f){const full=explainMove(f),needed=full.centerAnalysis.nodes;assert(needed>0);for(let limit=0;limit<=needed+1;limit++){const input={...f,maxCenterNodes:limit},r=explainMove(input),p=check(input,r);assert.equal(p.certificates,own(r).length);if(limit<needed){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(r.centerAnalysis.nodes,limit+1);}else{assert.equal(p.state,full.centerAnalysis.status);assert.equal(p.certificates,own(full).length);}}}
if(phase==='pilot'){
 for(const f of [french,reflect(french),schev,reflect(schev)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes own-event-only '+name+' gap',()=>{const r=explainMove(french);check(french,r);const bad=structuredClone(r);mutate(bad);for(const e of own(bad))replayEvent(french,e);assert.throws(()=>check(french,bad));});
 test('pilot every integer French budget',()=>budget(french));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={};let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;}});
 for(const [f,name,mutate]of mutations)test('complete structure rejects '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [french,base,ep,negative])test('every integer budget '+f.id,()=>budget(f));
 test('strict and historical null default compatibility',()=>{for(const centerTags of [false,undefined,null]){const f={...french,centerTags};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...french,maxCenterNodes:null},r=explainMove(f);assert.equal(r.centerAnalysis.limit,50000);check(f,r);for(const centerTags of [0,'true',{},[]])assert.throws(()=>explainMove({...french,centerTags}),/boolean/);for(const maxCenterNodes of [-1,50001,0.5,NaN,'2'])for(const centerTags of [false,true])assert.throws(()=>explainMove({...french,centerTags,maxCenterNodes}),/integer/);});
 test('normalized full history',()=>{const f={...schev,history:{...schev.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.equal(frame(r).history.length,schev.history.moves.length);assert(!frame(r).history.some(x=>'callerMetadata'in x));});
 test('all original states both kinds and legal negatives',()=>{assert.equal(errors,4);assert.deepEqual(states,{proven:48,ineligible:118,'no-legal-support-control':10,disabled:4,exhausted:4});assert.deepEqual(byKind,{'french-pawn-chain':28,'scheveningen-structure':20});});
 test('EP exchange EP ram reply and complete extra capture sets',()=>{for(const mirror of [f=>f,reflect]){const r=explainMove(mirror(ep));check(mirror(ep),r);assert.notEqual(frame(r).exchange.capture.to,frame(r).exchange.capture.from);assert.equal(frame(r).exchange.recapturePly,frame(r).exchange.firstPly+1);const hist=new Chess(mirror(ep).history.fen);let actualEP=0;for(const value of mirror(ep).history.moves)if(hist.move(value).flags.includes('e'))actualEP++;assert.equal(actualEP,1);const f=mirror(get('french-en-passant-reply')),a=explainMove(f);check(f,a);assert(frame(a).replies.some(x=>new Chess(x.response.before).move(x.response.move).flags.includes('e')));const f2=mirror(get('french-extra-support-captures')),b=explainMove(f2);check(f2,b);assert(frame(b).counterframes.some(x=>x.captures.length>x.sources.length));}});
 test('independent negative ledger and atomic proof omission',()=>{const r=explainMove(negative);assert.equal(check(negative,r).state,'no-legal-support-control');const bad=structuredClone(r);bad.centerAnalysis.nodes++;assert.throws(()=>check(negative,bad));const f={...schev,maxCenterNodes:0},a=explainMove(f);assert.equal(check(f,a).state,'exhausted');assert.equal(own(a).length,0);const s=explainMove(get('scheveningen-no-history'));assert.equal(check(get('scheveningen-no-history'),s).state,'ineligible');});
}else{


 const {openE074Saved,checkE074Shape,checkE074Bytes}=await import('./e074-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE074Saved();console.log('# E074-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,oracleEvaluations:0,ownProofReplays:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(row.error,'Illegal move; explanation refused.');assert.match(failure.message,/^Illegal move/);}else{audit.savedReplayAttempts++;const p=check(row.fixture,row.result);audit.parentEvaluations+=p.parentEvaluations;audit.oracleEvaluations+=p.oracleEvaluations;audit.ownProofReplays+=p.ownProofReplays;if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,kind:e.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&centerIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E074-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>centerIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>centerIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE074Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE074Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE074Bytes(spec.file,raw),true);assert.throws(()=>checkE074Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
