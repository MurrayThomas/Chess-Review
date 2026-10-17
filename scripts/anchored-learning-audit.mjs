import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

export async function auditAnchoredLearning({review,call,evaluate,waitFor,sleep,out}) {
  const run=expression=>evaluate(review,expression), results=[];
  const rect="(()=>{const r=document.querySelector('.board').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()";
  const same=(before,after,label)=>{
    for(const key of Object.keys(before))assert.ok(Math.abs(before[key]-after[key])<.6,`${label}: board ${key} changed: ${JSON.stringify({before,after})}`);
  };
  const screenshot=async label=>{
    const metrics=await run("(()=>{const w=document.querySelector('.learning-workspace'),s=w.querySelector('.learn-shell').getBoundingClientRect(),b=w.querySelector('.board').getBoundingClientRect();return {width:innerWidth,height:innerHeight,scroll:w.scrollWidth,rootScroll:w.scrollTop,panel:{x:s.x,y:s.y,width:s.width,right:s.right,bottom:s.bottom},board:{x:b.x,y:b.y,width:b.width,height:b.height},stacked:w.classList.contains('learn-stacked')}})()");
    assert.ok(metrics.scroll<=metrics.width+1,label+': horizontal overflow');
    assert.ok(metrics.panel.x>=0&&metrics.panel.right<=metrics.width+1,label+': panel outside viewport');
    const shot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);
    await fs.writeFile(path.join(out,label+'.png'),Buffer.from(shot.data,'base64'));results.push({label,...metrics});
  };
  await run("window.auditBoard=document.querySelector('.board');window.auditSquares=[...auditBoard.children];");
  await run("import('./analysis.js').then(m=>{m.go(2);m.S.settings.learningTransition='morph4';})");
  const open=async label=>{
    const before=await run(rect);
    // Sample every animation frame, not just the settled destination.
    await run("window.boardFrames=[];window.samplingBoard=true;(function sample(){if(!samplingBoard)return;const r=auditBoard.getBoundingClientRect();boardFrames.push({x:r.x,y:r.y,width:r.width,height:r.height});requestAnimationFrame(sample);})();void import('./analysis.js').then(m=>m.openLearning());");
    await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace?.ready&&!m.learningWorkspace.transitioning)",label);
    await run('window.samplingBoard=false');
    const frames=await run('boardFrames');for(const frame of frames)same(before,frame,label+' entry frame');
    same(before,await run(rect),label+' entered');
    assert.equal(await run('document.querySelector(\'.board\')===auditBoard'),true);
    assert.deepEqual(await run("[...document.querySelectorAll('.learn-nav button')].map(b=>b.textContent)"),['Puzzles','Openings','Concepts']);
    await screenshot(label);return before;
  };
  const close=async(before,label)=>{
    await run("window.boardFrames=[];window.samplingBoard=true;(function sample(){if(!samplingBoard)return;const r=auditBoard.getBoundingClientRect();boardFrames.push({x:r.x,y:r.y,width:r.width,height:r.height});requestAnimationFrame(sample);})();void import('./analysis.js').then(m=>m.learningWorkspace.close());");
    await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace)",label+' return');
    await run('window.samplingBoard=false');
    for(const frame of await run('boardFrames'))same(before,frame,label+' return frame');
    same(before,await run(rect),label+' restored');
    assert.equal(await run('document.querySelector(\'.board\')===auditBoard'),true);
  };
  const desktop=await open('morph4-desktop-puzzles');
  await run("document.querySelector('[data-focus=study-start]').click()");
  await waitFor(review,"!!document.querySelector('.learn-square')",'Puzzle board');same(desktop,await run(rect),'Puzzle activity');
  await screenshot('morph4-puzzle');
  await run("import('./analysis.js').then(m=>m.learningWorkspace.revealPuzzle())");
  await screenshot('morph4-solution');
  for(const page of ['openings','concepts','puzzles']) {
    await run(`import('./analysis.js').then(m=>m.learningWorkspace.navigate('${page}'))`);
    same(desktop,await run(rect),page);await screenshot('morph4-'+page);
  }
  await run("[...document.querySelectorAll('summary')].find(n=>n.textContent==='Filter puzzles').click();document.querySelector('[data-focus=difficulty]').value='Introductory';document.querySelector('[data-focus=difficulty]').dispatchEvent(new Event('change',{bubbles:true}))");
  assert.equal(await run("document.querySelector('[data-focus=difficulty]').closest('details').open"),true);
  await screenshot('morph4-filters');
  await run("[...document.querySelectorAll('summary')].find(n=>n.textContent==='Timed challenge').click();[...document.querySelectorAll('.learn-button')].find(n=>n.textContent==='1 min').click()");
  assert.equal(await run("!![...document.querySelectorAll('button')].find(n=>n.textContent==='Start challenge')"),true);
  await screenshot('morph4-timed-setup');
  await run("document.querySelector('[aria-label=Settings]').click()");await sleep(150);
  same(desktop,await run(rect),'Settings open');await screenshot('morph4-settings');
  await run("document.querySelector('[aria-label=Settings]').click()");
  await close(desktop,'desktop');
  const resizeStart=await open('morph4-before-resize');
  assert.ok(resizeStart.width>0);
  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(350);
  await screenshot('morph4-resized-open');
  await close(await run(rect),'resized while open');
  for(const [width,height] of [[1366,768],[820,768],[390,844],[320,640]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(350);
    const before=await open('morph4-'+width);
    await close(before,String(width));
  }
  await call('Emulation.clearDeviceMetricsOverride',{},review.sessionId);await sleep(350);
  await run("import('./analysis.js').then(m=>{m.S.layoutMode='custom';m.S.layout.board={...m.S.layout.board,x:1200,y:20,w:650,h:800};m.applyLayoutMode();})");await sleep(350);
  const custom=await open('morph4-custom-right');await close(custom,'custom');
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},review.sessionId);
  const reduced=await open('morph4-reduced-motion');
  assert.equal(await run("document.querySelector('.learning-workspace').getAnimations({subtree:true}).length"),0);
  assert.equal(await run("!!document.querySelector('.learn-scene-layer')"),false);await close(reduced,'reduced');
  await fs.writeFile(path.join(out,'morph4-results.json'),JSON.stringify({passed:true,results},null,2));
  console.log(`Morph 4 browser audit passed: ${results.length} screenshots plus frame-by-frame board checks in ${out}`);
}
