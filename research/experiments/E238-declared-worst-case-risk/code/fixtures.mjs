import {Chess} from '../../../../lib/chess.js';
import {cases as parents} from '../../E235-two-result-policy/code/fixtures.mjs';
import {inspectTwoResultPolicy} from '../../E235-two-result-policy/code/policy.mjs';
export const on={enabled:true};
function pair(p){return{id:'risk-'+p.id,source:'Authored declared nonprobabilistic coaching decision',actual:{...structuredClone(p),move:new Chess(p.fen).turn()==='w'?'e5g7':'e4g2'},reference:structuredClone(p),model:{kind:'worst-case-shortfall',fen:p.fen,actor:new Chess(p.fen).turn(),utility:{win:2,draw:1,loss:0},target:'win',allowed:0,units:'declared outcome utility units',source:'declared-coaching-input'}};}
const bases=parents.filter(x=>['two-results','two-results-opposite','recorded-cycles-1','recorded-cycles-1-opposite'].includes(x.id));
export const cases=bases.flatMap(p=>{const x=pair(p.input),reverse={...structuredClone(x),actual:structuredClone(x.reference),reference:structuredClone(x.actual)},unknown=structuredClone(x);unknown.reference.followup=new Chess(x.actual.fen).turn()==='w'?'f5f6':'f4f3';const missing=structuredClone(x);delete missing.model;return[
 {id:p.id+'-managed',input:x,expected:'proven',managed:true},
 {id:p.id+'-reversed',input:reverse,expected:'proven',managed:false},
 {id:p.id+'-draw-tolerance',input:{...structuredClone(x),model:{...structuredClone(x.model),allowed:1}},expected:'proven',managed:false},
 {id:p.id+'-draw-target',input:{...structuredClone(x),model:{...structuredClone(x.model),target:'draw'}},expected:'proven',managed:false},
 {id:p.id+'-unresolved',input:unknown,expected:'unavailable',managed:false},
 {id:p.id+'-missing-model',input:missing,expected:'unavailable',managed:false}
];});
export const sources=input=>Object.fromEntries(['actual','reference'].map(k=>[k,inspectTwoResultPolicy(input[k],{enabled:true})]));
