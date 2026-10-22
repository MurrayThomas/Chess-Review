import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';
import {ChallengeClock} from '../lib/learning/progress.js';
import {pickRunPuzzle, runPuzzleRating} from '../lib/learning/puzzle-runs.js';

const library=JSON.parse(fs.readFileSync(new URL('../data/learning/puzzles.json',import.meta.url))).puzzles;
const mate=library.find(p=>p.themes.includes('mateIn1'));
const line=library.find(p=>p.solution.length>=5);
const fixtures=Array.from({length:30},(_,i)=>({...mate,id:'run-'+i,rating:450+i*40}));
async function setup(t,{puzzles=fixtures,initial={}}={}) {
  const dom=new JSDOM('<div id="root"><div class="app"></div></div>',{url:'https://extension.test'}),data=structuredClone(initial),state={fail:false};
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({schema:1,puzzles})}));
  const storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){if(state.fail)throw Error('Unavailable');Object.assign(data,structuredClone(values));}};
  const w=new LearningWorkspace({document:dom.window.document,storage,settings:()=>({moveAnim:false}),makePiece:()=>dom.window.document.createElement('span')});
  t.after(async()=>{state.fail=false;await w.close();dom.window.close();});await w.open();
  return {w,dom,data,state};
}
const current=w=>w.puzzles.find(p=>p.id===w.activity.id);
const solve=async w=>{const id=w.activity.id;while(w.activity?.id===id)await w.submitPuzzle(current(w).solution[w.activity.step]);};
const wrong=async w=>{const p=current(w),c=new Chess(w.currentFen());await w.submitPuzzle(c.moves({verbose:true}).find(m=>m.lan!==p.solution[w.activity.step]&&!new Chess(m.after).isCheckmate()).lan);};

test('three aligned mode buttons show independent records and only normal play follows filters',async t=>{
  const {w}=await setup(t);
  await w.persist(p=>{p.bests.timeAttack=12;p.bests.knockout=7;p.puzzles.old={clean:1};});w.puzzleRange=[9000,9100];w.render();
  assert.deepEqual([...w.root.querySelectorAll('.puzzle-mode-name')].map(n=>n.textContent),['Solve a puzzle','Time attack','Knockout']);
  assert.deepEqual([...w.root.querySelectorAll('.puzzle-mode-record strong')].map(n=>n.textContent),['1','12','7']);
  assert.equal(w.root.querySelector('[data-focus=solve-puzzle]').disabled,true);
  assert.equal(w.root.querySelector('[data-focus=timeAttack]').disabled,false);
  w.root.querySelector('[data-focus=timeAttack]').click();
  for(let i=0;i<30;i++)await Promise.resolve();
  assert.equal(w.run.mode,'timeAttack');assert.ok(w.activity);
});

test('difficulty stays easy for eight puzzles then climbs without repeats in the real library',()=>{
  for(const random of [()=>0,()=>.5,()=>.999]){
    const results=[];
    for(let i=0;i<35;i++){
      const p=pickRunPuzzle(library,results,random);
      assert.ok(!results.some(r=>r.id===p.id));
      if(i<8)assert.ok(p.rating<=800);
      if(i)assert.ok(p.rating>=results.at(-1).rating||!library.some(q=>q.rating>=results.at(-1).rating&&!results.some(r=>r.id===q.id)));
      results.push({id:p.id,rating:p.rating});
    }
    assert.ok(results[20].rating>1700);assert.ok(results[34].rating>2900);
  }
  assert.equal(runPuzzleRating(7),730);assert.equal(runPuzzleRating(8),850);
  assert.equal(pickRunPuzzle([mate],[{id:mate.id,rating:mate.rating}]),null);
});

test('Time attack starts at three minutes, advances on success or failure, and ends on third mistake',async t=>{
  const {w,data}=await setup(t);await w.startPuzzleRun('timeAttack');
  assert.equal(w.root.querySelector('#learn-clock').textContent,'3:00');assert.equal(w.run.lives,3);
  assert.equal(w.root.querySelector('[data-focus=puzzle-hint]'),null);
  await solve(w);assert.equal(w.run.solved,1);assert.equal(data['learning:v1'].bests.timeAttack,1);
  const first=w.run.results[0].id;await wrong(w);
  assert.equal(w.run.lives,2);assert.equal(w.run.solved,1);assert.notEqual(w.activity.id,first);
  assert.deepEqual([...w.root.querySelectorAll('.puzzle-run-history li')].map(n=>n.getAttribute('aria-label')),['Puzzle 1: solved','Puzzle 2: incorrect']);
  await wrong(w);await wrong(w);
  assert.equal(w.run,null);assert.equal(w.result.reason,'Out of lives');assert.equal(w.result.solved,1);assert.equal(w.result.mistakes,3);
  assert.equal(w.result.results.length,4);assert.equal(data['learning:v1'].challenges.length,1);
  assert.equal(data['learning:v1'].bests.timeAttack,1);
});

