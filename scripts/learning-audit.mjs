import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

export async function auditLearning({review,call,evaluate,waitFor,sleep,out}) {
  const run=expression=>evaluate(review,expression),results=[];
  const geometry="(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right}};return {board:rect('.board'),panel:rect('.learn-shell')}})()";
  const capture=async label=>{
    const data=await run(geometry);
    const bounds=await run("({width:innerWidth,scroll:document.querySelector('.learning-workspace').scrollWidth,stacked:document.querySelector('.learning-workspace').classList.contains('learn-stacked')})");
    assert.ok(bounds.scroll<=bounds.width+1,label+': horizontal overflow');
    assert.ok(data.board.x>=0&&data.board.right<=bounds.width+1,label+': board outside viewport');
    assert.ok(Math.abs(data.board.width-data.board.height)<1,label+': board must stay square');
    assert.ok(data.panel.x>=0&&data.panel.right<=bounds.width+1,label+': panel outside viewport');
    const shot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);
    await fs.writeFile(path.join(out,label+'.png'),Buffer.from(shot.data,'base64'));results.push({label,...data,...bounds});
  };
  await run("import('./analysis.js').then(m=>{m.go(2);m.toggleFlip();})");
  const before=await run("import('./analysis.js').then(m=>({idx:m.S.idx,flipped:m.S.flipped,pgn:m.S.pgn,evals:JSON.stringify(m.S.evals)}))");
  await run("window.auditBoard=document.querySelector('.board');window.auditFrames=[];window.auditSampling=true;function sample(){const r=auditBoard.getBoundingClientRect();auditFrames.push({x:r.x,y:r.y,width:r.width,height:r.height});if(auditSampling)requestAnimationFrame(sample);}requestAnimationFrame(sample);");
  await run("document.querySelector('.learn-entry-button').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace?.ready&&!m.learningWorkspace.transitioning)",'Learning expansion');
  await run('auditSampling=false');
  const frames=await run('auditFrames');
  assert.ok(frames.length>10,'Board expansion must be observable across frames');
  for(const frame of frames)assert.ok(Math.abs(frame.width-frame.height)<1,'Animation distorts board');
  const first=frames[0],last=frames.at(-1);
  assert.ok(last.width>first.width,'Desktop board should expand');
  assert.ok(last.x<first.x&&first.x-last.x<=81,'Board expansion should stay bounded');
  assert.ok(last.width-first.width>32,'Board should expand more than the previous size');
  assert.ok(Math.abs(last.x+last.width-first.x-first.width)<1,'Original right edge must remain fixed');
  assert.ok(Math.abs(last.y-first.y)<1,'Original top edge must remain fixed');
  for(const frame of frames)assert.ok(frame.y>=Math.min(first.y,last.y)-1,'Board bounces above the expansion path');
  assert.deepEqual(await run("[...document.querySelectorAll('.learn-nav button')].map(n=>n.textContent)"),['Puzzles','Concepts','Openings']);
  assert.equal(await run("document.querySelector('.board')===auditBoard"),true);
  assert.equal(await run("document.querySelector('.learn-puzzle-start .primary').textContent"),'Solve a puzzle');
  assert.equal(await run("!!document.querySelector('[aria-label=Phase], [aria-label=Progress], .learn-style-option')"),false);
  await capture('puzzles-desktop');
  assert.ok((await run(geometry)).panel.x>first.x+first.width,'Learning controls must stay beside the original board');
  assert.equal(await run("document.querySelectorAll('.learn-dual-range').length"),1);
  const handles=await run("(()=>{const n=document.querySelector('[aria-label=Minimum]'),r=n.getBoundingClientRect();return {x:r.x+10,y:r.y+r.height/2,width:r.width}})()");
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:handles.x,y:handles.y,button:'left',clickCount:1},review.sessionId);
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:handles.x+handles.width*.15,y:handles.y,button:'left',buttons:1},review.sessionId);
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:handles.x+handles.width*.15,y:handles.y,button:'left',clickCount:1},review.sessionId);
  assert.ok(await run("Number(document.querySelector('[aria-label=Minimum]').value)>Number(document.querySelector('[aria-label=Minimum]').min)"),'Native lower handle must be draggable');
  await run("[...document.querySelectorAll('.learn-puzzle-options button')].find(n=>n.textContent==='Reset').click()");
  // Inspect every return frame: the exact same styled inputs must survive until
  // their original learning root is removed, with no duplicate/native sliders.
  await run("(()=>{const low=document.querySelector('[aria-label=Minimum]'),high=document.querySelector('[aria-label=Maximum]');low.value=1000;low.dispatchEvent(new Event('input',{bubbles:true}));high.value=2400;high.dispatchEvent(new Event('input',{bubbles:true}));window.auditSlider=low;window.auditShell=document.querySelector('.learn-shell');auditShell.scrollTop=120;window.sliderFrames=[];window.sampleSliders=true;function sample(){if(auditSlider.isConnected){sliderFrames.push({same:document.querySelector('[aria-label=Minimum]')===auditSlider,count:document.querySelectorAll('[aria-label=Minimum]').length,appearance:getComputedStyle(auditSlider).appearance,context:!!auditSlider.closest('.learning-workspace'),value:auditSlider.value,scroll:auditShell.scrollTop});}if(sampleSliders)requestAnimationFrame(sample);}requestAnimationFrame(sample);})()");
  await run("import('./analysis.js').then(m=>{void m.learningWorkspace.close();})");
  await sleep(60);
  assert.equal(await run("document.getAnimations().some(a=>a.effect?.target===auditShell)"),true,'Return should animate the live shell');
  const returning=await call('Page.captureScreenshot',{format:'png'},review.sessionId);
  await fs.writeFile(path.join(out,'return-live-controls.png'),Buffer.from(returning.data,'base64'));
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace)",'Return transition');
  await run('sampleSliders=false');
  const sliderFrames=await run('sliderFrames');assert.ok(sliderFrames.length>10);
  for(const frame of sliderFrames){assert.equal(frame.same,true);assert.equal(frame.count,1);assert.equal(frame.appearance,'none');assert.equal(frame.context,true);assert.equal(frame.value,'1000');assert.ok(Math.abs(frame.scroll-120)<1,'Scroll should retain its browser-rounded offset');}
  await run("import('./analysis.js').then(m=>{void m.openLearning();})");
  await waitFor(review,"import('./analysis.js').then(m=>!!m.learningWorkspace?.shell)",'Quick entry');await sleep(100);
  await run("import('./analysis.js').then(m=>{const rect=()=>{const r=document.querySelector('.board').getBoundingClientRect();return {width:r.width,right:r.right,top:r.top}};window.reverseFrames=[rect()];window.sampleReverse=true;function sample(){reverseFrames.push(rect());if(sampleReverse)requestAnimationFrame(sample);}requestAnimationFrame(sample);void m.learningWorkspace.close();})");
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace)",'Quick reversal');
  await run('sampleReverse=false');
  const reverseFrames=await run('reverseFrames');
  await fs.writeFile(path.join(out,'reverse-frames.json'),JSON.stringify(reverseFrames,null,2));
  for(const frame of reverseFrames){assert.ok(frame.width<=reverseFrames[0].width+1,'A quick reversal must not jump to the fully expanded size');assert.ok(Math.abs(frame.right-reverseFrames[0].right)<1,'A quick reversal must keep the original right edge');}
  assert.equal(await run("!!document.querySelector('.learn-transition-surface, .learn-swoop-anchor')"),false);
  await run("import('./analysis.js').then(m=>m.openLearning())");
  const closed=await run(geometry);
  await run("document.querySelector('[aria-label=Settings]').click()");await sleep(200);
  assert.deepEqual(await run(geometry),closed,'Settings moved the learning scene');
  assert.equal(await run("document.querySelector('.learn-shell').getBoundingClientRect().right<document.querySelector('#settings').getBoundingClientRect().left"),true,'Settings overlaps the study panel');
  await capture('puzzles-settings');
  await run("document.querySelector('[aria-label=Settings]').click();document.querySelector('[data-focus=theme-fork]').click()");
  assert.equal(await run("import('./analysis.js').then(m=>m.learningWorkspace.filteredPuzzles().every(p=>p.themes.includes('fork')))"),true);
  await run("document.querySelector('[data-focus=solve-puzzle]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.activity?.kind==='puzzle'&&!m.learningWorkspace.busy)",'Puzzle');
  assert.equal(await run("!!document.querySelector('.learn-square.annotated')"),false);
  await capture('puzzle-practice');
  assert.equal(await run("!!document.querySelector('.puzzle-session .learn-panel, .puzzle-session .learn-move-input, .learn-board-caption')"),false);
  assert.deepEqual(await run("[...document.querySelectorAll('.puzzle-practice-actions button')].map(n=>n.textContent)"),['Hint','Skip']);
  await run("import('./analysis.js').then(m=>m.learningWorkspace.startPuzzleSelection([m.learningWorkspace.puzzles.find(p=>p.solution.length>=5)]))");
  await run("document.querySelector('[data-focus=puzzle-hint]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace.busy)",'Piece hint');
  assert.equal(await run("document.querySelectorAll('.learn-square.annotated').length"),1);
  assert.equal(await run("!!document.querySelector('.puzzle-hint-arrow')"),false);
  await run("document.querySelector('[data-focus=puzzle-hint]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace.busy)",'Move hint');
  assert.equal(await run("!!document.querySelector('.board svg.best-arrow')"),true);
  await capture('puzzle-arrow-hint');
  await run("import('./analysis.js').then(m=>{window.replyStarted=performance.now();window.replyResolved=false;const w=m.learningWorkspace,p=w.puzzles.find(p=>p.id===w.activity.id);w.submitPuzzle(p.solution[0]).then(()=>{replyResolved=true;window.replyElapsed=performance.now()-replyStarted;});})");
  assert.equal(await run("import('./analysis.js').then(m=>m.learningWorkspace.activity.step)"),1);
  await sleep(200);assert.equal(await run('replyResolved'),false);
  await waitFor(review,'replyResolved','Delayed opponent reply');
  assert.ok(await run('replyElapsed>=790'),'Reply needs a visible pause');
  assert.equal(await run("!!document.querySelector('.puzzle-hint-arrow, .learn-square.annotated')"),false);
  await run("import('./analysis.js').then(m=>m.learningWorkspace.navigate('concepts'))");await capture('concepts-desktop');
  assert.equal(await run("!!document.querySelector('.learn-card')"),false);
  await run("import('./analysis.js').then(m=>m.learningWorkspace.startLesson('fork'))");
  await run("import('./analysis.js').then(m=>m.learningWorkspace.lessonTab('practise'))");
  await run("document.querySelector('[data-square=e4]').click();document.querySelector('[data-square=f6]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.feedback?.status==='correct')",'Real concept validation');
  await run("import('./analysis.js').then(m=>m.learningWorkspace.navigate('openings'))");await capture('openings-desktop');
  await run("import('./analysis.js').then(m=>m.learningWorkspace.startOpening('italian',{practice:true,color:'b'}))");
  await run("document.querySelector('[data-square=e7]').click();document.querySelector('[data-square=e5]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.activity.ply===3)",'Opening reply');
  for(const [width,height] of [[1366,768],[960,768],[390,844],[320,640]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(200);
    for(const page of ['puzzles','concepts','openings']){
      await run(`import('./analysis.js').then(m=>m.learningWorkspace.navigate('${page}'))`);await capture(page+'-'+width);
    }
    const geometryBefore=await run(geometry);
    await run("document.querySelector('[aria-label=Settings]').click()");
    assert.deepEqual(await run(geometry),geometryBefore,'Settings moves scene at '+width);
    await run("document.querySelector('[aria-label=Settings]').click()");
  }
  await call('Emulation.clearDeviceMetricsOverride',{},review.sessionId);
  await run("import('./analysis.js').then(m=>m.learningWorkspace.close())");
  const after=await run("import('./analysis.js').then(m=>({idx:m.S.idx,flipped:m.S.flipped,pgn:m.S.pgn,evals:JSON.stringify(m.S.evals)}))");assert.deepEqual(after,before);
  assert.equal(await run("document.querySelector('.board')===auditBoard"),true);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},review.sessionId);
  await run("import('./analysis.js').then(m=>m.openLearning())");
  assert.equal(await run("!!document.querySelector('.learn-scene-layer')"),false);
  await capture('puzzles-reduced-motion');
  await run("import('./analysis.js').then(m=>m.learningWorkspace.close())");
  assert.equal(await run("import('./analysis.js').then(m=>m.S.settings.showConcepts===false&&m.S.settings.conceptsEnabled===false)"),true);
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({passed:true,frames,sliderFrames,reverseFrames,results},null,2));
  console.log(`Learning browser audit passed: ${results.length} screenshots and measurements in ${out}`);
}
