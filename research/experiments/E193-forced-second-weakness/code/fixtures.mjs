import {Chess} from '../../../../lib/chess.js';
import {fixtures as old} from '../../E168-forced-pawn-weakness/code/fixtures.mjs';
const clean=f=>({fen:f.fen,history:f.history,move:f.move,alternative:f.weaknessQuiet,pawn:f.weaknessPawn});
export const fixtures=[0,1,2,3,4,5].map(n=>({id:old[n].id,input:clean(old[n]),options:{enabled:true,plies:old[n].weaknessMatePlies??2},expected:n<2?['C0913','C0915']:[]}));
export const fresh=[];for(let color=0;color<2;color++){const c=new Chess(old[color].fen),firstPawn=color?'a2':'a7';c.put({type:'p',color:color?'w':'b'},firstPawn);const fen=c.fen(),input={...clean(old[color]),fen,history:{fen,moves:[]},firstPawn},f={id:'second-weakness-'+color,input,options:{enabled:true},expected:['C0913','C0915','C1079']};fresh.push(f);fixtures.push(f);}
for(let color=0;color<2;color++)fixtures.push({...fresh[color],id:'nonisolated-moved-first-'+color,input:{...fresh[color].input,firstPawn:color?'g2':'g7'},expected:['C0913','C0915']});
const parts=old[0].fen.split(' ');parts[4]='99';const fen=parts.join(' ');export const claimControl={id:'authored-halfmove99',input:{...clean(old[0]),fen,history:{fen,moves:[]}},options:{enabled:true,plies:0},expected:[]};
