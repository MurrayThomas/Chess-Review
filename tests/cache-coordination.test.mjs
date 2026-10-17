import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.chrome ||= {};
const first=await import('../gamecache.js?coordination-first'),second=await import('../gamecache.js?coordination-second');
function storage(t,locks=true){
  const data={},queues=new Map(),old=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:locks?{locks:{request(key,fn){const next=(queues.get(key)||Promise.resolve()).catch(()=>{}).then(fn);queues.set(key,next);return next;}}}:{}});
  t.after(()=>{if(old)Object.defineProperty(globalThis,'navigator',old);else delete globalThis.navigator;});
  chrome.storage={local:{async get(key){await Promise.resolve();return {[key]:structuredClone(data[key])};},async set(values){Object.assign(data,structuredClone(values));},async remove(keys){for(const key of keys)delete data[key];}}};return data;
}
test('separate contexts coordinate game cache writes and eviction',async t=>{
  const data=storage(t);await Promise.all(Array.from({length:1005},(_,i)=>(i%2?first:second).setCachedGame('fixture',i,{pgn:'1. e4',i})));
  assert.equal(data['gamecache:index'].length,1000);assert.equal(Object.keys(data).filter(k=>k.startsWith('gamecache:fixture:')).length,1000);
  for(const key of data['gamecache:index'])assert.ok(data[key]);
});
test('separate contexts coordinate month cache writes and eviction',async t=>{
  const data=storage(t);await Promise.all(Array.from({length:65},(_,i)=>(i%2?first:second).setCachedMonth('archive/'+i,[{i}])));
  assert.equal(data['gamecache:monthindex'].length,60);assert.equal(Object.keys(data).filter(k=>k.startsWith('gamecache:month:')).length,60);
});
test('fallback queue recovers after a failed storage write',async t=>{
  const data=storage(t,false),set=chrome.storage.local.set;let fail=true;chrome.storage.local.set=async values=>{if(fail){fail=false;throw Error('Unavailable');}return set(values);};
  await Promise.all([first.setCachedGame('fixture','failed','1. e4'),first.setCachedGame('fixture','saved','1. d4')]);
  assert.equal(await first.getCachedGame('fixture','failed'),null);assert.equal(await first.getCachedGame('fixture','saved'),'1. d4');assert.equal(data['gamecache:index'].length,1);
});
