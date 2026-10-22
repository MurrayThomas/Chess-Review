import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {LearningWorkspace} from '../lib/learning/workspace.js';
import {LESSONS, OPENINGS, linePositions} from '../lib/learning/content.js';
import {validateExercise} from '../lib/learning/validation.js';
import {app, loadGame, branch} from './helpers/app.mjs';

const library=JSON.parse(fs.readFileSync(new URL('../data/learning/puzzles.json',import.meta.url)));
const savedFetch=globalThis.fetch;
globalThis.fetch=async()=>({ok:true,async json(){return structuredClone(library);}});
test.after(()=>{globalThis.fetch=savedFetch;});
const settle=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
async function workspace(t,options={}) {
  const dom=new JSDOM('<div id="root"><div class="app"><button id="entry">Learn</button></div></div>',{url:'https://extension.test'});
  const data={},storage={async get(key){return {[key]:structuredClone(data[key])};},async set(values){Object.assign(data,structuredClone(values));}};
  const w=new LearningWorkspace({document:dom.window.document,storage,makePiece:(type,color)=>{const img=dom.window.document.createElement('img');img.className='piece-img';img.dataset.piece=color+type;return img;},...options});
  t.after(async()=>{await w.close();dom.window.close();});await w.open();return {w,dom,data};
}
test('puzzle entry, loading errors, filtered empty states and focus restoration all work',async t=>{
  const {w,dom}=await workspace(t);const doc=dom.window.document;
  assert.ok(doc.querySelector('.learning-workspace'));assert.equal(doc.querySelector('.app').inert,true);
  assert.equal(w.page,'puzzles');assert.deepEqual([...w.root.querySelectorAll('.learn-nav button')].map(n=>n.textContent),['Puzzles','Concepts','Openings']);
  await w.navigate('concepts');w.filters.search='no such topic';w.render();assert.ok(w.root.querySelector('.learn-empty'));
  w.root.querySelector('.learn-empty button').click();assert.ok(w.root.textContent.includes('Develop your pieces'));
  await w.navigate('openings');w.filters.search='no such opening';w.render();assert.ok(w.root.querySelector('.learn-empty'));
  const old=globalThis.fetch;globalThis.fetch=async()=>{throw Error('Offline library missing');};await w.load();assert.match(w.root.textContent,/Offline library missing/);
  globalThis.fetch=old;await w.load();assert.equal(w.ready,true);await w.close();assert.equal(doc.querySelector('.app').inert,false);
});
test('square exercise uses selection, alternative answers, lesson completion and durable difficult-exercise tracking',async t=>{
  const {w,data}=await workspace(t);await w.startLesson('outpost');await w.lessonTab('practise');
  w.root.querySelector('[data-square="e5"]').click();assert.deepEqual([...w.marked],['e5']);
  await w.submitExercise(['e5']);assert.equal(w.feedback.status,'correct');assert.equal(w.store.value.lessons.outpost.exercises[0].passed,true);
  w.activity.exercise=1;w.clearAnswer();w.render();await w.submitExercise(1);assert.equal(w.store.value.lessons.outpost.exercises[1].struggled,true);
  await w.submitExercise(0);assert.equal(w.store.value.lessons.outpost.status,'completed');assert.equal(w.store.value.lessons.outpost.exercises[1].struggled,false);
  assert.equal(data['learning:v1'].resume,null);
});
test('inconclusive exercise feedback records neither a mistake nor completion',async t=>{
  const {w}=await workspace(t);await w.startLesson('fork');await w.lessonTab('practise');
  w.checkExercise=async(ex,answer)=>validateExercise(ex,answer,{maxNodes:1});
  await w.submitExercise('e4f6');assert.equal(w.feedback.status,'inconclusive');assert.deepEqual(w.store.value.lessons.fork.exercises,{});
});
test('the difficult-exercise library resumes the actual exercise that needs another attempt',async t=>{
  const {w}=await workspace(t);await w.startLesson('outpost');await w.lessonTab('practise');w.activity.exercise=1;await w.submitExercise(1);
  await w.navigate('concepts');w.filters.status='Struggled';await w.startLesson('outpost');
  assert.equal(w.activity.tab,'practise');assert.equal(w.activity.exercise,1);
});
test('board click input, keyboard navigation and opening replies support both colors',async t=>{
  const {w,dom}=await workspace(t);await w.startOpening('italian');w.activity.practice=true;w.activity.ply=0;w.render();
  w.root.querySelector('[data-square="e2"]').click();w.root.querySelector('[data-square="e4"]').click();await settle();
  assert.equal(w.activity.ply,2);assert.match(w.feedback.feedback,/opponent has replied/);
  const square=w.root.querySelector('[data-square="a8"]');square.focus();square.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(dom.window.document.activeElement.dataset.square,'b8');
  await w.startOpening('italian',{color:'b',practice:true});assert.equal(w.activity.ply,1);assert.equal(w.flipped,true);
  await w.submitOpening('e7e5');assert.equal(w.activity.ply,3);assert.equal(w.openingState.positions.length,11);
});
test('each opening practice line completes from both sides and legal deviations stay neutral',async t=>{
  const {w}=await workspace(t);
  for(const o of OPENINGS)for(let line=0;line<o.lines.length;line++)for(const color of ['w','b']) {
    await w.startOpening(o.id,{line,color,practice:true});const state=linePositions(o.lines[line]);
    while(w.activity.ply<state.moves.length)await w.submitOpening(state.moves[w.activity.ply]);
    assert.equal(w.feedback.status,'completed');assert.ok(w.store.value.openings[o.id].completed[line+':'+color]);
  }
  assert.ok(OPENINGS.every(o=>w.store.value.openings[o.id].status==='completed'));
  await w.startOpening('italian',{practice:true});await w.submitOpening('d2d4');assert.equal(w.activity.ply,0);assert.equal(w.feedback.status,'info');assert.match(w.feedback.feedback,/does not mean it is a bad move/);
  await w.startOpening('italian',{practice:true,color:'b',ply:5});await w.submitOpening('g8f6');assert.equal(w.activity.line,1);assert.equal(w.activity.ply,7);
});
test('puzzles hide solution information, persist intermediate steps and distinguish assisted and repeat solves',async t=>{
  const {w,data}=await workspace(t);const p=w.puzzles.find(p=>p.solution.length>=3);
  await w.startPuzzleSelection([p]);assert.ok(!w.root.textContent.includes('Why the solution works'));assert.equal(w.root.querySelectorAll('.annotated').length,0);
  assert.equal(w.root.querySelector('[data-focus="puzzle-hint"]').hasAttribute('title'),false);
  assert.equal(w.root.querySelector('.puzzle-practice-status').textContent,p.fen.split(' ')[1]==='w'?'White to move':'Black to move');
  assert.equal(w.root.querySelector('.puzzle-practice-status').classList.contains('puzzle-quiet-status'),false);
  await w.submitPuzzle(p.solution[0]);assert.equal(w.activity.step,2);assert.equal(data['learning:v1'].resume.step,2);
  const resume=structuredClone(data['learning:v1'].resume);await w.navigate('home');await w.resume(resume);assert.equal(w.activity.step,2);
  while(!w.attemptRecorded)await w.submitPuzzle(p.solution[w.activity.step]);assert.equal(w.store.value.puzzles[p.id].clean,1);
  assert.equal(w.root.querySelector('.puzzle-explanation, .puzzle-completion'),null);assert.equal(w.root.textContent.includes('View solution'),false);
  await w.preparePuzzle(p);await w.hintPuzzle();assert.equal(w.activity.assisted,true);assert.equal(w.root.querySelectorAll('.puzzle-hint-square').length,1);
  w.root.querySelector(`[data-square="${p.solution[0].slice(0,2)}"]`).click();
  assert.equal(w.root.querySelectorAll('.puzzle-hint-square').length,1);assert.equal(w.root.querySelectorAll('.annotated').length,0);
  await w.revealPuzzle();assert.equal(w.store.value.puzzles[p.id].assisted,1);assert.equal(w.store.value.puzzles[p.id].clean,1);
  assert.equal(w.root.querySelector('.puzzle-explanation, .puzzle-completion'),null);assert.equal(w.root.textContent.includes('View solution'),false);
  await w.preparePuzzle(p);while(!w.attemptRecorded)await w.submitPuzzle(p.solution[w.activity.step]);assert.equal(w.store.value.puzzles[p.id].clean,2);
});

