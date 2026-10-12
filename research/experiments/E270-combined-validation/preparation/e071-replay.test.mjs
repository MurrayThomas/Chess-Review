import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE071Pilot} from './e071-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E071_PHASE;assert(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE071Pilot(process.env.CHESS_E071_PILOT_ATTEMPT,admission);
const [{explainMove},{replay:replayEvent,replayRefutation,replayGuard},{fixtures,reflect},{Chess},{openE071Replay,octopusIds}]=await Promise.all([import('../../E071-octopus-knights/code/octopus.mjs'),import('../../E071-octopus-knights/code/replay.mjs'),import('../../E071-octopus-knights/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e071-whole-result.mjs')]);
const {check}=await openE071Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},central=get('central-d6'),other=get('central-e6'),refuted=get('knight-can-be-captured'),terminal=get('terminal-defense-repetition'),history=get('legal-history'),own=r=>r.events.filter(e=>octopusIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r)?.evidence||r.octopusAnalysis?.refutation,proof=r=>frame(r).proof,capture=r=>proof(r).defenses.flatMap(x=>x.captures).find(x=>x.counters.length),counter=r=>capture(r).counters[0];
const mutations=[
 [central,'attack domain incomplete',r=>frame(r).attacks.pop()],
 [central,'king target forged',r=>frame(r).king='a8'],
 [central,'queen target omitted',r=>frame(r).queens.pop()],
 [central,'embedded outpost identity forged',r=>frame(r).outpost.id='forged'],
 [central,'nominal queen value forged',r=>proof(r).values.q=1],
 [central,'actual-after baseline forged',r=>proof(r).baseline++],
 [central,'defense domain incomplete',r=>proof(r).defenses.pop()],
 [central,'defense order forged',r=>proof(r).defenses.reverse()],
 [central,'defense move forged',r=>proof(r).defenses[0].reply.move='a2a8'],
 [central,'defense draw forged',r=>proof(r).defenses[0].draw=!proof(r).defenses[0].draw],
 [central,'defense outcome forged',r=>proof(r).defenses[0].win=false],
 [central,'capture domain incomplete',r=>proof(r).defenses.find(x=>x.captures.length).captures.pop()],
 [central,'capture gain forged',r=>capture(r).gain++],
 [central,'counterreply domain incomplete',r=>capture(r).counters.pop()],
 [central,'counterreply gain forged',r=>counter(r).gain++],
 [central,'counterreply draw forged',r=>counter(r).draw=!counter(r).draw],
 [central,'capture outcome forged',r=>capture(r).win=!capture(r).win],
 [central,'capture terminal forged',r=>capture(r).gameOver=!capture(r).gameOver],
 [central,'whole proof outcome forged',r=>proof(r).win=false],
 [history,'full proof history omitted',r=>frame(r).history.pop()],
 [central,'actual move forged',r=>frame(r).played.move='f5f6'],
 [central,'octopus text forged',r=>event(r).text='Winning knight.'],
 [central,'quality claim forged',r=>event(r).qualityClaim=true],
 [refuted,'refutation outcome forged',r=>proof(r).win=true],
 [refuted,'refutation defense omitted',r=>proof(r).defenses.pop()],
 [refuted,'refutation laundered as ineligible',r=>{r.octopusAnalysis.refutation=null;r.octopusAnalysis.status='ineligible';}],
 [refuted,'refutation outpost forged',r=>frame(r).outpost.id='forged'],
 [refuted,'refutation baseline forged',r=>proof(r).baseline++],
 [refuted,'refutation counter gain forged',r=>counter(r).gain++],
 [refuted,'refutation counter mate forged',r=>counter(r).checkmate=!counter(r).checkmate],
 [terminal,'guard history omitted',r=>r.terminalDefenseGuard.history.pop()],
 [terminal,'guard actual move forged',r=>r.terminalDefenseGuard.played.move='f5f6'],
 [terminal,'guard reply domain incomplete',r=>r.terminalDefenseGuard.replies.pop()],
 [terminal,'guard reply terminal forged',r=>r.terminalDefenseGuard.replies[0].gameOver=!r.terminalDefenseGuard.replies[0].gameOver],
 [terminal,'guard terminal condition forged',r=>r.terminalDefenseGuard.terminal=false],
 [terminal,'guard suppression IDs omitted',r=>r.terminalDefenseGuard.suppressedIds=[]],
 [terminal,'guard suppression ID invented',r=>r.terminalDefenseGuard.suppressedIds.push('invented')],
 [terminal,'guard node ledger forged',r=>r.terminalDefenseGuard.nodes++],
 [terminal,'guard omitted',r=>r.terminalDefenseGuard=null],
 [terminal,'suppressed inherited fork restored',r=>r.events.push({id:'fork',text:'Winning.',qualityClaim:false})],
 [history,'inherited event omitted',r=>r.events.splice(r.events.findIndex(e=>e.id==='advanced-knight-outpost'),1)],
 [history,'false guard suppression on nonterminal history',r=>r.terminalDefenseGuard.suppressedIds.push('fork')],
 [central,'schema forged',r=>r.schema='coach-concepts-v99'],
 [central,'selected comment forged',r=>r.comment='Winning.'],
 [central,'inherited SAN forged',r=>r.san='forged'],
 [central,'omitted proof laundered as ineligible',r=>{r.events=r.events.filter(e=>!octopusIds.includes(e.id));r.octopusAnalysis.status='ineligible';}],
 [central,'octopus node ledger forged',r=>r.octopusAnalysis.nodes++],
 [central,'octopus limit forged',r=>r.octopusAnalysis.limit--],
];assert.equal(mutations.length,48);
function budget(f){const full=explainMove(f),needed=full.octopusAnalysis.nodes;assert(needed>0);for(let limit=0;limit<=needed+1;limit++){const input={...f,maxOctopusNodes:limit},r=explainMove(input),p=check(input,r);assert.equal(p.certificates,own(r).length);if(limit<needed){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(r.octopusAnalysis.nodes,limit+1);assert.equal(r.octopusAnalysis.refutation,null);}else{assert.equal(p.state,full.octopusAnalysis.status);assert.equal(p.certificates,own(full).length);}assert.deepEqual(r.terminalDefenseGuard,full.terminalDefenseGuard);}}
if(phase==='pilot'){
 for(const f of [central,reflect(central),other,reflect(other)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [f,name,mutate]of [[terminal,'omitted suppression IDs',r=>r.terminalDefenseGuard.suppressedIds=[]],[history,'inherited SAN',r=>r.san='forged']])test('pilot closes old guard '+name+' gap',()=>{const r=explainMove(f);check(f,r);const bad=structuredClone(r);mutate(bad);replayGuard(f,bad);assert.throws(()=>check(f,bad));});
 test('pilot every integer octopus budget',()=>budget(central));
}else if(phase==='smoke'){
 const outputs=new Map(),states={};let errors=0,certificates=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);certificates+=p.certificates;});
 for(const [f,name,mutate]of mutations)test('complete octopus rejects '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [central,refuted,terminal,history])test('every integer budget '+f.id,()=>budget(f));
 test('strict and historical null default compatibility',()=>{for(const octopusTags of [false,undefined,null]){const f={...central,octopusTags};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...central,maxOctopusNodes:null},r=explainMove(f);assert.equal(r.octopusAnalysis.limit,50000);check(f,r);for(const octopusTags of [0,'true',{},[]])assert.throws(()=>explainMove({...central,octopusTags}),/boolean/);for(const maxOctopusNodes of [-1,50001,0.5,NaN,'2'])for(const octopusTags of [false,true])assert.throws(()=>explainMove({...central,octopusTags,maxOctopusNodes}),/integer/);});
 test('full-history versus fresh FEN and zero independent budgets',()=>{for(const mirror of [f=>f,reflect]){const f=mirror(terminal),r=explainMove(f);check(f,r);assert.equal(r.terminalDefenseGuard.terminal,true);assert.deepEqual(r.terminalDefenseGuard.suppressedIds,['fork']);assert(!r.events.some(e=>e.id==='fork'));const fresh={...f,history:undefined},a=explainMove(fresh);check(fresh,a);assert.equal(a.terminalDefenseGuard,null);assert(a.events.some(e=>e.id==='fork'));for(const extra of [{maxOctopusNodes:0},{maxOctopusNodes:0,maxOutpostNodes:0},{maxOutpostNodes:0}]){const i={...f,...extra},o=explainMove(i);check(i,o);assert(o.terminalDefenseGuard.terminal);assert(!o.events.some(e=>['fork','broad-fork','triple-attack','discovered-double-attack'].includes(e.id)));}}});
 test('all original states certificates and guard/refutation coverage',()=>{assert.equal(errors,4);assert.equal(certificates,40);assert.deepEqual(states,{proven:40,ineligible:36,'queen-gain-refuted':20,disabled:4,exhausted:4});assert.equal([...outputs.values()].filter(r=>r.terminalDefenseGuard).length,8);assert.equal([...outputs.values()].filter(r=>r.terminalDefenseGuard?.terminal).length,4);});
 test('material values returned copies preserve subsequent calls',()=>{const r=explainMove(central);proof(r).values.q=1;const fresh=explainMove(central);assert.equal(proof(fresh).values.q,9);check(central,fresh);});
 test('full proof branches retain multiple queens promotions and refutations',()=>{const r=outputs.get('multiple-queens');assert(frame(r).queens.length>1);let promotions=0,failed=0,terminals=0;for(const o of outputs.values())if(frame(o)){for(const d of proof(o).defenses){if(d.gameOver)terminals++;for(const c of d.captures){if(!c.win)failed++;for(const x of c.counters)if(x.response.promotion)promotions++;}}}assert(promotions>0&&failed>0&&terminals>0);});
 test('normalized complete historical envelope',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.equal(frame(r).history.length,history.history.moves.length);assert(!frame(r).history.some(x=>'callerMetadata'in x));});
}else{




 const {openE071Saved,checkE071Shape,checkE071Bytes}=await import('./e071-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE071Saved();console.log('# E071-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,oracleEvaluations:0,ownProofReplays:0,refutationProofReplays:0,guardProofReplays:0,refutationMetadataAttempts:0,guardMetadataAttempts:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(row.error,'Illegal move; explanation refused.');assert.match(failure.message,/^Illegal move/);}else{audit.savedReplayAttempts++;const p=check(row.fixture,row.result);audit.parentEvaluations+=p.parentEvaluations;audit.oracleEvaluations+=p.oracleEvaluations;audit.ownProofReplays+=p.ownProofReplays;audit.refutationProofReplays+=p.refutationProofReplays;audit.guardProofReplays+=p.guardProofReplays;if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,kind:e.id,...replayEvent(row.fixture,e)});}if(row.result.octopusAnalysis){audit.guardMetadataAttempts++;assert.deepEqual({fixture:row.fixture.id,...replayGuard(row.fixture,row.result)},saved.report.guardReplays.find(x=>x.fixture===row.fixture.id));}if(row.result.octopusAnalysis?.status==='queen-gain-refuted'){audit.refutationMetadataAttempts++;assert.deepEqual({fixture:row.fixture.id,...replayRefutation(row.fixture,row.result)},saved.report.octopusRefutationReplays.find(x=>x.fixture===row.fixture.id));}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&octopusIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E071-row-audit '+JSON.stringify(audit));}});
 const mutations=[['guard record missing',r=>r.guardReplays.pop()],['refutation record missing',r=>r.octopusRefutationReplays.pop()],['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>octopusIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>octopusIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE071Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE071Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE071Bytes(spec.file,raw),true);assert.throws(()=>checkE071Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
