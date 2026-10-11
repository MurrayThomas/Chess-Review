import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
const authored=[
 {id:'rook-pawn-root',fen:boardFen({f6:'K',f7:'P',e2:'R',h7:'k',a8:'r'},'b')},
 {id:'promotion-domain',fen:boardFen({e6:'K',f7:'P',d2:'R',h8:'k',a8:'r'},'w')},
 {id:'capture-domain',fen:boardFen({e5:'K',d5:'P',a2:'R',g7:'k',a5:'r'},'w')},
 {id:'mechanical-kings',fen:boardFen({a1:'K',h8:'k'},'w')},
];
export const fixtures=authored.flatMap(f=>{const m=reflect({...f,move:'a1a2'});return[f,{id:f.id+'-black',fen:m.fen}];}).map(f=>({...f,input:{fen:f.fen,history:{fen:f.fen,moves:[]}},options:{maxProbes:128}}));
