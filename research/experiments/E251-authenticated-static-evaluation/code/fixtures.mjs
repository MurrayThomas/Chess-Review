import {Chess} from '../../../../lib/chess.js';
export const histories=[[],['e2e4'],['e2e4','e7e5'],['d2d4','d7d5','c1f4'],['e2e4','f7f6','d1h5'],['f2f3','e7e5','g2g4','d8h4']];
export const fixtures=histories.map((moves,i)=>{const c=new Chess();for(const m of moves)c.move(m);return{id:'static-'+i,input:{fen:c.fen(),history:{fen:new Chess().fen(),moves}}};});