test('the puzzle header returns to the library, preserves the attempt and then returns to review',async t=>{
  const {w}=await workspace(t),p=w.puzzles.find(p=>p.solution.length>=3);
  const back=()=>w.root.querySelector('.learn-header [data-focus="review"]');
  assert.equal(back().textContent,'← Back to review');
  await w.startPuzzleSelection([p],null,{adaptive:true});await w.submitPuzzle(p.solution[0]);
  const step=w.activity.step,fen=w.currentFen(),elo=w.store.value.puzzleRating.elo;
  assert.equal(back().textContent,'← Back to puzzles');assert.equal(w.root.querySelector('.puzzle-practice-heading button, .puzzle-back'),null);
  back().click();await settle();assert.equal(w.closed,false);assert.equal(w.activity,null);assert.equal(w.page,'puzzles');assert.equal(back().textContent,'← Back to review');
  assert.equal(w.store.value.puzzleResume.step,step);assert.equal(w.store.value.puzzleRating.elo,elo);
  await w.startRatedPuzzles();assert.equal(w.activity.id,p.id);assert.equal(w.currentFen(),fen);assert.equal(back().textContent,'← Back to puzzles');
  back().click();await settle();back().click();await settle();assert.equal(w.closed,true);assert.equal(w.root.isConnected,false);
});

