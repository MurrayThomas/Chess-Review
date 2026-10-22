import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {fullSizeLearningLayout, boardExpansionFrames, centeredMorph} from '../lib/learning/centered-morph.js';
import {capturePanels} from '../lib/learning/morph.js';
import {app, loadGame} from './helpers/app.mjs';

test('learning reserves Settings without moving and bounds the square board at all window sizes',()=>{
  for(const width of [320,390,600,760,960,1280,1440,1920,2560]){
    const board={x:80,y:140,width:Math.min(width-48,700)};
    const closed=fullSizeLearningLayout({width,height:1080,board,settingsOpen:false});
    const open=fullSizeLearningLayout({width,height:1080,board,settingsOpen:true});
    assert.deepEqual(open,closed);const p=open;
    assert.ok(p.boardX>=0&&p.boardX+p.boardSize<=width);
    assert.ok(p.panelX>=0&&p.panelX+p.panelWidth<=width);
    if(width>=760)assert.ok(p.panelX+p.panelWidth<=width-334);
    if(p.stacked)assert.ok(p.panelY>p.boardY+p.boardSize);
    else assert.ok(p.panelX>=p.boardX+p.boardSize+24);
  }
  const board={x:92,y:142,width:700};const p=fullSizeLearningLayout({width:1920,height:1080,board});
  assert.ok(p.boardSize>board.width);assert.ok(p.boardX<board.x);assert.equal(p.boardY+60,board.y);
  assert.equal(p.boardX+p.boardSize,board.x+board.width);
  assert.ok(board.x-p.boardX<=32);assert.equal(p.panelX,board.x+board.width+32);
  const tight=fullSizeLearningLayout({width:1366,height:1080,board:{x:350,y:70,width:800}});
  assert.equal(tight.boardX+tight.boardSize,1150);assert.equal(tight.boardY+60,70);
});

test('board expands uniformly on a straight path with no upward arc or overshoot',()=>{
  assert.deepEqual(boardExpansionFrames({x:80,y:130,width:600},{x:24,y:130,width:660}),[
    {transform:'translate(56px, 0px) scale('+600/660+')'},
    {transform:'translate(0px, 0px) scale(1)'},
  ]);
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

test('the scene moves the real board as one surface and releases it synchronously on interruption',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t),child=board.firstChild,square=child.firstChild;
  const controller=new dom.window.AbortController();
  const pending=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:{x:80,y:132,width:700},signal:controller.signal});
  assert.equal(doc.querySelector('.learn-scene-layer .board'),null);
  assert.equal(board.firstChild,child);assert.equal(child.firstChild,square);
  assert.ok(animations.some(a=>a.target===board&&a.options.duration===1150));
  controller.abort();
  assert.ok(animations.every(a=>a.cancelled));assert.equal(board.style.transformOrigin,'');
  assert.equal(doc.querySelector('.learn-scene-layer'),null);
  await pending;
  const resize=centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:{x:80,y:132,width:700},exiting:true});
  assert.ok(animations.some(a=>a.target===board&&a.options.duration===720));
  dom.window.dispatchEvent(new dom.window.Event('resize'));await resize;
  assert.equal(doc.querySelector('.learn-scene-layer'),null);
});

test('reduced motion skips board and panel movement',async t=>{
  const {dom,doc,source,board,target,animations}=scene(t),rect=board.getBoundingClientRect();
  dom.window.matchMedia=()=>({matches:true});
  await centeredMorph(doc,capturePanels([source]),[target],{board,fromBoard:rect});
  assert.equal(animations.length,0);assert.equal(doc.querySelector('.learn-scene-layer'),null);
});

test('Morph in place 3 keeps settings and learning open together and Escape closes settings first',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('computeDerived');a.call('buildUI');a.call('renderAll');
  a.state.settings.learningTransition='morph3';
  const originalFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({schema:1,puzzles:[{rating:1200,themes:['fork']}]})});
  t.after(()=>{globalThis.fetch=originalFetch;});
  await a.call('openLearning');const w=a.run('learningWorkspace'),doc=a.dom.window.document,board=doc.querySelector('.board');
  await a.call('toggleSettings');assert.equal(a.run('learningWorkspace'),w);
  assert.equal(doc.querySelector('#settings').hidden,false);assert.equal(doc.querySelector('.board'),board);
  doc.dispatchEvent(new a.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(doc.querySelector('#settings').hidden,true);assert.equal(a.run('learningWorkspace'),w);
  await w.close();assert.equal(a.run('learningWorkspace'),null);assert.equal(doc.body.style.overflow,'');
  assert.equal(doc.querySelector('.has-learning-morph3'),null);assert.equal(doc.querySelector('.board'),board);
});
