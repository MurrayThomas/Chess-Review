import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE073Pilot} from './e073-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E073_PHASE;assert(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE073Pilot(process.env.CHESS_E073_PILOT_ATTEMPT,admission);
const [{explainMove},{replay:replayEvent},{fixtures,reflect},{Chess},{openE073Replay,structureIds}]=await Promise.all([import('../../E073-carlsbad-hedgehog/code/structures.mjs'),import('../../E073-carlsbad-hedgehog/code/replay.mjs'),import('../../E073-carlsbad-hedgehog/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e073-whole-result.mjs')]);
const {check}=await openE073Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},carlsbad=get('carlsbad-e-completes'),hedgehog=get('hedgehog-e-completes'),history=get('hedgehog-legal-history'),negative=get('carlsbad-own-support-pinned'),own=r=>r.events.filter(e=>structureIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence;
const mutations=[
 [carlsbad,'before inventory omitted',r=>frame(r).beforeInventory.own.pop()],
 [carlsbad,'after inventory omitted',r=>frame(r).inventory.enemy.pop()],
 [carlsbad,'own core forged',r=>frame(r).ownCore[0]='a4'],
 [carlsbad,'enemy core forged',r=>frame(r).enemyCore[0]='a5'],
 [hedgehog,'control target omitted',r=>frame(r).targets.pop()],
 [carlsbad,'before queenside count forged',r=>frame(r).beforeInventory.queenside.own++],
 [carlsbad,'after queenside count forged',r=>frame(r).inventory.queenside.enemy++],
 [carlsbad,'after kingside count forged',r=>frame(r).inventory.kingside.own++],
 [carlsbad,'support frame omitted',r=>frame(r).counterframes.pop()],
 [carlsbad,'support sources omitted',r=>frame(r).counterframes[0].sources=[]],
 [carlsbad,'support side forged',r=>frame(r).counterframes[0].color='b'],
 [carlsbad,'support target forged',r=>frame(r).counterframes[0].target='a5'],
 [carlsbad,'replacement victim forged',r=>frame(r).counterframes[0].removed.type='q'],
 [carlsbad,'legal capture omitted',r=>frame(r).counterframes[0].captures.pop()],
 [carlsbad,'legal capture invented',r=>frame(r).counterframes[0].captures.push({move:'a2a8'})],
 [carlsbad,'support counterfen forged',r=>frame(r).counterframes[0].counterFen='forged'],
 [history,'complete history omitted',r=>frame(r).history.pop()],
 [history,'history move forged',r=>frame(r).history[0].move='a2a8'],
 [carlsbad,'played move forged',r=>frame(r).played.move='e2e4'],
 [carlsbad,'played piece forged',r=>frame(r).played.piece='n'],
 [carlsbad,'reply domain incomplete',r=>frame(r).replies.pop()],
 [carlsbad,'reply move forged',r=>frame(r).replies[0].response.move='a2a8'],
 [carlsbad,'reply inventory forged',r=>frame(r).replies[0].inventory.own=[]],
 [carlsbad,'reply own surviving core forged',r=>frame(r).replies[0].ownPresent=[]],
 [carlsbad,'reply enemy surviving core forged',r=>frame(r).replies[0].enemyPresent=[]],
 [carlsbad,'reply shape forged',r=>frame(r).replies[0].shape=!frame(r).replies[0].shape],
 [carlsbad,'reply check forged',r=>frame(r).replies[0].check=!frame(r).replies[0].check],
 [carlsbad,'reply mate forged',r=>frame(r).replies[0].checkmate=!frame(r).replies[0].checkmate],
 [carlsbad,'reply stalemate forged',r=>frame(r).replies[0].stalemate=!frame(r).replies[0].stalemate],
 [carlsbad,'reply draw forged',r=>frame(r).replies[0].draw=!frame(r).replies[0].draw],
 [carlsbad,'reply game over forged',r=>frame(r).replies[0].gameOver=!frame(r).replies[0].gameOver],
 [carlsbad,'reply queenside count forged',r=>frame(r).replies[0].inventory.queenside.own++],
 [carlsbad,'reply kingside count forged',r=>frame(r).replies[0].inventory.kingside.enemy++],
 [carlsbad,'own text forged',r=>event(r).text='Winning structure.'],
 [carlsbad,'quality claim forged',r=>event(r).qualityClaim=true],
 [carlsbad,'schema forged',r=>r.schema='coach-concepts-v99'],
 [carlsbad,'selected comment forged',r=>r.comment='Winning.'],
 [carlsbad,'inherited SAN forged',r=>r.san='forged'],
 [carlsbad,'omitted proof laundered as ineligible',r=>{r.events=r.events.filter(e=>!structureIds.includes(e.id));r.structureAnalysis.status='ineligible';}],
 [carlsbad,'own proof duplicated',r=>r.events.push(structuredClone(event(r)))],
 [carlsbad,'ledger forged',r=>r.structureAnalysis.nodes++],
 [carlsbad,'limit forged',r=>r.structureAnalysis.limit--],
 [carlsbad,'unsupported own field',r=>event(r).invented=true],
 [carlsbad,'unsupported evidence field',r=>frame(r).invented=true],
];assert.equal(mutations.length,44);
function budget(f){const full=explainMove(f),needed=full.structureAnalysis.nodes;assert(needed>0);for(let limit=0;limit<=needed+1;limit++){const input={...f,maxStructureNodes:limit},r=explainMove(input),p=check(input,r);assert.equal(p.certificates,own(r).length);if(limit<needed){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(r.structureAnalysis.nodes,limit+1);}else{assert.equal(p.state,full.structureAnalysis.status);assert.equal(p.certificates,own(full).length);}}}
if(phase==='pilot'){
 for(const f of [carlsbad,reflect(carlsbad),hedgehog,reflect(hedgehog)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes own-event-only '+name+' gap',()=>{const r=explainMove(carlsbad);check(carlsbad,r);const bad=structuredClone(r);mutate(bad);for(const e of own(bad))replayEvent(carlsbad,e);assert.throws(()=>check(carlsbad,bad));});
 test('pilot every integer Carlsbad budget',()=>budget(carlsbad));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={};let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;}});
 for(const [f,name,mutate]of mutations)test('complete structure rejects '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [carlsbad,hedgehog,negative,history])test('every integer budget '+f.id,()=>budget(f));
 test('strict and historical null default compatibility',()=>{for(const structureTags of [false,undefined,null]){const f={...carlsbad,structureTags};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...carlsbad,maxStructureNodes:null},r=explainMove(f);assert.equal(r.structureAnalysis.limit,50000);check(f,r);for(const structureTags of [0,'true',{},[]])assert.throws(()=>explainMove({...carlsbad,structureTags}),/boolean/);for(const maxStructureNodes of [-1,50001,0.5,NaN,'2'])for(const structureTags of [false,true])assert.throws(()=>explainMove({...carlsbad,structureTags,maxStructureNodes}),/integer/);});
 test('normalized full history',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.equal(frame(r).history.length,history.history.moves.length);assert(!frame(r).history.some(x=>'callerMetadata'in x));});
 test('all original states both kinds and legal negatives',()=>{assert.equal(errors,8);assert.deepEqual(states,{proven:42,ineligible:130,'no-legal-support-control':8,disabled:8,exhausted:8});assert.deepEqual(byKind,{'carlsbad-structure':20,'hedgehog-structure':22});});
 test('six Hedgehog targets eight named edges extras and EP negative',()=>{for(const mirror of [f=>f,reflect]){const f=mirror(hedgehog),r=explainMove(f);check(f,r);assert.equal(frame(r).targets.length,6);assert.equal(frame(r).counterframes.length,6);assert.equal(frame(r).counterframes.reduce((n,x)=>n+x.sources.length,0),8);const f2=mirror(get('hedgehog-extra-control-captures')),b=explainMove(f2);check(f2,b);assert(frame(b).counterframes.some(x=>x.captures.length>x.sources.length));const f3=mirror(get('hedgehog-double-push-en-passant-negative')),c=explainMove(f3);assert.equal(check(f3,c).state,'ineligible');const native=new Chess(c.after);assert(native.moves({verbose:true}).some(m=>m.flags.includes('e')));}});
 test('independent negative ledger and atomic proof omission',()=>{const r=explainMove(negative);assert.equal(check(negative,r).state,'no-legal-support-control');const bad=structuredClone(r);bad.structureAnalysis.nodes++;assert.throws(()=>check(negative,bad));const f={...hedgehog,maxStructureNodes:0},a=explainMove(f);assert.equal(check(f,a).state,'exhausted');assert.equal(own(a).length,0);const f2=get('carlsbad-doubled-flank'),b=explainMove(f2);assert.equal(check(f2,b).state,'ineligible');});
}else{



 const {openE073Saved,checkE073Shape,checkE073Bytes}=await import('./e073-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE073Saved();console.log('# E073-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,oracleEvaluations:0,ownProofReplays:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(row.error,'Illegal move; explanation refused.');assert.match(failure.message,/^Illegal move/);}else{audit.savedReplayAttempts++;const p=check(row.fixture,row.result);audit.parentEvaluations+=p.parentEvaluations;audit.oracleEvaluations+=p.oracleEvaluations;audit.ownProofReplays+=p.ownProofReplays;if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,kind:e.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&structureIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E073-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>structureIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>structureIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE073Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE073Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE073Bytes(spec.file,raw),true);assert.throws(()=>checkE073Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
