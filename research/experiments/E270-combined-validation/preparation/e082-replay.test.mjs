import test from 'node:test';
import assert from 'node:assert/strict';
import {admitTerminalRegression} from './semantic-gate.mjs';
await admitTerminalRegression();
const phase=process.env.CHESS_E082_PHASE;assert.ok(['smoke','saved'].includes(phase));
const [{explainMove},{replayResult},{fixtures,reflect},{Chess}]=await Promise.all([import('../../E082-rook-ending-facts/code/endings.mjs'),import('../../E082-rook-ending-facts/code/replay.mjs'),import('../../E082-rook-ending-facts/code/fixtures.mjs'),import('../../../../lib/chess.js')]);
const ownIds=new Set(['side-check-proof','rook-four-three','rook-three-two']);
const get=id=>{const f=fixtures.find(f=>f.id===id);assert.ok(f,id);return f;};
const side=get('side-no-advanced-passer'),count=get('four-three-last-minor-capture'),negative=get('already-four-three'),combined=get('side-and-four-three'),reused=fixtures.find(f=>f.reusedSide),promotion=fixtures.find(f=>f.id.startsWith('four-promotion-interpositions'));
assert.ok(reused&&promotion);
if(phase==='smoke'){
 const selected=[side,count,get('three-two-last-minor-capture'),get('capturable-side-check'),negative,combined,promotion,reused,get('en-passant-count-transition-4-3'),get('disabled'),get('zero-budget'),fixtures.find(f=>f.expectedStatus==='not-live')];assert.equal(new Set(selected.map(f=>f.id)).size,12);
 for(const f of selected.flatMap(f=>[f,reflect(f)]))test('original representative whole result: '+f.id,()=>{const r=explainMove(f),checked=replayResult(f,r);assert.equal(checked.state,f.expectedStatus);for(const id of f.expected)assert.ok(r.events.some(e=>e.id===id));for(const id of f.absent||[])assert(!r.events.some(e=>e.id===id));if(f.id.startsWith('capturable-side-check'))assert(r.rookEndingAnalysis.witness.side.replies.some(r=>r.captured==='r'));if(f.id.startsWith('four-promotion-interpositions')){const replies=r.rookEndingAnalysis.witness.side.replies.filter(r=>r.promotion);assert.equal(replies.length,8);for(const captures of [false,true])assert.deepEqual(replies.filter(r=>!!r.captured===captures).map(r=>r.promotion).sort(),['b','n','q','r']);}if(f.reusedSide){assert(r.rookEndingAnalysis.witness.side.reuseIndex>=0);assert(!r.events.some(e=>e.id==='side-check-proof'));}});
 const mutations=[
  [side,'whole witness omitted',r=>r.rookEndingAnalysis.witness=null],
  [side,'mandatory side omitted',r=>r.rookEndingAnalysis.witness.side=null],
  [combined,'complete categories omitted',r=>r.rookEndingAnalysis.witness.categories=[]],
  [side,'all replies omitted',r=>r.rookEndingAnalysis.witness.side.replies=[]],
  [side,'reply duplicated',r=>r.rookEndingAnalysis.witness.side.replies.push(structuredClone(r.rookEndingAnalysis.witness.side.replies[0]))],
  [side,'replies reordered',r=>r.rookEndingAnalysis.witness.side.replies.reverse()],
  [count,'inventory omitted',r=>r.rookEndingAnalysis.witness.after.pieces.pop()],
  [count,'pawn count forged',r=>r.rookEndingAnalysis.witness.after.counts.w++],
  [count,'wing forged',r=>r.rookEndingAnalysis.witness.after.wing='none'],
  [side,'ray shortened',r=>r.rookEndingAnalysis.witness.side.cells.pop()],
  [side,'checker identity forged',r=>r.rookEndingAnalysis.witness.side.checker.square='a1'],
  [side,'history invented',r=>r.rookEndingAnalysis.witness.history={fen:side.fen,moves:['a1a8']}],
  [count,'played flags forged',r=>r.rookEndingAnalysis.witness.played.flags='fake'],
  [side,'legal moves omitted',r=>r.rookEndingAnalysis.witness.legalMoves.pop()],
  [reused,'parent reuse index forged',r=>r.rookEndingAnalysis.witness.side.reuseIndex=-1],
  [count,'spurious side category',r=>r.rookEndingAnalysis.witness.categories.push('side-check')],
  [side,'entire new event omitted',r=>r.events=r.events.filter(e=>!ownIds.has(e.id))],
  [combined,'new event order forged',r=>{const indexes=r.events.flatMap((e,i)=>ownIds.has(e.id)?[i]:[]);assert.equal(indexes.length,2);[r.events[indexes[0]],r.events[indexes[1]]]=[r.events[indexes[1]],r.events[indexes[0]]];}],
  [side,'event text forged',r=>r.events.find(e=>ownIds.has(e.id)).text='Winning rook maneuver.'],
  [side,'quality claim forged',r=>r.events.find(e=>ownIds.has(e.id)).qualityClaim=true],
  [side,'selected comment forged',r=>r.comment='Winning.'],
  [side,'status forged',r=>r.rookEndingAnalysis.status='no-new-fact'],
  [side,'node count forged',r=>r.rookEndingAnalysis.nodes++],
  [side,'limit forged',r=>r.rookEndingAnalysis.limit--],
  [side,'inherited field forged',r=>r.san='forged']
 ];
 for(const [f,name,mutate]of mutations)test('whole replay rejects '+name,()=>{const r=explainMove(f);replayResult(f,r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>replayResult(f,bad));});
 for(const f of [side,count,negative])test('every integer budget boundary: '+f.id,()=>{const full=explainMove(f);for(let maxRookEndingNodes=0;maxRookEndingNodes<=full.rookEndingAnalysis.nodes;maxRookEndingNodes++){const i={...f,maxRookEndingNodes},r=explainMove(i);replayResult(i,r);if(maxRookEndingNodes<full.rookEndingAnalysis.nodes){assert.equal(r.rookEndingAnalysis.status,'exhausted');assert.equal(r.rookEndingAnalysis.witness,null);assert(!r.events.some(e=>ownIds.has(e.id)));}else assert.equal(r.rookEndingAnalysis.status,full.rookEndingAnalysis.status);}});
 test('default disabled and strict malformed controls',()=>{for(const rookEndingTags of [false,undefined]){const f={...side,rookEndingTags,maxRookEndingNodes:'ignored'};assert.equal(replayResult(f,explainMove(f)).state,'disabled');}for(const rookEndingTags of [null,0,'true',{},[]])assert.throws(()=>explainMove({...side,rookEndingTags}),/boolean/);for(const maxRookEndingNodes of [null,-1,50001,1.5,NaN,'2'])assert.throws(()=>explainMove({...side,maxRookEndingNodes}),/integer/);assert.throws(()=>explainMove({...side,history:{fen:side.fen,moves:['a1a8']}}),/history/);});
 test('history and ignored metadata preserve actual repetition terminal',()=>{const fen=new Chess().fen(),moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1'],c=new Chess(fen);for(const m of moves)c.move(m);const f={fen:c.fen(),history:{fen,moves,callerMetadata:'ignored'},move:'f6g8',rookEndingTags:true,scanReplies:false},r=explainMove(f);assert.equal(replayResult(f,r).state,'not-live');assert.equal(r.rookEndingAnalysis.witness,null);assert(!new Chess(r.after).isGameOver());});
 test('foundation-rejected legal board inherits zero new work',()=>{const f={...side,move:'g1g4',foundationTags:true},r=explainMove(f);assert.equal(replayResult(f,r).state,'not-applicable');assert.equal(r.rookEndingAnalysis.nodes,0);assert.equal(r.rookEndingAnalysis.witness,null);});
}else{
 const {openE082Saved,checkE082Shape,checkE082Bytes}=await import('./e082-saved-report.mjs'),{checkE083GameReceiptShape}=await import('./e083-policy-epoch.mjs');const saved=await openE082Saved();
 for(const [index,row]of saved.report.results.entries())test('saved whole row '+index+': '+row.fixture.id,()=>{const audit={index,id:row.fixture.id,parentEvaluations:0,savedReplayAttempts:0,candidateErrorEvaluations:0,savedErrorComparisons:0,passed:false};try{
  if(row.error){audit.candidateErrorEvaluations++;let failure;try{explainMove(row.fixture);}catch(e){failure=e;}assert.ok(failure);audit.savedErrorComparisons++;assert.equal(failure.message,row.error);assert.ok(failure.message.includes(row.fixture.inputError));}
  else {audit.savedReplayAttempts++;audit.parentEvaluations++;const checked=replayResult(row.fixture,row.result);const at=saved.report.rookEndingReplays.find(r=>r.fixture===row.fixture.id);assert.deepEqual({fixture:row.fixture.id,...checked},at);assert.equal(checked.state,row.fixture.expectedStatus);for(const id of row.fixture.expected||[])assert(row.result.events.some(e=>e.id===id));for(const id of row.fixture.absent||[])assert(!row.result.events.some(e=>e.id===id));}
  audit.passed=true;
 }finally{console.log('# E082-row-audit '+JSON.stringify(audit));}});
 const mutations=[['schema',r=>r.schema='bad'],['source',r=>r.source='real games'],['missing row',r=>r.results.pop()],['duplicate row',r=>r.results.push(structuredClone(r.results[0]))],['row order',r=>{[r.results[0],r.results[1]]=[r.results[1],r.results[0]];}],['fixture',r=>r.results[0].fixture.move='a1a8'],['result missing',r=>delete r.results[0].result],['error inserted',r=>r.results[0].error='invented'],['baseline missing',r=>r.baselineResults.pop()],['baseline fingerprint',r=>r.baselineResults[0].fullResultHash='0'.repeat(64)],['original result count',r=>r.newFixtureCases=1],['replay order',r=>r.rookEndingReplays.reverse()]];
 for(const [name,mutate]of mutations)test('saved shape rejects '+name,()=>{assert.deepEqual(checkE082Shape(saved.report,saved.fixtures,saved.manifest,saved.inherited),saved.summary);const bad=structuredClone(saved.report);mutate(bad);assert.throws(()=>checkE082Shape(bad,saved.fixtures,saved.manifest,saved.inherited));});
 for(const [name,mutate]of [['old policy',(a,b)=>a.policySha256='0'.repeat(64)],['missing old policy',(a,b)=>delete a.policySha256],['validator',(a,b)=>a.validatorSha256='0'.repeat(64)],['current policy',(a,b)=>b.policySha256='0'.repeat(64)]])test('receipt epoch rejects '+name,()=>{assert.equal(checkE083GameReceiptShape(saved.historicalReceipt,saved.receipt),true);const a=structuredClone(saved.historicalReceipt),b=structuredClone(saved.receipt);mutate(a,b);assert.throws(()=>checkE083GameReceiptShape(a,b));});
 for(const [name,change]of [['bytes',b=>b.subarray(1)],['content',b=>{const c=Buffer.from(b);c[0]^=1;return c;}],['append',b=>Buffer.concat([b,Buffer.from(' ')])],['namespace',b=>b]])test('raw artifact rejects '+name,async()=>{const {readFile}=await import('node:fs/promises'),spec=saved.canonical.find(x=>x.file.endsWith('/results.json')),raw=await readFile(spec.file);assert.equal(checkE082Bytes(spec.file,raw),true);assert.throws(()=>checkE082Bytes(name==='namespace'?'research/fake/results.json':spec.file,change(raw)));});
}
