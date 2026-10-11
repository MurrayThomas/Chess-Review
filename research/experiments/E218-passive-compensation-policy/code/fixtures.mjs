import {Chess} from '../../../../lib/chess.js';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
const authored=boardFen({f6:'K',g6:'R',g5:'P',a6:'P',c6:'P',h8:'k',a8:'r',b8:'b',a7:'p',c7:'p'}),cycle=['f6f5','h8h7','f5f6','h7h8'];
const flip=m=>m[0]+(9-Number(m[1]))+m[2]+(9-Number(m[3]));
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
export function fixture(black=false,prior=0,clock=0,negative=null){
 let source=authored;if(negative){const c=new Chess(source);if(negative==='pawn')c.remove('g5');else if(negative==='rook'){c.remove('g6');c.put({type:'r',color:'w'},'g4');}else throw Error('Unknown control');source=c.fen();}
 const fen=(black?reflect({id:'fortress',fen:source,move:cycle[0]}).fen:source).replace(/ \d+ \d+$/,' '+clock+' 1'),moves=black?cycle.map(flip):cycle,c=new Chess(fen),actor=c.turn(),states=[];
 for(let i=0;i<4;i++){const position=key(c),move=moves[i];c.move(move);const next=key(c);states.push(i%2?{key:position,replies:[{move,next}]}:{key:position,move,next});}
 const actual=new Chess(fen),historyMoves=Array.from({length:prior},()=>moves).flat();for(const m of historyMoves)actual.move(m);
 return{id:(black?'black':'white')+'-prior'+prior+'-clock'+clock+(negative?'-'+negative:''),input:{fen:actual.fen(),history:{fen,moves:historyMoves}},options:{enabled:true,player:actor},certificate:{schema:'passive-fortress-policy-v1',actor,root:key(actual),states}};
}
