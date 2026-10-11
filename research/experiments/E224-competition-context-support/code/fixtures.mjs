export const scoring={source:'authored-policy',eventId:'score-rule',model:'synthetic-half-point-units',denominator:2,win:2,draw:1,loss:0};
export const players=['A','B','C','D'].map(id=>({id,name:'Synthetic '+id}));
export const game=(id,round,white,black,result,played=true,slot=0)=>({id,round,slot,white,black,result,played});
export const games=[game('g1',1,'A','B','white-win'),game('g2',1,'C','D','draw'),game('g3',2,'A','C','draw'),game('g4',2,'B','D','white-win'),game('g5',3,'A','D','black-win'),game('g6',3,'B','C','draw')];
export const tieBreak={source:'authored-policy',eventId:'tie-rule',model:'synthetic-column-policy',columns:[{key:'first',label:'Declared first value',order:'higher'},{key:'second',label:'Declared second value',order:'lower'}],values:[{player:'A',values:[2,5]},{player:'B',values:[2,3]},{player:'C',values:[1,9]},{player:'D',values:[1,7]}]};
export const input=(changes={})=>({source:'authored-E224',eventId:'synthetic-development',players:structuredClone(players),games:structuredClone(games),scoring:structuredClone(scoring),...changes});
const missing=structuredClone(tieBreak);missing.values[0].values[1]=null;
const noFirst=structuredClone(tieBreak);noFirst.values[0].values[0]=null;
const titles=players.map((p,i)=>({...p,titles:[{code:['CM','FM','IM','GM'][i],authority:'Synthetic authority',source:'authored-title',eventId:p.id}]}));titles[0].titles.push({code:'NM',authority:'Synthetic local authority',source:'authored-title',eventId:'unknown-code'});
export const cases=[
 ['ranked',input({tieBreak:structuredClone(tieBreak),event:{name:'Synthetic round robin',format:'round-robin'}})],
 ['shared',input()],['missing-second',input({tieBreak:missing})],['missing-first',input({tieBreak:noFirst})],
 ['missing-player-values',input({tieBreak:{...structuredClone(tieBreak),values:tieBreak.values.slice(1)}})],
 ['custom-scoring',input({scoring:{...scoring,model:'synthetic-3-1-0',denominator:1,win:3,draw:1,loss:0}})],
 ['no-scoring',input({scoring:undefined})],
 ['bye',input({byes:[{id:'bye1',round:4,slot:0,player:'C',points:2,reason:'Explicit synthetic bye award'}]})],
 ['unplayed',input({games:[game('u1',1,'A','B','white-win',false),game('u2',1,'C','D','draw',false)]})],
 ['pending-cancelled',input({games:[game('p1',1,'A','B','pending',false),game('c1',1,'C','D','cancelled',false)]})],
 ['multiple-slots',input({games:[...structuredClone(games),game('slot1',1,'A','B','draw',true,1)]})],
 ['swiss',input({event:{name:'Synthetic Swiss declaration',format:'swiss'}})],
 ['knockout',input({event:{name:'Synthetic knockout declaration',format:'knockout'}})],
 ['match',input({players:players.slice(0,2),games:[game('m1',1,'A','B','draw'),game('m2',2,'B','A','black-win')],event:{name:'Synthetic match',format:'match'}})],
 ['other',input({event:{name:'Synthetic custom declaration',format:'other'}})],
 ['titles-norms',input({players:titles,normReports:[{id:'n1',player:'A',title:'IM',status:'claimed',source:'authored-norm',eventId:'n1'},{id:'n2',player:'D',title:'GM',status:'certified',source:'authored-norm',eventId:'n2',documentId:'synthetic-document'},{id:'n3',player:'B',title:'FM',status:'rejected',source:'authored-norm',eventId:'n3'}]})],
 ['negative-tie-values',input({tieBreak:{...structuredClone(tieBreak),columns:[{key:'signed',label:'Declared scaled value',order:'higher'}],values:[{player:'A',values:[-1000000]},{player:'B',values:[1000000]},{player:'C',values:[0]},{player:'D',values:[0]}]}})],
 ['empty',input({players:[],games:[],scoring:undefined})]
].map(([id,input])=>({id,input,options:{enabled:true}}));
