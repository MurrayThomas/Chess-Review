import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {centeredLearningLayout, fullSizeLearningLayout, newWayLearningLayout, boardSwoopFrames, centeredMorph, reflowCentered} from '../lib/learning/centered-morph.js';
import {capturePanels} from '../lib/learning/morph.js';
import {anchoredLearningLayout} from '../lib/learning/anchored-study.js';
import {app, loadGame} from './helpers/app.mjs';

test('centered learning reserves the settings width on both sides of a wide desktop',()=>{
  const p=centeredLearningLayout({width:1920,height:1080});
  assert.equal(p.boardX,286+48);
  assert.equal(1920-p.panelX-p.panelWidth,p.boardX);
  assert.equal(p.stacked,false);
  assert.ok(p.panelX-p.boardX-p.boardSize>=32);
  const open=centeredLearningLayout({width:1920,height:1080,settingsOpen:true});
  assert.deepEqual(open,p,'Opening Settings should not move an already reserved scene');
});

test('settings reflow preserves working sizes on laptop windows and bounds narrower windows',()=>{
  for(const width of [1280,1366,1440]) {
    const closed=centeredLearningLayout({width,height:900}),open=centeredLearningLayout({width,height:900,settingsOpen:true});
    assert.equal(open.boardSize,closed.boardSize);assert.equal(open.panelWidth,closed.panelWidth);
    assert.ok(open.panelX+open.panelWidth<=width-286-48);
  }
  for(const width of [320,600,760,960,1100,1920,2560]) for(const settingsOpen of [true,false]) {
    const p=centeredLearningLayout({width,height:768,settingsOpen});
    assert.ok(p.boardX>=0&&p.boardX+p.boardSize<=width);
    assert.ok(p.panelX>=0&&p.panelX+p.panelWidth<=width);
    assert.ok(p.panelWidth>0);
    if(settingsOpen&&width>=760)assert.ok(p.panelX+p.panelWidth<=width-334);
  }
});

test('New way bounds its board and library and leaves room for open settings',()=>{
  for(const width of [320,390,600,760,960,1366,1440,1920,2560])for(const settingsOpen of [false,true]) {
    const p=newWayLearningLayout({width,height:768,settingsOpen});
    assert.ok(p.boardX>=0&&p.boardX+p.boardSize<=width);
    assert.ok(p.panelWidth>0&&p.panelX>=0&&p.panelX+p.panelWidth<=width);
    if(settingsOpen&&width>=760)assert.ok(p.panelX+p.panelWidth<=width-310);
    if(p.stacked)assert.ok(p.panelY>p.boardY+p.boardSize+100);
    else assert.ok(p.panelX>p.boardX+p.boardSize);
  }
});

test('board path maps the original board exactly, uses uniform scale and settles without a snap',()=>{
  const frames=boardSwoopFrames({x:80,y:130,width:700},{x:334,y:112,width:560});
  assert.equal(frames[0].transform,'translate(-254px, 18px) scale(1.25)');
  assert.equal(frames.at(-1).transform,'translate(0px, 0px) scale(1)');
  assert.equal(frames.length,33);
  assert.ok(frames.some(frame=>parseFloat(frame.transform.split(', ')[1])<0),'The board should follow a gentle arc');
  for(const frame of frames)assert.deepEqual(Object.keys(frame),['offset','transform']);
});

test('Morph 3 preserves the measured review board and rearranges panels instead of shrinking it',()=>{
  for(const width of [320,390,600,960,1280,1440,1920])for(const settingsOpen of [true,false]) {
    const boardSize=Math.min(width-48,868);
    const p=fullSizeLearningLayout({width,height:1080,boardSize,settingsOpen});
    assert.equal(p.boardSize,boardSize);
    assert.ok(p.boardX>=0&&p.boardX+p.boardSize<=width);
    assert.ok(p.panelX>=0&&p.panelX+p.panelWidth<=width);
    if(p.stacked)assert.ok(p.panelY>p.boardY+p.boardSize);
    else assert.ok(p.panelX>=p.boardX+p.boardSize+24);
  }
});

test('Morph 3 clears outgoing text before revealing its single live destination and cancels cleanly',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t);
  const controller=new dom.window.AbortController();
  const pending=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:board.getBoundingClientRect(),variant:'morph3',signal:controller.signal});
  const outgoing=animations.find(a=>a.target.classList.contains('learn-scene-ghost'));
  const incoming=animations.find(a=>a.target===target);
  assert.ok(outgoing.options.duration<=incoming.options.delay);
  assert.equal(incoming.options.fill,'both');
  assert.equal(doc.querySelectorAll('#target').length,1);
  controller.abort();await pending;
  assert.equal(doc.querySelector('.learn-scene-layer'),null);
  assert.ok(animations.every(a=>a.cancelled));
});

