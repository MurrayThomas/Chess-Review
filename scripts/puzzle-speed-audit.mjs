import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

export async function auditLearning({review,call,evaluate,waitFor,out}) {
  const run=expression=>evaluate(review,expression);
  await run(`import('./analysis.js').then(async m=>{
    const {Chess}=await import('./lib/chess.js');m.S.settings.moveAnim=true;m.S.settings.animSpeed=7;
    await m.openLearning();const w=m.learningWorkspace,before=new Chess();before.move('e4');const after=new Chess(before.fen());after.move('d5');
    w.puzzles=[{id:'speed-authored',fen:after.fen(),setup:{fen:before.fen(),move:'d7d5'},solution:['e4d5','d8d5','b1c3'],rating:450,themes:[]}];
    window.speedFinishes=0;window.speedDurations=[];
    const animate=w.animatePuzzleReply.bind(w);
    w.animatePuzzleReply=move=>{const result=animate(move),animation=w.replyAnimation;
      if(animation){const finish=animation.finish;animation.finish=()=>{speedFinishes++;finish();};
        for(const piece of w.root.querySelectorAll('.puzzle-reply-target img'))for(const a of piece.getAnimations()){speedDurations.push(a.effect.getTiming().duration);a.playbackRate=.01;}}
      return result;};
    void w.startPuzzleRun('timeAttack');window.speedRun=w.run;
  })`);
  await waitFor(review,"import('./analysis.js').then(m=>!!m.learningWorkspace.replyAnimation)",'Held setup animation');
  await run("import('./analysis.js').then(m=>{window.speedRun=m.learningWorkspace.run;})");
  const point=async square=>run(`(()=>{const r=document.querySelector('[data-square=${square}]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
  const press=async square=>{const p=await point(square);await call('Input.dispatchMouseEvent',{type:'mouseMoved',...p},review.sessionId);await call('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1},review.sessionId);};
  const drop=async square=>{const p=await point(square);await call('Input.dispatchMouseEvent',{type:'mouseMoved',...p,buttons:1},review.sessionId);await call('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1},review.sessionId);};
  await press('e4');
  assert.equal(await run("document.querySelector('[data-square=d5]').classList.contains('legal-cap')"),true);
  const capture=await call('Page.captureScreenshot',{format:'png'},review.sessionId);await fs.writeFile(path.join(out,'time-attack-early-capture.png'),Buffer.from(capture.data,'base64'));
  await drop('d5');
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.activity?.step===2&&!!m.learningWorkspace.replyAnimation)",'Held continuation animation');
  assert.equal(await run('speedRun.correctMoves'),1);assert.equal(await run('speedFinishes'),1);
  await press('b1');assert.equal(await run("document.querySelector('[data-square=c3]').classList.contains('legal')"),true);
  await drop('c3');
  await waitFor(review,"import('./analysis.js').then(m=>m.learningWorkspace.result?.solved===1)",'Early-drop solve');
  assert.equal(await run('speedRun.correctMoves'),2);assert.equal(await run('speedFinishes'),2);
  assert.deepEqual(await run('speedDurations'),[64,64]);
  assert.equal(await run("import('./analysis.js').then(m=>m.learningWorkspace.pendingOpponent===null&&m.learningWorkspace.earlyPuzzleMove===null&&m.learningWorkspace.store.value.puzzleRating.played===0&&!document.querySelector('.drag-piece'))"),true);
  console.log('Real pointer early-drop capture and continuation checks passed; both opponent slides finished and one puzzle was counted. Screenshots: '+out);
}
