import {boardFen,reflect,flip} from '../../FRIEND-shared/lib.mjs';
export const on={enabled:true};
export function cases(){
 const pieces={g1:'K',f7:'Q',f1:'R',h1:'R',f2:'P',h2:'P',h7:'P',h8:'k',h6:'q',g7:'b'};
 return[['rook-check','f1f8',pieces],['escape-square','h2h3',pieces],['queen-pressure','f1f6',pieces],['rook-check-with-h7-covered','f1f8',{...pieces,g5:'N'}]].flatMap(([id,preparation,p])=>{
  const fen=boardFen(p),x={id,source:'Authored E233 geometry; E243 prospective preparation hypothesis',fen,history:{fen,moves:[]},attack:'f7g7',preparation};
  const b=reflect({...x,move:x.attack});delete b.move;b.attack=flip(x.attack.slice(0,2))+flip(x.attack.slice(2,4));b.preparation=flip(preparation.slice(0,2))+flip(preparation.slice(2,4));return[x,b];
 });
}
export function positiveControl(){const fen='8/7k/5K2/4Q3/8/8/8/8 w - - 0 1';return{id:'neutral-all-win-control',source:'Authored E235/E239 finite policy, not premature attack',fen,history:{fen,moves:[]},move:'e5g5',followup:'g5g7'};}
