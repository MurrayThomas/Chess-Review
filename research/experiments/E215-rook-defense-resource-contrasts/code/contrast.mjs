import {Chess} from '../../../../lib/chess.js';
import {phaseGeometry,phaseContrast,rookRay} from '../../E214-named-rook-defense-phases/code/geometry.mjs';
export const phases=['philidor-barrier','philidor-retreat','vancura-check-before-pressure','vancura-check-at-pawn'];
export const geometryFields=['defender','pawn','king','attackerKing','rook','attacker','pawnRank','attackerKingRank','rookRank','attackerRook','kingOnPromotionSquare','entryTargets','recordedAdvance','supported'];
export const compactGeometry=g=>g?Object.fromEntries(geometryFields.map(k=>[k,g[k]])):null;
export function contrast(input,view,phase){
 if(phase==='philidor-barrier')return phaseContrast(input,view,phase);
 if(phase==='vancura-check-at-pawn')return phaseContrast(input,view,'vancura-check');
 if(!phases.includes(phase))throw Error('Unknown E215 phase');
 const geometry=phaseGeometry(input,view,phase==='philidor-retreat'?phase:'vancura-pressure'),resources=[],alternatives=[];if(!geometry?.supported)return{passes:false,geometry,resources,alternatives};const c=new Chess(view.fen),rank=s=>geometry.attacker==='w'?Number(s[1]):9-Number(s[1]);
 for(const row of view.rows){const m=c.moves({verbose:true}).find(m=>m.from+m.to+(m.promotion||'')===row.move);if(m.piece!=='r'||m.from!==geometry.rook||m.captured)continue;const after=new Chess(row.fen),check=after.isCheck(),capturable=after.moves({verbose:true}).some(reply=>reply.to===m.to&&reply.captured==='r');let resource=false,alternative=false;
  if(phase==='philidor-retreat'){resource=!check&&rank(m.to)===1;alternative=!check&&rank(m.to)>=7;}
  else{resource=check&&m.to[1]===geometry.attackerKing[1]&&rookRay(after,m.to,geometry.attackerKing)&&Math.abs(m.to.charCodeAt(0)-geometry.attackerKing.charCodeAt(0))>=4;alternative=!check&&rank(m.to)===6&&rookRay(after,m.to,geometry.pawn);}
  if(resource&&row.rootActorWdl===0)resources.push(row.move);if(alternative&&!capturable&&row.rootActorWdl===-2)alternatives.push(row.move);
 }
 return{passes:view.root.wdl===0&&resources.length>0&&alternatives.length>0,rootWdl:view.root.wdl,geometry,resources,alternatives};
}
