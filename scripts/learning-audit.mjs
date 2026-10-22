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
  assert.ok(last.x<first.x,'Desktop board should expand toward the left edge');
  for(const frame of frames)assert.ok(frame.y>=Math.min(first.y,last.y)-1,'Board bounces above the expansion path');
  assert.deepEqual(await run("[...document.querySelectorAll('.learn-nav button')].map(n=>n.textContent)"),['Puzzles','Concepts','Openings']);
  assert.equal(await run("document.querySelector('.board')===auditBoard"),true);
  assert.equal(await run("document.querySelector('.learn-puzzle-start .primary').textContent"),'Solve a puzzle');
  assert.equal(await run("!!document.querySelector('[aria-label=Phase], [aria-label=Progress], .learn-style-option')"),false);
  await capture('puzzles-desktop');
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
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({passed:true,frames,results},null,2));
  console.log(`Learning browser audit passed: ${results.length} screenshots and measurements in ${out}`);
}
