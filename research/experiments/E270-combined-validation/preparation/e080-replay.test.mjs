import test from 'node:test';
import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';
await admitTerminalRegression();
const phase=process.env.CHESS_E080_PHASE;assert.ok(['smoke','saved'].includes(phase));
const [{explainMove},{replayResult},{fixtures,reflect},{Chess},{replayQuery}]=await Promise.all([import('../../E080-pawn-shield-defense/code/shield.mjs'),import('../../E080-pawn-shield-defense/code/replay.mjs'),import('../../E080-pawn-shield-defense/code/fixtures.mjs'),import('../../../../lib/chess.js'),import('../../E029-forced-mates/code/replay.mjs')]);
const get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;},queen=get('queen-file-cover'),rook=get('rook-file-cover'),negative=get('pinned-slider-no-mate');
const own=r=>r.events.filter(e=>e.id==='pawn-shield-defense');
if(phase==='smoke'){
 const homes={w:new Set(),b:new Set()},families=new Set(),states={};let errors=0;
 for(const f of fixtures.flatMap(f=>[f,reflect(f)]))test('original whole result: '+f.id,()=>{if(f.inputError){assert.throws(()=>explainMove(f),new RegExp(f.expectedError));errors++;return;}const r=explainMove(f),checked=replayResult(f,r);assert.equal(checked.state,f.expectedStatus);states[checked.state]=(states[checked.state]||0)+1;if(f.parentSelectedId)assert.equal(r.events.find(e=>e.text===r.comment)?.id,f.parentSelectedId);const w=r.pawnShieldAnalysis?.witness;if(w){homes[w.actor].add(w.before.king[0]);families.add(w.blockedCapture.piece);const e=own(r)[0];assert.equal(e.qualityClaim,false);assert.equal(e.text,`Pawn shield: ${w.played.to} blocks ${w.enemy==='b'?'...':''}${w.blockedCapture.san}, with no immediate mate remaining.`);assert.equal(r.pawnShieldAnalysis.afterProof.tree.kind,'all-fail');}});
 const mutations=[
  [queen,'mandatory before proof omitted',r=>r.pawnShieldAnalysis.beforeProof=null],
  [queen,'mandatory after proof omitted',r=>r.pawnShieldAnalysis.afterProof=null],
  [queen,'whole witness omitted',r=>r.pawnShieldAnalysis.witness=null],
  [queen,'proof witness and event omission laundered as negative',r=>{r.pawnShieldAnalysis.beforeProof=null;r.pawnShieldAnalysis.afterProof=null;r.pawnShieldAnalysis.witness=null;r.pawnShieldAnalysis.status='no-new-fact';r.events=r.events.filter(e=>e.id!=='pawn-shield-defense');}],
  [negative,'negative mandatory prior proof omitted',r=>{assert.ok(r.pawnShieldAnalysis.beforeProof);assert.equal(r.pawnShieldAnalysis.beforeProof.tree.win,false);r.pawnShieldAnalysis.beforeProof=null;}],
  [queen,'all after replies omitted',r=>r.pawnShieldAnalysis.afterProof.tree.branches=[]],
  [queen,'one after reply omitted',r=>r.pawnShieldAnalysis.afterProof.tree.branches.pop()],
  [queen,'after reply duplicated',r=>r.pawnShieldAnalysis.afterProof.tree.branches.push(structuredClone(r.pawnShieldAnalysis.afterProof.tree.branches[0]))],
  [queen,'after replies reordered',r=>r.pawnShieldAnalysis.afterProof.tree.branches.reverse()],
  [queen,'after leaf kind forged',r=>r.pawnShieldAnalysis.afterProof.tree.branches[0].child.kind='mate'],
  [queen,'after leaf win forged',r=>r.pawnShieldAnalysis.afterProof.tree.branches[0].child.win=true],
  [queen,'after leaf board forged',r=>r.pawnShieldAnalysis.afterProof.tree.branches[0].child.fen=queen.fen],
  [queen,'before mate edge forged',r=>r.pawnShieldAnalysis.beforeProof.tree.move='a1a8'],
  [queen,'before mate truth forged',r=>r.pawnShieldAnalysis.beforeProof.tree.win=false],
  [queen,'proof winner forged',r=>r.pawnShieldAnalysis.afterProof.winner='w'],
  [queen,'proof depth forged',r=>r.pawnShieldAnalysis.afterProof.plies=2],
  [queen,'before cover omitted',r=>r.pawnShieldAnalysis.witness.before.cover=[]],
  [queen,'after cover omitted',r=>r.pawnShieldAnalysis.witness.after.cover=[]],
  [queen,'causal ray omitted',r=>r.pawnShieldAnalysis.witness.blockedCapture.cells=[]],
  [queen,'causal blocker omitted',r=>r.pawnShieldAnalysis.witness.blockedCapture.afterBlockers=[]],
  [queen,'blocked victim forged',r=>r.pawnShieldAnalysis.witness.blockedCapture.captured='q'],
  [queen,'king identity forged',r=>r.pawnShieldAnalysis.witness.before.king='a1'],
  [queen,'before inventory omitted',r=>r.pawnShieldAnalysis.witness.before.pieces.pop()],
  [queen,'after inventory color forged',r=>{const p=r.pawnShieldAnalysis.witness.after.pieces.find(p=>p.color==='w');p.color='b';}],
  [queen,'history invented',r=>r.pawnShieldAnalysis.witness.history={fen:queen.fen,moves:['a1a8']}],
  [queen,'played flags forged',r=>r.pawnShieldAnalysis.witness.played.flags='fake'],
  [queen,'root legal set omitted',r=>r.pawnShieldAnalysis.witness.legalMoves=[]],
  [queen,'hypothetical board forged',r=>r.pawnShieldAnalysis.witness.hypotheticalOpponentFen=queen.fen],
  [queen,'new event omitted',r=>r.events=r.events.filter(e=>e.id!=='pawn-shield-defense')],
  [queen,'new event duplicated',r=>r.events.push(structuredClone(own(r)[0]))],
  [queen,'quality claim forged',r=>own(r)[0].qualityClaim=true],
  [queen,'text forged',r=>own(r)[0].text='Safe king forever.'],
  [queen,'comment forged',r=>r.comment='Winning.'],
  [queen,'status forged',r=>r.pawnShieldAnalysis.status='no-new-fact'],
  [queen,'node count forged',r=>r.pawnShieldAnalysis.nodes++],
  [queen,'limit forged',r=>r.pawnShieldAnalysis.limit--],
  [queen,'inherited field forged',r=>r.san='forged']
 ];
 for(const [f,name,mutate]of mutations)test('complete proof replay rejects '+name,()=>{const r=explainMove(f);replayResult(f,r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>replayResult(f,bad));});
 for(const f of [queen,rook,negative])test('every integer budget boundary: '+f.id,()=>{const full=explainMove(f);for(let maxPawnShieldNodes=0;maxPawnShieldNodes<=full.pawnShieldAnalysis.nodes;maxPawnShieldNodes++){const i={...f,maxPawnShieldNodes},r=explainMove(i);replayResult(i,r);if(maxPawnShieldNodes<full.pawnShieldAnalysis.nodes){assert.equal(r.pawnShieldAnalysis.status,'exhausted');for(const key of ['beforeProof','afterProof','witness'])assert.equal(r.pawnShieldAnalysis[key],null);assert.equal(own(r).length,0);}else assert.equal(r.pawnShieldAnalysis.status,full.pawnShieldAnalysis.status);}});
 test('default disabled and extra strict malformed controls',()=>{for(const pawnShieldTags of [false,undefined]){const f={...queen,pawnShieldTags,maxPawnShieldNodes:'ignored'};assert.equal(replayResult(f,explainMove(f)).state,'disabled');}for(const pawnShieldTags of [null,0,'true',{},[]])assert.throws(()=>explainMove({...queen,pawnShieldTags}),/boolean/);for(const maxPawnShieldNodes of [null,-1,50001,1.5,NaN,'2'])assert.throws(()=>explainMove({...queen,maxPawnShieldNodes}),/integer/);});
 test('history metadata normalizes and actual repetition is terminal',()=>{const original=get('valid-history'),metadata={...original,history:{...original.history,callerMetadata:'ignored'}},positive=explainMove(metadata);assert.equal(replayResult(metadata,positive).state,'proven');assert.deepEqual(positive.pawnShieldAnalysis.witness.history,original.history);const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const f={fen:c.fen(),history:{fen,moves},move:'f6g8',pawnShieldTags:true,scanReplies:false},r=explainMove(f);assert.equal(replayResult(f,r).state,'not-live');assert.equal(r.pawnShieldAnalysis.witness,null);assert(!new Chess(r.after).isGameOver());});
 test('independent tree verifier requires all negative legal replies',()=>{const r=explainMove(queen),p=r.pawnShieldAnalysis.afterProof,c=new Chess(p.rootFen);assert.equal(p.tree.branches.length,c.moves().length);assert.equal(replayQuery(c,p).win,false);const bad=structuredClone(p);bad.tree.branches.pop();assert.throws(()=>replayQuery(new Chess(p.rootFen),bad));});
 test('original home-file slider family and state coverage preserved',()=>{for(const actor of ['w','b'])assert.deepEqual([...homes[actor]].sort(),['c','e','g']);assert.deepEqual([...families].sort(),['q','r']);assert.equal(errors,38);assert.deepEqual(states,{proven:16,'no-new-fact':40,disabled:2,exhausted:4,'not-applicable':12,'not-live':10});});
}else{
 const {openE080Saved,checkE080Shape,checkE080Bytes}=await import('./e080-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs');const saved=await openE080Saved();console.log('# E080-admission-audit '+JSON.stringify(saved.admissionAudit));
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,passed:false};try{
  if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);assert.ok(failure.message.includes(row.fixture.expectedError));}
  else {audit.savedReplayAttempts++;audit.parentEvaluations++;const checked=replayResult(row.fixture,row.result);const at=saved.report.pawnShieldReplays.find(r=>r.fixture===row.fixture.id);assert.deepEqual({fixture:row.fixture.id,...checked},at);assert.equal(checked.state,row.fixture.expectedStatus);if(row.fixture.parentSelectedId)assert.equal(row.result.events.find(e=>e.text===row.result.comment)?.id,row.fixture.parentSelectedId);}
  audit.passed=true;
 }finally{console.log('# E080-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['original result count',r=>r.newFixtureCases=1],['replay order',r=>r.pawnShieldReplays.reverse()],['reply count',r=>r.pawnShieldReplays[0].replies++],['leaf count',r=>r.pawnShieldReplays[0].leaves++]];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE080Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE080Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE080Bytes(spec.file,raw),true);assert.throws(()=>checkE080Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
