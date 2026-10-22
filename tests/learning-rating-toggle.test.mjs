import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';
import {normalizeProgress} from '../lib/learning/progress.js';
import {canRatePuzzle,ratePuzzle} from '../lib/learning/puzzle-rating.js';

async function setup(t) {
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data={};
  const puzzles=['one','two','three','four'].map(id=>({id,fen:new Chess().fen(),solution:['e2e4'],rating:1200,themes:[],source:{url:'https://lichess.org/training'}}));
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(value){Object.assign(data,structuredClone(value));}};
  const instances=[],make=()=>{
    const w=new LearningWorkspace({document:dom.window.document,storage,settings:()=>({moveAnim:false}),makePiece:()=>dom.window.document.createElement('img')});
    w.shuffle=items=>[...items];instances.push(w);return w;
  };
  t.after(async()=>{for(const w of instances)await w.close();dom.window.close();});
  const w=make();await w.open();return {w,make,data,puzzles};
}

test('Elo is enabled for old progress and an unrated preference survives normalization',()=>{
  assert.equal(normalizeProgress({schema:1}).puzzleRatingEnabled,true);
  const progress=normalizeProgress({schema:1,puzzleRatingEnabled:false}),puzzle={id:'test',rating:1200};
  assert.equal(canRatePuzzle(progress,puzzle),true,'unrated mode still has puzzles to select');
  assert.equal(ratePuzzle(progress,puzzle,false,'skip'),null);
  assert.equal(progress.puzzleRating.elo,1200);assert.equal(progress.puzzleRating.played,0);
});

test('the small Elo switch persists across closing, reopening and resuming a puzzle',async t=>{
  const {w,make,data}=await setup(t),button=()=>w.root.querySelector('[data-focus=puzzle-rating-toggle]');
  assert.equal(button().getAttribute('role'),'switch');assert.equal(button().getAttribute('aria-checked'),'true');
  assert.ok(button().closest('.puzzle-elo-summary').querySelector('[data-puzzle-elo]'));
  await w.startRatedPuzzles();await w.togglePuzzleRating();
  assert.equal(button().textContent,'Rating Off');assert.equal(w.activity.rated,false);
  assert.equal(data['learning:v1'].puzzleRatingEnabled,false);assert.equal(data['learning:v1'].puzzleResume.rated,false);
  const resume=structuredClone(data['learning:v1'].puzzleResume);await w.close();
  const next=make();await next.open();await next.resume(resume);
  assert.equal(next.puzzleRatingEnabled(),false);assert.equal(next.activity.rated,false);
});

test('unrated mistakes, hints, skips and solves still save progress and leave Elo unchanged',async t=>{
  const {w,puzzles}=await setup(t);await w.togglePuzzleRating();await w.startPuzzleSelection(puzzles);
  await w.submitPuzzle('d2d4');await w.hintPuzzle();await w.skipPuzzle();
  assert.equal(w.activity.id,'two');assert.equal(w.root.querySelector('.puzzle-elo-change'),null);
  await w.submitPuzzle('e2e4');assert.equal(w.store.value.puzzles.two.clean,1);
  assert.equal(w.store.value.puzzles.one.last.skipped,true);assert.equal(w.store.value.puzzles.one.last.mistakes,1);
  assert.equal(w.store.value.puzzleRating.elo,1200);assert.equal(w.store.value.puzzleRating.played,0);
  assert.equal(w.store.value.puzzles.one.ratingResult,undefined);
});

test('reenabling Elo never rates the current unrated attempt and applies to the next puzzle',async t=>{
  const {w,puzzles}=await setup(t);await w.startPuzzleSelection(puzzles);
  await w.togglePuzzleRating();await w.submitPuzzle('d2d4');await w.togglePuzzleRating();
  assert.equal(w.puzzleRatingEnabled(),true);assert.equal(w.activity.rated,false);
  await w.skipPuzzle();assert.equal(w.activity.rated,true);assert.equal(w.store.value.puzzleRating.played,0);
  await w.submitPuzzle('e2e4');assert.equal(w.store.value.puzzleRating.elo,1224);
  assert.equal(w.store.value.puzzleRating.wins,1);
});
