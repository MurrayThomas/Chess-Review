import test from 'node:test';
import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';
await admitTerminalRegression();
const phase=process.env.CHESS_E084_PHASE;assert.ok(['smoke','saved'].includes(phase));
const [{openE084Replay},{explainMove},{explainMove:parent},{bothColors},{checkWitness},{Chess}]=await Promise.all([
 import('./e084-whole-result.mjs'),import('../../E084-legal-line-clearance/code/lines.mjs'),import('../../E083-contact-exchange-changes/code/changes.mjs'),
 import('../../E084-legal-line-clearance/code/fixtures.mjs'),import('../../E084-legal-line-clearance/code/check-witness.mjs'),import('../../../../lib/chess.js')]);
const replay=await openE084Replay(),input=f=>({fen:f.fen,move:f.move,history:f.history,scanReplies:false,lineTags:true});
const multi={fen:'7k/4q3/8/1B6/8/8/1K2N3/4Rr2 w - - 0 1',move:'e2c3',scanReplies:false,lineTags:true};
const get=id=>id==='multi'?multi:input(bothColors.find(f=>f.id===id));
const inherited=i=>parent({...i,lineTags:false});
const own=r=>r.events.filter(e=>e.evidence?.experiment==='E084');
const check=(i,r=explainMove(i),p=inherited(i))=>replay.check(i,r,p);
if(phase==='smoke'){
 for(const f of bothColors)test('authored whole result: '+f.id,()=>{const i=input(f),r=explainMove(i);check(i,r);for(const id of f.expected)assert(own(r).some(e=>e.id===id));if(!f.expected.length)assert.equal(own(r).length,0);});
 const mutations=[
  ['file-check','all witness frames and claims omitted',r=>{r.lineAnalysis.witnesses=[];r.events=r.events.filter(e=>e.evidence?.experiment!=='E084');r.lineAnalysis.status='no-new-fact';}],
  ['multi','one entire witness omitted',r=>{r.lineAnalysis.witnesses.pop();}],
  ['multi','witness duplicated',r=>{r.lineAnalysis.witnesses.push(structuredClone(r.lineAnalysis.witnesses[0]));}],
  ['multi','witnesses reordered',r=>{r.lineAnalysis.witnesses.reverse();}],
  ['ordinary','spurious negative witness',r=>{r.lineAnalysis.witnesses.push({experiment:'E084'});}],
  ['file-check','ray shortened',r=>{r.lineAnalysis.witnesses[0].cells.pop();}],
  ['file-check','blocker forged',r=>{r.lineAnalysis.witnesses[0].blocker='a2';}],
  ['rook-queen','capture domain omitted',r=>{r.lineAnalysis.witnesses[0].captures=[];}],
  ['file-check','check flag forged',r=>{r.lineAnalysis.witnesses[0].checking=false;}],
  ['file-check','all evasions omitted',r=>{assert(r.lineAnalysis.witnesses[0].replies.length);r.lineAnalysis.witnesses[0].replies=[];}],
  ['file-check','evasion result forged',r=>{r.lineAnalysis.witnesses[0].replies[0].terminal=true;}],
  ['rook-queen','actor-turn frame forged',r=>{r.lineAnalysis.witnesses[0].hypotheticalActorFen=r.lineAnalysis.witnesses[0].before;}],
  ['file-check','before inventory omitted',r=>{r.lineAnalysis.witnesses[0].beforePieces.pop();}],
  ['file-check','actor forged',r=>{r.lineAnalysis.witnesses[0].actor='b';}],
  ['file-check','history invented',r=>{r.lineAnalysis.witnesses[0].history={fen:r.before,moves:['a1a8']};}],
  ['file-check','target type forged',r=>{r.lineAnalysis.witnesses[0].target.type='q';}],
  ['file-check','entire event omitted',r=>{r.events.splice(r.events.findIndex(e=>e.evidence?.experiment==='E084'),1);}],
  ['file-check','event duplicated',r=>{r.events.push(structuredClone(own(r)[0]));}],
  ['file-check','events reordered',r=>{const a=r.events.findIndex(e=>e.evidence?.experiment==='E084');[r.events[a],r.events[a+1]]=[r.events[a+1],r.events[a]];}],
  ['file-check','event evidence forged',r=>{own(r)[0].evidence.checking=false;}],
  ['file-check','quality assertion forged',r=>{own(r)[0].qualityClaim=true;}],
  ['file-check','comment forged',r=>{r.comment='Winning alignment.';}],
  ['file-check','status forged',r=>{r.lineAnalysis.status='no-new-fact';}],
  ['file-check','nodes forged',r=>{r.lineAnalysis.nodes++;}],
  ['file-check','limit forged',r=>{r.lineAnalysis.limit--;}],
  ['file-check','inherited fields forged',r=>{r.san='forged';}]
 ];
 for(const [id,name,mutate]of mutations)test('complete-domain rejection: '+name,()=>{const i=get(id),r=explainMove(i),p=inherited(i);check(i,r,p);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(i,bad,p),/whole result differs/);});
 for(const id of ['file-check','rook-queen','diagonal-contact'])test('all integer budget boundaries: '+id,()=>{const i=get(id),full=explainMove(i),p=inherited(i);assert.equal(full.lineAnalysis.status,'proven');for(let maxLineNodes=0;maxLineNodes<=full.lineAnalysis.nodes;maxLineNodes++){const bounded={...i,maxLineNodes},r=explainMove(bounded);check(bounded,r,p);if(maxLineNodes<full.lineAnalysis.nodes){assert.equal(r.lineAnalysis.status,'exhausted');assert.deepEqual(r.lineAnalysis.witnesses,[]);assert.deepEqual(r.events,p.events);assert.equal(r.comment,p.comment);}else assert.equal(r.lineAnalysis.status,'proven');}});
 test('independent complete multi-slider target domain',()=>{const before=new Chess(multi.fen);assert.equal(before.isGameOver(),false);assert.equal(before.isCheck(),false);const old=before.moves({verbose:true}).map(m=>m.from+m.to);for(const code of ['e1e7','b5f1'])assert(!old.includes(code));before.move(multi.move);assert.equal(before.isGameOver(),false);const fields=before.fen().split(' ');fields[1]='w';fields[3]='-';const fresh=new Chess(fields.join(' ')).moves({verbose:true}).map(m=>m.from+m.to);for(const code of ['e1e7','b5f1'])assert(fresh.includes(code));const r=explainMove(multi);assert.equal(r.lineAnalysis.witnesses.length,2);check(multi,r);});
 test('complete explicit history domain',()=>{const fen='8/4q2k/8/1B6/8/8/1K2N3/4Rr2 b - - 0 1',c=new Chess(fen);c.move('h7h8');const i={...multi,fen:c.fen(),history:{fen,moves:['h7h8']}};const r=explainMove(i);assert.equal(r.lineAnalysis.witnesses.length,2);check(i,r);});
 test('default/disabled, malformed controls/history and terminal result',()=>{const i=get('file-check');for(const lineTags of [false,undefined])check({...i,lineTags});for(const lineTags of [null,0,'true',{},[]])assert.throws(()=>explainMove({...i,lineTags}),/boolean/);for(const maxLineNodes of [null,-1,50001,1.5,NaN,'2'])assert.throws(()=>explainMove({...i,maxLineNodes}),/integer/);assert.throws(()=>explainMove({...i,history:{fen:i.fen,moves:['a1a8']}}),/history/);const terminal={fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',move:'g6g7',lineTags:true,scanReplies:false};check(terminal);assert.equal(own(explainMove(terminal)).length,0);});
 test('checking every supplied witness cannot prove whole-list completeness',()=>{const i=get('file-check'),r=explainMove(i),bad=structuredClone(r);for(const w of r.lineAnalysis.witnesses)assert.equal(checkWitness(w),true);bad.lineAnalysis.witnesses=[];for(const w of bad.lineAnalysis.witnesses)checkWitness(w);assert.throws(()=>check(i,bad),/whole result differs/);});
}else{
 const {openE084Saved,checkE084Shape,checkE084Bytes}=await import('./e084-saved-report.mjs');
 const {checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs');
 const saved=await openE084Saved();assert.deepEqual(saved.receipt,replay.receipt);
 for(const [index,row]of saved.report.rows.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,passed:false};try{const i=input(row.fixture);audit.parentEvaluations++;const p=inherited(i);audit.savedReplayAttempts++;check(i,row.result,p);audit.passed=true;}finally{console.log('# E084-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['role',r=>r.source='real games'],['missing row',r=>r.rows.pop()],['duplicate row',r=>r.rows.push(structuredClone(r.rows[0]))],['row order',r=>{[r.rows[0],r.rows[1]]=[r.rows[1],r.rows[0]];}],['fixture',r=>r.rows[0].fixture.move='a1a8'],['source hash',r=>r.inputHashes[Object.keys(r.inputHashes)[0]]='0'.repeat(64)],['source omitted',r=>delete r.inputHashes[Object.keys(r.inputHashes)[0]]],['source inserted',r=>r.inputHashes.fake='0'.repeat(64)],['receipt',r=>r.eligibilityReceipt.registrySha256='0'.repeat(64)],['result missing',r=>delete r.rows[0].result],['error invented',r=>r.rows[0].error='invented']];
 for(const [name,mutate]of mutations)test('saved admission rejects '+name,()=>{assert.deepEqual(checkE084Shape(saved.report,saved.fixtures,saved.sourceHashes,saved.historicalReceipt),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE084Bytes(Buffer.from(JSON.stringify(bad))));assert.throws(()=>checkE084Shape(bad,saved.fixtures,saved.sourceHashes,saved.historicalReceipt));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
}