test('returning from a timed puzzle ends and saves its run before showing the puzzle library',async t=>{
  const {w}=await workspace(t);await w.startChallenge(60);
  const run=w.run;w.root.querySelector('.learn-header [data-focus="review"]').click();await settle();
  assert.equal(w.closed,false);assert.equal(w.run,null);assert.equal(run.clock.runningAt,null);assert.equal(w.activity,null);assert.equal(w.result,null);assert.equal(w.page,'puzzles');
  assert.equal(w.store.value.challenges.length,1);assert.equal(w.root.querySelector('.learn-header [data-focus="review"]').textContent,'← Back to review');
});
test('timed challenges start ready, count mistakes/skips/assistance and save personal best and review list',async t=>{
  const {w}=await workspace(t);const first=w.puzzles.find(p=>p.theme==='mateIn1'),second=w.puzzles.find(p=>p.theme==='fork');
  w.shuffle=()=>[first,second];await w.startChallenge(60);assert.ok(w.run.clock.started);assert.equal(w.root.querySelector('#learn-clock').textContent,'1:00');
  await w.revealPuzzle();assert.equal(w.run.solved,0);assert.equal(w.run.assisted,1);await w.nextPuzzle();
  const wrong=new (await import('../lib/chess.js')).Chess(second.fen).moves({verbose:true}).find(m=>m.lan!==second.solution[0]);
  await w.submitPuzzle(wrong.lan);assert.equal(w.run.mistakes,1);await w.skipPuzzle();assert.equal(w.run,null);
  assert.equal(w.result.assisted,1);assert.equal(w.result.mistakes,1);assert.equal(w.result.skips,1);assert.ok(w.result.missed.includes(second.id));assert.ok(w.store.value.challenges.length);
});
test('all timed modes end at expiry before accepting another answer; partially hinted puzzles enter review',async t=>{
  const {w}=await workspace(t);for(const duration of [60,300,600]){
    await w.startChallenge(duration);await w.hintPuzzle();w.run.clock.remainingMs=0;w.run.clock.runningAt=null;
    await w.submitPuzzle(w.puzzles.find(p=>p.id===w.activity.id).solution[0]);
    assert.equal(w.run,null);assert.equal(w.result.solved,0);assert.equal(w.result.missed.length,1);assert.equal(w.store.value.bests[duration],0);
  }
});
test('review game, move, board orientation and keyboard state survive learning on its own fresh board',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5 2. Nf3 Nc6');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  a.call('go',2);a.state.flipped=true;a.call('buildBoard');const before={idx:a.state.idx,flipped:a.state.flipped,pgn:a.state.pgn,positions:a.state.positions};
  await a.call('openLearning');const w=a.run('learningWorkspace');assert.ok(w.ready);
  assert.equal(w.currentFen(),new Chess().fen());assert.equal(w.activity,null);
  a.dom.window.document.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  assert.equal(a.state.idx,before.idx);await w.startOpening('italian');await w.submitOpening('e2e4');await w.close();
  assert.equal(a.state.idx,before.idx);assert.equal(a.state.flipped,before.flipped);assert.equal(a.state.pgn,before.pgn);assert.equal(a.state.positions,before.positions);
  a.dom.window.document.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(a.state.idx,before.idx+1);
});

