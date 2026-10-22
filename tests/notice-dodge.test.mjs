import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {escapePosition,evasiveNoticeButton} from '../lib/learning/notice-dodge.js';

test('escape destinations stay inside the dialog and leave the dismiss button a wide berth',()=>{
  for(const width of [248,318,468])for(const pointer of [{x:0,y:0},{x:width,y:140},{x:width/2,y:70}]) {
    const safe={left:0,top:98,right:94,bottom:140};
    const target=escapePosition({width,height:140,buttonWidth:110,buttonHeight:42,current:{x:width-110,y:98},pointer,safe,random:()=>.5});
    assert.ok(target);assert.ok(target.x>=0&&target.x+110<=width);assert.ok(target.y>=0&&target.y+42<=140);
    assert.ok(target.x>=safe.right+40||target.y+42<=safe.top-40,'Never cross the safe button’s exclusion zone');
    assert.ok(Math.hypot(target.x+55-pointer.x,target.y+21-pointer.y)>80,'Escape must meaningfully clear the pointer');
  }
});

test('the evasive button reacts before hover, respects a catch window, resets on resize and cleans up',t=>{
  const dom=new JSDOM('<div id="arena"><button id="safe">Fair enough</button><button id="runner">Unacceptable</button></div>');
  t.after(()=>dom.window.close());
  const view=dom.window,arena=view.document.querySelector('#arena'),button=view.document.querySelector('#runner'),safeButton=view.document.querySelector('#safe');
  let nextFrame=0,nextTimer=0,clock=0;const frames=new Map(),timers=new Map();
  view.requestAnimationFrame=fn=>{frames.set(++nextFrame,fn);return nextFrame;};view.cancelAnimationFrame=id=>frames.delete(id);
  view.setTimeout=fn=>{timers.set(++nextTimer,fn);return nextTimer;};view.clearTimeout=id=>timers.delete(id);
  t.mock.method(view.performance,'now',()=>clock);
  const rect=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});
  arena.getBoundingClientRect=()=>rect(100,200,468,140);
  safeButton.getBoundingClientRect=()=>rect(100,298,110,42);
  button.getBoundingClientRect=()=>rect(100+(button.style.left?parseFloat(button.style.left):338),200+(button.style.top?parseFloat(button.style.top):0),130,42);
  const move=(x,y,type='pointermove')=>arena.dispatchEvent(new view.MouseEvent(type,{bubbles:true,clientX:x,clientY:y}));
  const flush=()=>{for(const [id,fn] of frames){frames.delete(id);fn();}};
  const dispose=evasiveNoticeButton({arena,button,safeButton,view});
  move(155,315);assert.equal(frames.size,0,'Approaching Fair enough never starts the game');
  move(420,220);assert.equal(frames.size,1);move(421,220);assert.equal(frames.size,1);flush();
  assert.equal(button.dataset.dodges,'1');assert.notEqual(button.style.left,'338px');
  const now=button.getBoundingClientRect();move(now.left,now.top);flush();assert.equal(button.dataset.dodges,'1','A brief reaction window permits a real catch');
  assert.equal(timers.size,1);clock=120;for(const [id,fn] of timers){timers.delete(id);fn();}flush();
  assert.equal(button.dataset.dodges,'2','A pointer that stays close triggers another escape after the catch window');
  view.dispatchEvent(new view.Event('resize'));assert.equal(button.style.left,'');assert.equal(button.style.top,'');
  clock=240;move(440,220);assert.equal(frames.size,1);dispose();assert.equal(frames.size,0);assert.equal(timers.size,0);
  move(440,220);assert.equal(frames.size,0,'Closing the dialog removes every dodge listener');
});

test('touch presses can trigger an escape and reduced motion skips animation',t=>{
  const dom=new JSDOM('<div><button>Fair enough</button><button>Unacceptable</button></div>');t.after(()=>dom.window.close());
  const view=dom.window,arena=view.document.querySelector('div'),[safeButton,button]=arena.children;let frame;
  view.requestAnimationFrame=fn=>{frame=fn;return 1;};view.cancelAnimationFrame=()=>{frame=null;};view.matchMedia=()=>({matches:true});
  const rect=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});
  arena.getBoundingClientRect=()=>rect(0,0,300,170);safeButton.getBoundingClientRect=()=>rect(0,128,94,42);button.getBoundingClientRect=()=>rect(190,128,110,42);
  let animations=0;button.animate=()=>{animations++;};const dispose=evasiveNoticeButton({arena,button,safeButton,view});
  button.dispatchEvent(new view.MouseEvent('pointerdown',{clientX:230,clientY:145}));assert.ok(frame);frame();
  assert.equal(button.dataset.dodges,'1');assert.equal(animations,0);dispose();
});

test('escape coordinates account for the review’s CSS zoom',t=>{
  const dom=new JSDOM('<div><button>Fair enough</button><button>Unacceptable</button></div>');t.after(()=>dom.window.close());
  const view=dom.window,arena=view.document.querySelector('div'),[safeButton,button]=arena.children;let frame;
  view.requestAnimationFrame=fn=>{frame=fn;return 1;};view.cancelAnimationFrame=()=>{};
  Object.defineProperties(arena,{offsetWidth:{value:600},offsetHeight:{value:340}});
  const rect=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});
  arena.getBoundingClientRect=()=>rect(0,0,300,170);safeButton.getBoundingClientRect=()=>rect(0,128,94,42);button.getBoundingClientRect=()=>rect(0,0,110,42);
  const dispose=evasiveNoticeButton({arena,button,safeButton,view});
  button.dispatchEvent(new view.MouseEvent('pointerenter',{clientX:20,clientY:20}));frame();
  const x=parseFloat(button.style.left)*.5,y=parseFloat(button.style.top)*.5;
  assert.ok(x>=134);assert.ok(x+110<=300&&y+42<=170);dispose();
});
