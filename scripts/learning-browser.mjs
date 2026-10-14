import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

// Real packaged Chrome extension, isolated profile; test exports and screenshots
// are written to disposable copies and never enter store packages.
const root=process.cwd(),artifacts=path.join(root,'web-ext-artifacts');
const {recordPath}=JSON.parse(await fs.readFile(path.join(artifacts,'latest-release.json')));
const record=JSON.parse(await fs.readFile(recordPath));
const out=await fs.mkdtemp(path.join(path.dirname(recordPath),'learning-audit-'));
const source=await fs.mkdtemp(path.join(artifacts,'learning-chrome-'));
await fs.cp(record.packages.find(p=>p.browser==='chrome').sourceDir,source,{recursive:true});
// Iterate on UI changes against the same packaged engine/assets without rebuilding them.
if (process.argv.includes('--working-tree')) {
  for (const file of ['analysis.js','styles.css','lib/learning/workspace.js','lib/learning/morph.js','lib/learning/presentations.js']) await fs.copyFile(path.join(root,file),path.join(source,file));
}
await fs.appendFile(path.join(source,'analysis.js'),'\nexport {S, learningWorkspace, openLearning, go, toggleFlip, applyLayoutMode};\n');
await fs.writeFile(path.join(source,'audit.html'),'<!doctype html><script type="module" src="audit.js"></script>');
await fs.writeFile(path.join(source,'audit.js'),"import {browserAPI} from './browser-compat.js'; window.api=browserAPI;");
const profile=await fs.mkdtemp(path.join(artifacts,'learning-profile-'));
const chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',
  '--enable-unsafe-extension-debugging',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let ws;const keepAlive=setInterval(()=>{},1000),results=[];
