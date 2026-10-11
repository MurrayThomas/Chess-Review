import {fixtures as old} from '../../E145-critical-mating-decisions/code/fixtures.mjs';
import {panelContexts} from '../../E145-critical-mating-decisions/code/contexts.mjs';
import {flip} from '../../FRIEND-shared/lib.mjs';
const move=(m,color)=>color?flip(m.slice(0,2))+flip(m.slice(2,4)):m,clean=f=>({fen:f.fen,move:f.move,history:f.history});
export const fixtures=[];
for(let color=0;color<2;color++){const base=clean(old[color]),view={frame:'after-actual',perspective:color?'b':'w'},options={enabled:true,view},prior=panelContexts(old[2+color],1).previous;
 fixtures.push({id:'winning-choice-'+color,input:base,options,expected:['C0788','C0799','C0803']},{id:'losing-choice-'+color,input:{...base,move:move('g5h5',color)},options,expected:['C0788','C0799','C0803']},{id:'unresolved-check-'+color,input:{...base,move:move('g5d8',color)},options,expected:['C0788','C0803']},{id:'zero-bound-'+color,input:base,options:{...options,plies:0},expected:['C0788','C0799']},{id:'no-enemy-mate-'+color,input:clean(old[6+color]),options,expected:['C0788','C0799']},{id:'earlier-losing-decision-'+color,input:clean(prior),options,expected:['C0799']});
}
