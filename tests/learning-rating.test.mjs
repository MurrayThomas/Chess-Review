import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';
import {normalizeProgress, ProgressStore, recordPuzzle} from '../lib/learning/progress.js';
import {ratePuzzle, canRatePuzzle, pickRatedPuzzle, normalizePuzzleRating} from '../lib/learning/puzzle-rating.js';
import {app, loadGame} from './helpers/app.mjs';

const library=JSON.parse(fs.readFileSync(new URL('../data/learning/puzzles.json',import.meta.url))).puzzles;
const mate={...library.find(p=>p.themes.includes('mateIn1')),rating:1200};
const line={...library.find(p=>p.solution.length>=5),rating:1200};
const fresh=()=>normalizeProgress(null);
const wrongMove=puzzle=>new Chess(puzzle.fen).moves({verbose:true}).find(m=>m.lan!==puzzle.solution[0]&&!new Chess(m.after).isCheckmate()).lan;

async function setup(t,{puzzles=[mate,line],initial={},onWrong=()=>{}}={}) {
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data=structuredClone(initial),state={fail:false},instances=[];
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){if(state.fail)throw Error('Unavailable');Object.assign(data,structuredClone(values));}};
  const make=()=>{
    const w=new LearningWorkspace({document:dom.window.document,storage,makePiece:()=>dom.window.document.createElement('span'),onPuzzleWrong:onWrong});
    instances.push(w);return w;
  };
  t.after(async()=>{state.fail=false;for(const w of instances)await w.close();dom.window.close();});
  const w=make();await w.open();return {w,make,dom,data,state};
}

test('Elo compares the player with puzzle difficulty and calibrates faster for the first twenty puzzles',()=>{
  for(const won of [true,false]) {
    const p=fresh(),r=ratePuzzle(p,mate,won,won?'solved':'wrong');
    assert.equal(r.delta,won?24:-24);assert.equal(p.puzzleRating.elo,won?1224:1176);
    assert.equal(p.puzzleRating.played,1);assert.equal(p.puzzleRating.wins,Number(won));assert.equal(p.puzzleRating.losses,Number(!won));
    p.puzzleRating={elo:1200,wins:10,losses:10,played:20};
    assert.equal(ratePuzzle(p,{...mate,id:'new'},won,'test').delta,won?12:-12);
  }
  assert.ok(ratePuzzle(fresh(),{...mate,rating:1600},true,'solved').delta>ratePuzzle(fresh(),{...mate,rating:800},true,'solved').delta);
  assert.ok(ratePuzzle(fresh(),{...mate,rating:800},false,'wrong').delta<ratePuzzle(fresh(),{...mate,rating:1600},false,'wrong').delta);
});

test('one puzzle can change Elo once: losing, retrying and later completing never award or deduct again',()=>{
  const p=fresh();ratePuzzle(p,mate,false,'wrong');
  for(let i=0;i<4;i++)assert.equal(ratePuzzle(p,mate,false,'wrong'),null);
  assert.equal(ratePuzzle(p,mate,true,'solved'),null);assert.equal(p.puzzleRating.elo,1176);assert.equal(p.puzzleRating.played,1);
  recordPuzzle(p,mate.id,{completed:true,mistakes:3});assert.equal(p.puzzles[mate.id].clean,0);assert.equal(p.puzzles[mate.id].recovered,1);
  const q=fresh();ratePuzzle(q,mate,true,'solved');assert.equal(ratePuzzle(q,mate,false,'wrong'),null);assert.equal(q.puzzleRating.elo,1224);
});

test('older progress gains a provisional rating without erasing lessons, resumes or puzzle history',()=>{
  const old={schema:1,lessons:{fork:{status:'completed'}},puzzles:{old:{clean:2,attempts:2}},resume:{kind:'puzzle',id:'x',step:2}};
  const p=normalizeProgress(old);assert.deepEqual(p.puzzleRating,{elo:1200,played:0,wins:0,losses:0});
  assert.deepEqual(p.lessons,old.lessons);assert.deepEqual(p.resume,old.resume);assert.equal(canRatePuzzle(p,{id:'old'}),false);
  assert.deepEqual(normalizePuzzleRating({elo:NaN,wins:-1,losses:'3'}),p.puzzleRating);
});

