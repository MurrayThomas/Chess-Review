import test from 'node:test';
import assert from 'node:assert/strict';
import {saved} from './saved.mjs';
import {inspectChecksCapturesThreats as inspect} from './question.mjs';
import {checkResult} from './check-result.mjs';
import {history,cases} from '../../E200-recorded-move-changes/code/fixtures.mjs';
const a=await saved();
for(const f of a.rows)test('saved complete source and independent answer '+f.id,()=>{
  const r=inspect(f.input,f.options,f.panel);assert.equal(r.status,'answered');checkResult(f.input,f.options,f.panel,r);
  assert.equal(r.answer.moves.length,f.role==='claim'?r.answer.moves.length:f.panel.rows.length);
  const t=r.answer.threats;
  if(f.role==='quiet'){const q=t.resources.find(q=>q.move===f.nominated);assert.equal(q.kind,'quiet-mating-threat');assert.ok(!r.answer.checks.includes(q.move));assert.ok(!r.answer.captures.includes(q.move));}
  if(f.role==='checking')assert.ok(t.resources.some(q=>q.kind==='checking-mating-continuation'));
  if(f.role==='empty'){assert.equal(t.status,'bounded-domain-answered');assert.deepEqual(t.resources,[]);assert.equal(t.generalThreatCompleteness,false);assert.equal(t.notCertifiedGeneralThreats.length,r.answer.moves.length);}
  if(f.role==='claim'){assert.equal(t.status,'claim-rule-prerequisite');assert.deepEqual(t.resources,[]);assert.deepEqual(t.candidateOutcomes,[]);}
});
test('same frozen root separates H1 immediate mate from H2 continuation',()=>{
  for(const color of ['w','b']){const long=a.rows.find(f=>f.id==='checking-H2-'+color),short=a.rows.find(f=>f.id==='winning-choice-'+(color==='w'?0:1)),l=inspect(long.input,long.options,long.panel),s=inspect(short.input,short.options,short.panel);assert.equal(l.answer.fen,s.answer.fen);assert.deepEqual(l.answer.checks,s.answer.checks);assert.ok(l.answer.threats.resources.length>s.answer.threats.resources.length);assert.ok(s.answer.threats.resources.every(q=>q.kind==='immediate-mate'));}
});
test('current-side complete en passant and promotion options without tactical panel',()=>{
  const ep=cases.find(c=>c.id==='ep').input.history,i=history(ep.fen,ep.moves.slice(0,-1)),r=inspect(i,{enabled:true});assert.ok(r.answer.captures.includes('e5d6'));assert.equal(r.answer.moves.find(m=>m.move==='e5d6').enPassant,true);checkResult(i,{enabled:true},undefined,r);
  const f=cases.find(c=>c.id==='capture-promotion').input.history.fen,p={fen:f,history:{fen:f,moves:[]}},s=inspect(p,{enabled:true});assert.deepEqual(s.answer.captures.filter(m=>m.startsWith('a7b8')),['a7b8b','a7b8n','a7b8q','a7b8r']);checkResult(p,{enabled:true},undefined,s);
});
test('missing history/panel preserve static answer; optional proposed move irrelevant',()=>{
  const f=a.rows[0];for(const [input,p,status]of [[{fen:f.input.fen,move:'invalid'},f.panel,'history-prerequisite'],[{...f.input,move:'invalid'},undefined,'panel-prerequisite']]){const r=inspect(input,f.options,p);assert.equal(r.answer.threats.status,status);assert.deepEqual(r.answer.checks,inspect(f.input,f.options,f.panel).answer.checks);checkResult(input,f.options,p,r);}
});
test('disabled/not-live and strict input contracts',()=>{
  const f=a.rows[0],r=inspect({fen:'invalid'},{});assert.equal(r.status,'disabled');checkResult({fen:'invalid'},{},undefined,r);
  const m=cases.find(c=>c.id==='mate').input,z=inspect(m,{enabled:true});assert.equal(z.status,'not-live');assert.equal(z.answer,null);checkResult(m,{enabled:true},undefined,z);
  for(const o of [{enabled:null},{enabled:1},{plies:-1},{plies:3},{plies:0.5},{maxNodes:-1},{maxNodes:50001},{maxNodes:NaN},{extra:1}])assert.throws(()=>inspect(f.input,{...f.options,...o},f.panel));
  assert.throws(()=>inspect({...f.input,history:null},f.options,f.panel));assert.throws(()=>inspect({...f.input,history:{fen:f.input.fen,moves:['a1a1']}},f.options,f.panel));
  let called=false;assert.throws(()=>inspect({get fen(){called=true;return f.input.fen;}},f.options,f.panel));assert.equal(called,false);
});
test('exact/short/zero budgets withhold every partial answer on exhaustion',()=>{
  const f=a.rows.find(r=>r.id==='quiet-H2-w'),r=inspect(f.input,f.options,f.panel);
  for(const limit of [r.nodes,r.nodes-1,0]){const o={...f.options,maxNodes:limit},s=inspect(f.input,o,f.panel);assert.equal(s.status,limit===r.nodes?'answered':'exhausted');checkResult(f.input,o,f.panel,s);if(limit<r.nodes){assert.equal(s.answer,null);assert.equal(s.panel,null);}}
});
test('unresolved source choices never become certified no-threat or safety answers',()=>{
  const f=a.rows[0],r=inspect(f.input,f.options,f.panel),t=r.answer.threats,all=[...t.resources.map(q=>q.move),...t.notCertifiedGeneralThreats].sort();assert.deepEqual(all,r.answer.moves.map(q=>q.move));assert.equal(t.generalThreatCompleteness,false);assert.ok(t.candidateOutcomes.some(q=>q.role==='opponent-mate'));assert.ok(t.candidateOutcomes.some(q=>q.role==='unresolved-within-bound'));
});
test('own answer/accounting/frame and source mutations rejected by separate admission',()=>{
  const f=a.rows.find(r=>r.id==='zero-bound-0'),r=inspect(f.input,f.options,f.panel);checkResult(f.input,f.options,f.panel,r);
  for(const mutate of [r=>r.nodes--,r=>r.answer.fen='bad',r=>r.answer.actor='b',r=>r.answer.checks.pop(),r=>r.answer.moves.pop(),r=>r.answer.threats.resources.pop(),r=>r.answer.threats.generalThreatCompleteness=true,r=>r.answer.threats.candidateOutcomes.pop(),r=>r.answer.threats.notCertifiedGeneralThreats.push('a1a1'),r=>r.panel.rows.pop()]){const z=structuredClone(r);mutate(z);assert.throws(()=>checkResult(f.input,f.options,f.panel,z));}
  for(const mutate of [p=>p.nodes--,p=>p.rows.pop(),p=>p.rows[0].san='bad',p=>p.rows[0].actor.tree.win=!p.rows[0].actor.tree.win,p=>p.history.moves.push('a1a1'),p=>p.plies=2]){const p=structuredClone(f.panel);mutate(p);assert.throws(()=>inspect(f.input,f.options,p));assert.throws(()=>checkResult(f.input,f.options,p,r));}
});
test('proof getters rejected; returned panels and answers isolated',()=>{
  const f=a.rows[0],p=structuredClone(f.panel);Object.defineProperty(p,'nodes',{enumerable:true,get(){return f.panel.nodes;}});assert.throws(()=>inspect(f.input,f.options,p));
  const r=inspect(f.input,f.options,f.panel);r.panel.rows.pop();r.answer.moves.pop();r.answer.threats.resources.length=0;checkResult(f.input,f.options,f.panel,inspect(f.input,f.options,f.panel));
});
