import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {Chess} from '../lib/chess.js';
import {pieceRoutes,slidePuzzlePieces} from '../lib/learning/piece-transition.js';

const start=new Chess().fen(),sparse='7k/8/8/8/8/8/8/K7 w - - 0 1';
const onBoard=p=>p.x>0&&p.x<8&&p.y>0&&p.y<8;
test('rearranging preserves identical pieces and slides surplus pieces fully beyond an edge',()=>{
  const routes=pieceRoutes(start,sparse);
  assert.equal(routes.filter(r=>onBoard(r.from)).length,32);assert.equal(routes.filter(r=>onBoard(r.to)).length,2);
  assert.equal(routes.filter(r=>r.kind==='leave').length,30);
  assert.deepEqual(routes.filter(r=>r.kind==='move').map(r=>r.type),['k','k']);
  for(const r of routes.filter(r=>r.kind==='leave'))assert.ok(r.to.x<=-.5||r.to.x>=8.5||r.to.y<=-.5||r.to.y>=8.5);
  const moved=new Chess(start);moved.move('e4');const simple=pieceRoutes(start,moved.fen());
  assert.equal(simple.filter(r=>r.from.x!==r.to.x||r.from.y!==r.to.y).length,1);
});

test('new and promoted pieces enter from outside the board and respect a changed orientation',()=>{
  const promoted='7k/8/8/8/8/QQ6/8/K7 w - - 0 1';
  const routes=pieceRoutes(sparse,promoted,{fromFlipped:false,toFlipped:true});
  assert.equal(routes.filter(r=>r.kind==='enter').length,2);
  assert.ok(routes.filter(r=>r.kind==='enter').every(r=>!onBoard(r.from)&&onBoard(r.to)&&r.type==='q'));
  assert.deepEqual(routes.find(r=>r.type==='k'&&r.color==='w'),{type:'k',color:'w',from:{x:.5,y:7.5},to:{x:7.5,y:.5},kind:'move'});
});

for(const cancel of [false,true])test(`piece slides ${cancel?'cancel':'finish'} without leaving hidden pieces or overlays`,async()=>{
  const dom=new JSDOM('<div class="learn-board"></div>'),board=dom.window.document.querySelector('div'),pending=[];
  dom.window.HTMLElement.prototype.animate=function(frames,options){
    let resolve;const animation={finished:new Promise(r=>{resolve=r;}),cancel(){resolve();}};
    pending.push({frames,options,animation,resolve});return animation;
  };
  const transition=slidePuzzlePieces(board,pieceRoutes(sparse,start),()=>dom.window.document.createElement('img'),{duration:120});
  assert.ok(board.classList.contains('puzzle-arranging'));assert.equal(board.querySelectorAll('.puzzle-transition-piece').length,32);
  assert.ok(pending.every(p=>p.options.duration===120&&!p.options.delay&&p.options.fill==='both'));
  if(cancel)transition.cancel();else pending.forEach(p=>p.resolve());await transition.finished;
  assert.equal(board.querySelector('.puzzle-piece-transition'),null);assert.equal(board.classList.contains('puzzle-arranging'),false);
  transition.cancel();dom.window.close();
});