test('pairing prefers unseen puzzles within 200 Elo, adapts to rating, and falls back to nearest available puzzles',()=>{
  const p=fresh(),puzzles=[600,1100,1250,1800,2200].map(rating=>({id:String(rating),rating}));
  assert.equal(pickRatedPuzzle(puzzles,p,{random:()=>0}).rating,1100);
  assert.equal(pickRatedPuzzle(puzzles,p,{random:()=>.99}).rating,1250);
  p.puzzleRating={elo:1800,wins:20,losses:0};assert.equal(pickRatedPuzzle(puzzles,p).rating,1800);
  ratePuzzle(p,puzzles[3],false,'wrong');assert.notEqual(pickRatedPuzzle(puzzles,p)?.id,'1800');
  assert.equal(pickRatedPuzzle([{id:'far',rating:3000}],p).rating,3000);
  assert.equal(pickRatedPuzzle(puzzles,p,{seen:new Set(puzzles.map(x=>x.id))}),null);
});

test('two review tabs racing to rate the same puzzle commit exactly one result',async()=>{
  let queue=Promise.resolve();const locks={request(name,job){const next=queue.then(job);queue=next.catch(()=>{});return next;}};
  const data={},storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){Object.assign(data,structuredClone(values));}};
  const a=new ProgressStore(storage,locks),b=new ProgressStore(storage,locks);
  await Promise.all([a.update(p=>ratePuzzle(p,mate,false,'wrong')),b.update(p=>ratePuzzle(p,mate,true,'solved'))]);
  await a.load();assert.equal(a.value.puzzleRating.played,1);assert.equal(a.value.puzzleRating.elo,1176);
});

test('wrong answers play the practice cue, keep the position and lower Elo once across retries, completion and reopening',async t=>{
  let cues=0;const {w,data,make}=await setup(t,{onWrong:()=>cues++});
  await w.startPuzzleSelection([mate]);const fen=w.currentFen();
  await w.submitPuzzle(wrongMove(mate));assert.equal(cues,1);assert.equal(w.currentFen(),fen);assert.equal(w.activity.step,0);
  assert.equal(w.store.value.puzzleRating.elo,1176);assert.equal(w.root.querySelectorAll('.puzzle-wrong').length,2);
  assert.match(w.root.textContent,/Wrong move — try again/);assert.match(w.root.textContent,/-24 Elo/);
  await w.submitPuzzle(wrongMove(mate));assert.equal(cues,2);assert.equal(w.store.value.puzzleRating.elo,1176);
  await w.submitPuzzle(mate.solution[0]);assert.equal(w.feedback.status,'completed');assert.equal(w.store.value.puzzleRating.elo,1176);
  assert.equal(w.store.value.puzzles[mate.id].clean,0);assert.equal(w.store.value.puzzles[mate.id].recovered,1);
  await w.preparePuzzle(mate);await w.submitPuzzle(wrongMove(mate));assert.equal(w.store.value.puzzleRating.elo,1176);
  const resume=structuredClone(data['learning:v1'].resume);await w.close();const reopened=make();await reopened.open();await reopened.resume(resume);
  await reopened.submitPuzzle(wrongMove(mate));assert.equal(reopened.store.value.puzzleRating.elo,1176);
  await reopened.submitPuzzle(mate.solution[0]);assert.equal(reopened.store.value.puzzleRating.played,1);
});

test('the review entry wires puzzle failures to the existing practice wrong sound',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles:[mate]})}));
  let cues=0;a.replace('playWrongSound',()=>cues++);a.state.settings.learningTransition='morph4';
  await a.call('openLearning');const w=a.run('learningWorkspace');await w.startPuzzleSelection([mate]);
  await w.submitPuzzle(wrongMove(mate));assert.equal(cues,1);await w.close();
});

test('a correct full line earns Elo once; partial moves, illegal input and memorized repeats do not',async t=>{
  const {w,make,data}=await setup(t);await w.startPuzzleSelection([line]);
  await w.submitPuzzle('a1a1');assert.equal(w.feedback.status,'illegal');assert.equal(w.store.value.puzzleRating.played,0);
  await w.submitPuzzle(line.solution[0]);assert.equal(w.store.value.puzzleRating.played,0);assert.equal(w.activity.step,2);
  const resume=structuredClone(data['learning:v1'].resume);await w.close();const next=make();await next.open();await next.resume(resume);
  while(!next.attemptRecorded)await next.submitPuzzle(line.solution[next.activity.step]);
  assert.equal(next.store.value.puzzleRating.elo,1224);assert.equal(next.store.value.puzzleRating.wins,1);
  await next.preparePuzzle(line);while(!next.attemptRecorded)await next.submitPuzzle(line.solution[next.activity.step]);
  assert.equal(next.store.value.puzzleRating.elo,1224);assert.equal(next.store.value.puzzles[line.id].clean,2);
});

