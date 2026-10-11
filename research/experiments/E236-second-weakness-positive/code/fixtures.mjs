import {Chess} from '../../../../lib/chess.js';
import {fixtures as original} from '../../E168-forced-pawn-weakness/code/fixtures.mjs';
export const on={enabled:true};
export const fixtures=[0,1].map(color=>{const f=original[color],c=new Chess(f.fen),firstPawn=color?'d7':'d2',blocker=color?'d8':'d1';c.put({type:'p',color:color?'w':'b'},firstPawn);c.put({type:'r',color:color?'b':'w'},blocker);const fen=c.fen();return{id:'blocked-first-pawn-'+color,input:{fen,history:{fen,moves:[]},move:f.move,alternative:f.weaknessQuiet,pawn:f.weaknessPawn,firstPawn},options:on};});
