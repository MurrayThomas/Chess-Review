import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
const position=c=>c.fen().split(' ').slice(0,4).join(' ');
const flip=m=>m.slice(0,1)+(9-+m[1])+m.slice(2,3)+(9-+m[3]);
const authored=boardFen({f6:'K',g5:'R',c4:'B',f5:'N',h8:'k'}),cycle=['g5g6','h8h7','g6g5','h7h8'];
export function fixture(black=false,priorCycles=0,clock=0){
 const fen=black?reflect({id:'policy',fen:authored,move:cycle[0]}).fen:authored,moves=black?cycle.map(flip):cycle,c=legalPosition(fen),actor=c.turn(),states=[];
 for(let i=0;i<4;i++){const key=position(c),move=moves[i];c.move(move);const next=position(c);states.push(i%2?{key,replies:[{move,next}]}:{key,move,next,mateThreat:black?flip(i===0?'g6h6':'g5h5'):i===0?'g6h6':'g5h5'});}
 const start=fen.replace(/ \d+ \d+$/,' '+clock+' 1'),a=legalPosition(start),historyMoves=Array.from({length:priorCycles},()=>moves).flat();for(const move of historyMoves)a.move(move);
 return{id:(black?'black':'white')+'-cycles'+priorCycles+'-clock'+clock,input:{fen:a.fen(),history:{fen:start,moves:historyMoves}},options:{enabled:true,player:actor},certificate:{schema:'perpetual-policy-v1',actor,root:position(a),states}};
}
export const dir='research/experiments/E210-sustainable-threat-policy';
