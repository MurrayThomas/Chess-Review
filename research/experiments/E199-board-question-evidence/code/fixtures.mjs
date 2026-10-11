import {boardFen} from '../../FRIEND-shared/lib.mjs';
const make=(id,pieces)=>{const fen=boardFen(pieces);return{id,input:{fen,history:{fen,moves:[]}}};};
export const snapshots=[make('undefended-attacked-rook',{a1:'K',h8:'k',c3:'B',d4:'r',h2:'P'}),make('defended-attacked-rook',{a1:'K',h8:'k',c3:'B',d4:'r',e5:'p',h2:'P'}),make('pinned-knight-defends-geometrically',{e1:'K',e2:'N',d4:'R',e8:'r',h8:'k'}),make('blocked-friendly-slider-ray',{a1:'K',a3:'R',a4:'P',a5:'B',h5:'r',h8:'k'})];
