import test from 'node:test';
import assert from 'node:assert/strict';
import {SCREEN_PREVIEWS,memoryStorage,createScreenPreviewContext} from '../lib/screen-previews.js';
import {app,loadGame} from './helpers/app.mjs';

test('preview storage is isolated, snapshots its inputs and implements browser get defaults',async()=>{
  const source={settings:{accent:'#123456'},username:'sample'},store=memoryStorage(source);
  source.settings.accent='changed';const first=await store.get('settings');first.settings.accent='changed again';
  assert.equal((await store.get('settings')).settings.accent,'#123456');
  await store.set({progress:{attempts:3}});assert.deepEqual(await store.get({missing:7}),{missing:7});
  assert.deepEqual(await store.get(['username']),{username:'sample'});
  await store.remove(['username','progress']);assert.equal((await store.get('username')).username,undefined);
  await store.clear();assert.deepEqual(await store.get(),{});
});

test('only an explicit preview query creates a memory context and invalid views remain isolated',async()=>{
  assert.equal(createScreenPreviewContext({search:''}),null);
  assert.equal(createScreenPreviewContext({search:'?other=review'}),null);
  const context=createScreenPreviewContext({search:'?screen-preview=unknown'});assert.equal(context.id,'review');
  const preferences={settings:{accent:'#123456',engineWorkers:8,sound:true},layout:{board:{x:10,y:20,w:300,h:400}},layoutMode:'custom',layoutVersion:8};
  await context.configure(preferences);await context.storage.set({username:'preview'});
  const data=await context.storage.get();assert.equal(data.settings.engineWorkers,1);assert.equal(data.settings.engineDepth,4);assert.equal(data.settings.sound,false);
  assert.equal(data.settings.accent,'#123456');assert.deepEqual(data.layout,preferences.layout);
  assert.equal(preferences.settings.engineWorkers,8);assert.equal(preferences.username,undefined);
  assert.match(context.job.pgn,/Preview White/);assert.equal(new Set(SCREEN_PREVIEWS.map(view=>view.id)).size,SCREEN_PREVIEWS.length);
});

test('Visual settings opens the separate preview tab without storing a preference',async t=>{
  const a=app(t);loadGame(a,'1. e4');a.call('buildUI');a.call('renderSettings');let created;
  a.context.browserAPI.tabs={async create(options){created=options;}};
  a.dom.window.document.querySelector('[data-debug=screen-previews]').click();await Promise.resolve();
  assert.equal(created.url,'https://extension.test/analysis.html?screen-preview=review');assert.equal(a.writes.length,0);
});

test('preview startup reads display preferences but never migrates or saves real account data',async t=>{
  const a=app(t,{url:'https://extension.test/analysis.html?screen-preview=review#keep'}),original={settings:{accent:'#123456'},username:'real user',library:[{id:'keep'}]};
  Object.assign(a.store,structuredClone(original));let releaseCalls=0,mounted=0;
  a.replace('resetSettingsForRelease',async()=>{releaseCalls++;});
  a.replace('loadBook',async()=>{});a.replace('loadCalibration',async()=>{});
  a.replace('startAnalysis',()=>{a.state.analyzing=false;});
  a.replace('loadScreenPreviewController',async()=>({async mountScreenPreview(env){mounted++;await env.context.storage.set({username:'sample',library:[]});}}));
  a.dom.window.sessionStorage.setItem('job:keep','keep original game');
  await a.start();
  assert.equal(a.dom.window.sessionStorage.getItem('job:keep'),'keep original game');
  assert.equal(releaseCalls,0);assert.equal(mounted,1);assert.equal(a.writes.length,0);assert.deepEqual(a.store,original);
  assert.equal(a.state.players.w.name,'Preview White');assert.equal(a.state.settings.accent,'#123456');
});
