import test from 'node:test';
import assert from 'node:assert/strict';
import {app} from './helpers/app.mjs';
function tabs(t){
  const a=app(t),b=app(t),data={settings:{sound:true,showCoords:true,engineDepth:16}},storage={async get(key){return {[key]:structuredClone(data[key])};},async set(value){Object.assign(data,structuredClone(value));}};
  let queue=Promise.resolve();const locks={request(name,commit){assert.equal(name,'chess-review-settings');const next=queue.catch(()=>{}).then(commit);queue=next;return next;}};
  for(const tab of [a,b]){Object.assign(tab.state.settings,data.settings);tab.context.browserAPI.storage.local=storage;Object.defineProperty(tab.dom.window.navigator,'locks',{value:locks});tab.replace('applySettings',()=>{});}
  return {a,b,data,storage};
}
test('stale tabs preserve unrelated edits and deliberate same-field last commit wins',async t=>{
  const {a,b,data}=tabs(t);await a.call('setSetting','sound',false);await b.call('setSetting','showCoords',false);
  assert.deepEqual(data.settings,{sound:false,showCoords:false,engineDepth:16});
  await b.call('setSetting','sound',true);assert.equal(data.settings.sound,true);assert.equal(data.settings.showCoords,false);
});
test('concurrent nested edits merge by the changed field rather than stale maps',async t=>{
  const {a,b,data}=tabs(t);data.settings.soundFx={capture:{snd:'01'}};
  await Promise.all([a.call('writeSettings',{soundFx:{capture:{pitch:2}},categoryNames:{blunder:'Oops'}}),b.call('writeSettings',{soundFx:{capture:{speed:1.5}},categoryNames:{mistake:'Careful'}})]);
  assert.deepEqual(data.settings.soundFx,{capture:{snd:'01',pitch:2,speed:1.5}});assert.deepEqual(data.settings.categoryNames,{blunder:'Oops',mistake:'Careful'});
  await a.call('writeSettings',{categoryNames:{blunder:undefined}});assert.deepEqual(data.settings.categoryNames,{mistake:'Careful'});
});
test('section resets replace intended maps without resetting unrelated preferences',async t=>{
  const {a,data}=tabs(t);data.settings.categoryNames={blunder:'Oops'};data.settings.sound=false;
  await a.call('resetSettingKeys',['categoryNames']);assert.deepEqual(data.settings.categoryNames,{});assert.equal(data.settings.sound,false);assert.equal(data.settings.engineDepth,16);
});
test('queued patches are immutable snapshots and failure does not block later saves',async t=>{
  const {a,data,storage}=tabs(t),set=storage.set;let fail=true;a.context.console={...console,warn(){}};
  storage.set=async values=>{if(fail){fail=false;throw Error('Unavailable');}return set(values);};
  await assert.rejects(a.call('writeSettings',{sound:false}),/Unavailable/);
  const patch={categoryNames:{blunder:'Oops'}},pending=a.call('writeSettings',patch);patch.categoryNames.blunder='Changed later';await pending;
  assert.equal(data.settings.categoryNames.blunder,'Oops');assert.equal(data.settings.sound,true);
});
