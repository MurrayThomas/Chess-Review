import {Chess} from '../../../../lib/chess.js';
import {fixtures} from '../../E211-rook-tablebase-admission/code/fixtures.mjs';
export const on={enabled:true},sourceRoot=fixtures.find(f=>f.id==='rook-pawn-root').fen;
export const input=(fen=sourceRoot,history)=>({source:'Authored saved-root query',eventId:'query-1',query:{fen,...(history?{history}: {})}});
const item=(id,fen,options=on,history)=>({id,input:input(fen,history),options});
export const repeat=n=>{const moves=Array.from({length:n},()=>['h7h8','e2e3','h8h7','e3e2']).flat(),c=new Chess(sourceRoot);for(const m of moves)c.move(m);return{fen:c.fen(),history:{fen:sourceRoot,moves}};};
const thrice=repeat(2),five=repeat(4);
export const cases=[item('rook-root',sourceRoot),item('other-player',sourceRoot,{enabled:true,player:'w'}),item('promotion',fixtures.find(f=>f.id==='promotion-domain').fen),item('capture',fixtures.find(f=>f.id==='capture-domain').fen),item('mechanical-draw',fixtures.find(f=>f.id==='mechanical-kings').fen),item('clock100',sourceRoot.replace('0 1','100 1')),item('clock150',sourceRoot.replace('0 1','150 1')),item('threefold',thrice.fen,on,thrice.history),item('fivefold',five.fen,on,five.history),item('not-cached',new Chess().fen())];
