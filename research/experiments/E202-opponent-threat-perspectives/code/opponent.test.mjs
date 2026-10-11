import test from 'node:test';
import assert from 'node:assert/strict';
import {saved} from './saved.mjs';
import {inspectOpponentResources as inspect} from './opponent.mjs';
import {checkResult} from './check-result.mjs';
import {cases} from '../../E200-recorded-move-changes/code/fixtures.mjs';
const a=await saved();
for(const f of a.rows)test('independent perspective answer '+f.id,()=>{
  const r=inspect(f.input,f.options,f.panel);checkResult(f.input,f.options,f.panel,r);assert.equal(r.answer.player,f.options.perspective);assert.equal(r.answer.generalThreatCompleteness,false);assert.match(r.answer.intent,/unavailable/);
  if(f.role==='claim'){assert.equal(r.status,'unavailable');assert.equal(r.answer.evidenceStatus,'claim-rule-prerequisite');assert.deepEqual(r.answer.resources,[]);assert.deepEqual(r.answer.candidateReplies,[]);return;}
  assert.equal(r.status,'answered');
  if(f.mode==='own'){assert.equal(r.answer.frame.mode,'after-each-own-candidate');assert.equal(r.answer.candidateReplies.length,f.panel.rows.length);assert.deepEqual(r.answer.resources,[]);assert.deepEqual(r.answer.candidateReplies.map(q=>q.ownMove),r.source.answer.moves.map(m=>m.move));}
  else {assert.equal(r.answer.frame.mode,'opponent-to-act-now');assert.deepEqual(r.answer.candidateReplies,[]);assert.ok(r.answer.resources.every(q=>q.winner!==f.options.perspective&&q.fromFen===f.input.fen));if(f.role==='quiet')assert.equal(r.answer.resources.find(q=>q.enemyMove===f.nominated).kind,'quiet-mating-threat');if(f.role==='empty')assert.deepEqual(r.answer.resources,[]);}
});
test('conditional enemy replies identify exact real frame without implying root loss',()=>{
  for(const color of ['w','b']){const f=a.rows.find(q=>q.id==='winning-choice-'+(color==='w'?0:1)+'-view-'+color),r=inspect(f.input,f.options,f.panel),choices=r.answer.candidateReplies,certified=choices.filter(q=>q.resource);assert.ok(certified.length>0);assert.ok(choices.some(q=>q.resource===null));assert.ok(certified.every(q=>q.resource.fromFen===q.afterOwnMove&&q.resource.winner!==color&&q.resource.querySide==='opponent'));assert.ok(!Object.hasOwn(r.answer,'rootLosing'));assert.ok(r.answer.uncertifiedCandidates.length>0);}
});
test('same root with opposite perspective changes domain, not board turn',()=>{
  const f=a.rows[0],own=inspect(f.input,{...f.options,perspective:'w'},f.panel),enemy=inspect(f.input,{...f.options,perspective:'b'},f.panel);assert.deepEqual(own.source,enemy.source);assert.equal(own.answer.frame.fen,enemy.answer.frame.fen);assert.equal(own.answer.frame.actor,enemy.answer.frame.actor);assert.notEqual(own.answer.frame.mode,enemy.answer.frame.mode);assert.notEqual(own.answer.opponent,enemy.answer.opponent);
});
test('genuine history and optional proposed move preserve exact current frame',()=>{
  const f=a.rows.find(q=>q.input.history.moves.length>0);assert.ok(f);const input={...f.input,move:'invalid proposed move'},r=inspect(input,f.options,f.panel);assert.equal(r.answer.frame.fen,f.input.fen);checkResult(input,f.options,f.panel,r);
});
test('missing history/panel, explicit disabled and actual terminal abstention',()=>{
  const f=a.rows[0];for(const [i,p,status]of [[{fen:f.input.fen},f.panel,'history-prerequisite'],[f.input,undefined,'panel-prerequisite']]){const r=inspect(i,f.options,p);assert.equal(r.status,'unavailable');assert.equal(r.answer.evidenceStatus,status);assert.deepEqual(r.answer.resources,[]);assert.deepEqual(r.answer.candidateReplies,[]);checkResult(i,f.options,p,r);}
  const r=inspect({fen:'invalid'},{});assert.equal(r.status,'disabled');assert.equal(r.source,null);checkResult({fen:'invalid'},{},undefined,r);
  const i=cases.find(q=>q.id==='mate').input,o={enabled:true,perspective:'w'},z=inspect(i,o);assert.equal(z.status,'not-live');assert.equal(z.answer,null);checkResult(i,o,undefined,z);
});
test('explicit perspective and strict plain controls cannot infer a player',()=>{
  const f=a.rows[0];for(const o of [{enabled:true},{enabled:true,perspective:null},{enabled:true,perspective:'x'},{enabled:1,perspective:'w'},{enabled:true,perspective:'w',plies:3},{enabled:true,perspective:'w',maxNodes:-1},{enabled:true,perspective:'w',maxNodes:50001},{enabled:true,perspective:'w',extra:1}])assert.throws(()=>inspect(f.input,o,f.panel));
  let called=false;assert.throws(()=>inspect(f.input,{enabled:true,get perspective(){called=true;return 'w';}},f.panel));assert.equal(called,false);
  const p=structuredClone(f.panel);Object.defineProperty(p,'nodes',{enumerable:true,get(){return f.panel.nodes;}});assert.throws(()=>inspect(f.input,f.options,p));
});
test('exact/one-short/zero and route-only shortage atomically discard source',()=>{
  const f=a.rows.find(q=>q.id==='quiet-H2-w-view-b'),r=inspect(f.input,f.options,f.panel),M=r.source.answer.moves.length;
  for(const maxNodes of [r.nodes,r.nodes-1,r.nodes-M,0]){const o={...f.options,maxNodes},z=inspect(f.input,o,f.panel);assert.equal(z.status,maxNodes===r.nodes?'answered':'exhausted');checkResult(f.input,o,f.panel,z);if(maxNodes<r.nodes){assert.equal(z.answer,null);assert.equal(z.source,null);assert.equal(z.nodes,maxNodes+1);}}
});
test('own enemy-resource/frame/accounting and inherited source mutations rejected',()=>{
  const f=a.rows.find(q=>q.id==='zero-bound-0-view-b'),r=inspect(f.input,f.options,f.panel);checkResult(f.input,f.options,f.panel,r);
  for(const mutate of [q=>q.nodes--,q=>q.answer.player='w',q=>q.answer.opponent='b',q=>q.answer.frame.actor='b',q=>q.answer.frame.mode='after-each-own-candidate',q=>q.answer.intent='known',q=>q.answer.generalThreatCompleteness=true,q=>q.answer.resources.pop(),q=>q.answer.resources[0].winner='b',q=>q.answer.resources[0].enemyMove='a1a1',q=>q.source.nodes--,q=>q.source.answer.threats.resources.pop()]){const z=structuredClone(r);mutate(z);assert.throws(()=>checkResult(f.input,f.options,f.panel,z));}
  for(const mutate of [p=>p.nodes--,p=>p.rows.pop(),p=>p.rows[0].actor.tree.win=!p.rows[0].actor.tree.win]){const p=structuredClone(f.panel);mutate(p);assert.throws(()=>inspect(f.input,f.options,p));assert.throws(()=>checkResult(f.input,f.options,p,r));}
  const own=a.rows.find(q=>q.id==='winning-choice-0-view-w'),z=inspect(own.input,own.options,own.panel);z.answer.candidateReplies.find(q=>q.resource).resource.enemyMove='a1a1';assert.throws(()=>checkResult(own.input,own.options,own.panel,z));
});
test('caller output mutation leaves later source and own answers intact',()=>{const f=a.rows[0],r=inspect(f.input,f.options,f.panel);r.source.panel.rows.pop();r.answer.candidateReplies.pop();checkResult(f.input,f.options,f.panel,inspect(f.input,f.options,f.panel));});
