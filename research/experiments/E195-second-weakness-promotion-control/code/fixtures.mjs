import {Chess} from '../../../../lib/chess.js';
import {fresh as prior} from '../../E194-retained-second-weakness/code/fixtures.mjs';
import {fixtures as old} from '../../E193-forced-second-weakness/code/final-fixtures.mjs';
export {claimControl} from '../../E193-forced-second-weakness/code/fixtures.mjs';
export const fresh=[];for(let color=0;color<2;color++){const f=prior[color],c=new Chess(f.input.fen);c.remove(color?'a8':'a1');c.put({type:'k',color:color?'b':'w'},color?'a7':'a2');const fen=c.fen();fresh.push({...f,id:'king-off-promotion-check-'+color,input:{...f.input,fen,history:{fen,moves:[]}}});}
for(let color=0;color<2;color++)fresh.push({...fresh[color],id:'positive-vulnerability-zero-goal-'+color,options:{enabled:true,plies:0},expected:[]});
for(let color=0;color<2;color++){const f=fresh[color],moves=color?['e2c1','h1g1','c1e2','g1h1']:['e7c8','h8g8','c8e7','g8h8'],c=new Chess(f.input.fen);for(const m of moves)c.move(m);fresh.push({...f,id:'genuine-four-ply-prefix-'+color,input:{...f.input,fen:c.fen(),history:{fen:f.input.fen,moves}}});}
export const fixtures=[...fresh,...fresh.slice(0,2).map((f,color)=>({...f,id:'missing-first-'+color,input:{...f.input,firstPawn:undefined},expected:['C0913','C0915']})),...fresh.slice(0,2).map((f,color)=>({...f,id:'nonisolated-first-'+color,input:{...f.input,firstPawn:color?'g2':'g7'},expected:['C0913','C0915']})),old[6],old[7],old[2],old[3],{...prior[0],id:'retained-checking-promotion-refutation',expected:[]}];