test('concept promotions use piece images for board moves and unspecified typed promotions',async t=>{
  const {w,dom}=await workspace(t);await w.startLesson('promotion');await w.lessonTab('practise');
  w.root.querySelector('[data-square=e7]').click();w.root.querySelector('[data-square=e8]').click();
  assert.deepEqual([...w.root.querySelectorAll('.promotion-options img')].map(n=>n.dataset.piece),['wq','wr','wb','wn']);
  w.root.querySelector('[aria-label="Promote to bishop"]').click();await settle();assert.equal(w.feedback.status,'correct');
  await w.lessonTab('practise');const input=w.root.querySelector('[aria-label="Enter a chess move"]');input.value='e7e8';
  input.closest('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(w.root.querySelector('[aria-label="Promotion piece"]'),null);assert.equal(w.root.querySelectorAll('.promotion-options img').length,4);
  w.root.querySelector('[aria-label="Promote to knight"]').click();await settle();assert.equal(w.feedback.status,'correct');
});
test('entering learning leaves a playing analysis variation and glides from it into a fresh untinted board',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5 2. Nf3 Nc6');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  a.replace('requestLiveEval',async()=>{});const v=branch(a,0,1),source=v.positions[v.idx].fen,routes=[];
  t.mock.method(LearningWorkspace.prototype,'arrangePuzzlePieces',async function(from,to){routes.push({from,to});});
  a.call('paintBoard');a.call('startLineWalk');assert.equal(a.state.lineWalking,true);
  await a.call('openLearning');assert.equal(a.state.lineWalking,false);const w=a.run('learningWorkspace');
  assert.equal(a.state.analysisMode,false);assert.equal(a.state.variation,null);assert.equal(w.currentFen(),new Chess().fen());
  assert.equal(a.dom.window.document.querySelector('.board').classList.contains('analysis'),false);
  assert.deepEqual(routes,[{from:{fen:source,flipped:false},to:{fen:new Chess().fen(),flipped:false}}]);
  await w.startLesson('chain');w.flipped=!w.flipped;await w.close();
  assert.equal(a.state.analysisMode,false);assert.equal(a.state.variation,null);assert.equal(a.state.lineWalking,false);
  assert.equal(a.call('activePos').fen,a.state.positions[a.state.idx].fen);
  assert.equal(a.dom.window.document.querySelector('.board').classList.contains('analysis'),false);
});

