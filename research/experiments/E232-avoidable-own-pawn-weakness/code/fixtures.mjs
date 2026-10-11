import {Chess} from '../../../../lib/chess.js';
import {reflect,flip} from '../../FRIEND-shared/lib.mjs';
export const on={enabled:true},fen='7k/5B1r/8/6Q1/3P4/5p2/3q2PP/5RK1 w - - 0 1';
const input={id:'own-weakness',source:'Authored pawn capture hypothesis',fen,history:{fen,moves:[]},move:'g2f3',target:'h2',exploit:'d2h2',alternative:'g5g8'};
const change=(id,edit,fields={})=>{const c=new Chess(fen);edit(c);const f=c.fen();return{id,input:{...input,id,fen:f,history:{fen:f,moves:[]},...fields},expected:'not-established'};};
const base=[{id:'opened-mating-capture',input,expected:'proven'},change('support-remains',c=>c.put({type:'p',color:'w'},'g4')),change('capture-refuted-by-knight',c=>c.put({type:'n',color:'w'},'g4')),change('no-protecting-rook',c=>c.remove('h7')),change('already-isolated',c=>{c.remove('g2');c.put({type:'p',color:'w'},'e2');},{move:'e2f3'}),{id:'wrong-target',input:{...input,target:'g2'},expected:'not-established'},{id:'wrong-route',input:{...input,exploit:'d2e1'},expected:'not-established'},{id:'nonmating-alternative',input:{...input,alternative:'g5h5'},expected:'not-established'}];
for(const n of [1,2]){const c=new Chess(fen),moves=[];for(let i=0;i<n;i++)for(const m of ['f1e1','d2d1','e1f1','d1d2']){c.move(m);moves.push(m);}base.push({id:'recorded-cycles-'+n,input:{...input,fen:c.fen(),history:{fen,moves}},expected:n===1?'proven':'unavailable'});}
for(const clock of [100,150]){const f=fen.replace('0 1',clock+' 1');base.push({id:'clock-'+clock,input:{...input,fen:f,history:{fen:f,moves:[]}},expected:'unavailable'});}
const {history,...missing}=input;base.push({id:'missing-history',input:missing,expected:'unavailable'});
export const cases=base.flatMap(c=>{const r=reflect(c.input),move=m=>flip(m.slice(0,2))+flip(m.slice(2,4))+(m.slice(4)||'');return[c,{id:c.id+'-black',input:{...r,target:flip(c.input.target),exploit:move(c.input.exploit),alternative:move(c.input.alternative)},expected:c.expected}];});
