import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {SCREEN_PREVIEWS} from '../lib/screen-previews.js';

export async function auditLearning({review,call,evaluate,waitFor,sleep,out}) {
  const run=expression=>evaluate(review,expression);
  await sleep(400);
  await run("import('./browser-compat.js').then(async({browserAPI})=>{await browserAPI.storage.local.set({username:'keep-real-user',pendingError:'keep-real-error','learning:v1':{schema:1,puzzleRating:{elo:1777,wins:2,losses:1},puzzles:{keep:{attempts:3}}}});window.previewStorageBaseline=JSON.stringify(await browserAPI.storage.local.get(null));})");
  const base=await run('location.origin');let checked=0;
  for(const view of SCREEN_PREVIEWS){
    const {targetId}=await call('Target.createTarget',{url:base+'/analysis.html?screen-preview='+view.id});
    const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true}),tab={targetId,sessionId};
    try {
      await waitFor(tab,"document.body?.dataset.previewReady==='true'||(document.querySelector('#error')&&!document.querySelector('#error').hidden)",view.id);
      const status=await evaluate(tab,"({ready:document.body.dataset.previewReady,error:document.querySelector('#error')?.hidden?'':document.querySelector('#error')?.textContent,view:document.querySelector('[aria-label=\"Screen preview\"]')?.value})");
      assert.equal(status.error,'',view.id+': '+status.error);assert.equal(status.ready,'true');assert.equal(status.view,view.id);
      if(view.id.startsWith('popup')){
        assert.equal(await evaluate(tab,"document.querySelector('.screen-preview-popup').contentDocument.querySelector('#username')"),null);
        assert.equal(await evaluate(tab,"document.querySelector('.screen-preview-popup').contentDocument.querySelector('#manual').open"),view.id==='popup-manual');
        await evaluate(tab,"document.querySelector('.screen-preview-popup').contentDocument.querySelector('#analyzeManual').click()");
        assert.match(await evaluate(tab,"document.querySelector('.screen-preview-popup').contentDocument.querySelector('#status').textContent"),/Preview actions are disabled/);
      }else if(view.id==='run-notice')assert.equal(await evaluate(tab,"!!document.querySelector('.puzzle-run-notice-card')"),true);
      else if(view.id==='concept-notice')assert.equal(await evaluate(tab,"!!document.querySelector('.learn-notice-overlay')"),true);
      else if(view.id==='puzzle-promotion')assert.equal(await evaluate(tab,"document.querySelectorAll('.promotion-options button').length"),4);
      else if(view.id==='puzzle-save-error')assert.equal(await evaluate(tab,"!!document.querySelector('.learn-storage-error')"),true);
      else if(view.id.includes('-results')||view.id.includes('-replay')||view.id.endsWith('-best'))assert.equal(await evaluate(tab,"!!document.querySelector('.puzzle-run-results')"),true);
      if(['puzzle-promotion','timeAttack-results','statistics','popup-manual','review-error','lesson-exercise'].includes(view.id)){
        const shot=await call('Page.captureScreenshot',{format:'png'},sessionId);await fs.writeFile(path.join(out,'preview-'+view.id+'.png'),Buffer.from(shot.data,'base64'));
      }
      checked++;if(checked%6===0)console.log('Checked '+checked+' screen previews.');
    }finally{await call('Target.closeTarget',{targetId});}
  }
  assert.equal(await run("import('./browser-compat.js').then(async({browserAPI})=>JSON.stringify(await browserAPI.storage.local.get(null))===previewStorageBaseline)"),true,'Previews must leave real settings, jobs, library, username and puzzle progress unchanged');
  console.log('All '+checked+' isolated screen previews and popup write guards passed. Screenshots: '+out);
}
