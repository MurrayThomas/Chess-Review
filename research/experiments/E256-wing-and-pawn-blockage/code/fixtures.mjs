import {Chess} from '../../../../lib/chess.js';
export function frame(black=false,role='both-wing',type='b'){
 const other={'both-wing':'g6','doubled':'a2','separated':'c2'}[role];if(!other)throw Error('Unknown role');const c=new Chess();c.clear();
 for(const [square,t,color]of [['b3','k','w'],['b1',type,'w'],['d8','k','b'],['a3','p','b'],[other,'p','b']])c.put({type:t,color:black?(color==='w'?'b':'w'):color},black?square[0]+(9-Number(square[1])):square);
 const parts=c.fen().split(' ');parts[1]=black?'b':'w';parts[2]='-';parts[3]='-';parts[4]='0';parts[5]='1';const fen=parts.join(' ');
 return {fen,history:{fen,moves:[]},pawns:black?['a6',other[0]+(9-Number(other[1]))]:['a3',other],minor:black?'b8':'b1'};
}
export const fixtures=[];
for(const black of [false,true])for(const role of ['both-wing','doubled','separated'])for(const type of ['b','n'])fixtures.push({id:(black?'black':'white')+'-'+role+'-'+type,black,role,type,input:frame(black,role,type)});
export const comparisons=[false,true].map(black=>({id:black?'black':'white',input:frame(black)}));
