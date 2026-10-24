import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {THEME_NAMES} from '../lib/learning/content.js';

export async function auditLearning({review,call,evaluate,sleep,out}) {
  const run=expression=>evaluate(review,expression);
  await run("import('./analysis.js').then(async m=>{m.S.settings.moveAnim=false;await m.openLearning();m.learningWorkspace.showPuzzleStatistics(true);})");
  assert.equal(await run("document.querySelectorAll('.learn-stat-row').length"),Object.keys(THEME_NAMES).length);
  assert.equal(await run("[...document.querySelectorAll('.learn-stat-row')].every(n=>n.textContent.includes('0 correct · 0 incorrect')&&n.textContent.endsWith('0%'))"),true);
  assert.equal(await run("!!document.querySelector('.learn-stat-untried')"),false);
  assert.equal(await run("[...document.querySelectorAll('.learn-stat-track > span')].every(n=>n.style.width==='0%')"),true);
  await run("import('./analysis.js').then(async m=>{const w=m.learningWorkspace,puzzle=w.puzzles.find(p=>p.themes.includes('fork'));await w.persist(p=>{p.puzzles[puzzle.id]={attempts:3,clean:1,mistakes:2};p.puzzleTimeMs=843000;});w.render();})");
  assert.deepEqual(await run("[...document.querySelectorAll('.learn-stat-overview > div')].map(n=>n.textContent)"),['Correct1','Incorrect2','Attempts3','Time spent14m 3s']);
  assert.equal(await run("(()=>{const row=document.querySelector('[data-theme=fork]');return Math.abs(parseFloat(row.querySelector('.learn-stat-correct').style.width)-100/3)<.01&&Math.abs(parseFloat(row.querySelector('.learn-stat-incorrect').style.width)-200/3)<.01;})()"),true);
  for(const [width,height] of [[1920,1080],[1280,800],[390,844],[320,640]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},review.sessionId);await sleep(250);
    if(width<760)await run("document.querySelector('.learn-puzzle-statistics').scrollIntoView({block:'start'})");
    const layout=await run("(()=>{const cards=[...document.querySelectorAll('.learn-stat-overview > div')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,overflow:n.scrollWidth>n.clientWidth+1};});return {cards,lines:[...document.querySelectorAll('.learn-stat-row')].some(n=>parseFloat(getComputedStyle(n).borderBottomWidth)>0),overflow:document.querySelector('.learn-puzzle-statistics').scrollWidth>document.querySelector('.learn-puzzle-statistics').clientWidth+1};})()");
    assert.equal(layout.lines,false);assert.equal(layout.overflow,false);assert.equal(layout.cards.length,4);
    assert.ok(layout.cards.every(card=>!card.overflow&&Math.abs(card.width-layout.cards[0].width)<1));
    assert.ok(Math.abs(layout.cards[0].top-layout.cards[1].top)<1&&layout.cards[2].top>layout.cards[0].top);
    const shot=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,`puzzle-statistics-${width}.png`),Buffer.from(shot.data,'base64'));
  }
  console.log('Statistics cards, all-type zero states and uncluttered rows verified at 1920, 1280, 390 and 320 pixels. Screenshots: '+out);
}