test('Knockout has no timer and ends immediately on its first wrong move with its own best',async t=>{
  const {w,data}=await setup(t);await w.startPuzzleRun('knockout');
  assert.equal(w.run.clock,null);assert.equal(w.root.querySelector('[role=timer]'),null);
  await solve(w);await solve(w);assert.equal(w.run.lives,1);await wrong(w);
  assert.equal(w.run,null);assert.equal(w.result.solved,2);assert.equal(w.result.results.at(-1).correct,false);
  assert.equal(data['learning:v1'].bests.knockout,2);assert.equal(data['learning:v1'].bests.timeAttack,undefined);
  await w.startPuzzleRun('knockout');await wrong(w);assert.equal(w.result.best,2);assert.equal(w.result.personalBest,false);
  await w.navigate('puzzles');assert.equal(w.root.querySelector('[data-focus=knockout] .puzzle-mode-record strong').textContent,'2');
});

test('a partial continuation earns no point and a wrong move later in it ends Knockout',async t=>{
  const {w}=await setup(t,{puzzles:[line,...fixtures.map(p=>({...p,rating:3000}))]});
  // Make the multi-move puzzle the only easy candidate.
  w.puzzles[0]={...line,rating:400};await w.startPuzzleRun('knockout');
  await w.submitPuzzle(line.solution[0]);assert.equal(w.activity.step,2);assert.equal(w.run.solved,0);
  await wrong(w);assert.equal(w.result.solved,0);assert.equal(w.result.results.length,1);
});

test('illegal moves and assistance calls cannot consume lives or bypass run scoring',async t=>{
  const {w}=await setup(t);await w.startPuzzleRun('timeAttack');const id=w.activity.id;
  await w.submitPuzzle('a1a1');await w.hintPuzzle();await w.revealPuzzle();await w.skipPuzzle();
  assert.equal(w.activity.id,id);assert.equal(w.activity.assisted,false);assert.equal(w.run.lives,3);assert.equal(w.run.results.length,0);
});

for(const elapsed of [179999,180000])test(`Time attack ${elapsed<180000?'accepts a solve before':'rejects a solve at'} the deadline`,async t=>{
  const {w}=await setup(t);await w.startPuzzleRun('timeAttack');clearInterval(w.ticker);
  let now=0;w.run.clock=new ChallengeClock(180,()=>now);w.run.clock.ready();now=elapsed;
  await solve(w);
  if(w.run)await w.finishChallenge('Ended early');
  assert.equal(w.result.solved,elapsed<180000?1:0);
});

test('timer keeps running during replies and expiry cancels pending work without counting a partial solve',async t=>{
  const {w}=await setup(t,{puzzles:[{...line,rating:400},...fixtures.map(p=>({...p,rating:3000}))]});
  await w.startPuzzleRun('timeAttack');clearInterval(w.ticker);
  let now=0;const run=w.run;run.clock=new ChallengeClock(180,()=>now);run.clock.ready();now=179500;
  const answer=w.submitPuzzle(line.solution[0]);assert.equal(run.clock.runningAt,0);
  now=180001;await w.finishChallenge('Time is up');await answer;
  assert.equal(w.activity,null);assert.equal(w.busy,false);assert.equal(w.result.solved,0);assert.equal(w.result.results.length,0);
});

test('records survive reloads and run completion preserves normal Elo, statistics and resume',async t=>{
  const {w,data}=await setup(t);await w.startRatedPuzzles();await w.navigate('puzzles');const before=structuredClone(data['learning:v1']);
  await w.startPuzzleRun('timeAttack');await solve(w);await w.finishChallenge('Ended early');
  assert.deepEqual(data['learning:v1'].puzzleRating,before.puzzleRating);
  assert.deepEqual(data['learning:v1'].puzzles,before.puzzles);assert.deepEqual(data['learning:v1'].puzzleResume,before.puzzleResume);
  assert.deepEqual(data['learning:v1'].resume,before.resume);
  await w.store.load();assert.equal(w.store.value.bests.timeAttack,1);
});

test('failed record writes recover once and leaving ends the run without creating an extra puzzle result',async t=>{
  const {w,data,state}=await setup(t);await w.startPuzzleRun('knockout');state.fail=true;await solve(w);
  assert.equal(w.failedChanges.length,1);state.fail=false;await w.retrySave();assert.equal(data['learning:v1'].bests.knockout,1);
  await w.finishChallenge('Ended on return to puzzles',false);await w.navigate('puzzles');
  assert.equal(w.run,null);assert.equal(w.result,null);assert.equal(data['learning:v1'].challenges.length,1);
  assert.equal(data['learning:v1'].challenges[0].results.length,1);
});