for(const action of ['hintPuzzle','revealPuzzle','skipPuzzle'])test(`${action} records one loss and cannot add another after a wrong answer`,async t=>{
  const {w}=await setup(t);await w.startPuzzleSelection([mate]);
  await w[action]();assert.equal(w.store.value.puzzleRating.elo,1176);assert.equal(w.store.value.puzzleRating.played,1);
  await w.preparePuzzle(mate);await w.submitPuzzle(wrongMove(mate));await w.revealPuzzle();
  assert.equal(w.store.value.puzzleRating.elo,1176);assert.equal(w.store.value.puzzleRating.played,1);
});

test('failed rating writes recover once, even after repeated mistakes and closing learning',async t=>{
  const {w,state,make}=await setup(t);await w.startPuzzleSelection([mate]);state.fail=true;
  await w.submitPuzzle(wrongMove(mate));await w.submitPuzzle(wrongMove(mate));await w.submitPuzzle(mate.solution[0]);
  assert.equal(w.failedChanges.length,3);assert.equal(w.store.value.puzzleRating.played,0);await w.close();
  const next=make();await next.open();state.fail=false;await Promise.all([next.retrySave(),next.retrySave()]);
  assert.equal(next.store.value.puzzleRating.elo,1176);assert.equal(next.store.value.puzzleRating.played,1);
  assert.equal(next.store.value.puzzles[mate.id].recovered,1);assert.equal(next.failedChanges.length,0);
});

test('adaptive practice resumes, pairs from current Elo after each result, and finishes when no new puzzles remain',async t=>{
  const puzzles=[{...mate,id:'a',rating:1100},{...mate,id:'b',rating:1250}];
  const {w,make,data}=await setup(t,{puzzles});await w.startRatedPuzzles();assert.equal(w.queue.length,1);assert.equal(w.activity.adaptive,true);
  const first=puzzles.find(p=>p.id===w.activity.id);await w.submitPuzzle(wrongMove(first));
  const resume=structuredClone(data['learning:v1'].resume);await w.close();const next=make();await next.open();await next.resume(resume);
  await next.submitPuzzle(first.solution[0]);const lost=next.store.value.puzzleRating.elo;
  await next.nextPuzzle();assert.notEqual(next.activity.id,first.id);assert.equal(next.activity.adaptive,true);
  const second=puzzles.find(p=>p.id===next.activity.id);assert.ok(Math.abs(second.rating-lost)<=200);
  await next.submitPuzzle(second.solution[0]);assert.ok(next.store.value.puzzleRating.elo>lost);
  await next.nextPuzzle();assert.equal(next.activity,null);assert.equal(next.ratedLibraryComplete,true);
  await next.startRatedPuzzles();assert.equal(next.activity,null);
});

test('Black-to-move puzzle history retains its real move numbers and side labels',async t=>{
  const puzzle=library.find(p=>p.fen.split(' ')[1]==='b'&&p.solution.length>=3);
  const {w}=await setup(t,{puzzles:[puzzle]});await w.startPuzzleSelection([puzzle]);await w.submitPuzzle(puzzle.solution[0]);
  const spans=[...w.root.querySelectorAll('.puzzle-played-line span')];
  const move=Number(puzzle.fen.split(' ')[5]);assert.ok(spans[0].textContent.startsWith(move+'… '));assert.ok(spans[1].textContent.startsWith((move+1)+'. '));
});

test('rapid duplicate starts and wrong submissions create one active puzzle and one rating loss',async t=>{
  const {w}=await setup(t);await Promise.all([w.startRatedPuzzles(),w.startRatedPuzzles()]);assert.equal(w.queue.length,1);
  const puzzle=w.puzzles.find(p=>p.id===w.activity.id);const wrong=wrongMove(puzzle);
  await Promise.all([w.submitPuzzle(wrong),w.submitPuzzle(wrong)]);
  assert.equal(w.activity.mistakes,1);assert.equal(w.store.value.puzzleRating.losses,1);
});
