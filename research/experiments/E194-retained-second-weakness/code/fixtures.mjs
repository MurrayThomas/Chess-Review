import {Chess} from '../../../../lib/chess.js';
import {fixtures as original} from '../../E168-forced-pawn-weakness/code/fixtures.mjs';
import {fixtures as old} from '../../E193-forced-second-weakness/code/final-fixtures.mjs';
export {claimControl} from '../../E193-forced-second-weakness/code/fixtures.mjs';
export const fresh=[];
for(let color=0;color<2;color++){const f=original[color],c=new Chess(f.fen),firstPawn=color?'d7':'d2';c.put({type:'p',color:color?'w':'b'},firstPawn);const fen=c.fen(),input={fen,history:{fen,moves:[]},move:f.move,alternative:f.weaknessQuiet,pawn:f.weaknessPawn,firstPawn};fresh.push({id:'d-file-existing-weakness-'+color,input,options:{enabled:true},expected:['C0913','C0915','C1079']});}
for(let color=0;color<2;color++)fresh.push({...fresh[color],id:'d-file-zero-bound-'+color,options:{enabled:true,plies:0},expected:[]});
for(let color=0;color<2;color++){const f=fresh[color],moves=color?['e2c1','h1g1','c1e2','g1h1']:['e7c8','h8g8','c8e7','g8h8'],c=new Chess(f.input.fen);for(const m of moves)c.move(m);fresh.push({...f,id:'d-file-genuine-prefix-'+color,input:{...f.input,fen:c.fen(),history:{fen:f.input.fen,moves}}});}
export const fixtures=[...fresh,...fresh.slice(0,2).map((f,color)=>({...f,id:'missing-first-'+color,input:{...f.input,firstPawn:undefined},expected:['C0913','C0915']})),...fresh.slice(0,2).map((f,color)=>({...f,id:'nonisolated-first-'+color,input:{...f.input,firstPawn:color?'g2':'g7'},expected:['C0913','C0915']})),old[6],old[7],old[2],old[3]];
