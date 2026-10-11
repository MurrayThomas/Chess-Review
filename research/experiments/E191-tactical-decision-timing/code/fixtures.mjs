import {fixtures as d} from '../../E169-passive-defense-counterplay/code/fixtures.mjs';
import {fixtures as s} from '../../E168-forced-pawn-weakness/code/fixtures.mjs';
export const fixtures=[...[2,3,0,1,6,7,8,9].map(n=>({id:'defense-'+d[n].id,source:'defense',input:{fen:d[n].fen,history:d[n].history,move:d[n].move,alternative:d[n].defenseAlternative},options:{enabled:true,ownPlies:d[n].counterplayPlies??2,enemyPlies:3},expected:n===2||n===3?['C0810','C0811']:[]})),...[0,1,2,3,4,5].map(n=>({id:'structure-'+s[n].id,source:'structure',input:{fen:s[n].fen,history:s[n].history,move:s[n].move,alternative:s[n].weaknessQuiet,pawn:s[n].weaknessPawn},options:{enabled:true,ownPlies:s[n].weaknessMatePlies??2},expected:n<2?['C0813']:[]}))];
const f=fixtures[0],parts=f.input.fen.split(' ');parts[4]='99';const fen=parts.join(' ');
export const claimControl={source:'defense',input:{...f.input,fen,history:{fen,moves:[]}},options:{enabled:true,ownPlies:0,enemyPlies:0}};
