import test from 'node:test';
import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {lastMoveChanges} from './changes.mjs';
import {checkResult} from './check-result.mjs';
import {cases,history} from './fixtures.mjs';
await openResearchData(['D001'],{purpose:'test'});
const input=id=>structuredClone(cases.find(c=>c.id===id).input);
for(const f of cases)test('independent full frame/identity/geometry '+f.id,()=>{const r=lastMoveChanges(f.input);assert.equal(r.status,'answered');assert.equal(checkResult(f.input,r),true);});
test('original identities through both castling units and promotion capture',()=>{
  const c=lastMoveChanges(input('black-long-castle')).answer;assert.equal(c.last.castlingRook.id,'bra8');assert.equal(c.unitChanges.length,2);assert.equal(c.after.inventory.find(p=>p.id==='wrh1').square,'f1');
  const p=lastMoveChanges(input('capture-promotion')).answer;assert.equal(p.last.unit,'wpa7');assert.equal(p.last.captured.id,'brb8');assert.equal(p.after.units.find(u=>u.id==='wpa7').type,'q');assert.equal(p.after.units.find(u=>u.id==='brb8').alive,false);
});
test('en-passant actual victim and rule-state transitions',()=>{const a=lastMoveChanges(input('ep')).answer;assert.equal(a.last.captured.square,'d5');assert.equal(a.before.fields.enPassant,'d6');assert.equal(a.after.fields.enPassant,'-');assert.equal(a.after.material.whiteMinusBlack,undefined);assert.equal(a.after.material.nominal.whiteMinusBlack,1);assert.equal(a.last.unit,'wpe2');});
test('history-aware claim and final terminal frames remain answerable',()=>{
  const r=lastMoveChanges(input('threefold')).answer;assert.equal(r.before.rules.threefoldClaim,false);assert.equal(r.after.rules.threefoldClaim,true);
  assert.equal(lastMoveChanges(input('mate')).answer.after.rules.checkmate,true);assert.deepEqual(lastMoveChanges(input('mate')).answer.after.legal.moves,[]);
  assert.equal(lastMoveChanges(input('fifty-claim')).answer.after.rules.fiftyMoveClaim,true);
});
test('pinned defender counted and departed rook rights lost',()=>{
  const a=lastMoveChanges(input('pinned-defense')).answer;assert.ok(a.after.attacks.find(e=>e.color==='w'&&e.target==='d4').from.includes('wne2'));
  const b=lastMoveChanges(input('rook-right-loss')).answer;assert.equal(b.before.fields.castling,'KQkq');assert.equal(b.after.fields.castling,'Qkq');
});
test('missing and empty histories are unavailable; disabled is inert',()=>{
  for(const i of [{fen:input('quiet').fen},history(null,[])]){const r=lastMoveChanges(i);assert.equal(r.status,'unavailable');checkResult(i,r);}
  const i={enabled:false,fen:'not a position',history:null};const r=lastMoveChanges(i);assert.equal(r.status,'disabled');checkResult(i,r);
});
test('exact/short/zero atomic budget; proposed move is never played',()=>{
  const i=input('ep'),n=lastMoveChanges(i).nodes;
  for(const limit of [n,n-1,0]){const q={...i,maxChangeNodes:limit,move:'invalid proposed move'},r=lastMoveChanges(q);assert.equal(r.status,limit===n?'answered':'exhausted');checkResult(q,r);if(limit<n)assert.equal(r.answer,null);}
});
test('strict data, illegal history, endpoint mismatch and claim continuation rejected',()=>{
  for(const enabled of [null,1,'yes'])assert.throws(()=>lastMoveChanges({...input('quiet'),enabled}));
  for(const maxChangeNodes of [-1,1.5,100001,NaN])assert.throws(()=>lastMoveChanges({...input('quiet'),maxChangeNodes}));
  const bad=input('quiet');bad.history.moves=['g1g5'];assert.throws(()=>lastMoveChanges(bad));
  assert.throws(()=>lastMoveChanges({...input('quiet'),fen:input('capture').fen}));
  const terminal=input('mate');terminal.history.moves.push('a7a6');assert.throws(()=>lastMoveChanges(terminal),/terminal/);
  let called=false;const getter={get history(){called=true;return null;}};assert.throws(()=>lastMoveChanges(getter),/ordinary/);assert.equal(called,false);
  const cyclic={};cyclic.self=cyclic;assert.throws(()=>lastMoveChanges(cyclic),/acyclic/);
});
test('independent checker rejects identity, geometry, rule, option and accounting changes',()=>{
  const i=input('capture-promotion'),r=lastMoveChanges(i);
  const mutate=[a=>a.answer.last.unit='wqa7',a=>a.answer.after.units[0].alive=!a.answer.after.units[0].alive,a=>a.answer.after.attacks[0].from.push('fake'),a=>a.answer.attackChanges.pop(),a=>a.answer.after.rules.check=!a.answer.after.rules.check,a=>a.answer.after.legal.moves.push('a1a1'),a=>a.nodes--,a=>a.answer.history.moves.pop(),a=>a.answer.unitChanges.pop()];
  for(const edit of mutate){const copy=structuredClone(r);edit(copy);assert.throws(()=>checkResult(i,copy));}
});
test('caller mutation cannot alter later outputs',()=>{const i=input('capture'),r=lastMoveChanges(i);r.answer.after.units[0].square='a1';r.answer.history.moves.pop();const fresh=lastMoveChanges(i);checkResult(i,fresh);assert.equal(i.history.moves.length,3);});
