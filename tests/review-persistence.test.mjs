import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame} from './helpers/app.mjs';
function review(t,pgn='1. e4 e5'){const a=app(t);loadGame(a,pgn);a.call('computeDerived');a.call('buildUI');a.call('renderAll');a.replace('startAnalysis',()=>{});return a;}
test('failed save is visible and retries its immutable original review after navigation',async t=>{
  const a=review(t),original=a.state.pgn;a.state.meta={gameId:'original'};const set=a.context.browserAPI.storage.local.set;let fail=true;
  a.context.browserAPI.storage.local.set=async value=>{if('library'in value&&fail)throw Error('Unavailable');return set(value);};a.context.console={...console,warn(){}};
  assert.equal(await a.call('saveToLibrary'),false);const status=a.dom.window.document.querySelector('.review-save-status');assert.equal(status.hidden,false);assert.match(status.textContent,/Retry saving/);
  a.state.evals[0].cp=999;await a.call('applyGame',{pgn:'1. d4 d5',meta:{gameId:'different'},analysis:null});
  let starts=0;a.replace('createEngine',()=>{starts++;throw Error('No analysis is needed');});fail=false;await Promise.all([a.call('retryReviewSaves'),a.call('retryReviewSaves')]);
  assert.equal(a.store['analysis:original'].pgn,original);assert.equal(a.store['analysis:original'].evals[0].cp,0);assert.equal(a.state.meta.gameId,'different');assert.equal(starts,0);assert.equal(status.hidden,true);
});
test('cleanup failure does not hide a committed review and known cleanup retries safely',async t=>{
  const a=review(t);a.state.meta={gameId:'new'};a.store.library=Array.from({length:300},(_,i)=>({id:String(i)}));a.store['analysis:299']={old:true};
  const remove=a.context.browserAPI.storage.local.remove;let fail=true;a.context.console={...console,warn(){}};a.context.browserAPI.storage.local.remove=async keys=>{if(fail)throw Error('Cleanup unavailable');return remove(keys);};
  assert.equal(await a.call('saveToLibrary'),true);assert.equal(a.state.library[0].id,'new');assert.equal(a.dom.window.document.querySelector('.review-save-status').hidden,true);assert.ok(a.store['analysis:299']);
  fail=false;await a.call('saveToLibrary');assert.equal(a.store['analysis:299'],undefined);assert.ok(a.store['analysis:new']);
});
test('short PGN hash collision retains both games, analysis, favorites and reopening identity',async t=>{
  const a=review(t),first='[Event "Aa"]\n[White "Alice"]\n[Black "Bob"]\n[Result "1-0"]\n\n1. e4 e5 1-0',second=first.replace('[Event "Aa"]','[Event "B@"]');
  loadGame(a,first);a.call('computeDerived');const id=a.call('currentGameId');await a.call('saveToLibrary');await a.call('toggleFav',id);const firstRecord=structuredClone(a.store.library[0]);
  loadGame(a,second);a.call('computeDerived');assert.equal(a.call('currentGameId'),id);await a.call('saveToLibrary');const secondId=a.call('currentGameId');assert.notEqual(secondId,id);
  assert.equal(a.store.library.length,2);assert.equal(a.store['analysis:'+id].pgn,first);assert.equal(a.store['analysis:'+secondId].pgn,second);assert.equal(a.store.library.find(r=>r.id===id).fav,true);assert.equal(a.store.library.find(r=>r.id===secondId).fav,false);
  await a.call('openLibraryGame',firstRecord);assert.equal(a.state.pgn,first);assert.equal(a.call('currentGameId'),id);
});

test('two unsaved PGNs with colliding IDs both survive until storage recovers',async t=>{
  const a=review(t),first='[Event "Aa"]\n\n1. e4 e5',second=first.replace('[Event "Aa"]','[Event "B@"]');
  const set=a.context.browserAPI.storage.local.set;let fail=true;a.context.console={...console,warn(){}};
  a.context.browserAPI.storage.local.set=async values=>{if(values.library&&fail)throw Error('Unavailable');return set(values);};
  loadGame(a,first);a.call('computeDerived');const id=a.call('currentGameId');await a.call('saveToLibrary');
  loadGame(a,second);a.call('computeDerived');assert.equal(a.call('currentGameId'),id);await a.call('saveToLibrary');
  assert.match(a.dom.window.document.querySelector('.review-save-status').textContent,/2 reviews/);
  fail=false;await a.call('retryReviewSaves');assert.equal(a.store.library.length,2);
  assert.deepEqual(new Set(a.store.library.map(record=>a.store['analysis:'+record.id].pgn)),new Set([first,second]));
});
test('saved known player survives username changes and anonymous records remain anonymous',async t=>{
  const pgn='[White "Alice"]\n[Black "Bob"]\n[Result "0-1"]\n\n1. e4 e5 0-1',a=review(t,pgn),S=a.state;S.meta={gameId:'black'};S.username='Bob';S.headers=a.call('parseHeaders',pgn);Object.assign(S,a.call('derivePlayers',S.headers,S.meta,S.username));await a.call('saveToLibrary');const record=structuredClone(a.store.library[0]);
  S.username='Carol';loadGame(a,'1. d4 d5');await a.call('openLibraryGame',record);assert.equal(S.meSide,'b');assert.equal(S.playerKnown,true);assert.equal(a.call('myResult'),'win');
  S.username='Alice';await a.call('applyGame',{pgn:'1. d4 d5',meta:{gameId:'other'},analysis:null});await a.call('openLibraryGame',{...record,id:'anonymous',meta:{gameId:'anonymous'},meSide:'w',playerKnown:false,myName:'Alice'});assert.equal(S.playerKnown,false);assert.equal((await a.call('loadJob')).meta.playerKnown,false);
});
for(const style of ['rows','cards','compact'])test(`Black-start setup move grouping and retained cells are correct in ${style}`,t=>{
  const pgn='[SetUp "1"]\n[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 17"]\n\n17... e5 18. Nf3 Nc6',a=review(t,pgn);a.state.settings.mlStyle=style;a.call('renderMoves');
  const list=a.dom.window.document.querySelector('.movelist'),children=style==='compact'?[...list.children]:[...list.querySelector('.ml-pair').children];assert.equal(parseInt(children[0].textContent,10),17);assert.equal(children[1].dataset.ply,undefined);assert.equal(children[2].dataset.ply,'1');
  const cell=list.querySelector('[data-ply="2"]');a.call('renderMoves');assert.equal(a.dom.window.document.querySelector('[data-ply="2"]'),cell);
  loadGame(a,'1. e4 e5 2. Nf3');a.call('computeDerived');a.call('renderMoves');assert.equal(a.dom.window.document.querySelector('.ml-num').textContent,style==='compact'?'1.':'1');
});
