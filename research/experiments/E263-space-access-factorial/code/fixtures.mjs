import {Chess} from '../../../../lib/chess.js';import {fixtures as original} from '../../E261-two-army-outpost-space/code/fixtures.mjs';
export const contexts=['a8','h8'].flatMap(king=>['h6','g6','f8'].map(knight=>({king,knight,id:king+'-'+knight})));
const flip=s=>s[0]+(9-Number(s[1]));
export const fixtures=contexts.flatMap(context=>['main','control'].flatMap(role=>['w','b'].flatMap(actor=>[false,true].map(reflected=>{
 const base=original.find(f=>f.role===role&&f.originalActor===actor&&f.reflected===reflected),input=structuredClone(base.input),c=new Chess(input.fen),kingFrom=reflected?'a1':'a8',knightFrom=reflected?'h3':'h6',kingTo=reflected?flip(context.king):context.king,knightTo=reflected?flip(context.knight):context.knight;
 const k=c.remove(kingFrom),n=c.remove(knightFrom);c.put(k,kingTo);c.put(n,knightTo);input.fen=c.fen();if(actor==='b')input.knight=knightTo;
 return {id:context.id+'-'+base.id,context:context.id,role,originalActor:actor,reflected,input};
}))));
export const inputKey=x=>JSON.stringify([x.fen,x.actor,x.knight,x.plies]);
