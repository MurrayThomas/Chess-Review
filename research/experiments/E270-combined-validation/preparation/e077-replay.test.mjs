import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE077Pilot} from './e077-saved-report.mjs';
const admission=await admitTerminalRegression(),phase=process.env.CHESS_E077_PHASE;assert.ok(['pilot','smoke','saved'].includes(phase));if(phase==='smoke')await admitE077Pilot(process.env.CHESS_E077_PILOT_ATTEMPT,admission);
const [{explainMove},{replayResult:legacyReplay,replay:replayEvent},{fixtures,reflect},{Chess},{openE077Replay,openLineIds}]=await Promise.all([import('../../E077-connected-passers-open-lines/code/lines.mjs'),import('../../E077-connected-passers-open-lines/code/replay.mjs'),import('../../E077-connected-passers-open-lines/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('./e077-whole-result.mjs')]);
const {check}=await openE077Replay(),get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;},pair=get('connected-new-diagonal'),multiple=get('connected-chain-three'),file=get('open-file-remaining-rook'),rank=get('rank-rook-four'),ep=get('ep-capture'),own=r=>r.events.filter(e=>openLineIds.includes(e.id)),event=r=>own(r)[0],claim=r=>event(r).evidence.claim,frame=r=>event(r).evidence;
const historyMoves=['a1b1','h8g8','b1a1','g8h8'],hc=new Chess(rank.fen);for(const m of historyMoves)hc.move(m);const history={...rank,id:'authored-positive-history',fen:hc.fen(),history:{fen:rank.fen,moves:historyMoves}};
const mutations=[
 [pair,'pair member omitted',r=>claim(r).squares.pop()],
 [pair,'newness forged',r=>claim(r).eligibility='forged'],
 [pair,'directed support omitted',r=>claim(r).support=[]],
 [pair,'reciprocal support invented',r=>{const e=claim(r).support[0];assert.ok(e);claim(r).support.push({from:e.to,to:e.from});}],
 [pair,'complete before own map omitted',r=>frame(r).before.map.own=[]],
 [pair,'complete after enemy map omitted',r=>frame(r).after.map.enemy=[]],
 [pair,'pawn classification omitted',r=>frame(r).after.classification.own.pop()],
 [pair,'passed truth forged',r=>frame(r).after.classification.own[0].passed=!frame(r).after.classification.own[0].passed],
 [pair,'front blocker invented',r=>frame(r).after.classification.own[0].blockers.push('a1')],
 [pair,'complete passer list omitted',r=>frame(r).after.passers.own=[]],
 [ep,'legal EP domain omitted',r=>{assert(frame(r).before.ep.length);frame(r).before.ep=[];}],
 [ep,'off-destination EP victim forged',r=>frame(r).before.ep[0].victim='a1'],
 [file,'opened file forged',r=>claim(r).file='a'],
 [file,'removed own contributors omitted',r=>claim(r).removed.own=[]],
 [file,'removed enemy contributors invented',r=>claim(r).removed.enemy.push('a7')],
 [file,'remaining nonpawn blockers omitted',r=>claim(r).remainingPieces=[]],
 [file,'eight-file domain omitted',r=>frame(r).after.files=[]],
 [file,'pawn-free file filled',r=>frame(r).after.files.find(f=>f.file==='c').own.push('c4')],
 [file,'file nonpawn inventory omitted',r=>frame(r).after.files.find(f=>f.file==='c').otherPieces=[]],
 [file,'complete after inventory omitted',r=>frame(r).after.pieces.pop()],
 [rank,'one horizontal alternative omitted',r=>claim(r).alternatives.pop()],
 [rank,'horizontal alternative duplicated',r=>claim(r).alternatives.push(structuredClone(claim(r).alternatives[0]))],
 [rank,'alternative move forged',r=>claim(r).alternatives[0].uci='a1a8'],
 [rank,'alternative result board forged',r=>claim(r).alternatives[0].after='invalid'],
 [rank,'rank cell domain omitted',r=>claim(r).cells.pop()],
 [rank,'rank occupant omitted',r=>{assert(claim(r).cells[0].after);claim(r).cells[0].after=null;}],
 [rank,'rank number forged',r=>claim(r).rank=3],
 [rank,'extra horizontal alternative invented',r=>claim(r).alternatives.push({uci:'a1a8'})],
 [pair,'actor forged',r=>frame(r).actor='b'],
 [pair,'history forged',r=>frame(r).history={fen:pair.fen,moves:['a1a8']}],
 [pair,'actual move identity forged',r=>frame(r).played.uci='a1a8'],
 [pair,'actual flags forged',r=>frame(r).played.flags='fake'],
 [pair,'schema forged',r=>r.schema='forged'],
 [pair,'selected comment forged',r=>r.comment='Winning.'],
 [pair,'inherited SAN forged',r=>r.san='forged'],
 [pair,'inherited event invented',r=>r.events.push({id:'invented-inherited',text:'Winning.',qualityClaim:false,evidence:{}})],
 [pair,'whole claim omitted and laundered',r=>{r.events=r.events.filter(e=>!openLineIds.includes(e.id));r.openLineAnalysis.status='no-new-fact';}],
 [pair,'own event duplicated',r=>r.events.push(structuredClone(event(r)))],
 [pair,'quality claim forged',r=>event(r).qualityClaim=true],
 [pair,'text forged',r=>event(r).text='These pawns protect each other and win.'],
 [multiple,'complete own order reversed',r=>{const inherited=r.events.filter(e=>!openLineIds.includes(e.id));r.events=[...inherited,...own(r).reverse()];}],
 [pair,'node count forged',r=>r.openLineAnalysis.nodes++],
 [pair,'budget limit forged',r=>r.openLineAnalysis.limit--],
 [pair,'status forged',r=>r.openLineAnalysis.status='no-new-fact']
];assert.equal(mutations.length,44);
const budget=f=>{const full=explainMove(f);for(let maxOpenLineNodes=0;maxOpenLineNodes<=full.openLineAnalysis.nodes;maxOpenLineNodes++){const i={...f,maxOpenLineNodes},r=explainMove(i),p=check(i,r);if(maxOpenLineNodes<full.openLineAnalysis.nodes){assert.equal(p.state,'exhausted');assert.equal(p.certificates,0);assert.equal(own(r).length,0);}else{assert.equal(p.state,full.openLineAnalysis.status);assert.equal(p.certificates,own(full).length);}}};
if(phase==='pilot'){
 for(const f of [pair,reflect(pair),rank,reflect(rank)])test('pilot whole positive '+f.id,()=>{assert.equal(check(f,explainMove(f)).state,'proven');});
 for(const [name,mutate]of [['comment',r=>r.comment='Winning.'],['inherited field',r=>r.san='forged']])test('pilot closes old checker '+name+' gap',()=>{const r=explainMove(pair);check(pair,r);const bad=structuredClone(r);mutate(bad);legacyReplay(pair,bad);assert.throws(()=>check(pair,bad));});
 test('pilot every integer simultaneous-pair budget',()=>budget(multiple));
}else if(phase==='smoke'){
 const outputs=new Map(),states={},byKind={},ranks=new Set(),supportSizes=new Set();let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),f.expectedError?new RegExp(f.expectedError):undefined);errors++;return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);if(f.expectedStatus)assert.equal(p.state,f.expectedStatus);states[p.state]=(states[p.state]||0)+1;for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));assert.equal(p.certificates,own(r).length);for(const e of own(r)){replayEvent(f,e);byKind[e.id]=(byKind[e.id]||0)+1;if(e.id==='connected-passer-proof'){supportSizes.add(e.evidence.claim.support.length);assert(e.evidence.claim.support.length<=1);}if(e.id==='open-rank-proof'){ranks.add(e.evidence.claim.rank);assert.equal(e.evidence.claim.alternatives.length,7);}}});
 for(const [f,name,mutate]of mutations)test('complete frame rejects '+name,()=>{const r=outputs.get(f.id);assert.ok(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
 for(const f of [multiple,rank,ep,history])test('every integer budget '+f.id,()=>budget(f));
 test('implemented strict and historical null/default compatibility',()=>{for(const openLineTags of [false,undefined,null]){const f={...pair,openLineTags,maxOpenLineNodes:'ignored'};assert.equal(check(f,explainMove(f)).state,'disabled');}const f={...pair,maxOpenLineNodes:null},r=explainMove(f);assert.equal(r.openLineAnalysis.limit,50000);check(f,r);for(const openLineTags of [0,'true',{},[]])assert.throws(()=>explainMove({...pair,openLineTags}),/boolean/);for(const maxOpenLineNodes of [-1,50001,0.5,NaN,'2'])assert.throws(()=>explainMove({...pair,maxOpenLineNodes}),/integer/);});
 test('positive normalized history and actual repetition terminal',()=>{const f={...history,history:{...history.history,callerMetadata:'ignored'}},r=explainMove(f);assert.equal(check(f,r).state,'proven');assert.deepEqual(frame(r).history,history.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const i={fen:c.fen(),history:{fen,moves},move:'f6g8',openLineTags:true,scanReplies:false},actual=explainMove(i);assert.equal(check(i,actual).state,'not-live');assert.equal(own(actual).length,0);assert(!new Chess(actual.after).isGameOver());});
 test('all original states three kinds eight ranks and directed-support cases',()=>{assert.equal(errors,24);assert.deepEqual(states,{proven:80,'no-new-fact':50,'not-live':10,disabled:2,exhausted:2,'not-applicable':12});assert.deepEqual(byKind,{'connected-passer-proof':22,'open-pawn-file-proof':28,'open-rank-proof':38});assert.deepEqual([...ranks].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8]);assert.deepEqual([...supportSizes].sort(),[0,1]);});
 test('legacy derivable count distinct from emitted atomic count',()=>{const f={...multiple,maxOpenLineNodes:0},r=explainMove(f),legacy=legacyReplay(f,r),p=check(f,r);assert(legacy.certificates>0);assert.equal(p.legacyDerivedCertificates,legacy.certificates);assert.equal(p.certificates,0);assert.equal(p.state,'exhausted');});
}else{
 const {openE077Saved,checkE077Shape,checkE077Bytes}=await import('./e077-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs'),saved=await openE077Saved();console.log('# E077-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,ownEventReplayAttempts:0,passed:false};try{if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);if(row.fixture.expectedError)assert(failure.message.includes(row.fixture.expectedError));}else{audit.savedReplayAttempts++;audit.parentEvaluations++;const p=check(row.fixture,row.result);if(row.fixture.expectedStatus)assert.equal(p.state,row.fixture.expectedStatus);const records=[];for(const e of own(row.result)){audit.ownEventReplayAttempts++;records.push({fixture:row.fixture.id,...replayEvent(row.fixture,e)});}assert.equal(p.certificates,records.length);assert.deepEqual(records,saved.report.replays.filter(r=>r.fixture===row.fixture.id&&openLineIds.includes(r.kind)));}audit.passed=true;}finally{console.log('# E077-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['result count',r=>r.newFixtureCases=1],['own record order',r=>r.replays.reverse()],['own record missing',r=>{const i=r.replays.findIndex(x=>openLineIds.includes(x.kind));r.replays.splice(i,1);}],['own kind forged',r=>r.replays.find(x=>openLineIds.includes(x.kind)).kind='forged']];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE077Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE077Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE077Bytes(spec.file,raw),true);assert.throws(()=>checkE077Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
