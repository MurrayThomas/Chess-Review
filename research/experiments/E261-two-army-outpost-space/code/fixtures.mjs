import {Chess} from '../../../../lib/chess.js';
const pieces=[['k','w','a1'],['n','w','c3'],['p','w','e4'],['k','b','a8'],['n','b','h6'],['p','b','c6'],['p','b','g5']];
export const swap=c=>c==='w'?'b':'w';
function make(role,actor,reflected){let rows=structuredClone(pieces);if(role==='control')rows.find(x=>x[2]==='c6')[2]='a6';if(role.startsWith('neutral'))rows.find(x=>x[1]==='b'&&x[0]==='n')[2]='f5';if(role==='neutral-unsupported')rows=rows.filter(x=>x[2]!=='g5');
 if(reflected)rows=rows.map(([type,color,square])=>[type,swap(color),square[0]+(9-Number(square[1]))]);
 const c=new Chess();c.clear();for(const [type,color,square]of rows)c.put({type,color},square);const fields=c.fen().split(' ');fields[1]=reflected?swap(actor):actor;fields[2]='-';fields[3]='-';fields[4]='0';fields[5]='1';
 const color=fields[1],knight=rows.find(x=>x[0]==='n'&&x[1]===color)[2];return {id:(reflected?'reflected-':'original-')+role+'-'+actor,role,reflected,originalActor:actor,input:{fen:fields.join(' '),actor:color,knight,plies:role.startsWith('neutral')?2:4},expected:role==='neutral-positive'||role==='control'||role==='main'&&actor==='b'};
}
export const fixtures=[make('neutral-positive','b',false),make('neutral-unsupported','b',false),make('neutral-positive','b',true),make('neutral-unsupported','b',true),...[false,true].flatMap(r=>['main','control'].flatMap(role=>['w','b'].map(a=>make(role,a,r))))];
