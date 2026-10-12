import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE076Pilot} from './e076-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E076_PHASE;assert.ok(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE076Pilot(process.env.CHESS_E076_PILOT_ATTEMPT,admission);
const [{explainMove},{replayResult:legacyReplay,replay:replayEvent},{fixtures,reflect},{Chess},{openE076Replay,inventoryIds}]=await Promise.all([import('../../E076-pawn-army-inventories/code/inventories.mjs'),import('../../E076-pawn-army-inventories/code/replay.mjs'),import('../../E076-pawn-army-inventories/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e076-whole-result.mjs')]);
const {check}=await openE076Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;},pawn=get('pawn-advance'),multi=get('pawn-capture-own-majority'),bishops=get('own-paired-bishops-bn'),rook=get('rook-vs-bn'),ep=get('ep-vulnerable-double'),history=get('valid-history'),own=r=>r.events.filter(e=>inventoryIds.includes(e.id)),event=(r,id)=>id?own(r).find(e=>e.id===id):own(r)[0],claim=(r,id)=>{const e=event(r,id);assert.ok(e,id);return e.evidence.claim;},frame=r=>event(r).evidence,epPawn=r=>frame(r).after.classification.own.find(p=>p.square===frame(r).played.to);
const mutations=[
 [multi,'skeleton own map omitted',r=>claim(r,'pawn-skeleton').own.pop()],
 [multi,'skeleton enemy map omitted',r=>claim(r,'pawn-skeleton').enemy.pop()],
 [multi,'complete before own map omitted',r=>frame(r).before.map.own=[]],
 [multi,'complete after enemy map omitted',r=>frame(r).after.map.enemy=[]],
 [multi,'eight-file pawn map omitted',r=>frame(r).after.map.files.own.pop()],
 [multi,'eight-rank pawn map omitted',r=>frame(r).after.map.ranks.enemy.pop()],
 [multi,'complete before inventory omitted',r=>frame(r).before.pieces.pop()],
 [multi,'complete after inventory omitted',r=>frame(r).after.pieces.pop()],
 [multi,'front blocker invented',r=>frame(r).after.classification.own[0].blockers.push('a1')],
 [multi,'complete pawn classification omitted',r=>frame(r).after.classification.own.pop()],
 [multi,'geometric passed truth forged',r=>frame(r).after.classification.own[0].passed=!frame(r).after.classification.own[0].passed],
 [multi,'complete passer list omitted',r=>frame(r).after.passers.own=[]],
 [ep,'legal EP domain omitted',r=>{assert(frame(r).after.ep.length);frame(r).after.ep=[];}],
 [ep,'off-destination victim forged',r=>frame(r).after.ep[0].victim='a1'],
 [ep,'legal EP move forged',r=>frame(r).after.ep[0].uci='a1a8'],
 [ep,'EP resulting board forged',r=>frame(r).after.ep[0].after='invalid'],
 [ep,'individual EP exclusion omitted',r=>{assert(epPawn(r).epCaptures.length);epPawn(r).epCaptures=[];}],
 [ep,'EP-vulnerable pawn called passed',r=>{assert.equal(epPawn(r).passed,false);epPawn(r).passed=true;}],
 [bishops,'whole own army signature forged',r=>frame(r).after.armies.own.signature='bbn'],
 [bishops,'bishop inventory omitted',r=>frame(r).after.armies.own.bishops.pop()],
 [bishops,'opposite-square colors forged',r=>frame(r).after.armies.own.oppositeBishopColors=false],
 [bishops,'whole opposing army forged',r=>frame(r).after.armies.enemy.signature='rr'],
 [bishops,'bishop-comparison actor role forged',r=>claim(r,'paired-bishop-armies').side='enemy'],
 [bishops,'bishop comparison forged',r=>claim(r,'paired-bishop-armies').opposing='nn'],
 [rook,'rook comparison forged',r=>claim(r,'rook-minor-armies').opposing='bb'],
 [rook,'whole rook army forged',r=>frame(r).after.armies.own.signature='rr'],
 [multi,'corrected four-file wing shortened',r=>claim(r,'flank-count-imbalance').files='abc'],
 [multi,'wing own contributor omitted',r=>claim(r,'flank-count-imbalance').own.pop()],
 [multi,'wing enemy contributor omitted',r=>claim(r,'flank-count-imbalance').enemy.pop()],
 [multi,'complete wing domain omitted',r=>frame(r).after.wings.pop()],
 [multi,'wing identity forged',r=>claim(r,'flank-count-imbalance').wing='kingside'],
 [multi,'wing pawn classification forged',r=>frame(r).after.wings[0].own=[]],
 [multi,'actor forged',r=>frame(r).actor='b'],
 [multi,'history forged',r=>frame(r).history={fen:multi.fen,moves:['a1a8']}],
 [multi,'actual move identity forged',r=>frame(r).played.uci='a1a8'],
 [multi,'actual flags forged',r=>frame(r).played.flags='fake'],
 [multi,'schema forged',r=>r.schema='forged'],
 [multi,'selected comment forged',r=>r.comment='Winning.'],
 [multi,'inherited SAN forged',r=>r.san='forged'],
 [multi,'inherited event invented',r=>r.events.push({id:'invented-inherited',text:'Winning.',qualityClaim:false,evidence:{}})],
 [multi,'whole claim omitted and laundered',r=>{r.events=r.events.filter(e=>!inventoryIds.includes(e.id));r.inventoryAnalysis.status='no-new-fact';}],
 [multi,'own event duplicated',r=>r.events.push(structuredClone(event(r)))],
 [multi,'quality claim forged',r=>event(r).qualityClaim=true],
 [multi,'text forged',r=>event(r).text='Your majority will certainly win.'],
 [multi,'complete own event order reversed',r=>{const inherited=r.events.filter(e=>!inventoryIds.includes(e.id));r.events=[...inherited,...own(r).reverse()];}],
 [multi,'node count forged',r=>r.inventoryAnalysis.nodes++],
 [multi,'budget limit forged',r=>r.inventoryAnalysis.limit--],
 [multi,'status forged',r=>r.inventoryAnalysis.status='no-new-fact']
];assert.equal(mutations.length,48);
const budget=f=>{const full=explainMove(f);for(let maxInventoryNodes=0;maxInventoryNodes<=full.inventoryAnalysis.nodes;maxInventoryNodes++){const i={...f,maxInventoryNodes},r=explainMove(i),p=check(i,r);assert.equal(p.legacyReportedCertificates,p.certificates);if(maxInventoryNodes<full.inventoryAnalysis.nodes){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(own(r).length,0);}else{assert.equal(p.state,full.inventoryAnalysis.status);assert.equal(p.certificates,own(full).length);}}};
if(phase==='pilot'){
 for(const f of [pawn,reflect(pawn),bishops,reflect(bishops)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes old checker '+name+' gap',()=>{const r=explainMove(pawn);check(pawn,r);const bad=structuredClone(r);mutate(bad);legacyReplay(pawn,bad);assert.throws(()=>check(pawn,bad));});
 test('pilot every integer multi-fact budget',()=>budget(multi));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={},bishopRoles=new Set(),rookRoles=new Set();let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),f.expectedError?new RegExp(f.expectedError):undefined);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);if(f.expectedStatus)assert.equal(p.state,f.expectedStatus);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);if(r.inventoryAnalysis)assert.equal(p.legacyReportedCertificates,p.certificates);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;assert.deepEqual(e.evidence.after.wings.map(w=>w.files),['abcd','efgh']);for(const side of ['own','enemy']){assert.equal(e.evidence.after.map.files[side].length,8);assert.equal(e.evidence.after.map.ranks[side].length,8);}if(e.id==='paired-bishop-armies')bishopRoles.add(e.evidence.claim.side+':'+e.evidence.claim.opposing);if(e.id==='rook-minor-armies')rookRoles.add(e.evidence.claim.side+':'+e.evidence.claim.opposing);}});
 for(const [f,name,mutate]of mutations)test('complete frame rejects '+name,()=>{const r=outputs.get(f.id);assert.ok(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [multi,bishops,ep,history])test('every integer budget '+f.id,()=>budget(f));
 test('implemented strict and historical null/default compatibility',()=>{for(const inventoryTags of [false,undefined,null]){const f={...pawn,inventoryTags,maxInventoryNodes:'ignored'};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...pawn,maxInventoryNodes:null},r=explainMove(f);assert.equal(r.inventoryAnalysis.limit,50000);check(f,r);for(const inventoryTags of [0,'true',{},[]])assert.throws(()=>explainMove({...pawn,inventoryTags}),/boolean/);for(const maxInventoryNodes of [-1,50001,0.5,NaN,'2'])assert.throws(()=>explainMove({...pawn,maxInventoryNodes}),/integer/);});
 test('positive normalized history and actual repetition terminal',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.deepEqual(frame(r).history,history.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const i={fen:c.fen(),history:{fen,moves},move:'f6g8',inventoryTags:true,scanReplies:false},actual=explainMove(i);assert.equal(check(i,actual).state,'not-live');assert.equal(own(actual).length,0);assert(!new Chess(actual.after).isGameOver());});
 test('all original states five kinds complete army roles and comparisons',()=>{assert.equal(errors,8);assert.deepEqual(states,{proven:88,'no-new-fact':10,'not-live':8,disabled:2,exhausted:2,'not-applicable':8});assert.deepEqual(byKind,{'pawn-skeleton':66,'passed-count-imbalance':22,'flank-count-imbalance':28,'paired-bishop-armies':10,'rook-minor-armies':14});assert.deepEqual([...bishopRoles].sort(),['enemy:bn','enemy:nn','own:bn','own:nn']);assert.deepEqual([...rookRoles].sort(),['enemy:bb','enemy:bn','enemy:nn','own:bb','own:bn','own:nn']);});
 test('legacy checker already reports actual atomic emitted count',()=>{const f={...multi,maxInventoryNodes:0},r=explainMove(f),legacy=legacyReplay(f,r),p=check(f,r);assert.equal(legacy.certificates,0);assert.equal(p.legacyReportedCertificates,0);assert.equal(p.certificates,0);assert.equal(p.state,'exhausted');});
 test('legal versus pinned EP exclusion and central d-e wing transfer',()=>{for(const reflectCase of [f=>f,reflect]){for(const [id,legal]of [['ep-vulnerable-double',true],['ep-illegal-pinned-double',false]]){const f=reflectCase(get(id)),r=explainMove(f);check(f,r);const s=frame(r).after,p=epPawn(r),actual=new Chess(r.after).moves({verbose:true}).filter(m=>m.flags.includes('e')).map(m=>m.from+m.to+(m.promotion||''));assert.deepEqual(s.ep.map(m=>m.uci),actual);assert.equal(p.epCaptures.length,legal?1:0);assert.equal(p.passed,!legal);if(legal)assert.deepEqual(s.ep.map(m=>m.victim),[frame(r).played.to]);}const f=reflectCase(get('d-e-boundary-transfer')),r=explainMove(f);check(f,r);assert(frame(r).before.wings[0].own.includes(frame(r).played.from));assert(frame(r).after.wings[1].own.includes(frame(r).played.to));assert.equal(own(r).filter(e=>e.id==='flank-count-imbalance').length,2);}});
}else{
 const {openE076Saved,checkE076Shape,checkE076Bytes}=await import('./e076-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE076Saved();console.log('# E076-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);if(row.fixture.expectedError)assert(failure.message.includes(row.fixture.expectedError));}else{audit.savedReplayAttempts++;audit.parentEvaluations++;const p=check(row.fixture,row.result);if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&inventoryIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E076-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>inventoryIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>inventoryIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE076Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE076Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE076Bytes(spec.file,raw),true);assert.throws(()=>checkE076Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
