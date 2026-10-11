import {fixtures as old} from '../../E153-second-target-defense/code/fixtures.mjs';
export const fixtures=old.slice(0,8).map((f,n)=>({id:f.id,input:{fen:f.fen,history:f.history,move:f.move,alternative:f.weaknessAlternative,targets:f.weaknessTargets,defender:n%2?'d5':'d4'},options:{enabled:true},expected:n<4?['C0922']:[],burden:n<2}));
