// Independent proof traversal: no solver, goal, or fixture imports.
import assert from 'node:assert/strict';import {Chess} from '../../../../lib/chess.js';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const code=m=>m.from+m.to+(m.promotion??'');
function target(c,square,actor){if(!square||c.get(square)?.type!=='n'||c.get(square)?.color!==actor)return false;const rank=Number(square[1]);if(!(actor==='w'?[5,6]:[3,4]).includes(rank))return false;
 const counter=new Chess(c.fen());counter.remove(square);counter.put({type:'n',color:actor==='w'?'b':'w'},square);const fields=counter.fen().split(' ');fields[1]=actor;fields[3]='-';let b;try{b=legalPosition(fields.join(' '));}catch{return false;}if(b.isGameOver()||!b.moves({verbose:true}).filter(m=>m.piece==='p'&&m.captured==='n'&&m.to===square).length)return false;
 for(const p of c.board().flat().filter(p=>p?.type==='p'&&p.color!==actor)){const dir=p.color==='w'?1:-1,positions=new Set([p.square]);for(let r=Number(p.square[1]);r>1&&r<8;r+=dir){for(const at of [...positions].filter(s=>Number(s[1])===r)){const f=at.charCodeAt(0);if(Math.abs(f-square.charCodeAt(0))===1&&r+dir===rank)return false;for(const df of [-1,0,1]){const to=String.fromCharCode(f+df)+(r+dir);if(/^[a-h][2-7]$/.test(to))positions.add(to);}if(r===(p.color==='w'?2:7))positions.add(at[0]+(r+dir*2));}}
 }return true;
}
export function checkProof(q){plain(q);assert.equal(q.schema,'E261-query-v1');const {input}=q,actor=input.actor;assert.deepEqual(Object.keys(input).sort(),['actor','fen','knight','plies']);assert(['w','b'].includes(actor)&&[2,4].includes(input.plies));const c=legalPosition(input.fen),root=c.board().flat().filter(Boolean),f=c.fen().split(' ');assert.equal(c.fen(),input.fen);assert.equal(c.turn(),actor);assert.equal(f[2],'-');assert.equal(f[3],'-');assert.equal(f[4],'0');assert(!c.isCheck()&&!c.isGameOver());assert(root.length<=10&&root.every(p=>['k','n','p'].includes(p.type)));for(const color of ['w','b'])assert.equal(root.filter(p=>p.type==='n'&&p.color===color).length,1);assert.equal(c.get(input.knight)?.type,'n');assert.equal(c.get(input.knight)?.color,actor);assert((actor==='w'?+input.knight[1]:9-Number(input.knight[1]))<=4);
 let nodes=0,leaves=0;
 function visit(n,square,left,path){nodes++;assert.equal(n.fen,c.fen());assert.equal(n.square,square);assert.equal(n.left,left);assert.deepEqual(n.path,path);assert.equal(typeof n.win,'boolean');let kind=null,win=false;
  if(c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial())kind='terminal';else if(square===null)kind='knight-lost';else if(!c.board().flat().filter(p=>p?.type==='p'&&p.color===actor).length)kind='no-support-pawns';else if(c.isThreefoldRepetition()||+c.fen().split(' ')[4]>=100)kind='claim-sensitive';else if(left===0){kind='goal';win=target(c,square,actor);}
  if(kind){leaves++;assert.equal(n.kind,kind);assert.equal(n.win,win);assert(!Object.hasOwn(n,'branches')&&!Object.hasOwn(n,'moves')&&!Object.hasOwn(n,'choices'));return win;}
  const moves=c.moves({verbose:true}),inventory=moves.map(code).sort(),own=c.turn()===actor;
  const eligible=moves.filter(m=>{if(!own)return true;if(m.captured||m.promotion||m.piece==='p')return false;c.move(m);const checking=c.isCheck();c.undo();return !checking;}).map(code).sort();assert.deepEqual(n.moves,inventory);assert.deepEqual(n.choices,eligible);assert(Array.isArray(n.branches));
  const ordered=own?[...eligible].sort((a,b)=>Number(b.slice(0,2)===square)-Number(a.slice(0,2)===square)||a.localeCompare(b)):eligible;assert.deepEqual(n.branches.map(b=>b.move),ordered.slice(0,n.branches.length));assert(n.branches.length<=ordered.length);
  let found=false;for(const [i,edge]of n.branches.entries()){assert(!found,'Branch after decisive result');const m=moves.find(m=>code(m)===edge.move);let next=square;if(m.color===actor&&m.from===square)next=m.to;else if(m.color!==actor&&m.captured&&m.to===square)next=null;c.move(m);let child;try{child=visit(edge.child,next,left-1,[...path,edge.move]);}finally{c.undo();}if(child===own){found=true;assert.equal(i,n.branches.length-1);}}
  assert.equal(n.kind,found?(own?'choice':'counterchoice'):(own?'all-fail':'all'));if(!found)assert.equal(n.branches.length,eligible.length);assert.equal(n.win,found?own:!own);return n.win;
 }
 const win=visit(q.tree,input.knight,input.plies,[]);assert.equal(q.win,win);assert(Number.isInteger(q.ticks)&&q.ticks>=nodes&&q.ticks<=100000);assert(q.seconds>=0&&q.seconds<=10);return {win,nodes,leaves};
}
