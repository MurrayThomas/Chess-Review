import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE075Pilot} from './e075-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E075_PHASE;assert(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE075Pilot(process.env.CHESS_E075_PILOT_ATTEMPT,admission);
const [{explainMove,explainAttempt},{replayResult:legacyReplay,replay:replayEvent},{fixtures,reflect},{Chess},{openE075Replay,foundationIds}]=await Promise.all([import('../../E075-board-material/code/foundations.mjs'),import('../../E075-board-material/code/replay.mjs'),import('../../E075-board-material/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e075-whole-result.mjs')]);
const {check}=await openE075Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},pawn=get('pawn-double-edge'),multi=get('equal-points-unequal-armies'),illegal=get('long-origin-alternatives'),history=get('valid-history'),own=r=>r.events.filter(e=>foundationIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence;
const mutations=[
 [multi,'before inventory omitted',r=>frame(r).before.pieces.pop()],
 [multi,'after inventory omitted',r=>frame(r).after.pieces.pop()],
 [multi,'piece count forged',r=>frame(r).after.counts.own.b++],
 [multi,'own nominal total forged',r=>frame(r).after.own++],
 [multi,'enemy nominal total forged',r=>frame(r).after.enemy++],
 [multi,'balance forged',r=>frame(r).after.balance++],
 [multi,'equal points launder unequal armies',r=>frame(r).after.unequalArmies=false],
 [multi,'king value forged',r=>frame(r).values.k=100],
 [pawn,'absolute from coordinate forged',r=>frame(r).from.file='h'],
 [pawn,'absolute to rank forged',r=>frame(r).to.rank=8],
 [pawn,'origin piece forged',r=>frame(r).origin.type='q'],
 [pawn,'actor forged',r=>frame(r).actor='b'],
 [pawn,'root fen forged',r=>frame(r).fen='forged'],
 [history,'full history omitted',r=>frame(r).history.pop()],
 [pawn,'legal domain incomplete',r=>frame(r).legalMoves.pop()],
 [pawn,'legal domain invented move',r=>frame(r).legalMoves.push('a1a8')],
 [pawn,'legal domain unsorted',r=>frame(r).legalMoves.reverse()],
 [illegal,'origin alternatives incomplete',r=>frame(r).originMoves.pop()],
 [illegal,'origin alternative invented',r=>frame(r).originMoves.push('c3c3')],
 [illegal,'accepted illegal attempt',r=>frame(r).accepted=true],
 [pawn,'played uci forged',r=>frame(r).played.uci='a2a5'],
 [pawn,'played flags forged',r=>frame(r).played.flags='c'],
 [pawn,'played before forged',r=>frame(r).played.before='forged'],
 [pawn,'played after forged',r=>frame(r).played.after='forged'],
 [get('ep-legal'),'ep victim type forged',r=>frame(r).played.captured='q'],
 [get('castle-kingside'),'castle king endpoint forged',r=>frame(r).played.to='f1'],
 [get('promotion-n'),'promotion choice forged',r=>frame(r).played.promotion='q'],
 [pawn,'movement text forged',r=>event(r).text='Winning pawn.'],
 [pawn,'quality claim forged',r=>event(r).qualityClaim=true],
 [pawn,'required fact omitted',r=>{const e=event(r);r.events.splice(r.events.indexOf(e),1);}],
 [pawn,'required fact duplicated',r=>r.events.push(structuredClone(event(r)))],
 [pawn,'own event order forged',r=>{const a=r.events.findIndex(e=>foundationIds.includes(e.id));[r.events[a],r.events[a+1]]=[r.events[a+1],r.events[a]];}],
 [pawn,'schema forged',r=>r.schema='coach-concepts-v99'],
 [pawn,'selected comment forged',r=>r.comment='Winning.'],
 [pawn,'inherited SAN forged',r=>r.san='forged'],
 [pawn,'invented inherited event',r=>r.events.unshift({id:'invented',text:'Winning.',qualityClaim:false})],
 [pawn,'node ledger forged',r=>r.foundationAnalysis.nodes++],
 [pawn,'limit forged',r=>r.foundationAnalysis.limit--],
 [pawn,'status forged',r=>r.foundationAnalysis.status='rejected'],
 [illegal,'invented played after illegal input',r=>r.after=illegal.fen],
];assert.equal(mutations.length,40);
function budget(f){const complete=explainMove(f),needed=complete.foundationAnalysis.nodes;assert(needed>0);for(let limit=0;limit<=needed+1;limit++){const input={...f,maxFoundationNodes:limit},r=explainMove(input),p=check(input,r);assert.equal(p.legacyReportedCertificates,own(r).length);assert.equal(p.certificates,own(r).length);if(limit<needed){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(r.foundationAnalysis.nodes,limit+1);}else{assert.equal(p.state,complete.foundationAnalysis.status);assert.equal(p.certificates,own(complete).length);}}}
if(phase==='pilot'){
 for(const f of [pawn,reflect(pawn),illegal,reflect(illegal)])test('pilot whole branch '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,f.expectedStatus);});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes old checker '+name+' gap',()=>{const r=explainMove(pawn);check(pawn,r);const bad=structuredClone(r);mutate(bad);legacyReplay(pawn,bad);assert.throws(()=>check(pawn,bad));});
 test('pilot every integer nominal material budget',()=>budget(multi));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={};let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f));errors++;return;}const r=explainMove(f);assert.deepEqual(explainAttempt(f),r);const p=check(f,r);outputs.set(f.id,r);if(f.expectedStatus)assert.equal(p.state,f.expectedStatus);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);if(r.foundationAnalysis)assert.equal(p.legacyReportedCertificates,p.certificates);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;}});
 for(const [f,name,mutate]of mutations)test('complete frame rejects '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [pawn,multi,illegal,history])test('every integer budget '+f.id,()=>budget(f));
 test('strict and historical null default compatibility',()=>{for(const foundationTags of [false,undefined,null]){const f={...pawn,foundationTags,maxFoundationNodes:'ignored'};assert.equal(check(f,explainMove(f)).state,'disabled');assert.deepEqual(explainAttempt(f),explainMove(f));}const f={...pawn,maxFoundationNodes:null},r=explainMove(f);assert.equal(r.foundationAnalysis.limit,50000);check(f,r);for(const foundationTags of [0,'true',{},[]])assert.throws(()=>explainMove({...pawn,foundationTags}),/boolean/);for(const maxFoundationNodes of [-1,50001,0.5,NaN,'2'])assert.throws(()=>explainMove({...pawn,maxFoundationNodes}),/integer/);for(const move of ['a4','A2a4','a2a4k',null])assert.throws(()=>explainMove({...pawn,move}),/UCI/);});
 test('normalized history and actual repetition root',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);check(f,r);assert.equal(frame(r).history.length,2);assert(!frame(r).history.some(x=>'callerMetadata'in x));const f2=get('root-repetition'),r2=explainMove(f2);assert.equal(check(f2,r2).state,'unavailable');assert(!new Chess(f2.fen).isGameOver());assert.equal(r2.after,undefined);});
 test('all original states kinds and exact errors',()=>{assert.equal(errors,16);assert.deepEqual(states,{accepted:62,rejected:40,unavailable:10,disabled:2,exhausted:4});assert.deepEqual(byKind,{'piece-movement':62,'board-coordinates':62,'legal-input':62,'material-inventory':62,'nominal-balance':62,'material-imbalance':50,'illegal-input':40});});
 test('all six pieces special transitions and unequal equal-point armies',()=>{const types=new Set();for(const r of outputs.values())if(r.foundationAnalysis?.status==='accepted')types.add(frame(r).played.piece);assert.deepEqual([...types].sort(),['b','k','n','p','q','r']);for(const mirror of [f=>f,reflect]){const f=mirror(get('ep-legal')),r=explainMove(f);check(f,r);const e=frame(r),victim=e.played.to[0]+e.played.from[1];assert(e.before.pieces.some(p=>p.square===victim));assert(!e.after.pieces.some(p=>p.square===victim));for(const type of ['q','r','b','n']){const i=mirror(get('capture-promotion-'+type)),o=explainMove(i);check(i,o);assert.equal(frame(o).played.promotion,type);}const b=explainMove(mirror(multi));assert.equal(frame(b).after.balance,0);assert.equal(frame(b).after.unequalArmies,true);}});
 test('terminal disabled rejected and exhaustion preserve separate routes',()=>{for(const f of [get('root-dead'),get('root-mate'),get('root-stalemate'),get('root-clock-draw'),get('root-repetition')]){const r=explainMove(f),p=check(f,r);assert.equal(p.parentEvaluations,0);assert.equal(r.after,undefined);assert.deepEqual(r.events,[]);}for(const f of [illegal,{...illegal,maxFoundationNodes:0}]){const r=explainMove(f);assert.equal(check(f,r).parentEvaluations,0);assert.equal(r.after,undefined);}assert.throws(()=>explainMove({...illegal,foundationTags:false}),/Illegal/);const r=explainMove({...pawn,maxFoundationNodes:0});assert.equal(check({...pawn,maxFoundationNodes:0},r).parentEvaluations,1);});
}else{

 const {openE075Saved,checkE075Shape,checkE075Bytes}=await import('./e075-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE075Saved();console.log('# E075-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);if(row.fixture.expectedError)assert(failure.message.includes(row.fixture.expectedError));}else{audit.savedReplayAttempts++;const p=check(row.fixture,row.result);audit.parentEvaluations+=p.parentEvaluations;if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&foundationIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E075-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>foundationIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>foundationIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE075Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE075Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE075Bytes(spec.file,raw),true);assert.throws(()=>checkE075Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
