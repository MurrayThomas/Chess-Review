import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame} from './helpers/app.mjs';

test('Concepts setting hides and restores its panel, persists, and preserves analysis choices and layout',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  const doc=a.dom.window.document,mod=doc.querySelector('[data-mod="concepts"]'),before=JSON.stringify(a.state.layout);
  const width=a.call('layoutPageSize',a.state.layout).pageW;
  assert.equal(mod.hidden,false);await a.call('toggleSettings');doc.querySelectorAll('.set-tab')[2].click();
  const toggle=doc.querySelector('#showConcepts');assert.equal(toggle.checked,true);toggle.click();await a.run('_settingsWriteQueue');
  assert.equal(a.store.settings.showConcepts,false);assert.equal(mod.hidden,true);assert.equal(doc.querySelector('.stage').classList.contains('no-concepts'),true);
  assert.ok(a.call('layoutPageSize',a.state.layout).pageW<width);assert.equal(JSON.stringify(a.state.layout),before);assert.equal(a.state.settings.conceptsEnabled,false);
  doc.querySelector('#showConcepts').click();await a.run('_settingsWriteQueue');assert.equal(mod.hidden,false);assert.equal(a.store.settings.showConcepts,true);assert.equal(a.call('layoutPageSize',a.state.layout).pageW,width);
});

test('saved hidden panel preference applies at startup for automatic and custom layouts',t=>{
  for(const mode of ['auto','custom']){
    const a=app(t);loadGame(a,'1. e4');a.state.settings.showConcepts=false;a.state.layoutMode=mode;a.call('buildUI');
    assert.equal(a.dom.window.document.querySelector('[data-mod="concepts"]').hidden,true);
    a.call('resetConceptDefaults');assert.equal(a.state.settings.showConcepts,false);
  }
});
