import {Chess} from '../../../../lib/chess.js';
import {reflect} from '../../FRIEND-shared/lib.mjs';
export const on={enabled:true};
const make=(id,fen,move='e5g7',history={fen,moves:[]})=>({id,source:'Authored synthetic rule-deadline fixture',fen,move,history});
export const positive=make('deadline','8/5K1k/8/4Q3/8/8/8/8 w - - 149 76');
const prefixFen='7k/5K2/8/4Q3/8/8/8/8 b - - 148 75',c=new Chess(prefixFen);c.move('h8h7');
const noHistory={...positive};delete noHistory.history;
const base=[
 {id:'conversion',input:positive,expected:'proven',converted:true},
 {id:'actual-delay',input:{...positive,move:'e5f5'},expected:'proven',converted:false},
 {id:'recorded-prefix',input:make('prefix',c.fen(),'e5g7',{fen:prefixFen,moves:['h8h7']}),expected:'proven',converted:true},
 ...[0,99,100,148,150,151].map(h=>({id:'clock-'+h,input:make('clock-'+h,positive.fen.replace('149 76',h+' 76')),expected:h>=150?'unavailable':'not-established',converted:false})),
 {id:'no-mate',input:make('no-mate','8/7k/8/4Q3/8/8/8/K7 w - - 149 76','e5f5'),expected:'not-established',converted:false},
 {id:'pawn-reset-escape',input:make('pawn-escape','8/5K1k/8/4Q3/8/8/P7/8 w - - 149 76'),expected:'not-established',converted:false},
 {id:'capture-reset-escape',input:make('capture-escape','8/5K1k/8/r3Q3/8/8/8/8 w - - 149 76'),expected:'not-established',converted:false},
 {id:'missing-history',input:noHistory,expected:'unavailable',converted:false}
];
export const cases=base.flatMap(x=>{const input=reflect(x.input);if(input.history){const c=new Chess(input.history.fen);for(const m of input.history.moves)c.move(m);input.fen=c.fen();}return[x,{...x,id:x.id+'-opposite',input}];});
