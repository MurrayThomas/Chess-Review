import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData} from '../../../data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixture,dir} from './fixtures.mjs';
import {inspectPerpetualAttack as inspect} from './policy.mjs';
import {checkPerpetualAttack as check} from './check-result.mjs';
const data=await openResearchData(['D001'],{purpose:'test'}),saved=JSON.parse(gunzipSync(await readFile(dir+'/evidence/policies.json.gz'))),copy=x=>structuredClone(x);
assert.deepEqual(saved.datasetReceipt,data.receipt);assert.deepEqual(saved.sourceHashes,await bindings([dir+'/code/policy.mjs',dir+'/code/fixtures.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']));
const base=fixture(),valid=saved.rows.find(r=>r.id===base.id).result;
for(const row of saved.rows)test('complete sustainable nonchecking policy '+row.id,()=>{
 const f=fixture(row.black,row.priorCycles,row.clock);assert.deepEqual(row.fixture,f);const q=row.result;check(f.input,f.options,f.certificate,q);assert.equal(q.status,'proven');assert.equal(q.witness.states.length,4);assert.equal(q.witness.recurrence.actorStates,2);assert.equal(q.witness.recurrence.maxFurtherPlies,8);assert.equal(q.witness.sample.moves.length,row.clock===99?2:row.priorCycles?4:8);assert.equal(q.witness.sample.goal,row.clock===99?'actor-fifty-claim':'actor-threefold-claim');assert.equal(q.answer.qualityClaim,false);assert.ok(q.witness.states.filter(s=>s.threat).every(s=>s.threat.history===null&&s.threat.mate&&s.threat.model==='turn-flipped-diagram-not-a-legal-pass'));assert.equal(q.witness.sample.kind,'one-deterministic-path-not-all-path-enumeration');
});
test('one fresh runtime equality and default disabled isolation',()=>{
 assert.deepEqual(inspect(base.input,base.options,base.certificate),valid);const q=inspect(base.input);check(base.input,{},undefined,q);assert.equal(q.status,'disabled');assert.equal(q.witness,null);assert.equal(q.nodes,0);
 const i=copy(base.input),o=copy(base.options),p=copy(base.certificate),before=JSON.stringify([i,o,p]),r=inspect(i,o,p);r.witness.certificate.states.pop();r.witness.actual.history.moves.push('g5g6');assert.equal(JSON.stringify([i,o,p]),before);
});
test('missing history policy and wrong actual player remain prerequisites',()=>{
 for(const [input,options,certificate,status]of [[{fen:base.input.fen},base.options,base.certificate,'history-prerequisite'],[base.input,base.options,undefined,'policy-prerequisite'],[base.input,{...base.options,player:'b'},base.certificate,'player-turn-prerequisite']]){const q=inspect(input,options,certificate);check(input,options,certificate,q);assert.equal(q.status,status);assert.equal(q.answer.available,false);}
});
test('current claims can be declined in genuine history but automatic terminals cannot',()=>{
 for(const cycles of [2,3,4]){const f=fixture(false,cycles),q=inspect(f.input,f.options,f.certificate);check(f.input,f.options,f.certificate,q);assert.equal(q.status,cycles===4?'not-live':'already-claimable');}
 const continued=fixture(false,5);assert.throws(()=>inspect(continued.input,continued.options,continued.certificate),/automatic terminal/);assert.throws(()=>check(continued.input,continued.options,continued.certificate,valid));
 for(const clock of [100,149,150]){const f=fixture(false,0,clock),q=inspect(f.input,f.options,f.certificate);check(f.input,f.options,f.certificate,q);assert.equal(q.status,clock===150?'not-live':'already-claimable');}
 const f=fixture(false,0,149),c=legalPosition(f.input.fen);c.move('g5g6');f.input={fen:c.fen(),history:{fen:f.input.fen,moves:['g5g6']}};const q=inspect(f.input,f.options,f.certificate);check(f.input,f.options,f.certificate,q);assert.equal(q.status,'not-live');
});
test('rights and legal en passant belong to repetition identity',()=>{
 for(const [fen,cycle]of [['4k2r/8/8/8/8/8/8/4K2R w Kk - 0 1',['h1h2','h8h7','h2h1','h7h8']],['4k3/8/8/3pP3/8/8/8/4K2R w - d6 0 1',['h1h2','e8e7','h2h1','e7e8']]]){const moves=[...cycle,...cycle],c=legalPosition(fen);for(const m of moves)c.move(m);const input={fen:c.fen(),history:{fen,moves}},o={enabled:true,player:'w'},q=inspect(input,o);check(input,o,undefined,q);assert.equal(q.status,'policy-prerequisite','Lost rights/EP prevent treating initial placement as the same position');}
});
test('escape negative refuses a cooperative cycle with omitted legal defense',()=>{
 const f=copy(base),map=new Map();for(const s of f.certificate.states){const c=legalPosition(s.key+' 0 1');c.remove('f5');map.set(s.key,c.fen().split(' ').slice(0,4).join(' '));}
 for(const s of f.certificate.states){s.key=map.get(s.key);if(s.next)s.next=map.get(s.next);for(const e of s.replies||[])e.next=map.get(e.next);}f.certificate.root=map.get(f.certificate.root);f.input.fen=f.certificate.root+' 0 1';f.input.history={fen:f.input.fen,moves:[]};assert.throws(()=>inspect(f.input,f.options,f.certificate),/defender domain/);assert.throws(()=>check(f.input,f.options,f.certificate,valid));
});
test('strict controls getter history and certificate identity reject',()=>{
 for(const extra of [{enabled:null},{player:undefined},{player:'x'},{maxNodes:-1},{maxNodes:50001},{maxNodes:1.5},{maxNodes:null},{unknown:true}])assert.throws(()=>inspect(base.input,{...base.options,...extra},base.certificate));
 for(const change of [p=>p.actor='b',p=>p.root=p.states[1].key,p=>p.states.push(copy(p.states[0])),p=>p.states[0].extra=true,p=>p.states=[],p=>p.schema='observed-cycle']){const p=copy(base.certificate);change(p);assert.throws(()=>inspect(base.input,base.options,p));}
 const bad=copy(base.input);bad.history.moves=['g5g6'];assert.throws(()=>inspect(bad,base.options,base.certificate),/endpoint/);let called=false;const options={enabled:true};Object.defineProperty(options,'player',{enumerable:true,get(){called=true;return'w';}});assert.throws(()=>inspect(base.input,options,base.certificate),/ordinary/);assert.equal(called,false);
});
test('graph legality closure quiet threats and full defender domains are mandatory',()=>{
 for(const change of [p=>p.states[0].move='g5h5',p=>p.states[0].mateThreat='g6g7',p=>p.states[0].next=p.root,p=>p.states[1].replies=[],p=>p.states[1].replies.push(copy(p.states[1].replies[0])),p=>p.states[1].replies[0].next=p.states[1].key,p=>p.states.pop()]){const p=copy(base.certificate);change(p);assert.throws(()=>inspect(base.input,base.options,p));assert.throws(()=>check(base.input,base.options,p,valid));}
});
test('exact short zero setup graph sample and mapping caps discard every proof',()=>{
 for(const limit of [valid.nodes,valid.nodes-1,18,2,1,0]){const options={...base.options,maxNodes:limit},q=inspect(base.input,options,base.certificate);check(base.input,options,base.certificate,q);assert.equal(q.status,limit===valid.nodes?'proven':'exhausted');if(q.status==='exhausted'){assert.equal(q.nodes,limit+1);assert.equal(q.witness,null);assert.equal(q.answer.available,false);}}
});
test('independent result actual history graph threats recurrence sample and ledger mutations reject',()=>{
 for(const change of [q=>q.witness.actual.history.moves.push('g5g6'),q=>q.witness.actual.actor='b',q=>q.witness.certificate.states.pop(),q=>q.witness.states[0].key+=' 0 1',q=>q.witness.states.find(s=>s.threat).threat.history={},q=>q.witness.states.find(s=>s.threat).threat.mate=false,q=>q.witness.recurrence.maxFurtherPlies--,q=>q.witness.recurrence.defenses='observed-only',q=>q.witness.sample.moves.pop(),q=>q.witness.sample.goal='automatic-threefold',q=>q.witness.sample.moves[0].occurrences++,q=>q.answer.qualityClaim=true,q=>q.answer.side='b',q=>q.nodes--]){const bad=copy(valid);change(bad);assert.throws(()=>check(base.input,base.options,base.certificate,bad));}
 const q=inspect(base.input,{...base.options,maxNodes:0},base.certificate);q.witness=copy(valid.witness);assert.throws(()=>check(base.input,{...base.options,maxNodes:0},base.certificate,q));
});

test('strict UCI threat rejects consistently forged SAN proof',()=>{check(base.input,base.options,base.certificate,valid);const p=copy(base.certificate),bad=copy(valid);p.states[0].mateThreat='Rh6#';bad.witness.certificate=copy(p);bad.witness.states.find(s=>s.key===p.root).threat.move='Rh6#';assert.throws(()=>inspect(base.input,base.options,p),/Illegal diagram threat/);assert.throws(()=>check(base.input,base.options,p,bad));});
