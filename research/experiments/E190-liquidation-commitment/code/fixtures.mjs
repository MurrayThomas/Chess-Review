import {fixtures as parent,prefixControl} from '../../E177-queen-exchange-ending/code/fixtures.mjs';
const clean=f=>({fen:f.fen,move:f.move,alternative:f.endingAlternative,history:f.history}),commit=['C0804','C0926'],all=['C0804','C0926','C0808'];
export const fixtures=[];
for(let color=0;color<2;color++)for(const [name,index,expected]of [['winning-liquidation',0,all],['quiet-king-alternative',2,all],['committed-but-goal-fails',4,commit],['immediate-mate-not-liquidation',6,[]],['visited-alternative-fifty',18,[]]])fixtures.push({id:name+'-'+color,input:clean(parent[index+color]),options:{enabled:true},expected});
fixtures.push({id:'genuine-prefix',input:clean(prefixControl),options:{enabled:true},expected:all});
export const extraMinor=clean(parent[16]);
