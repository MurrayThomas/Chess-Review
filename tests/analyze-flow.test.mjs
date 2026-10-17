import test from 'node:test';
import assert from 'node:assert/strict';

// The API facade is captured at import time, just as it is in an extension page.
globalThis.chrome = {};
const { analyzeActiveTab, reloadActiveAndAnalyze, openAnalysisTab } = await import('../analyze-flow.js');
import {createImportRequest} from '../lib/import-request.js';
import {deferred,settle} from './helpers/app.mjs';

function setup(t, url = 'https://www.chess.com/game/live/12345678') {
  const store = {}, opened = [], listeners = new Set();
  const tabs = new Map([[1, { id: 1, url }]]);
  const state = { activeId: 1, store, opened, listeners, tabs };
  Object.assign(globalThis.chrome, {
    runtime: { getURL: path => `chrome-extension://test/${path}` },
    storage: { local: {
      async get(key) { return { [key]: store[key] }; },
      async set(data) { Object.assign(store, structuredClone(data)); },
      async remove(key) { delete store[key]; },
    } },
    tabs: {
      async query() { return [tabs.get(state.activeId)]; },
      async get(id) { if (!tabs.has(id)) throw Error('Tab closed'); return tabs.get(id); },
      async sendMessage() { throw Error('Receiving end does not exist'); },
      async create(data) { opened.push(data); },
      onUpdated: { addListener(fn) { listeners.add(fn); }, removeListener(fn) { listeners.delete(fn); } },
      async reload(id) { for (const listener of [...listeners]) listener(id, { status: 'complete' }); },
    },
  });
  t.mock.method(globalThis, 'fetch', async url => ({
    ok: true,
    json: async () => ({ games: [{ url: 'https://www.chess.com/game/live/12345678', pgn: '1. e4 e5 1-0' }] }),
    text: async () => '[Result "1-0"]\n\n1. e4 e5 1-0',
  }));
  state.payload = () => Object.entries(store).find(([key]) => key.startsWith('job:'))?.[1];
  return state;
}

test('Chess.com without a content script uses the saved username and URL', async t => {
  const s = setup(t);
  await analyzeActiveTab('saved-user');
  assert.equal(s.opened.length, 1);
  assert.equal(s.payload().meta.gameId, '12345678');
  assert.equal(Object.hasOwn(s.payload(), 'theme'), false);
});

for (const url of ['https://www.chess.com/game/live/12345678', 'https://lichess.org/AAAAAAAA']) {
  test(`source themes from stale content scripts are discarded: ${url}`, async t => {
    const s = setup(t, url);
    t.mock.method(chrome.tabs, 'sendMessage', async () => ({
      ok: true, gameId: url.includes('lichess') ? 'AAAAAAAA' : '12345678',
      theme: { boardTheme: 'green', boardUrl: 'https://example.test/board.png' },
    }));
    await analyzeActiveTab('saved-user');
    assert.equal(s.opened.length, 1);
    assert.equal(Object.hasOwn(s.payload(), 'theme'), false);
  });
}

test('missing content script and username produces a recoverable username error', async t => {
  setup(t);
  await assert.rejects(analyzeActiveTab(''), err => err.code === 'NO_USERNAME' && err.tabId === 1);
});

test('retry retains the original tab before and during the reload', async t => {
  const s = setup(t, 'https://lichess.org/');
  s.tabs.set(2, { id: 2, url: 'https://lichess.org/BBBBBBBB' });
  let originalError;
  try { await analyzeActiveTab(''); } catch (err) { originalError = err; }
  assert.equal(originalError.code, 'NO_GAME');
  s.activeId = 2;
  let reloaded;
  t.mock.method(chrome.tabs, 'reload', async id => {
    reloaded = id;
    s.tabs.get(1).url = 'https://lichess.org/AAAAAAAA';
    for (const fn of [...s.listeners]) fn(id, { status: 'complete' });
  });
  await reloadActiveAndAnalyze('', originalError.tabId);
  assert.equal(reloaded, 1);
  assert.equal(s.payload().meta.gameId, 'AAAAAAAA');
  assert.equal(s.listeners.size, 0);
});

test('a rejected reload immediately cleans up its listener', async t => {
  const s = setup(t);
  t.mock.method(chrome.tabs, 'reload', async () => { throw Error('Reload denied'); });
  await assert.rejects(reloadActiveAndAnalyze('', 1), /Reload denied/);
  assert.equal(s.listeners.size, 0);
});

test('a closed original tab never falls back to the active tab', async t => {
  const s = setup(t);
  s.tabs.set(2, { id: 2, url: 'https://lichess.org/BBBBBBBB' });
  s.tabs.delete(1); s.activeId = 2;
  await assert.rejects(reloadActiveAndAnalyze('', 1), /Tab closed/);
  assert.equal(s.opened.length, 0);
});

test('canceling a pending storage handoff cannot open a late analysis tab',async t=>{
  const s=setup(t),pending=deferred(),request=createImportRequest();t.after(()=>request.dispose());
  const set=chrome.storage.local.set;t.mock.method(chrome.storage.local,'set',async data=>{await pending.promise;await set(data);});
  const opening=openAnalysisTab({pgn:'1. e4'},{signal:request.signal});request.cancel();
  await assert.rejects(opening,error=>error.code==='IMPORT_CANCELLED');pending.resolve();await settle();
  assert.equal(s.opened.length,0);assert.equal(s.payload(),undefined);
});
test('canceling tab creation closes only that operation\'s late tab',async t=>{
  const s=setup(t),pending=deferred(),request=createImportRequest(),removed=[];t.after(()=>request.dispose());
  t.mock.method(chrome.tabs,'create',()=>pending.promise);chrome.tabs.remove=async id=>removed.push(id);
  const opening=openAnalysisTab({pgn:'1. e4'},{signal:request.signal});await settle();request.cancel();
  await assert.rejects(opening,error=>error.code==='IMPORT_CANCELLED');pending.resolve({id:99});await settle();
  assert.deepEqual(removed,[99]);assert.equal(s.payload(),undefined);
});
