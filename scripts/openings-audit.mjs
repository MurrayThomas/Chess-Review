import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Run with: node scripts/learning-browser.mjs --working-tree --openings
export async function auditLearning({review,call,evaluate,waitFor,sleep,out}) {
  const run=expression=>evaluate(review,expression),results=[];
  await run("document.querySelector('.learn-entry-button').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace?.ready&&!m.learningWorkspace.transitioning)",'Learning workspace');
  const rect=selector=>`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right};})()`;
  for(const [width,height] of [[1920,1080],[1366,768],[960,768],[390,844],[320,640]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);
    await sleep(200);
    await run("import('./analysis.js').then(m=>m.learningWorkspace.navigate('puzzles'))");
    const board=await run(rect('.board'));
    for(const color of ['w','b']) {
      await run(`import('./analysis.js').then(m=>m.learningWorkspace.startOpening('italian',{color:'${color}'}))`);
      const openingBoard=await run(rect('.board'));
      // Stacked layouts scroll between the board and panel on navigation.
      for(const key of width>=1366?['x','y','width','height']:['width','height'])assert.ok(Math.abs(openingBoard[key]-board[key])<1,'Opening must keep puzzle board '+key+' at '+width);
      assert.equal(await run("document.querySelectorAll('.learn-opening-controls button').length"),2);
      assert.equal(await run("!!document.querySelector('.learn-shell .learn-opening-controls')&&!document.querySelector('.learn-board-dock .learn-opening-controls')"),true);
      const controls=await run(rect('.learn-opening-controls'));
      if(width>=1366)assert.ok(controls.x>board.right,'Controls belong to the right of the board');
      assert.equal(await run("getComputedStyle(document.querySelector('[aria-label=\"Next move\"]')).backgroundColor"),'rgb(127, 180, 95)');
      await run("import('./analysis.js').then(m=>m.learningWorkspace.stepOpening(4))");
      await run("document.querySelector('[aria-label=\"Previous move\"]').click()");
      assert.deepEqual(await run("[...document.querySelectorAll('.last-move')].map(n=>n.dataset.square).sort()"),['b8','c6']);
      assert.equal(await run("document.querySelector('.learn-opening-moves [aria-current=step]').textContent"),'Nf3');
      await run("import('./analysis.js').then(m=>m.learningWorkspace.stepOpening(0))");
      assert.equal(await run("document.querySelectorAll('.last-move').length"),0);
      await run("import('./analysis.js').then(m=>m.learningWorkspace.stepOpening(7))");
      assert.equal(await run("[...document.querySelectorAll('.learn-opening-score, .learn-opening-moves, .learn-opening-toolbar, .learn-opening-moves button')].every(n=>n.scrollWidth<=n.clientWidth+1)"),true,'Move scorecard must fit at '+width);
      const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},review.sessionId);
      const label=`opening-${width}-${color}`;
      await fs.writeFile(path.join(out,label+'.png'),Buffer.from(screenshot.data,'base64'));
      results.push({label,board,controls});
    }
  }
  await fs.writeFile(path.join(out,'openings-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({ok:true,out,views:results.length}));
}
