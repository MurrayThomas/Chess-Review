import test from 'node:test';
import assert from 'node:assert/strict';
import {saved} from './saved.mjs';
import {inspectPieceQuestions as inspect} from './questions.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();
for(const f of a.rows)test('complete objective profile '+f.id,()=>{
  const r=inspect(f.current,f.options,f.source);checkResult(f.current,f.options,f.source,r);
  if(f.role==='claim'){assert.equal(r.status,'claim-rule-prerequisite');assert.ok(r.answers.every(a=>!a.available));return;}
  assert.equal(r.witness.profiles.length,f.role==='both-cover'?3:2);assert.equal(r.witness.frame.unitColor,f.source.panel.actor);assert.notEqual(r.witness.frame.actorToMove,f.source.panel.actor);
  if(f.role==='defender'){assert.equal(r.status,'compared');assert.equal(r.witness.ranking.separates,false);assert.ok(r.answers.every(a=>!a.available));}
  else {assert.equal(r.status,'proven');const own=f.options.player===f.source.panel.actor;assert.equal(r.answers.find(a=>a.id==='C1064').available,own);assert.equal(r.answers.find(a=>a.id==='C1065').available,!own);assert.equal(r.answers.find(a=>a.id==='C1063').available,true);}
});
test('unselected third unit participates; all successful ties retained',()=>{
  for(const actor of ['w','b']){const f=a.rows.find(f=>f.role==='both-cover'&&f.source.panel.actor===actor&&f.options.player!==actor),r=inspect(f.current,f.options,f.source),rank=r.witness.ranking,best=r.answers.find(a=>a.id==='C1065');assert.equal(rank.covering.length,2);assert.equal(rank.failing.length,1);assert.equal(best.units.length,2);assert.ok(r.witness.profiles.some(u=>u.square===(actor==='w'?'e1':'e8')&&!u.covers));assert.deepEqual(best.units.map(u=>u.id),rank.covering);}
});
test('original moved/captured IDs and target remain genuine at current-after frame',()=>{
  const f=a.rows.find(f=>f.role==='base'&&f.source.panel.actor==='w'),r=inspect(f.current,f.options,f.source);assert.equal(r.witness.profiles.find(u=>u.square==='c4').id,'wbf1');assert.equal(r.witness.objective.target.id,'bpf7');assert.equal(r.witness.identity.answer.after.units.find(u=>u.id==='wra1').alive,false);assert.ok(!r.witness.profiles.some(u=>u.type==='r'));assert.equal(r.witness.identity.answer.history.moves.length,3);
});
test('failed attempts/counters and zero-success units are retained',()=>{
  const f=a.rows.find(f=>f.role==='defender'&&f.source.panel.actor==='w'),r=inspect(f.current,f.options,f.source);assert.ok(r.witness.profiles.every(u=>u.refutations.length>0));assert.ok(r.witness.profiles.some(u=>u.branches.every(b=>b.successes.length===0)));assert.ok(r.witness.source.panel.variants[0].branches.some(b=>b.attempts.some(a=>a.counters.some(c=>c.state.balance-f.source.panel.baseline<1))));
});
test('strict IDs/perspective/history/current source binding and plain-data controls',()=>{
  const f=a.rows[0];for(const o of [{enabled:true},{enabled:1,player:'w'},{enabled:true,player:'x'},{enabled:true,player:'w',ids:[]},{enabled:true,player:'w',ids:['C1063','C1063']},{enabled:true,player:'w',ids:['C1066']},{enabled:true,player:'w',maxNodes:-1},{enabled:true,player:'w',maxNodes:50001},{enabled:true,player:'w',extra:1}])assert.throws(()=>inspect(f.current,o,f.source));
  assert.throws(()=>inspect({...f.current,fen:f.source.input.fen},f.options,f.source));const wrong=structuredClone(f.current);wrong.history.moves.pop();assert.throws(()=>inspect(wrong,f.options,f.source),/exact source/);
  const get=structuredClone(f.source);let called=false;Object.defineProperty(get.panel,'nodes',{enumerable:true,get(){called=true;return f.source.panel.nodes;}});assert.throws(()=>inspect(f.current,f.options,get));assert.equal(called,false);
});
test('disabled/missing history/record/source stay unavailable without invented labels',()=>{
  const f=a.rows[0];for(const [i,o,s,status]of [[{fen:'invalid'}, {},undefined,'disabled'],[{fen:f.current.fen},f.options,f.source,'history-prerequisite'],[{fen:f.source.input.history.fen,history:{fen:f.source.input.history.fen,moves:[]}},f.options,f.source,'recorded-move-prerequisite'],[f.current,f.options,undefined,'source-prerequisite']]){const r=inspect(i,o,s);assert.equal(r.status,status);assert.equal(r.witness,null);assert.ok(r.answers.every(a=>!a.available));checkResult(i,o,s,r);}
});
test('exact/short/zero atomic ledger and ID subset routing',()=>{
  const f=a.rows[0],r=inspect(f.current,f.options,f.source);
  for(const maxNodes of [r.nodes,r.nodes-1,0]){const o={...f.options,maxNodes},s=inspect(f.current,o,f.source);assert.equal(s.status,maxNodes===r.nodes?'proven':'exhausted');checkResult(f.current,o,f.source,s);if(maxNodes<r.nodes){assert.equal(s.witness,null);assert.ok(s.answers.every(a=>!a.available));}}
  const o={...f.options,ids:['C1063']},s=inspect(f.current,o,f.source);assert.equal(s.answers.length,1);checkResult(f.current,o,f.source,s);
});
test('own profile/ranking/identity/target/perspective/accounting mutation rejects',()=>{
  const f=a.rows[0],r=inspect(f.current,f.options,f.source);checkResult(f.current,f.options,f.source,r);
  for(const edit of [r=>r.nodes--,r=>r.answers[0].units.pop(),r=>r.answers[0].available=false,r=>r.witness.profiles.pop(),r=>r.witness.profiles[0].covers=!r.witness.profiles[0].covers,r=>r.witness.ranking.covering.pop(),r=>r.witness.objective.target.id='fake',r=>r.witness.frame.player='b',r=>r.witness.identity.answer.last.unit='fake',r=>r.witness.source.panel.nodes--]){const s=structuredClone(r);edit(s);assert.throws(()=>checkResult(f.current,f.options,f.source,s));}
});
test('source omissions/counter tampering miss independent exact caches',()=>{
  const f=a.rows[0],r=inspect(f.current,f.options,f.source);
  for(const edit of [s=>s.panel.nodes--,s=>s.panel.variants[0].branches.pop(),s=>s.panel.units.pop(),s=>s.panel.claimContexts.push('fake'),s=>s.panel.variants[0].branches[0].attempts.pop()]){const s=structuredClone(f.source);edit(s);assert.throws(()=>inspect(f.current,f.options,s));assert.throws(()=>checkResult(f.current,f.options,s,r));}
});
test('caller source/output mutations cannot change later answers',()=>{const f=a.rows[0],r=inspect(f.current,f.options,f.source);r.witness.source.panel.variants[0].branches.pop();r.witness.profiles.length=0;checkResult(f.current,f.options,f.source,inspect(f.current,f.options,f.source));});
