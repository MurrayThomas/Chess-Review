import {Chess} from '../../../../lib/chess.js';
export function frame(black=false,sameWing=false,type='b') {
 const c=new Chess();c.clear();
 for(const [square,t,color] of [['b3','k','w'],['d6',type,'w'],['d8','k','b'],['a3','p','b'],[sameWing?'c4':'g3','p','b']]) {
  c.put({type:t,color:black?(color==='w'?'b':'w'):color},black?square[0]+(9-Number(square[1])):square);
 }
 const parts=c.fen().split(' ');parts[1]=black?'b':'w';parts[2]='-';parts[3]='-';parts[4]='0';parts[5]='1';const fen=parts.join(' ');
 return {fen,history:{fen,moves:[]},pawns:black?['a6',sameWing?'c5':'g6']:['a3',sameWing?'c4':'g3'],minor:black?'d3':'d6'};
}
export const fixtures=[];
for(const black of [false,true])for(const sameWing of [false,true])for(const type of ['b','n'])fixtures.push({id:(black?'black':'white')+'-'+(sameWing?'same-wing':'both-wing')+'-'+type,black,sameWing,type,input:frame(black,sameWing,type)});
export const comparisons=[false,true].map(black=>({id:black?'black':'white',input:frame(black,false,'b')}));
