// Independent whole E084 segment. Parent semantics remain separately required.
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {openResearchData} from '../../../data-policy.mjs';
const squares=[...'abcdefgh'].flatMap(f=>[...'12345678'].map(r=>f+r));
const pieces=c=>squares.flatMap(square=>{const p=c.get(square);return p?[{square,type:p.type,color:p.color}]:[];});
const uci=m=>m.from+m.to+(m.promotion||'');
const record=m=>({uci:uci(m),san:m.san,piece:m.piece,captured:m.captured||null,promotion:m.promotion||null});
const clone=x=>structuredClone(x);
const lower=new Set(['bishop-pawn-color','capture','material-balance','nominal-balance','material-imbalance','piece-movement','material-inventory','legal-input','board-coordinates',
 'pawn-skeleton','paired-bishop-armies','rook-minor-armies','passed-count-imbalance','flank-count-imbalance','connected-passer-proof','open-pawn-file-proof','open-rank-proof',
 'outside-chain-proof','behind-chain-proof','slider-battery-proof','direct-attack','attack-on-pawn','attack-on-piece']);
function boardWithHistory(input){
 const h=input.history;
 if(h!==undefined)assert.ok(h&&typeof h.fen==='string'&&Array.isArray(h.moves)&&h.moves.length<=1000,'Invalid history');
 const c=new Chess(h===undefined?input.fen:h.fen);
 for(const code of h?.moves||[]){assert.equal(c.isGameOver(),false);assert.match(code,/^[a-h][1-8][a-h][1-8][qrbn]?$/);c.move(code);}
 assert.equal(c.fen(),new Chess(input.fen).fen());
 return {board:c,history:h===undefined?null:{fen:h.fen,moves:clone(h.moves)}};
}
function firstRayOccupants(board,slider){
 const orthogonal=[[1,0],[-1,0],[0,1],[0,-1]],diagonal=[[1,1],[1,-1],[-1,1],[-1,-1]],rays=[];
 const directions=slider.type==='b'?diagonal:slider.type==='r'?orthogonal:[...orthogonal,...diagonal];
 for(const [dx,dy]of directions){const cells=[];
  for(let x=slider.square.charCodeAt(0)-97+dx,y=Number(slider.square[1])+dy;x>=0&&x<8&&y>=1&&y<=8;x+=dx,y+=dy){
   const square=String.fromCharCode(97+x)+y,p=board.get(square);
   if(p){rays.push({target:{square,type:p.type,color:p.color},cells});break;}
   cells.push(square);
  }
 }
 return rays.sort((a,b)=>a.target.square.localeCompare(b.target.square));
}
function reconstruct(input,parent){
 const enabled=input.lineTags===undefined?false:input.lineTags;
 assert.equal(typeof enabled,'boolean','lineTags must be boolean');
 if(!enabled)return clone(parent);
 const limit=input.maxLineNodes===undefined?50000:input.maxLineNodes;
 assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=50000,'maxLineNodes must be integer0..50000');
 assert.ok(Array.isArray(parent.events));assert(!parent.events.some(e=>e.evidence?.experiment==='E084'));
 function finish(status,required,witnesses=[],extra=[]){
  const exhausted=required>limit,committed=exhausted?[]:extra;
  const comment=committed.length&&parent.events.every(e=>e.evidence?.experiment==='E083'||lower.has(e.id))?committed[0].text:parent.comment;
  return {...clone(parent),schema:'coach-concepts-E084-prototype',events:[...clone(parent.events),...committed],comment,
   lineAnalysis:{limit,nodes:exhausted?limit+1:required,status:exhausted?'exhausted':status,witnesses:exhausted?[]:witnesses}};
 }
 if(parent.error||parent.foundationAnalysis&&parent.foundationAnalysis.status!=='accepted')return finish('not-applicable',0);
 const {board:c,history}=boardWithHistory(input),historyCost=1+(history?.moves.length||0);
 if(c.isGameOver())return finish('not-live',historyCost);
 const before=c.fen(),actor=c.turn(),beforePieces=pieces(c),root=new Chess(before);
 assert.match(input.move,/^[a-h][1-8][a-h][1-8][qrbn]?$/);
 const played=c.move(input.move),after=c.fen();assert.equal(after,parent.after);
 if(c.isGameOver())return finish('not-live',historyCost+1);
 const afterPieces=pieces(c),fields=after.split(' ');fields[1]=actor;fields[3]='-';
 const hypothetical=new Chess(fields.join(' ')),legal=hypothetical.moves({verbose:true});
 const sliders=afterPieces.filter(p=>p.color===actor&&'brq'.includes(p.type)&&p.square!==played.to),enemies=afterPieces.filter(p=>p.color!==actor);
 // Ledger derives the ORIGINAL complete candidate domain, while discovery below
 // walks rays independently rather than reproducing its slider x target loop.
 let cost=historyCost+2+sliders.length;
 const witnesses=[],extra=[];
 for(const slider of sliders){
  const oldSlider=root.get(slider.square);
  if(oldSlider?.type!==slider.type||oldSlider.color!==actor)continue;
  cost+=enemies.length;
  for(const {target,cells}of firstRayOccupants(c,slider)){
   if(target.color===actor)continue;
   const oldTarget=root.get(target.square);
   if(oldTarget?.type!==target.type||oldTarget.color!==target.color)continue;
   const priorBlockers=cells.filter(s=>root.get(s));
   if(priorBlockers.length!==1||priorBlockers[0]!==played.from)continue;
   const captures=target.type==='k'?[]:legal.filter(m=>m.from===slider.square&&m.to===target.square&&m.captured===target.type&&!m.flags.includes('e')).map(uci).sort();
   // A first-occupant king on this ray is geometrically checked by the slider.
   const checking=target.type==='k'&&c.isCheck();
   if(!checking&&!captures.length)continue;
   const replies=[];
   if(checking){const moves=c.moves({verbose:true});cost+=1+moves.length;
    for(const move of moves){c.move(uci(move));replies.push({...record(move),fen:c.fen(),terminal:c.isGameOver()});c.undo();}
   }
   const witness={experiment:'E084',actor,history,before,after,beforePieces,afterPieces,played:record(played),
    slider,target,cells,blocker:played.from,captures,checking,replies,hypotheticalActorFen:checking?null:hypothetical.fen()};
   witnesses.push(clone(witness));
   const labels=[['legal-line-clearance','Line clearance'],['legal-clearance','Clearance'],['legal-line-opening','Line opening'],
    ['legal-opening-lines','Opening lines'],['legal-alignment','Witnessed alignment'],['legal-line-contact','Line contact'],['legal-alignment-contact','Alignment contact']];
   if(slider.square[0]===target.square[0])labels.push(['legal-file-opening','File opening']);
   if(checking){labels.push(['checking-king-piece-alignment','King-piece alignment']);if(slider.type==='q')labels.push(['checking-queen-king-alignment','Queen-king alignment']);}
   if(slider.type==='r'&&target.type==='q')labels.push(['legal-rook-queen-alignment','Rook-queen alignment']);
   for(const [id,label]of labels){const name={q:'queen',r:'rook',b:'bishop'}[slider.type],action=checking?'checks the king':`has a legal capture contact on ${target.square}`;
    const text=`${label}: moving from ${played.from} clears ${slider.square}–${target.square}; ${name} ${slider.square} ${action}.`;
    assert.ok(text.split(/\s+/).length<=24);extra.push({id,text,qualityClaim:false,evidence:clone(witness)});
   }
  }
 }
 cost+=extra.length;
 return finish(extra.length?'proven':'no-new-fact',cost,witnesses,extra);
}
export async function openE084Replay(){
 const {receipt}=await openResearchData(['D001'],{purpose:'test'});
 return {receipt:clone(receipt),check(input,actual,parent){
  assert.deepEqual(actual,reconstruct(input,parent),'E084 whole result differs from independent complete-ray reconstruction');
  return {segment:'E084',exactResult:true,parentSemanticReplayRequired:true,sharedChessDependency:true,acceptedCredit:0};
 }};
}
