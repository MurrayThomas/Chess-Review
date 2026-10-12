import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE072Pilot} from './e072-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E072_PHASE;assert(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE072Pilot(process.env.CHESS_E072_PILOT_ATTEMPT,admission);
const [{explainMove},{replay:replayEvent},{fixtures,reflect},{Chess},{openE072Replay,formationIds}]=await Promise.all([import('../../E072-named-pawn-formations/code/formations.mjs'),import('../../E072-named-pawn-formations/code/replay.mjs'),import('../../E072-named-pawn-formations/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e072-whole-result.mjs')]);
const {check}=await openE072Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},stone=get('stone-d-completes'),maroczy=get('maroczy-recorded-exchange'),ep=get('maroczy-original-exchange-en-passant'),history=get('stone-reversible-history'),negative=get('stone-supporter-pinned'),own=r=>r.events.filter(e=>formationIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence;
const mutations=[
 [stone,'required cell omitted',r=>frame(r).cells.pop()],
 [stone,'cell order forged',r=>frame(r).cells.reverse()],
 [stone,'named source omitted',r=>frame(r).counterframes[0].sources.pop()],
 [stone,'named source forged',r=>frame(r).counterframes[0].sources[0]='a3'],
 [maroczy,'common-control cell forged',r=>frame(r).cells[0]='a4'],
 [stone,'formation identity forged',r=>event(r).id='maroczy-bind'],
 [stone,'invented historical exchange',r=>frame(r).exchange={}],
 [stone,'replacement victim color forged',r=>frame(r).counterframes[0].removed.color='b'],
 [stone,'support frame domain omitted',r=>frame(r).counterframes.pop()],
 [stone,'replacement victim type forged',r=>frame(r).counterframes[0].removed.type='q'],
 [stone,'invented support frame',r=>frame(r).counterframes.push(structuredClone(frame(r).counterframes[0]))],
 [stone,'support sources omitted',r=>frame(r).counterframes[0].sources=[]],
 [stone,'capture actor forged',r=>frame(r).counterframes[0].captures[0].color='b'],
 [stone,'support target forged',r=>frame(r).counterframes[0].target='a5'],
 [stone,'support capture result forged',r=>frame(r).counterframes[0].captures[0].after='forged'],
 [stone,'legal capture omitted',r=>frame(r).counterframes[0].captures.pop()],
 [stone,'legal capture invented',r=>frame(r).counterframes[0].captures.push({move:'a2a8'})],
 [stone,'support counterfen forged',r=>frame(r).counterframes[0].counterFen='forged'],
 [maroczy,'exchange order forged',r=>frame(r).exchange.order='own-d-takes-enemy-c'],
 [maroczy,'exchange first ply forged',r=>frame(r).exchange.firstPly++],
 [maroczy,'exchange recapture delayed',r=>frame(r).exchange.recapturePly++],
 [maroczy,'exchange pawn identity forged',r=>frame(r).exchange.capture.piece='n'],
 [maroczy,'exchange recapture origin forged',r=>frame(r).exchange.recapture.from='a1'],
 [maroczy,'complete history omitted',r=>frame(r).history.pop()],
 [maroczy,'history move forged',r=>frame(r).history[0].move='a2a8'],
 [stone,'played move forged',r=>frame(r).played.move='d3d5'],
 [stone,'played piece forged',r=>frame(r).played.piece='n'],
 [stone,'reply domain incomplete',r=>frame(r).replies.pop()],
 [stone,'reply move forged',r=>frame(r).replies[0].response.move='a2a8'],
 [stone,'reply draw forged',r=>frame(r).replies[0].draw=!frame(r).replies[0].draw],
 [stone,'reply surviving cells forged',r=>frame(r).replies[0].present=[]],
 [stone,'reply mate forged',r=>frame(r).replies[0].checkmate=!frame(r).replies[0].checkmate],
 [stone,'reply check forged',r=>frame(r).replies[0].check=!frame(r).replies[0].check],
 [stone,'reply terminal forged',r=>frame(r).replies[0].gameOver=!frame(r).replies[0].gameOver],
 [stone,'own text forged',r=>event(r).text='Winning formation.'],
 [stone,'quality claim forged',r=>event(r).qualityClaim=true],
 [stone,'schema forged',r=>r.schema='coach-concepts-v99'],
 [stone,'selected comment forged',r=>r.comment='Winning.'],
 [stone,'inherited SAN forged',r=>r.san='forged'],
 [stone,'omitted proof laundered as ineligible',r=>{r.events=r.events.filter(e=>!formationIds.includes(e.id));r.formationAnalysis.status='ineligible';}],
 [stone,'own proof duplicated',r=>r.events.push(structuredClone(event(r)))],
 [stone,'ledger forged',r=>r.formationAnalysis.nodes++],
 [stone,'limit forged',r=>r.formationAnalysis.limit--],
 [stone,'unsupported own field',r=>event(r).invented=true],
];assert.equal(mutations.length,44);
function budget(f){const full=explainMove(f),needed=full.formationAnalysis.nodes;assert(needed>0);for(let limit=0;limit<=needed+1;limit++){const input={...f,maxFormationNodes:limit},r=explainMove(input),p=check(input,r);assert.equal(p.certificates,own(r).length);if(limit<needed){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(r.formationAnalysis.nodes,limit+1);}else{assert.equal(p.state,full.formationAnalysis.status);assert.equal(p.certificates,own(full).length);}}}
if(phase==='pilot'){
 for(const f of [stone,reflect(stone),maroczy,reflect(maroczy)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes own-event-only '+name+' gap',()=>{const r=explainMove(stone);check(stone,r);const bad=structuredClone(r);mutate(bad);for(const e of own(bad))replayEvent(stone,e);assert.throws(()=>check(stone,bad));});
 test('pilot every integer Stonewall budget',()=>budget(stone));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={};let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;}});
 for(const [f,name,mutate]of mutations)test('complete formation rejects '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [stone,ep,negative,history])test('every integer budget '+f.id,()=>budget(f));
 test('strict and historical null default compatibility',()=>{for(const formationTags of [false,undefined,null]){const f={...stone,formationTags};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...stone,maxFormationNodes:null},r=explainMove(f);assert.equal(r.formationAnalysis.limit,50000);check(f,r);for(const formationTags of [0,'true',{},[]])assert.throws(()=>explainMove({...stone,formationTags}),/boolean/);for(const maxFormationNodes of [-1,50001,0.5,NaN,'2'])for(const formationTags of [false,true])assert.throws(()=>explainMove({...stone,formationTags,maxFormationNodes}),/integer/);});
 test('normalized full reversible history',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.equal(frame(r).history.length,history.history.moves.length);assert(!frame(r).history.some(x=>'callerMetadata'in x));});
 test('all original states both kinds and legal negatives',()=>{assert.equal(errors,4);assert.deepEqual(states,{proven:42,ineligible:106,'no-legal-support-control':8,disabled:4,exhausted:4});assert.deepEqual(byKind,{'stonewall-structure':22,'maroczy-bind':20});});
 test('exact three Stonewall and two Maroczy named control edges',()=>{for(const mirror of [f=>f,reflect])for(const [f,expected]of [[stone,['c3>d4','e3>d4','e3>f4']],[maroczy,['c4>d5','e4>d5']]]){const input=mirror(f),r=explainMove(input);check(input,r);const sq=s=>s[0]+(frame(r).played.color==='w'?s[1]:9-Number(s[1]));assert.deepEqual(frame(r).counterframes.flatMap(x=>x.sources.map(s=>s+'>'+x.target)).sort(),expected.map(s=>s.split('>').map(sq).join('>')).sort());}});
 test('EP exchange and replies negative ledger and atomic proof omission',()=>{for(const mirror of [f=>f,reflect]){const f=mirror(ep),r=explainMove(f);check(f,r);assert.equal(frame(r).exchange.recapturePly,frame(r).exchange.firstPly+1);const native=new Chess(f.history.fen);let captures=0;for(const value of f.history.moves)if(native.move(value).flags.includes('e'))captures++;assert.equal(captures,1);for(const id of ['stone-en-passant-reply','maroczy-en-passant-reply']){const i=mirror(get(id)),o=explainMove(i);check(i,o);assert(frame(o).replies.some(x=>new Chess(x.response.before).move(x.response.move).flags.includes('e')));}}const r=explainMove(negative);assert.equal(check(negative,r).state,'no-legal-support-control');const bad=structuredClone(r);bad.formationAnalysis.nodes++;assert.throws(()=>check(negative,bad));const f={...maroczy,maxFormationNodes:0},a=explainMove(f);assert.equal(check(f,a).state,'exhausted');assert.equal(own(a).length,0);assert.equal(check(get('maroczy-no-history'),explainMove(get('maroczy-no-history'))).state,'ineligible');});
}else{



 const {openE072Saved,checkE072Shape,checkE072Bytes}=await import('./e072-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE072Saved();console.log('# E072-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,oracleEvaluations:0,ownProofReplays:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(row.error,'Illegal move; explanation refused.');assert.match(failure.message,/^Illegal move/);}else{audit.savedReplayAttempts++;const p=check(row.fixture,row.result);audit.parentEvaluations+=p.parentEvaluations;audit.oracleEvaluations+=p.oracleEvaluations;audit.ownProofReplays+=p.ownProofReplays;if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,kind:e.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&formationIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E072-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>formationIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>formationIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE072Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE072Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE072Bytes(spec.file,raw),true);assert.throws(()=>checkE072Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