function scene(t) {
  const dom=new JSDOM('<div id="source">Review</div><div id="boardWrap"><div class="board"><div class="sq">Piece</div></div></div><div id="target">Learning</div>');
  t.after(()=>dom.window.close());
  const doc=dom.window.document,source=doc.querySelector('#source'),board=doc.querySelector('#boardWrap'),target=doc.querySelector('#target');
  for(const node of [source,board,target])node.getBoundingClientRect=()=>({x:334,y:112,width:560,height:560});
  dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  const animations=[];
  dom.window.Element.prototype.animate=function(frames,options){const a={target:this,frames,options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(a);return a;};
  return {dom,doc,source,board,target,animations};
}

test('Morph 4 keeps every board coordinate and dimension with Settings, a custom board, and narrow windows',()=>{
  for(const [width,height,board] of [
    [1920,1080,{x:92,y:142,width:868}], [1366,768,{x:78,y:118,width:520}],
    [1920,1080,{x:1200,y:104,width:650,height:678}], [390,844,{x:26,y:140,width:340}],
    [320,640,{x:16,y:120,width:288}],
  ]) for(const settingsOpen of [false,true]) {
    const p=anchoredLearningLayout({width,height,board,settingsOpen});
    assert.equal(p.boardX,board.x);assert.equal(p.boardY+60,board.y);assert.equal(p.boardSize,board.width);
    assert.equal(p.boardHeight,board.height||board.width);
    assert.ok(p.panelWidth>0&&p.panelX>=0&&p.panelX+p.panelWidth<=width);
    if(p.stacked)assert.ok(p.panelY>p.boardY+p.boardSize);
    else assert.ok(p.panelX>=board.x+board.width+24||p.panelX+p.panelWidth<=board.x-24);
    if(settingsOpen&&width>=760)assert.ok(p.panelX+p.panelWidth<=width-310);
  }
});

test('Morph 4 never animates, scales or changes the transform origin of the board on entry or return',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t);
  for(const exiting of [false,true]) {
    const controller=new dom.window.AbortController();
    const pending=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:board.getBoundingClientRect(),variant:'morph4',exiting,signal:controller.signal});
    assert.ok(animations.length>0);
    assert.ok(animations.every(a=>a.target!==board&&!board.contains(a.target)));
    assert.equal(board.style.transformOrigin,'');assert.equal(board.closest('.learn-swoop-anchor'),null);
    controller.abort();await pending;
    assert.equal(doc.querySelector('.learn-scene-layer'),null);
  }
});

test('the scene moves the real board as one surface and releases it synchronously on interruption',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t),child=board.firstChild,square=child.firstChild;
  const controller=new dom.window.AbortController();
  const pending=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:{x:80,y:132,width:700},signal:controller.signal});
  assert.equal(doc.querySelector('.learn-scene-layer .board'),null);
  assert.equal(board.firstChild,child);assert.equal(child.firstChild,square);
  assert.ok(animations.some(a=>a.target===board&&a.options.duration===1040));
  controller.abort();
  assert.ok(animations.every(a=>a.cancelled));assert.equal(board.style.transformOrigin,'');
  assert.equal(doc.querySelector('.learn-scene-layer'),null);
  await pending;
  const resize=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:{x:80,y:132,width:700},exiting:true});
  assert.ok(animations.some(a=>a.target===board&&a.options.duration===800));
  dom.window.dispatchEvent(new dom.window.Event('resize'));await resize;
  assert.equal(doc.querySelector('.learn-scene-layer'),null);
});

test('reduced motion skips the swoop and settings movement',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t),rect=board.getBoundingClientRect();
  dom.window.matchMedia=()=>({matches:true});
  await centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:rect});
  await reflowCentered(doc,board,rect,target,rect);
  assert.equal(animations.length,0);assert.equal(doc.querySelector('.learn-scene-layer'),null);
});

test('Morph in place 2 keeps settings and learning open together and Escape closes settings first',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  a.state.settings.learningTransition='morph2';
  const originalFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({schema:1,puzzles:[{}]})});
  t.after(()=>{globalThis.fetch=originalFetch;});
  await a.call('openLearning');const w=a.run('learningWorkspace'),doc=a.dom.window.document,board=doc.querySelector('.board');
  await a.call('toggleSettings');assert.equal(a.run('learningWorkspace'),w);
  assert.equal(doc.querySelector('#settings').hidden,false);assert.equal(doc.querySelector('.board'),board);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(doc.querySelector('#settings').hidden,true);assert.equal(a.run('learningWorkspace'),w);
  await w.close();assert.equal(a.run('learningWorkspace'),null);assert.equal(doc.body.style.overflow,'');
  assert.equal(doc.querySelector('.has-learning-morph2'),null);assert.equal(doc.querySelector('.board'),board);
});
