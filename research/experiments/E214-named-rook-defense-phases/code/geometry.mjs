import {Chess} from '../../../../lib/chess.js';
import {sideDefenseGeometry} from '../../E212-rook-side-defense/code/geometry.mjs';
export const phases=['philidor-barrier','philidor-retreat','vancura-pressure','vancura-check'];
export function rookRay(c,from,to){if(from===to||from[0]!==to[0]&&from[1]!==to[1])return false;const df=Math.sign(to.charCodeAt(0)-from.charCodeAt(0)),dr=Math.sign(Number(to[1])-Number(from[1]));let f=from.charCodeAt(0)+df,r=Number(from[1])+dr;while(String.fromCharCode(f)+r!==to){if(c.get(String.fromCharCode(f)+r))return false;f+=df;r+=dr;}return true;}
export function phaseGeometry(input,view,phase){
 const g=sideDefenseGeometry(view.fen);if(!g||g.defender!==view.actor)return null;const c=new Chess(view.fen),attacker=g.defender==='b'?'w':'b',rank=s=>attacker==='w'?Number(s[1]):9-Number(s[1]),promotion=attacker==='w'?'8':'1',ownRook=c.board().flat().find(p=>p?.type==='r'&&p.color===attacker),geometry={...g,attacker,pawnRank:rank(g.pawn),attackerKingRank:rank(g.attackerKing),rookRank:rank(g.rook),attackerRook:ownRook.square,kingOnPromotionSquare:g.king===g.pawn[0]+promotion,entryTargets:[],recordedAdvance:false};
 if(phase==='philidor-barrier'){
  for(let f=Math.max(97,g.attackerKing.charCodeAt(0)-1);f<=Math.min(104,g.attackerKing.charCodeAt(0)+1);f++){const s=String.fromCharCode(f)+(attacker==='w'?'6':'3');if(c.get(s)?.color!==attacker)geometry.entryTargets.push(s);}
  geometry.supported=geometry.pawnRank===5&&geometry.attackerKingRank===5&&geometry.rookRank===6&&geometry.kingOnPromotionSquare&&Math.abs(g.attackerKing.charCodeAt(0)-g.pawn.charCodeAt(0))<=1&&geometry.entryTargets.length>0;
 }else if(phase==='philidor-retreat'){
  const h=input.history;if(h?.moves.length===2){const p=new Chess(h.fen),first=p.move(h.moves[0]),second=p.move(h.moves[1]);geometry.recordedAdvance=first.piece==='r'&&first.color===g.defender&&!first.captured&&rank(first.from)===6&&rank(first.to)===6&&first.to===g.rook&&second.piece==='p'&&second.color===attacker&&!second.captured&&rank(second.from)===5&&rank(second.to)===6&&second.to===g.pawn&&p.fen()===c.fen();}
  geometry.supported=geometry.pawnRank===6&&geometry.attackerKingRank===5&&geometry.rookRank===6&&geometry.kingOnPromotionSquare&&geometry.recordedAdvance;
 }else if(phase==='vancura-pressure'||phase==='vancura-check'){
  geometry.supported=['a','h'].includes(g.pawn[0])&&geometry.pawnRank===6&&ownRook.square===g.pawn[0]+promotion&&Math.abs(g.king.charCodeAt(0)-g.pawn.charCodeAt(0))>=3&&(phase==='vancura-pressure'?geometry.attackerKingRank===5&&geometry.rookRank===6:geometry.attackerKingRank===6);
 }else throw Error('Unknown named rook phase');
 return geometry;
}
export function phaseContrast(input,view,phase){
 const geometry=phaseGeometry(input,view,phase),resources=[],alternatives=[];if(!geometry?.supported)return{passes:false,geometry,resources,alternatives};const c=new Chess(view.fen),rank=s=>geometry.attacker==='w'?Number(s[1]):9-Number(s[1]);
 const legal=new Map(c.moves({verbose:true}).map(m=>[m.from+m.to+(m.promotion||''),m]));
 for(const row of view.rows){const m=legal.get(row.move);if(m.piece!=='r'||m.from!==geometry.rook||m.captured)continue;const after=new Chess(row.fen),check=after.isCheck(),capturable=after.moves({verbose:true}).some(reply=>reply.to===m.to&&reply.captured==='r');let resource=false,alternative=false;
  if(phase==='philidor-barrier'){resource=!check&&rank(m.to)===6&&geometry.entryTargets.every(s=>rookRay(after,m.to,s));alternative=!check&&rank(m.to)!==6;}
  if(phase==='philidor-retreat'){resource=!check&&rank(m.to)===1;alternative=!check&&rank(m.to)===6;}
  if(phase==='vancura-pressure'){resource=!check&&rank(m.to)===6&&rookRay(after,m.to,geometry.pawn);alternative=!check&&rank(m.to)!==6;}
  if(phase==='vancura-check'){resource=check&&rank(m.to)===6&&rookRay(after,m.to,geometry.attackerKing)&&Math.abs(m.to.charCodeAt(0)-geometry.attackerKing.charCodeAt(0))>=4;alternative=!check&&rank(m.to)!==6;}
  if(resource&&row.rootActorWdl===0)resources.push(row.move);if(alternative&&!capturable&&row.rootActorWdl===-2)alternatives.push(row.move);
 }
 return{passes:view.root.wdl===0&&resources.length>0&&alternatives.length>0,rootWdl:view.root.wdl,geometry,resources,alternatives};
}
