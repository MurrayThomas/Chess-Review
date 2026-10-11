import test from 'node:test';
import assert from 'node:assert/strict';
import {saved} from './saved.mjs';
import {inspectExchangeQuestions as inspect} from './questions.mjs';
import {checkResult} from './check-result.mjs';
import {extraMinor} from '../../E190-liquidation-commitment/code/fixtures.mjs';
const a=await saved(),ids=r=>r.answers.filter(q=>q.available).map(q=>q.id);
for(const f of a.rows)test('independent exchange question '+f.id,()=>{
  const r=inspect(f.input,f.options,f.panel);checkResult(f.input,f.options,f.panel,r);
  const expected=f.role==='winning-liquidation'||f.role==='genuine-prefix'?['C1068','C1073','C1078']:f.role==='quiet-king-alternative'?['C1068','C1073']:[];
  assert.deepEqual(ids(r),expected);
  if(f.role==='visited-alternative-fifty'){assert.equal(r.status,'claim-rule-prerequisite');assert.equal(r.witness,null);}
  else {assert.equal(r.witness.frame,f.panel.variants[0].state.fen);for(const q of r.answers.filter(q=>q.available)){assert.equal(q.side,f.panel.actor);assert.equal(q.relation,q.side===f.options.player?'own':'opponent');}}
});
test('capture-profit removal is independent of conversion/initiative',()=>{
  const f=a.rows.find(f=>f.role==='quiet-king-alternative'&&f.options.player==='w'),r=inspect(f.input,f.options,f.panel);assert.deepEqual(ids(r),['C1068','C1073']);assert.deepEqual(r.witness.counterplay.alternativeProfitable,[]);assert.equal(r.witness.benefit.alternativeMate,false);assert.ok(!Object.hasOwn(r.witness.benefit,'alternativeLosing'));assert.ok(!Object.hasOwn(r.witness.benefit,'globalWinner'));
  const p=a.rows[0],z=inspect(p.input,p.options,p.panel);assert.deepEqual(z.witness.counterplay.actualProfitable,[]);assert.equal(z.witness.counterplay.alternativeProfitable[0].minimumGain,9);
});
test('positive initiative covers all checked defenses and checking actor choices',()=>{
  const f=a.rows[0],r=inspect(f.input,f.options,f.panel),w=r.witness.initiative;assert.equal(w.live,true);assert.equal(w.checked,true);assert.equal(w.checkingPolicy,true);assert.deepEqual(w.steps.filter(s=>s.role==='defender').map(s=>s.move),f.panel.variants[0].replies.map(r=>r.played.move));assert.ok(w.steps.filter(s=>s.role==='actor').every(s=>s.checkAfter));
  const terminal=a.rows.find(f=>f.role==='immediate-mate-not-liquidation'),z=inspect(terminal.input,terminal.options,terminal.panel);assert.equal(z.witness.initiative.live,false);assert.equal(z.answers.find(q=>q.id==='C1073').available,false);
});
test('genuine history/current after frame and opposite perspectives are preserved',()=>{
  const f=a.rows.find(f=>f.role==='genuine-prefix'),r=inspect(f.input,f.options,f.panel);assert.equal(f.input.history.moves.length,2);assert.equal(r.answers[0].frame,f.panel.variants[0].state.fen);assert.notEqual(r.answers[0].frame,f.input.fen);
  const other={...f.options,player:f.options.player==='w'?'b':'w'},s=inspect(f.input,other,f.panel);assert.deepEqual(r.source,s.source);assert.deepEqual(ids(r),ids(s));assert.ok(r.answers.every((q,i)=>!q.available||q.side===s.answers[i].side&&q.relation!==s.answers[i].relation));checkResult(f.input,other,f.panel,s);
});
test('disabled/missing/history/alternative/material/panel prerequisites do not fabricate answers',()=>{
  const f=a.rows[0];for(const [input,options,panel,status]of [[{fen:'invalid'}, {},undefined,'disabled'],[{...f.input,history:undefined},f.options,f.panel,'history-prerequisite'],[{...f.input,alternative:undefined},f.options,f.panel,'alternative-prerequisite'],[extraMinor,f.options,undefined,'material-prerequisite'],[f.input,f.options,undefined,'panel-prerequisite']]){const r=inspect(input,options,panel);assert.equal(r.status,status);assert.deepEqual(ids(r),[]);assert.equal(r.witness,null);checkResult(input,options,panel,r);}
});
test('strict player/IDs/plain controls and genuine legal source inputs',()=>{
  const f=a.rows[0];for(const o of [{enabled:true},{enabled:1,player:'w'},{enabled:true,player:null},{enabled:true,player:'x'},{enabled:true,player:'w',ids:[]},{enabled:true,player:'w',ids:['C1068','C1068']},{enabled:true,player:'w',ids:['C1069']},{enabled:true,player:'w',maxNodes:-1},{enabled:true,player:'w',maxNodes:50001},{enabled:true,player:'w',plies:2}])assert.throws(()=>inspect(f.input,o,f.panel));
  assert.throws(()=>inspect({...f.input,move:'bad'},f.options,f.panel));assert.throws(()=>inspect({...f.input,alternative:f.input.move},f.options,f.panel));const input=structuredClone(f.input);input.history.moves.push(input.move);assert.throws(()=>inspect(input,f.options,f.panel));
  const p=structuredClone(f.panel);let called=false;Object.defineProperty(p,'nodes',{enumerable:true,get(){called=true;return f.panel.nodes;}});assert.throws(()=>inspect(f.input,f.options,p));assert.equal(called,false);
});
test('exact/short/zero atomic budgets discard source and all answers',()=>{
  const f=a.rows[0],r=inspect(f.input,f.options,f.panel);for(const maxNodes of [r.nodes,r.nodes-1,0]){const options={...f.options,maxNodes},s=inspect(f.input,options,f.panel);assert.equal(s.status,maxNodes===r.nodes?'proven':'exhausted');checkResult(f.input,options,f.panel,s);if(maxNodes<r.nodes){assert.equal(s.source,null);assert.equal(s.witness,null);assert.deepEqual(ids(s),[]);}}
  const options={...f.options,ids:['C1073']},s=inspect(f.input,options,f.panel);assert.deepEqual(ids(s),['C1073']);checkResult(f.input,options,f.panel,s);
});
test('own answer/policy/capture-profit/frame/accounting and inherited source mutations reject',()=>{
  const f=a.rows[0],r=inspect(f.input,f.options,f.panel);checkResult(f.input,f.options,f.panel,r);
  for(const edit of [r=>r.nodes--,r=>r.answers[0].side='b',r=>r.answers[0].available=false,r=>r.answers[0].relation='opponent',r=>r.answers[0].frame=f.input.fen,r=>r.witness.initiative.steps.pop(),r=>r.witness.initiative.checkingPolicy=false,r=>r.witness.counterplay.alternativeProfitable[0].minimumGain=0,r=>r.witness.benefit.alternativeMate=true,r=>r.source.nodes--,r=>r.source.claims.C0808=false,r=>r.witness.derivation.panel.nodes--]){const s=structuredClone(r);edit(s);assert.throws(()=>checkResult(f.input,f.options,f.panel,s));}
  for(const edit of [p=>p.nodes--,p=>p.variants[0].replies.pop(),p=>p.variants[0].query.tree.win=false,p=>p.variants[0].query.tree.branches.pop()]){const p=structuredClone(f.panel);edit(p);assert.throws(()=>inspect(f.input,f.options,p));assert.throws(()=>checkResult(f.input,f.options,p,r));}
});
test('returned derivation/source cannot mutate caller proof or later answers',()=>{const f=a.rows[0],r=inspect(f.input,f.options,f.panel);r.witness.derivation.panel.variants[0].replies.pop();r.source.panel.variants.pop();r.witness.initiative.steps.length=0;checkResult(f.input,f.options,f.panel,inspect(f.input,f.options,f.panel));});