test('in-place learning preserves the actual board and topbar across all destinations and restores review input',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5 2. Nf3 Nc6');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  const doc=a.dom.window.document,board=doc.querySelector('.board'),topbar=doc.querySelector('.topbar'),squares=[...board.children];
  const wrap=doc.querySelector('#boardWrap'),parent=wrap.parentNode;
  await a.call('openLearning');const w=a.run('learningWorkspace');
  assert.ok(w.embedded);assert.ok(doc.querySelector('.learning-embedded'));assert.notEqual(doc.querySelector('.app').inert,true);
  assert.equal(doc.querySelector('.topbar'),topbar);assert.equal(doc.querySelector('.board'),board);
  assert.equal(board.querySelectorAll('[data-square]').length,64);assert.equal(board.inert,false);assert.equal(w.currentFen(),new Chess().fen());
  a.call('toggleFlip');assert.ok(board.querySelector('.learn-square'));assert.equal(w.flipped,!a.state.flipped);
  a.call('toggleFlip');assert.equal(w.flipped,a.state.flipped);assert.equal(w.currentFen(),new Chess().fen());
  assert.ok([...doc.querySelectorAll('.mod')].every(node=>node.inert));
  await w.startLesson('outpost');await w.lessonTab('practise');
  assert.equal(doc.querySelector('.board'),board);assert.equal(doc.querySelectorAll('.learn-board').length,1);
  board.querySelector('[data-square=e5]').click();assert.ok(w.marked.has('e5'));
  await w.submitExercise(['e5']);assert.equal(w.feedback.status,'correct');
  await w.startOpening('italian',{practice:true});
  board.querySelector('[data-square=e2]').click();board.querySelector('[data-square=e4]').click();await settle();
  assert.equal(w.activity.ply,2);assert.equal(a.state.idx,0);
  const drag=new a.dom.window.Event('dragstart',{bubbles:true,cancelable:true});board.dispatchEvent(drag);assert.equal(drag.defaultPrevented,false);
  const orientation=a.state.flipped;a.call('toggleFlip');assert.equal(a.state.flipped,orientation);assert.equal(w.flipped,true);
  await w.startPuzzleSelection([w.puzzles.find(p=>p.theme==='mateIn1')]);
  assert.equal(doc.querySelector('.board'),board);assert.equal(board.querySelectorAll('.annotated').length,0);
  // An asynchronous review repaint must not overwrite the learning board.
  a.call('buildBoard');a.call('paintBoard');assert.equal(doc.querySelector('.board'),board);assert.ok(board.querySelector('.learn-square'));
  a.state.bests[0]={bestmove:'e2e4'};a.state.userArrows=[{from:'e2',to:'e4'}];a.call('refreshArrows');
  assert.equal(board.querySelector('svg'),null,'Review arrows must never appear over a learning position');
  w.shell.scrollTop=300;await w.navigate('concepts');assert.equal(w.shell.scrollTop,0);assert.equal(w.currentFen(),new Chess().fen());assert.equal(board.querySelectorAll('[data-square]').length,64);
  await w.close();assert.equal(wrap.parentNode,parent);assert.equal(doc.querySelector('.board'),board);
  assert.deepEqual([...board.querySelectorAll('.sq')],squares.filter(node=>node.classList.contains('sq')));assert.equal(board.inert,false);
  assert.ok(board.querySelector('svg.user-arrows'));
  assert.ok([...doc.querySelectorAll('.mod')].every(node=>!node.inert));assert.equal(doc.querySelector('.learn-board-placeholder'),null);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(a.state.idx,1);
});

test('old presentation preferences all select Morph 3 and Settings stays open with learning',async t=>{
  for(const settings of [{},{learningTransition:'page'},{learningTransition:'newway'},{learningPresentation:'studio'},{learningLayout:'morph'}])assert.equal(LearningWorkspace.presentationFor(settings),'morph3');
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  await a.call('toggleSettings');assert.equal(a.dom.window.document.querySelector('.learn-style-option'),null);
  await a.call('openLearning');const w=a.run('learningWorkspace'),doc=a.dom.window.document;
  assert.equal(w.presentation,'morph3');assert.equal(w.page,'puzzles');assert.ok(w.embedded);
  await a.call('toggleSettings');assert.equal(a.run('learningWorkspace'),w);assert.equal(doc.querySelector('#settings').hidden,false);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(doc.querySelector('#settings').hidden,true);assert.equal(a.run('learningWorkspace'),w);
  await w.close();await a.call('resetVisualSettings');assert.equal(a.store.settings.learningTransition,'morph3');
});

