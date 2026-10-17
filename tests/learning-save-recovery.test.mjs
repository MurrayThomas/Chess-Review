import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {LearningWorkspace} from '../lib/learning/workspace.js';
const puzzle=JSON.parse(await fs.readFile(new URL('../data/learning/puzzles.json',import.meta.url),'utf8')).puzzles.find(p=>p.themes.includes('mateIn1'));
async function setup(t){
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data={},state={fail:false},instances=[];
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles:[puzzle]})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){if(state.fail)throw Error('Unavailable');Object.assign(data,structuredClone(values));}};
  const make=()=>{const w=new LearningWorkspace({document:dom.window.document,storage,makePiece:()=>dom.window.document.createElement('span')});instances.push(w);return w;};
  t.after(async()=>{state.fail=false;for(const w of instances)await w.close();dom.window.close();});
  const w=make();await w.open();await w.startPuzzleSelection([puzzle]);return {dom,data,state,w,make};
}
test('navigation retains the unsaved banner and retry commits a completion exactly once',async t=>{
  const {dom,data,state,w}=await setup(t);state.fail=true;await w.submitPuzzle(puzzle.solution[0]);assert.equal(w.failedChanges.length,1);
  state.fail=false;await w.navigate('home');assert.equal(w.store.error,null);assert.ok(w.root.querySelector('.learn-storage-error'));
  const leaving=new dom.window.Event('beforeunload',{cancelable:true});dom.window.dispatchEvent(leaving);assert.equal(leaving.defaultPrevented,true);
  await Promise.all([w.retrySave(),w.retrySave()]);await w.retrySave();w.render();
  assert.equal(data['learning:v1'].puzzles[puzzle.id].clean,1);assert.equal(w.failedChanges.length,0);assert.equal(w.root.querySelector('.learn-storage-error'),null);
  const savedLeaving=new dom.window.Event('beforeunload',{cancelable:true});dom.window.dispatchEvent(savedLeaving);assert.equal(savedLeaving.defaultPrevented,false);
});
test('closing and reopening learning retains failed work and a later save drains it',async t=>{
  const {data,state,w,make}=await setup(t);state.fail=true;await w.submitPuzzle(puzzle.solution[0]);await w.close();
  const reopened=make();await reopened.open();assert.equal(reopened.failedChanges.length,1);assert.ok(reopened.root.querySelector('.learn-storage-error'));
  state.fail=false;await reopened.persist(p=>{p.resume=null;});assert.equal(reopened.failedChanges.length,0);assert.equal(data['learning:v1'].puzzles[puzzle.id].clean,1);
});
