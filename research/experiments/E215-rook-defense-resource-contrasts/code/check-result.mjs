import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {readFen} from '../../FRIEND-shared/lib.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {readAdmission} from './admission.mjs';
// No classifier/geometry imports. Reconstruct manual occupied-square rays,
// history, noncapturability and actor-perspective outcomes from admitted data.
export function checkNamedRookResult(input,phase,token,result){
 plain([input,result]);const a=readAdmission(token);assert.deepEqual(a.input,input);const c=new Chess(input.fen),{board,turn}=readFen(input.fen),items=Object.entries(board),pawn=items.find(([,p])=>p.toLowerCase()==='p');assert.ok(pawn);const attacker=pawn[1]==='P'?'w':'b',defender=attacker==='w'?'b':'w',find=letter=>items.find(([,p])=>p===letter)[0],king=find(defender==='w'?'K':'k'),attackerKing=find(attacker==='w'?'K':'k'),rook=find(defender==='w'?'R':'r'),attackerRook=find(attacker==='w'?'R':'r'),rank=s=>attacker==='w'?Number(s[1]):9-Number(s[1]);
 const g={defender,pawn:pawn[0],king,attackerKing,rook,attacker,pawnRank:rank(pawn[0]),attackerKingRank:rank(attackerKing),rookRank:rank(rook),attackerRook,kingOnPromotionSquare:king===pawn[0][0]+(attacker==='w'?'8':'1'),entryTargets:[],recordedAdvance:false,supported:false};
 if(phase==='philidor-barrier'){
  const r=attacker==='w'?'6':'3';for(const f of 'abcdefgh')if(Math.abs(f.charCodeAt(0)-attackerKing.charCodeAt(0))<=1){const piece=board[f+r],own=piece&&(attacker==='w'?piece===piece.toUpperCase():piece===piece.toLowerCase());if(!own)g.entryTargets.push(f+r);}
  g.supported=g.pawnRank===5&&g.attackerKingRank===5&&g.rookRank===6&&g.kingOnPromotionSquare&&Math.abs(attackerKing.charCodeAt(0)-pawn[0].charCodeAt(0))<=1&&g.entryTargets.length>0;
 }else if(phase==='philidor-retreat'){
  if(input.history.moves.length===2){const h=new Chess(input.history.fen),x=h.move(input.history.moves[0]),y=h.move(input.history.moves[1]);g.recordedAdvance=x.piece==='r'&&x.color===defender&&!x.captured&&rank(x.from)===6&&rank(x.to)===6&&x.to===rook&&y.piece==='p'&&y.color===attacker&&!y.captured&&rank(y.from)===5&&rank(y.to)===6&&y.to===pawn[0]&&h.fen()===c.fen();}g.supported=g.pawnRank===6&&g.attackerKingRank===5&&g.rookRank===6&&g.kingOnPromotionSquare&&g.recordedAdvance;
 }else{assert.ok(['vancura-check-before-pressure','vancura-check-at-pawn'].includes(phase));g.supported=['a','h'].includes(pawn[0][0])&&g.pawnRank===6&&attackerRook===pawn[0][0]+(attacker==='w'?'8':'1')&&Math.abs(king.charCodeAt(0)-pawn[0].charCodeAt(0))>=3&&(phase==='vancura-check-before-pressure'?g.attackerKingRank===5&&g.rookRank===6:g.attackerKingRank===6);}
 function clear(from,to,b){if(from===to)return false;const fx='abcdefgh'.indexOf(from[0]),fy=Number(from[1]),tx='abcdefgh'.indexOf(to[0]),ty=Number(to[1]);if(fx!==tx&&fy!==ty)return false;const dx=Math.sign(tx-fx),dy=Math.sign(ty-fy),length=Math.max(Math.abs(tx-fx),Math.abs(ty-fy));for(let i=1;i<length;i++)if(b['abcdefgh'[fx+i*dx]+(fy+i*dy)])return false;return true;}
 const resources=[],alternatives=[],legal=c.moves({verbose:true});assert.equal(a.view.rows.length,legal.length);
 for(const row of a.view.rows){const m=legal.find(m=>m.from+m.to+(m.promotion||'')===row.move);assert.ok(m);assert.equal(row.rootActorWdl,row.wdl===0?0:-row.wdl);if(!g.supported||m.piece!=='r'||m.from!==rook||m.captured)continue;const after=new Chess(row.fen),b=readFen(row.fen).board,isCheck=after.isCheck(),capturable=after.moves({verbose:true}).some(reply=>reply.to===m.to&&reply.captured==='r');let good=false,bad=false;
  if(phase==='philidor-barrier'){good=!isCheck&&rank(m.to)===6&&g.entryTargets.every(s=>clear(m.to,s,b));bad=!isCheck&&rank(m.to)!==6;}
  else if(phase==='philidor-retreat'){good=!isCheck&&rank(m.to)===1;bad=!isCheck&&rank(m.to)>=7;}
  else if(phase==='vancura-check-before-pressure'){good=isCheck&&m.to[1]===attackerKing[1]&&clear(m.to,attackerKing,b)&&Math.abs(m.to.charCodeAt(0)-attackerKing.charCodeAt(0))>=4;bad=!isCheck&&rank(m.to)===6&&clear(m.to,pawn[0],b);}
  else{good=isCheck&&rank(m.to)===6&&clear(m.to,attackerKing,b)&&Math.abs(m.to.charCodeAt(0)-attackerKing.charCodeAt(0))>=4;bad=!isCheck&&rank(m.to)!==6;}
  if(good&&row.wdl===0)resources.push(row);if(bad&&!capturable&&row.wdl===2)alternatives.push(row);
 }
 const available=items.length===5&&turn===defender&&a.view.root.wdl===0&&resources.length>0&&alternatives.length>0;
 assert.deepEqual(result,{schema:'E215-named-rook-resource',id:phase.startsWith('philidor')?'C0670':'C0671',phase,available,status:available?'observed-resource':'no-qualifying-contrast',defender:turn,resources:available?resources:[],losingAlternatives:available?alternatives:[],geometry:g,source:a.source,outcomeScope:a.view.outcomeScope});return true;
}