test('puzzle types and two handles on one Elo track filter the full adaptive session',async t=>{
  const {w,dom}=await workspace(t);
  const doc=dom.window.document;
  assert.equal(w.root.querySelectorAll('.learn-puzzle-start .primary').length,1);
  assert.equal(w.root.querySelector('[aria-label="Phase"]'),null);assert.equal(w.root.querySelector('[aria-label="Progress"]'),null);
  assert.doesNotMatch(w.root.textContent,/How rating works|Provisional|Unsolved|Race the clock/);
  doc.querySelector('[data-focus="theme-fork"]').click();assert.deepEqual([...w.puzzleThemes],['fork']);
  assert.ok(w.filteredPuzzles().every(p=>p.themes.includes('fork')));
  const slider=doc.querySelector('[aria-label="Minimum"]');slider.value=slider.max;slider.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  const max=Number(slider.max);assert.deepEqual(w.puzzleRange,[max-50,max]);assert.equal(doc.querySelector('[aria-label="Maximum"]').value,String(max));
  assert.equal(doc.querySelectorAll('.learn-dual-range').length,1);assert.equal(doc.querySelectorAll('.learn-dual-range input').length,2);
  assert.equal(doc.querySelector('[data-focus="solve-puzzle"]').disabled,!w.filteredPuzzles().length);
  const puzzle=w.puzzles.find(p=>p.themes.includes('fork'));w.puzzleRange=[puzzle.rating,puzzle.rating];w.render();
  await w.startRatedPuzzles();assert.equal(w.puzzles.find(p=>p.id===w.activity.id).rating,puzzle.rating);
  await w.revealPuzzle();await w.nextPuzzle();
  if(w.activity){const next=w.puzzles.find(p=>p.id===w.activity.id);assert.ok(next.themes.includes('fork'));assert.equal(next.rating,puzzle.rating);}
  await w.navigate('puzzles');w.root.querySelector('[data-focus="theme-all"]').click();assert.equal(w.puzzleThemes.size,0);
});

test('concept and opening libraries use readable rows without progress labels',async t=>{
  const {w}=await workspace(t);
  for(const page of ['concepts','openings']){
    await w.navigate(page);assert.ok(w.root.querySelectorAll('.learn-library-row').length>0);
    assert.equal(w.root.querySelector('.learn-card'),null);assert.doesNotMatch(w.root.textContent,/not started|in progress/);
  }
  assert.equal(w.root.querySelector('.learn-bookmark'),null);assert.doesNotMatch(w.root.textContent,/★|☆|Saved/);
});

test('learning keeps review panels mounted until loading finishes and can close before mounting',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  const doc=a.dom.window.document,board=doc.querySelector('.board'),wrap=doc.querySelector('#boardWrap'),parent=wrap.parentNode;
  const originalFetch=globalThis.fetch;let release;
  globalThis.fetch=()=>new Promise(resolve=>{release=()=>resolve({ok:true,json:async()=>structuredClone(library)});});
  t.after(()=>{globalThis.fetch=originalFetch;});
  const opening=a.call('openLearning'),w=a.run('learningWorkspace');
  assert.equal(doc.querySelector('.learning-active'),null);
  assert.equal(w.shell,undefined);assert.equal(wrap.parentNode,parent);
  assert.ok([...doc.querySelectorAll('.mod')].every(node=>!node.inert));
  release();await opening;
  assert.ok(doc.querySelector('.learning-active'));assert.equal(doc.querySelector('.board'),board);
  await w.close();assert.equal(wrap.parentNode,parent);

  const canceledOpening=a.call('openLearning'),canceled=a.run('learningWorkspace');
  await canceled.close();release();await canceledOpening;
  assert.equal(a.run('learningWorkspace'),null);
  assert.equal(doc.querySelector('.learning-workspace'),null);
  assert.equal(doc.querySelector('.learn-board-placeholder'),null);
  assert.equal(doc.querySelector('.board'),board);assert.equal(wrap.parentNode,parent);
});