try {
  let info;for(let i=0;i<100;i++){try{info=await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8');break;}catch{await sleep(100);}}
  if(!info)throw Error('Chrome debugging port unavailable');
  const [port,route]=info.trim().split(/\r?\n/);ws=new WebSocket(`ws://127.0.0.1:${port}${route}`);
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP timed out')),10000);ws.onopen=()=>{clearTimeout(timer);resolve();};ws.onerror=()=>{clearTimeout(timer);reject(Error('CDP failed'));};});
  let seq=0;const pending=new Map();
  ws.onmessage=event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
  const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));});
  const loaded=await call('Extensions.loadUnpacked',{path:source});
  const tab=async url=>{const {targetId}=await call('Target.createTarget',{url});const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});return {targetId,sessionId};};
  const evaluate=async(t,expression)=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},t.sessionId);if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
  const waitFor=async(t,expression,label)=>{for(let i=0;i<250;i++){if(await evaluate(t,expression))return;await sleep(100);}throw Error(label+' did not become ready');};
  const audit=await tab(`chrome-extension://${loaded.id}/audit.html`);await waitFor(audit,'!!window.api','Storage API');
  await evaluate(audit,"api.storage.local.set({settings:{engineDepth:4,engineWorkers:1,depthBumped:true,sound:false,coachPlain:true},'job:learn-audit':{pgn:'1. e4 e5 2. Nf3 Nc6 *',meta:{gameId:'learn-audit'},source:'pgn'}})");
  const review=await tab(`chrome-extension://${loaded.id}/analysis.html#learn-audit`);
  await waitFor(review,"!!document.querySelector('.board')&&import('./analysis.js').then(m=>!m.S.analyzing)",'Review');
  const {windowId}=await call('Browser.getWindowForTarget',{targetId:review.targetId});
  await call('Browser.setWindowBounds',{windowId,bounds:{width:1920,height:1080}});await sleep(400);
  const entry=await evaluate(review,"(()=>{const rect=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}};return {learn:rect('.learn-entry-button'),engine:rect('#engineMount'),controls:rect('#controls'),width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth}})()");
  assert.ok(entry.learn.y>=entry.engine.bottom-1,'Learning entry is not beneath the engine');
  assert.ok(entry.learn.x>=entry.controls.right-1,'Learning entry is not right of move controls');
  assert.ok(entry.learn.bottom<=entry.height&&entry.scroll<=entry.width,'Review entry overflows');results.push({label:'review-entry',...entry});
  const reviewShot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,'review-entry.png'),Buffer.from(reviewShot.data,'base64'));
  await evaluate(review,"import('./analysis.js').then(m=>{m.go(2);m.toggleFlip();})");
  const before=await evaluate(review,"import('./analysis.js').then(m=>({idx:m.S.idx,flipped:m.S.flipped,pgn:m.S.pgn,evals:JSON.stringify(m.S.evals),variation:JSON.stringify(m.S.variation)}))");
  const boardBefore=await evaluate(review,"(()=>{window.auditBoard=document.querySelector('.board');window.auditTopbar=document.querySelector('.topbar');const r=auditBoard.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()");
  await evaluate(review,"document.querySelector('.learn-entry-button').click()");
  await sleep(220);
  const morphShot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,'morph-in-progress.png'),Buffer.from(morphShot.data,'base64'));
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace?.ready)",'Learning workspace');
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace?.transitioning)",'Panel morph');
  assert.equal(await evaluate(review,"document.querySelector('#root>.app').inert"),false);
  assert.equal(await evaluate(review,"document.querySelector('.board')===auditBoard && document.querySelector('.topbar')===auditTopbar"),true);
  const boardAfter=await evaluate(review,"(()=>{const r=auditBoard.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()");
  for(const key of Object.keys(boardBefore))assert.ok(Math.abs(boardBefore[key]-boardAfter[key])<1,`Board ${key} moved during morph: ${JSON.stringify({boardBefore,boardAfter})}`);
  assert.equal(await evaluate(review,"!!document.querySelector('.learn-morph-layer')"),false);
  const capture=async label=>{
    await sleep(250);const data=await evaluate(review,"(()=>{const r=document.querySelector('.learning-workspace').getBoundingClientRect(),b=document.querySelector('.learn-board')?.getBoundingClientRect();return {width:innerWidth,height:innerHeight,scroll:document.querySelector('.learning-workspace').scrollWidth,board:b&&{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right},workspace:{x:r.x,right:r.right}}})()");
    assert.ok(data.scroll<=data.width+1,label+': horizontal overflow');if(data.board){assert.ok(Math.abs(data.board.w-data.board.h)<1,label+': non-square board');assert.ok(data.board.x>=0&&data.board.right<=data.width+1,label+': board outside workspace');}
    const screenshot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,label+'.png'),Buffer.from(screenshot.data,'base64'));results.push({label,...data});
  };
  await capture('learning-home');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startLesson('fork'))");
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.lessonTab('practise'))");
  await evaluate(review,"document.querySelector('[data-square=e4]').click();document.querySelector('[data-square=f6]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.feedback?.status==='correct')",'Real concept worker');
  assert.equal(await evaluate(review,"import('./analysis.js').then(m=>!!m.learningWorkspace.worker)"),true);await capture('lesson-fork-proof');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startLesson('outpost'))");await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.lessonTab('practise'))");
  await evaluate(review,"document.querySelector('[data-square=e5]').click();[...document.querySelectorAll('.learn-button')].find(b=>b.textContent==='Check selection').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.feedback?.status==='correct')",'Square exercise');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startOpening('italian',{practice:true,color:'b'}))");
  await evaluate(review,"document.querySelector('[data-square=e7]').click();document.querySelector('[data-square=e5]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.activity.ply===3)",'Black opening practice');await capture('opening-black-practice');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startPuzzleSelection([m.learningWorkspace.puzzles.find(p=>p.theme==='mateIn1')]))");
  assert.equal(await evaluate(review,"!!document.querySelector('.learn-board .annotated')"),false);await capture('puzzle-no-spoilers');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.revealPuzzle())");await capture('puzzle-solution');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startChallenge(60))");
  assert.equal(await evaluate(review,"document.querySelector('#learn-clock').textContent"),'1:00');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.revealPuzzle())");
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.finishChallenge('Audit completed'))");
  const score=await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.result)");assert.equal(score.solved,0);assert.equal(score.assisted,1);await capture('challenge-results');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.navigate('home'))");
  await evaluate(review,"import('./analysis.js').then(m=>{void m.learningWorkspace.close();})");await sleep(220);
  assert.equal(await evaluate(review,"document.querySelector('.board')===auditBoard"),true);
  const returnShot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,'morph-return-in-progress.png'),Buffer.from(returnShot.data,'base64'));
  await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace)",'Reverse panel morph');
  assert.equal(await evaluate(review,"!!document.querySelector('.learn-morph-layer')"),false);
  await evaluate(review,"import('./analysis.js').then(m=>m.openLearning())");
  for(const [width,height]of [[1366,768],[820,768],[390,844],[320,640]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(500);
    await capture('home-'+width);
    await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startLesson('chain'))");await capture('lesson-'+width);
    await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.navigate('home'))");
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},review.sessionId);
  assert.equal(await evaluate(review,"getComputedStyle(document.querySelector('.learning-workspace')).animationName"),'none');
  await evaluate(review,"[...document.querySelectorAll('.learn-header button')].find(b=>b.textContent.includes('Back to review')).click()");
  await waitFor(review,"!document.querySelector('.learning-workspace')",'Return to review');
  const after=await evaluate(review,"import('./analysis.js').then(m=>({idx:m.S.idx,flipped:m.S.flipped,pgn:m.S.pgn,evals:JSON.stringify(m.S.evals),variation:JSON.stringify(m.S.variation)}))");assert.deepEqual(after,before);
  assert.equal(await evaluate(review,"document.querySelector('.board')===auditBoard"),true);
  await evaluate(review,"import('./analysis.js').then(m=>{m.S.settings.learningTransition='page';return m.openLearning();})");
  assert.equal(await evaluate(review,"document.querySelector('#root>.app').inert"),true);
  assert.equal(await evaluate(review,"!!document.querySelector('.learning-embedded')"),false);
  await capture('legacy-learning-home');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startOpening('italian',{practice:true,color:'w'}))");
  await evaluate(review,"document.querySelector('[data-square=e2]').click();document.querySelector('[data-square=e4]').click()");
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.activity.ply===2)",'Legacy opening practice');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.close())");
  await call('Emulation.clearDeviceMetricsOverride',{},review.sessionId);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]},review.sessionId);await sleep(500);
  await evaluate(review,"document.querySelector('[aria-label=Settings]').click();[...document.querySelectorAll('.set-sect-head')].find(b=>b.textContent==='Learning experience').click()");
  const labels=await evaluate(review,"[...document.querySelectorAll('.learn-style-option strong')].map(n=>n.textContent)");
  assert.deepEqual(labels,['Morph in place','Studio Morph','Minimal morph','Board morph','Separate page']);
  const settingsShot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,'learning-style-options.png'),Buffer.from(settingsShot.data,'base64'));
  for(const style of ['studio','minimal','board']) {
    await evaluate(review,`document.querySelector('.learn-style-option[data-presentation="${style}"]').click();document.querySelector('.learn-entry-button').click()`);
    await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace?.ready)",style+' ready');
    const timing=await evaluate(review,"document.getAnimations().map(a=>a.effect.getTiming().duration)");
    assert.ok(timing.some(duration=>duration===280||duration===300),style+': distinct morph animation missing');
    await waitFor(review,"import('./analysis.js').then(m=>!m.learningWorkspace?.transitioning)",style+' transition');
    assert.equal(await evaluate(review,`document.querySelector('.learning-workspace').dataset.presentation==='${style}' && document.querySelector('.board')===auditBoard`),true);
    await capture(style+'-home');
    await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.startLesson('outpost'))");
    await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.lessonTab('practise'))");
    await evaluate(review,"document.querySelector('[data-square=e5]').click();[...document.querySelectorAll('.learn-button')].find(b=>b.textContent==='Check selection').click()");
    await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.feedback?.status==='correct')",style+' exercise');
    await capture(style+'-lesson');
    for(const [width,height]of [[390,844],[320,640]]) {
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(500);
      await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.navigate('home'))");await capture(style+'-home-'+width);
    }
    await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.close())");
    await call('Emulation.clearDeviceMetricsOverride',{},review.sessionId);await sleep(500);
    await evaluate(review,"document.querySelector('[aria-label=Settings]').click()");
  }
  await evaluate(review,"document.querySelector('[aria-label=Settings]').click()");
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},review.sessionId);
  await evaluate(review,"import('./analysis.js').then(m=>{m.S.settings.learningTransition='morph';m.S.layoutMode='custom';m.S.layout.board={...m.S.layout.board,x:1200,y:20,w:700,h:800};m.applyLayoutMode();})");await sleep(500);
  const customBefore=await evaluate(review,"(()=>{const r=auditBoard.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()");
  await evaluate(review,"import('./analysis.js').then(m=>m.openLearning())");
  const customAfter=await evaluate(review,"(()=>{const r=auditBoard.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()");
  for(const key of Object.keys(customBefore))assert.ok(Math.abs(customBefore[key]-customAfter[key])<1,`Custom board ${key} moved: ${JSON.stringify({customBefore,customAfter})}`);
  assert.equal(await evaluate(review,"!!document.querySelector('.learn-morph-layer')"),false,'Reduced motion must skip the panel morph');
  await capture('custom-board-right');
  await evaluate(review,"import('./analysis.js').then(m=>m.learningWorkspace.close())");
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({passed:true,sourceRecord:recordPath,chromeVersion:await call('Browser.getVersion'),results},null,2));
  console.log(`Learning browser audit passed: ${results.length} screenshots and measurements in ${out}`);
} finally {clearInterval(keepAlive);ws?.close();chrome.kill();}
