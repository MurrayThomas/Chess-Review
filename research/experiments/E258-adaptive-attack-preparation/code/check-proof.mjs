import assert from 'node:assert/strict';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
const u=m=>m.from+m.to+(m.promotion??'');
export function checkProof(q){
 assert.equal(q.schema,'E258-adaptive-query-v1');assert.equal(q.plies,5);assert(Number.isInteger(q.ticks)&&q.ticks>0&&q.ticks<=6144);assert(Number.isFinite(q.seconds)&&q.seconds>=0&&q.seconds<=5);
 const input=q.input,c=legalPosition(input.history.fen),occ=new Map(),key=()=>c.fen().split(' ').slice(0,4).join(' '),count=()=>occ.set(key(),(occ.get(key())??0)+1);count();
 for(const move of input.history.moves){assert(!c.isCheckmate()&&!c.isStalemate()&&!c.isInsufficientMaterial()&&+c.fen().split(' ')[4]<150&&(occ.get(key())??0)<5);assert(c.moves({verbose:true}).some(m=>u(m)===move));c.move(move);count();}assert.equal(c.fen(),input.fen);assert.equal(c.turn(),q.actor);
 const actor=c.turn(),a0=input.attack.slice(0,2),t0=input.attack.slice(2),p0=input.preparation.slice(0,2);assert.equal(c.get(a0)?.type,'q');assert.equal(c.get(a0)?.color,actor);assert.equal(c.get(t0)?.type,'b');assert.notEqual(c.get(t0)?.color,actor);assert.notEqual(a0,p0);assert.notEqual(c.get(p0)?.type,'k');
 assert.deepEqual(q.roles,{attacker:{square:a0,...c.get(a0)},target:{square:t0,...c.get(t0)},preparer:{square:p0,...c.get(p0)}});
 const end=()=>c.isCheckmate()?'mate':c.isStalemate()?'stalemate':c.isInsufficientMaterial()?'dead-material':+c.fen().split(' ')[4]>=150?'automatic-clock':null;let visited=0;
 const frame=()=>{visited++;return{fen:c.fen(),check:c.isCheck(),terminal:end()};};
 const directMove=c.moves({verbose:true}).find(m=>u(m)===input.attack);assert(directMove?.captured&&!directMove.promotion);c.move(directMove);assert(c.isCheck());
 try{assert.deepEqual(q.direct.after,frame());const legal=end()?[]:c.moves({verbose:true}).map(u).sort();assert.deepEqual(q.direct.moves,legal);assert.equal(q.direct.replies.length,legal.length);for(const [i,move]of legal.entries()){assert.equal(q.direct.replies[i].move,move);c.move(move);try{assert.deepEqual(q.direct.replies[i].frame,frame());}finally{c.undo();}}assert.deepEqual(q.direct.enemyMatingReplies,q.direct.replies.filter(r=>r.frame.terminal==='mate'&&r.frame.fen.split(' ')[1]===actor).map(r=>r.move));}finally{c.undo();}
 const prep=c.moves({verbose:true}).find(m=>u(m)===input.preparation);assert(prep&&!prep.captured&&!prep.promotion);c.move(prep);assert.equal(end(),null);c.undo();
 function replay(n,a,t,attacked,left,path,first=false){visited++;assert.equal(n.fen,c.fen());assert.equal(n.attacker,a);assert.equal(n.target,t);assert.equal(n.attacked,attacked);assert.equal(n.left,left);assert.deepEqual(n.path,path);assert.equal(typeof n.win,'boolean');const terminal=end();
  if(terminal){assert.equal(n.kind,terminal);assert.equal(n.win,terminal==='mate'&&c.turn()!==actor&&attacked&&!!a&&c.get(a)?.type==='q'&&c.get(a)?.color===actor);return;}
  if(a===null){assert.equal(n.kind,'attacker-lost');assert.equal(n.win,false);return;}if(t===null&&!attacked){assert.equal(n.kind,'target-lost');assert.equal(n.win,false);return;}
  const legal=c.moves({verbose:true}),inventory=legal.map(u).sort();let claim=+c.fen().split(' ')[4]>=100||c.isThreefoldRepetition();for(const m of legal){if(claim)break;c.move(m);claim=c.isThreefoldRepetition()||+c.fen().split(' ')[4]>=100;c.undo();}if(claim){assert.equal(n.kind,'claim-sensitive');assert.equal(n.win,false);return;}if(left===0){assert.equal(n.kind,'limit');assert.equal(n.win,false);return;}
  assert.deepEqual(n.moves,inventory);const own=c.turn()===actor,ordered=[...legal].sort((x,y)=>own?Number(!!y.captured)-Number(!!x.captured)||u(x).localeCompare(u(y)):u(x).localeCompare(u(y)));
  let choices=ordered;if(first){choices=ordered.filter(m=>u(m)===input.preparation);assert.equal(n.kind,'preparation');assert.equal(n.branches.length,1);assert.equal(n.branches[0].move,input.preparation);assert.equal(n.win,n.branches[0].child.win);}
  else if(own&&left===1&&!attacked){choices=ordered.filter(m=>m.from===a&&m.to===t&&!!m.captured);assert.equal(n.kind,'final-target');assert.deepEqual(n.candidates,choices.map(u));assert.equal(n.win,n.branches.some(b=>b.child.win));assert.deepEqual(n.branches.map(b=>b.move),choices.slice(0,n.branches.length).map(u));if(n.win){assert(n.branches.slice(0,-1).every(b=>!b.child.win));assert.equal(n.branches.at(-1).child.win,true);}else assert.equal(n.branches.length,choices.length);}
  else if(['choice','counterchoice'].includes(n.kind)){assert.equal(n.kind,own?'choice':'counterchoice');assert.equal(n.win,own);assert(n.branches.length>0);assert.deepEqual(n.branches.map(b=>b.move),ordered.slice(0,n.branches.length).map(u));assert(n.branches.slice(0,-1).every(b=>b.child.win!==own));assert.equal(n.branches.at(-1).child.win,own);}
  else{assert.equal(n.kind,own?'all-fail':'all');assert.equal(n.win,!own);assert.deepEqual(n.branches.map(b=>b.move),ordered.map(u));assert(n.branches.every(b=>b.child.win===!own));}
  for(const b of n.branches){const m=legal.find(m=>u(m)===b.move);assert(m);let na=a,nt=t;if(m.color===actor&&m.from===a)na=m.to;else if(m.color!==actor&&m.captured&&m.to===a)na=null;if(m.color!==actor&&m.from===t)nt=m.to;else if(m.color===actor&&m.captured&&m.to===t)nt=null;
   c.move(m);const checkedCapture=attacked||(m.color===actor&&m.from===a&&m.to===t&&!!m.captured&&c.isCheck());try{replay(b.child,na,nt,checkedCapture,left-1,[...path,b.move]);}finally{c.undo();}
  }
 }
 replay(q.tree,a0,t0,false,5,[],true);assert.equal(q.win,q.tree.win);assert.equal(visited,q.ticks);assert.equal(c.fen(),input.fen);return{visited,win:q.win,directRefuted:q.direct.enemyMatingReplies.length>0};
}
