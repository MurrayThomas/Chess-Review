// Complete E085 compatibility replay, conditional on independently supplied E084.
// No candidate helpers, priority functions or proof-query implementation imports.
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {openResearchData} from '../../../data-policy.mjs';
import {selectedE085Comment} from './e085-comment-policy.mjs';
const uci=m=>m.from+m.to+(m.promotion||'');
const played=m=>({uci:uci(m),san:m.san,piece:m.piece,captured:m.captured||null,promotion:m.promotion||null,flags:m.flags});
const copy=x=>structuredClone(x);
function board(input){
 const h=input.history;
 if(h!==undefined)assert.ok(h&&typeof h.fen==='string'&&Array.isArray(h.moves)&&h.moves.length<=1000,'Invalid history');
 const c=new Chess(h?.fen||input.fen);
 for(const code of h?.moves||[]){assert.equal(c.isGameOver(),false);assert.match(code,/^[a-h][1-8][a-h][1-8][qrbn]?$/);c.move(code);}
 assert.equal(c.fen(),new Chess(input.fen).fen());return c;
}
// Rebuild each child from the full move stack: separate from candidate move/undo.
function snapshot(c){return {fen:c.history().length?c.history({verbose:true})[0].before:c.fen(),moves:c.history({verbose:true}).map(uci)};}
function restore(s){const c=new Chess(s.fen);for(const m of s.moves)c.move(m);return c;}
function scan(c){
 const fen=c.fen();if(c.isGameOver())return {value:{fen,terminal:true,moves:[],mates:[]},cost:1};
 const start=snapshot(c),moves=c.moves({verbose:true}).map(m=>{const child=restore(start);child.move(uci(m));return {...played(m),fen:child.fen(),check:child.isCheck(),mate:child.isCheckmate(),draw:child.isDraw(),terminal:child.isGameOver()};});
 return {value:{fen,terminal:false,moves,mates:moves.filter(m=>m.mate).map(m=>m.uci)},cost:2+moves.length};
}
function onePlyProof(before,actor,root){
 const move=root.moves.filter(m=>m.mate).sort((a,b)=>a.uci.localeCompare(b.uci))[0];assert.ok(move);
 const c=new Chess(before);c.move(move.uci);assert.equal(c.isCheckmate(),true);
 return {rootFen:before,winner:actor,plies:1,tree:{win:true,kind:'choice',move:move.uci,child:{win:true,kind:'mate',fen:c.fen()}}};
}
function reconstruct(input,parent){
 const enabled=input.reviewTags===undefined?false:input.reviewTags;assert.equal(typeof enabled,'boolean','reviewTags must be boolean');if(!enabled)return copy(parent);
 const limit=input.maxReviewNodes===undefined?50000:input.maxReviewNodes;assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=50000,'maxReviewNodes must be integer0..50000');
 assert.ok(Array.isArray(parent.events));assert(!parent.events.some(e=>e.evidence?.experiment==='E085'));
 const finish=(status,cost,witness=null,extra=[])=>{const exhausted=cost>limit,events=exhausted?[]:extra;return {...copy(parent),schema:'coach-concepts-E085-prototype',events:[...copy(parent.events),...copy(events)],comment:selectedE085Comment(parent,events),reviewAnalysis:{limit,nodes:exhausted?limit+1:cost,status:exhausted?'exhausted':status,witness:exhausted?null:copy(witness)}};};
 if(parent.error||parent.foundationAnalysis&&parent.foundationAnalysis.status!=='accepted')return finish('not-applicable',0);
 const c=board(input);let cost=1+(input.history?.moves.length||0);if(c.isGameOver())return finish('not-live',cost);
 const before=c.fen(),actor=c.turn(),rootCheck=c.isCheck(),first=scan(c);cost+=first.cost;
 const actual=c.move(input.move);cost++;const after=c.fen();assert.equal(after,parent.after);const next=scan(c);cost+=next.cost;
 const witness={experiment:'E085',actor,history:input.history?{fen:input.history.fen,moves:copy(input.history.moves)}:null,before,after,played:played(actual),root:first.value,actual:next.value,beforeOpponent:null,alternatives:[],missedProof:null},extra=[];
 // Evidence deliberately snapshots properties by phase, while retaining the
 // shared alternatives array used by the frozen contract's shallow snapshots.
 const add=(id,text,details={})=>{cost++;assert.ok(text.split(/\s+/).length<=24);extra.push({id,text,qualityClaim:false,evidence:{...witness,...details}});};
 const forcing=first.value.moves.filter(m=>m.check||m.captured);
 if(forcing.length)add('legal-forcing-candidates',`Candidate moves: ${forcing.length} legal checks or captures were available; the complete list is recorded.`,{candidates:forcing});
 add('one-ply-calculation-tree',`Legal calculation tree: ${first.value.moves.length} root moves and ${next.value.moves.length} replies to ${actual.san} are recorded.`);
 add('checks-captures-mates-inventory',`Checks and captures: ${first.value.moves.filter(m=>m.check).length} checking moves, ${first.value.moves.filter(m=>m.captured).length} captures, ${first.value.mates.length} immediate mates.`,{horizon:'one ply; deeper threats unresolved'});
 if(!c.isCheckmate()&&first.value.mates.length){
  const existing=parent.events.find(e=>e.id==='missed-mate'&&e.evidence.mateIn===1),proof=onePlyProof(before,actor,first.value);
  if(existing)assert.deepEqual(existing.evidence.proof,proof,'Parent reused one-ply proof differs');else cost+=4;
  witness.missedProof={proof,reusedParentEvent:existing?parent.events.indexOf(existing):null};
  if(!existing){const chosen=first.value.moves.find(m=>m.uci===proof.tree.move);add('missed-immediate-mate-review',`Missed mate in one: ${chosen.san} was legal; ${actual.san} does not checkmate.`);}
 }
 if(!next.value.terminal){
  if(next.value.mates.length){const threat=next.value.moves.find(m=>m.uci===next.value.mates[0]);add('immediate-mate-blunder-check',`Mate warning: your opponent can play ${threat.san} after ${actual.san}.`,{opponentMate:threat});}
  if(!rootCheck){
   const fields=before.split(' ');fields[1]=actor==='w'?'b':'w';fields[3]='-';const previous=scan(new Chess(fields.join(' ')));cost+=1+previous.cost;witness.beforeOpponent=previous.value;
   if(previous.value.mates.length){
    for(const m of first.value.moves){const alternative=new Chess(before);alternative.move(m.uci);const replies=scan(alternative);cost+=1+replies.cost;witness.alternatives.push({move:m.uci,replyScan:replies.value});}
    const safe=witness.alternatives.filter(a=>!a.replyScan.mates.length&&!a.replyScan.terminal),retainedMates=next.value.mates.filter(m=>previous.value.mates.includes(m));
    if(retainedMates.length&&safe.length){const alternate=first.value.moves.find(m=>m.uci===safe[0].move);add('retained-mate-threat',`Existing mate threat remains: ${actual.san} allows mate in one; ${alternate.san} leaves no immediate mating reply.`,{alternative:safe[0],retainedMates});}
    if(!next.value.mates.length)add('prevented-immediate-mate',`${actual.san} removes all ${previous.value.mates.length} immediate mates seen in the hypothetical opponent-turn snapshot.`,{horizon:'one ply only; not a proof of safety'});
   }
  }
 }
 return finish('proven',cost,witness,extra);
}
export async function openE085Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return {receipt:copy(receipt),check(input,result,parent){const expected=reconstruct(input,parent);assert.deepEqual(result,expected,'E085 whole result differs');return true;}};}
