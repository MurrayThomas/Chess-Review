import test from 'node:test';
import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';
await admitTerminalRegression();
const phase=process.env.CHESS_E081_PHASE;assert.ok(['smoke','saved'].includes(phase));
const [{explainMove},{replayResult},{fixtures,reflect},{Chess}]=await Promise.all([import('../../E081-direct-attacks/code/attacks.mjs'),import('../../E081-direct-attacks/code/replay.mjs'),import('../../E081-direct-attacks/code/fixtures.mjs'),import('../../../../lib/chess.js')]);
const ownIds=new Set(['direct-attack','attack-on-pawn','attack-on-piece']);
const get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;};
const knight=get('knight-attacks-pawn'),multiple=get('multiple-categories'),promotion=get('all-capture-promotion-choices'),negative=get('pinned-rook-contact'),bishop=get('bishop-long-diagonal');
const own=r=>r.events.filter(e=>ownIds.has(e.id));
if(phase==='smoke'){
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result: '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),new RegExp(f.expectedError));return;}const r=explainMove(f),checked=replayResult(f,r);assert.equal(checked.state,f.expectedStatus);for(const id of f.expected||[])assert(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));if(f.parentSelectedId)assert.equal(r.events.find(e=>e.text===r.comment)?.id,f.parentSelectedId);if(f.id.startsWith('all-capture-promotion-choices')){const w=r.directAttackAnalysis.witness;assert.equal(w.targets.length,2);for(const target of w.targets)assert.equal(target.captures.length,4);}});
 const mutations=[
  [knight,'whole witness omitted',r=>r.directAttackAnalysis.witness=null],
  [knight,'all contacts omitted',r=>r.directAttackAnalysis.witness.contacts=[]],
  [knight,'all targets omitted',r=>r.directAttackAnalysis.witness.targets=[]],
  [multiple,'one target omitted',r=>r.directAttackAnalysis.witness.targets.pop()],
  [multiple,'target duplicated',r=>r.directAttackAnalysis.witness.targets.push(structuredClone(r.directAttackAnalysis.witness.targets[0]))],
  [multiple,'targets reordered',r=>r.directAttackAnalysis.witness.targets.reverse()],
  [multiple,'contacts reordered',r=>r.directAttackAnalysis.witness.contacts.reverse()],
  [promotion,'capture choice omitted',r=>r.directAttackAnalysis.witness.targets[0].captures.pop()],
  [promotion,'capture duplicated',r=>r.directAttackAnalysis.witness.targets[0].captures.push(r.directAttackAnalysis.witness.targets[0].captures[0])],
  [promotion,'capture choices reordered',r=>r.directAttackAnalysis.witness.targets[0].captures.reverse()],
  [knight,'hypothetical legal set omitted',r=>r.directAttackAnalysis.witness.hypotheticalLegalMoves=[]],
  [knight,'hypothetical frame forged',r=>r.directAttackAnalysis.witness.hypotheticalActorFen=r.before],
  [knight,'before inventory omitted',r=>r.directAttackAnalysis.witness.before.pieces.pop()],
  [knight,'after inventory color forged',r=>r.directAttackAnalysis.witness.after.pieces[0].color='b'],
  [bishop,'ray shortened',r=>r.directAttackAnalysis.witness.contacts[0].cells.pop()],
  [knight,'target type forged',r=>r.directAttackAnalysis.witness.targets[0].target.type='q'],
  [knight,'actor forged',r=>r.directAttackAnalysis.witness.actor='b'],
  [get('knight-promotion-contact'),'played promotion forged',r=>r.directAttackAnalysis.witness.played.promotion='q'],
  [knight,'played flags forged',r=>r.directAttackAnalysis.witness.played.flags='fake'],
  [knight,'history invented',r=>r.directAttackAnalysis.witness.history={fen:knight.fen,moves:['a1a8']}],
  [knight,'root legal set omitted',r=>r.directAttackAnalysis.witness.legalMoves=[]],
  [knight,'one event omitted',r=>r.events.pop()],
  [knight,'all new events omitted',r=>r.events=r.events.filter(e=>!ownIds.has(e.id))],
  [knight,'event duplicated',r=>r.events.push(structuredClone(own(r)[0]))],
  [knight,'new event order forged',r=>{const indexes=r.events.flatMap((e,i)=>ownIds.has(e.id)?[i]:[]);assert.equal(indexes.length,2);[r.events[indexes[0]],r.events[indexes[1]]]=[r.events[indexes[1]],r.events[indexes[0]]];}],
  [knight,'event category subset omitted',r=>own(r)[0].evidence.targets=[]],
  [knight,'quality claim forged',r=>own(r)[0].qualityClaim=true],
  [knight,'selected comment forged',r=>r.comment='Winning.'],
  [knight,'status forged',r=>r.directAttackAnalysis.status='no-new-fact'],
  [knight,'node count forged',r=>r.directAttackAnalysis.nodes++],
  [knight,'limit forged',r=>r.directAttackAnalysis.limit--],
  [knight,'inherited field forged',r=>r.san='forged']
 ];
 for(const [f,name,mutate]of mutations)test('whole replay rejects '+name,()=>{const r=explainMove(f);replayResult(f,r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>replayResult(f,bad));});
 for(const f of [knight,multiple,promotion,negative])test('every integer budget boundary: '+f.id,()=>{const full=explainMove(f);for(let maxDirectAttackNodes=0;maxDirectAttackNodes<=full.directAttackAnalysis.nodes;maxDirectAttackNodes++){const i={...f,maxDirectAttackNodes},r=explainMove(i);replayResult(i,r);if(maxDirectAttackNodes<full.directAttackAnalysis.nodes){assert.equal(r.directAttackAnalysis.status,'exhausted');assert.equal(r.directAttackAnalysis.witness,null);assert(!r.events.some(e=>ownIds.has(e.id)));}else assert.equal(r.directAttackAnalysis.status,full.directAttackAnalysis.status);}});
 test('default disabled and extra strict malformed controls',()=>{for(const directAttackTags of [false,undefined]){const f={...knight,directAttackTags,maxDirectAttackNodes:'ignored'};assert.equal(replayResult(f,explainMove(f)).state,'disabled');}for(const directAttackTags of [null,0,'true',{},[]])assert.throws(()=>explainMove({...knight,directAttackTags}),/boolean/);for(const maxDirectAttackNodes of [null,-1,50001,1.5,NaN,'2'])assert.throws(()=>explainMove({...knight,maxDirectAttackNodes}),/integer/);});
 test('prior geometric contact is excluded despite newly legal capture after unpinning',()=>{const pinned={id:'authored-unpin',fen:'7k/8/8/8/4r3/8/4Q1b1/4K3 w - - 0 1',move:'e2e4',directAttackTags:true,scanReplies:false},clear={...pinned,id:'authored-unpinned',fen:'7k/8/8/8/8/8/4Q1b1/4K3 w - - 0 1'};for(const f of [pinned,clear])for(const reflected of [false,true]){const i=reflected?reflect(f):f,c=new Chess(i.fen),origin=reflected?'e7':'e2',target=reflected?'g7':'g2',code=origin+target;assert(c.attackers(target,c.turn()).includes(origin));assert.equal(c.moves({verbose:true}).some(m=>m.from+m.to===code),f===clear);c.move(i.move);const fields=c.fen().split(' ');fields[1]=reflected?'b':'w';fields[3]='-';const h=new Chess(fields.join(' '));assert(h.moves({verbose:true}).some(m=>m.from+m.to===(reflected?'e5':'e4')+target));const r=explainMove(i);assert.equal(replayResult(i,r).state,'no-new-fact');assert.equal(r.directAttackAnalysis.witness,null);}});
 test('history metadata normalizes and actual repetition is terminal',()=>{const original=get('valid-history'),metadata={...original,history:{...original.history,callerMetadata:'ignored'}},positive=explainMove(metadata);assert.equal(replayResult(metadata,positive).state,'proven');assert.deepEqual(positive.directAttackAnalysis.witness.history,original.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const f={fen:c.fen(),history:{fen,moves},move:'f6g8',directAttackTags:true,scanReplies:false},r=explainMove(f);assert.equal(replayResult(f,r).state,'not-live');assert.equal(r.directAttackAnalysis.witness,null);assert(!new Chess(r.after).isGameOver());});
}else{
 const {openE081Saved,checkE081Shape,checkE081Bytes}=await import('./e081-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs');const saved=await openE081Saved();
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,passed:false};try{
  if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);assert.ok(failure.message.includes(row.fixture.expectedError));}
  else {audit.savedReplayAttempts++;audit.parentEvaluations++;const checked=replayResult(row.fixture,row.result);const at=saved.report.directAttackReplays.find(r=>r.fixture===row.fixture.id);assert.deepEqual({fixture:row.fixture.id,...checked},at);assert.equal(checked.state,row.fixture.expectedStatus);for(const id of row.fixture.expected||[])assert(row.result.events.some(e=>e.id===id));for(const id of row.fixture.absent||[])assert(!row.result.events.some(e=>e.id===id));}
  audit.passed=true;
 }finally{console.log('# E081-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['original result count',r=>r.newFixtureCases=1],['replay order',r=>r.directAttackReplays.reverse()]];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE081Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE081Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE081Bytes(spec.file,raw),true);assert.throws(()=>checkE081Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
