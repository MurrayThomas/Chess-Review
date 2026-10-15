import test from 'node:test';
import assert from 'node:assert/strict';
import {methods,opportunityWeighted,tail20,experiment} from './stress.mjs';
const row=(quality,range=.5,eligible=true)=>({quality,alternatives:[0,range],eligible});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('independent arithmetic, harmonic and weighted equations',()=>{
  const xs=[row(20,.1),row(80,.9)];
  close(methods.sf18Arithmetic(xs),50);close(methods.sf19Combined(xs),(50+32)/2);
  close(opportunityWeighted(xs),74);close(tail20(xs),20);
});
test('no eligible decisions and zero-range opportunity disclose null',()=>{
  for(const f of Object.values(methods)){assert.equal(f([]),null);assert.equal(f([row(100,.5,false)]),null);}
  assert.equal(opportunityWeighted([row(20,0)]),null);
});
test('bad qualities and opportunity vectors cannot enter candidate scores',()=>{
  for(const f of [opportunityWeighted,tail20])for(const bad of [row(NaN),row(101),row(10,-.1),{quality:10,alternatives:[0],eligible:true}])assert.throws(()=>f([bad]));
});
test('zero-quality harmonic edge and forced rows reproduce independent formula',()=>{
  const xs=[row(0),row(100),row(100,.5,false)];close(methods.sf19Combined(xs),25);
});
test('tail subset ceiling exposes an independently authored replication failure',()=>{
  const xs=[row(0),...Array.from({length:5},()=>row(100))];
  close(tail20(xs),50);close(tail20([...xs,...xs]),100/3);
});
test('exhaustive finite input monotonicity for candidates',()=>{
  for(const a of [0,20,50,100])for(const b of [0,20,50,100])for(const wa of [0,.001,.5,1])for(const wb of [0,.001,.5,1]){
    for(const f of [opportunityWeighted,tail20]){
      const before=f([row(a,wa),row(b,wb)]),after=f([row(Math.max(0,a-10),wa),row(b,wb)]);
      if(before!==null)assert.ok(after<=before+1e-10);
    }
  }
});
test('complete panel is deterministic with all frozen methods and conditions',()=>{
  assert.deepEqual(experiment(),experiment());
  for(const r of Object.values(experiment().methods)){assert.equal(r.padding.length,6);assert.equal(r.replications.length,2);}
});
