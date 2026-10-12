import test from 'node:test';import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE078Pilot} from './e078-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E078_PHASE;assert.ok(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE078Pilot(process.env.CHESS_E078_PILOT_ATTEMPT,admission);
const [{explainMove},{replayResult:legacyReplay,replay:replayEvent},{fixtures,reflect},{Chess},{openE078Replay,placementIds}]=await Promise.all([import('../../E078-bishop-chains-batteries/code/placements.mjs'),import('../../E078-bishop-chains-batteries/code/replay.mjs'),import('../../E078-bishop-chains-batteries/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e078-whole-result.mjs')]);
const {check}=await openE078Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;},chain=get('outside-branched-chain'),behind=get('behind-branched-chain'),battery=get('triple-queen-middle'),multiple=get('two-new-batteries'),own=r=>r.events.filter(e=>placementIds.includes(e.id)),event=r=>own(r)[0],claim=r=>event(r).evidence.claim,frame=r=>event(r).evidence;
const historyMoves=['a1b1','h8g8','b1a1','g8h8'],hc=new Chess(chain.fen);for(const m of historyMoves)hc.move(m);const history={...chain,id:'authored-positive-history',fen:hc.fen(),history:{fen:chain.fen,moves:historyMoves}};
const mutations=[
 [chain,'component member omitted',r=>claim(r).component.members.pop()],
 [chain,'component edge omitted',r=>claim(r).component.edges.pop()],
 [chain,'component bases omitted',r=>claim(r).component.bases=[]],
 [chain,'component heads omitted',r=>claim(r).component.heads=[]],
 [chain,'component terminals omitted',r=>claim(r).component.terminals=[]],
 [chain,'prior restriction omitted',r=>claim(r).restrictionBefore=[]],
 [chain,'after restriction invented',r=>claim(r).restrictionAfter.push({direction:'NE',blocker:'a1'})],
 [chain,'bishop ray domain omitted',r=>frame(r).after.bishopRays[0].rays=[]],
 [chain,'first blocker omitted',r=>{const ray=frame(r).before.bishopRays[0].rays.find(x=>x.first);assert.ok(ray);ray.first=null;}],
 [chain,'before inventory omitted',r=>frame(r).before.pieces.pop()],
 [battery,'maximal group member omitted',r=>claim(r).group.members.pop()],
 [battery,'compatible middle slider made a gap',r=>claim(r).group.gaps.push('d4')],
 [battery,'group boundary invented',r=>claim(r).group.bounds.before={square:'a1',type:'n',color:'w'}],
 [battery,'whole line cells omitted',r=>claim(r).group.cells=[]],
 [battery,'family list omitted',r=>claim(r).group.families=[]],
 [battery,'queen subset forged',r=>claim(r).group.hasQueen=false],
 [battery,'identity mapping forged',r=>claim(r).identityMappedKey='forged'],
 [battery,'before complete battery domain omitted',r=>frame(r).before.batteries=[]],
 [battery,'after complete battery domain omitted',r=>frame(r).after.batteries=[]],
 [battery,'orientation forged',r=>claim(r).group.orientation='rank'],
 [chain,'after inventory color forged',r=>frame(r).after.pieces[0].color='x'],
 [chain,'actor forged',r=>frame(r).actor='b'],
 [chain,'history forged',r=>frame(r).history={fen:chain.fen,moves:['a1a8']}],
 [chain,'root legal domain omitted',r=>frame(r).legalMoves=[]],
 [chain,'played identity forged',r=>frame(r).played.uci='a1a8'],
 [chain,'played flags forged',r=>frame(r).played.flags='fake'],
 [chain,'before board forged',r=>frame(r).before.fen='invalid'],
 [chain,'after board forged',r=>frame(r).after.fen='invalid'],
 [chain,'complete claim omitted and laundered',r=>{r.events=r.events.filter(e=>!placementIds.includes(e.id));r.placementAnalysis.status='no-new-fact';}],
 [chain,'own event duplicated',r=>r.events.push(structuredClone(event(r)))],
 [chain,'quality claim forged',r=>event(r).qualityClaim=true],
 [chain,'teaching text forged',r=>event(r).text='The bishop is always strong.'],
 [chain,'schema forged',r=>r.schema='forged'],
 [chain,'selected comment forged',r=>r.comment='Winning.'],
 [chain,'inherited SAN forged',r=>r.san='forged'],
 [chain,'inherited event omitted',r=>{const i=r.events.findIndex(e=>!placementIds.includes(e.id));assert(i>=0);r.events.splice(i,1);}],
 [multiple,'complete own event order reversed',r=>{const inherited=r.events.filter(e=>!placementIds.includes(e.id));r.events=[...inherited,...own(r).reverse()];}],
 [chain,'node count forged',r=>r.placementAnalysis.nodes++],
 [chain,'budget limit forged',r=>r.placementAnalysis.limit--],
 [chain,'status forged',r=>r.placementAnalysis.status='no-new-fact']
];assert.equal(mutations.length,40);
const budget=f=>{const full=explainMove(f);for(let maxPlacementNodes=0;maxPlacementNodes<=full.placementAnalysis.nodes;maxPlacementNodes++){const i={...f,maxPlacementNodes},r=explainMove(i),p=check(i,r);if(maxPlacementNodes<full.placementAnalysis.nodes){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(own(r).length,0);}else{assert.equal(p.state,full.placementAnalysis.status);assert.equal(p.certificates,own(full).length);}}};
if(phase==='pilot'){
 for(const f of [chain,reflect(chain),battery,reflect(battery)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes old checker '+name+' gap',()=>{const r=explainMove(chain);check(chain,r);const bad=structuredClone(r);mutate(bad);legacyReplay(chain,bad);assert.throws(()=>check(chain,bad));});
 test('pilot every integer two-event budget',()=>budget(multiple));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={},families=new Set(),directions=new Set();let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),f.expectedError?new RegExp(f.expectedError):undefined);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);if(f.expectedStatus)assert.equal(p.state,f.expectedStatus);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;for(const family of e.evidence.claim.group?.families||[])families.add(family);for(const x of e.evidence.claim.restrictionBefore||[])directions.add(x.direction);for(const x of e.evidence.claim.restrictionAfter||[])directions.add(x.direction);}});
 for(const [f,name,mutate]of mutations)test('complete frame rejects '+name,()=>{const r=outputs.get(f.id);assert.ok(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [chain,behind,multiple,history])test('every integer budget '+f.id,()=>budget(f));
 test('implemented strict and historical null/default compatibility',()=>{for(const placementTags of [false,undefined,null]){const f={...chain,placementTags,maxPlacementNodes:'ignored'};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...chain,maxPlacementNodes:null},r=explainMove(f);assert.equal(r.placementAnalysis.limit,50000);check(f,r);for(const placementTags of [0,'true',{},[]])assert.throws(()=>explainMove({...chain,placementTags}),/boolean/);for(const maxPlacementNodes of [-1,50001,0.5,NaN,'2'])assert.throws(()=>explainMove({...chain,maxPlacementNodes}),/integer/);});
 test('normalized positive history and actual repetition terminal',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.deepEqual(frame(r).history,history.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const i={fen:c.fen(),history:{fen,moves},move:'f6g8',placementTags:true,scanReplies:false},actual=explainMove(i);assert.equal(check(i,actual).state,'not-live');assert.equal(own(actual).length,0);assert(!new Chess(actual.after).isGameOver());});
 test('all original states families blocker directions and certificate kinds',()=>{assert.equal(errors,24);assert.deepEqual(states,{proven:86,'no-new-fact':56,disabled:2,exhausted:2,'not-applicable':12,'not-live':10});assert.deepEqual(byKind,{'outside-chain-proof':14,'behind-chain-proof':6,'slider-battery-proof':68});assert.deepEqual([...families].sort(),['bb','bq','qq','qr','rr']);assert.deepEqual([...directions].sort(),['NE','NW','SE','SW']);});
 test('legacy derived count retained separately from atomic emitted count',()=>{const f={...chain,maxPlacementNodes:0},r=explainMove(f),legacy=legacyReplay(f,r),p=check(f,r);assert(legacy.certificates>0);assert.equal(p.legacyDerivedCertificates,legacy.certificates);assert.equal(p.certificates,0);assert.equal(p.state,'exhausted');});
}else{
 const {openE078Saved,checkE078Shape,checkE078Bytes}=await import('./e078-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE078Saved();console.log('# E078-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);if(row.fixture.expectedError)assert(failure.message.includes(row.fixture.expectedError));}else{audit.savedReplayAttempts++;audit.parentEvaluations++;const p=check(row.fixture,row.result);if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&placementIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E078-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>placementIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>placementIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE078Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE078Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE078Bytes(spec.file,raw),true);assert.throws(()=>checkE078Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
