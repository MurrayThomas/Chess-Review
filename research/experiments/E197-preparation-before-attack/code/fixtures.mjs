import {fixtures as parent} from '../../E166-development-defender-capacity/code/fixtures.mjs';
export const fixtures=parent.slice(0,8).map((f,n)=>({id:f.id,input:{fen:f.fen,history:f.history,move:f.move,unit:f.developmentUnit,preparationPly:6,alternativeHistory:f.developmentAlternativeHistory},options:{enabled:true,plies:f.developmentAttackPlies??2},expected:n<2?['C0920']:[]}));
