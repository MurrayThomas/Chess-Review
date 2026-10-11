import {Chess} from '../../../../lib/chess.js';
const file=s=>s.charCodeAt(0)-97;
export function sideDefenseGeometry(fen){
 const c=new Chess(fen),pieces=[];for(let r=1;r<=8;r++)for(const f of 'abcdefgh'){const s=f+r,p=c.get(s);if(p)pieces.push({...p,square:s});}
 const pawn=pieces.find(p=>p.type==='p');if(!pawn||pieces.length!==5)return null;
 const defender=pawn.color==='w'?'b':'w',king=pieces.find(p=>p.type==='k'&&p.color===defender),attackerKing=pieces.find(p=>p.type==='k'&&p.color===pawn.color),rook=pieces.find(p=>p.type==='r'&&p.color===defender);
 if(!king||!attackerKing||!rook||pieces.filter(p=>p.type==='r').length!==2)return null;
 const pf=file(pawn.square),longSign=pf<3.5?1:-1,wing=s=>Math.sign(file(s)-pf)*longSign;
 return{defender,pawn:pawn.square,king:king.square,attackerKing:attackerKing.square,rook:rook.square,longSign,kingOnShortSide:wing(king.square)===-1,rookOnLongSide:wing(rook.square)===1,rookCheckingDistance:Math.abs(file(rook.square)-file(attackerKing.square))-1,rookSharesKingRank:rook.square[1]===attackerKing.square[1]};
}
export function pilotContrast(view,kind){
 const g=sideDefenseGeometry(view.fen),c=new Chess(view.fen);if(!g||g.defender!==view.actor)return{passes:false,reason:'not defender KRPvKR',resources:[],alternatives:[]};
 const legal=new Map(c.moves({verbose:true}).map(m=>[m.from+m.to+(m.promotion||''),m])),resources=[],alternatives=[];
 for(const row of view.rows){const m=legal.get(row.move),after=sideDefenseGeometry(row.fen);let qualifies=false,contrast=false;
  if(kind==='long'){qualifies=m.piece==='r'&&m.from===g.rook&&after?.kingOnShortSide&&after.rookOnLongSide&&after.rookSharesKingRank&&after.rookCheckingDistance>=3&&new Chess(row.fen).isCheck();contrast=m.piece==='r'&&m.from===g.rook&&!new Chess(row.fen).isCheck();}
  else if(kind==='short'){const pf=file(g.pawn),wing=Math.sign(file(m.to)-pf)*g.longSign;qualifies=m.piece==='k'&&m.from===g.king&&wing===-1;contrast=m.piece==='k'&&m.from===g.king&&wing===1;}
  else throw Error('Unknown side hypothesis');
  if(qualifies&&row.rootActorWdl===0)resources.push(row.move);if(contrast&&row.rootActorWdl===-2)alternatives.push(row.move);
 }
 return{passes:view.root.wdl===0&&resources.length>0&&alternatives.length>0,rootWdl:view.root.wdl,geometry:g,resources,alternatives};
}
