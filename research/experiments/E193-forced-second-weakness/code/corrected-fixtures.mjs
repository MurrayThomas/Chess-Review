import {Chess} from '../../../../lib/chess.js';
import {fresh} from './fixtures.mjs';
export const corrected=fresh.map((f,color)=>{const c=new Chess(f.input.fen);c.remove(f.input.firstPawn);const firstPawn=color?'c4':'c5';c.put({type:'p',color:color?'w':'b'},firstPawn);const fen=c.fen();return{...f,id:'corrected-c-file-second-'+color,input:{...f.input,fen,history:{fen,moves:[]},firstPawn}};});
