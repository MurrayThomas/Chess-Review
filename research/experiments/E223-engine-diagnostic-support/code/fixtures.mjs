import {Chess} from '../../../../lib/chess.js';
export const input=(lines=[],changes={})=>({fen:new Chess().fen(),source:'authored-E223',eventId:'synthetic-development',engine:{name:'Synthetic report source',version:'fixture-v1'},multiPV:1,scorePerspective:'root-side-to-move',frames:[{id:'frame-a',lines}],...changes});
export const row=(pv='d2d4 d7d5',rank=1,extra='')=>'info depth 6 seldepth 9 multipv '+rank+' score cp 37 nodes 901 nps 45000 time 20 '+extra+' pv '+pv;
const black=new Chess();black.move('d4');
const base=new Chess().fen();
export const cases=[
 ['menu',input([row(),row('g1f3 g8f6',2)],{multiPV:2})],
 ['opponent',input([row('d7d5 d2d4')],{fen:new Chess().fen().replace(' w ',' b ')})],
 ['black-history',input(['info depth 5 multipv 1 score cp -23 lowerbound wdl 100 700 200 pv d7d5'],{fen:black.fen(),history:{fen:base,moves:['d2d4']},wdlModel:'synthetic-no-probability-truth'})],
 ['upper',input(['info depth 8 multipv 1 score cp 0 upperbound pv c2c4'])],
 ['mate',input(['info depth 3 multipv 1 score mate 4 pv g1f3'])],
 ['mate-zero',input(['info score mate 0 nodes 0 time 0 nps 0'])],
 ['partial',input(['info depth 4 nodes 100','info nps 27182','info score cp -31'])],
 ['opaque',input(['info string score cp 999 pv e2e5','info currmove d2d4 currmovenumber 1','bestmove d2d4','info stringify diagnostic'])],
 ['mixed-depth',input([row(),row('g1f3',2).replace('depth 6','depth 7')],{multiPV:2})],
 ['missing-rank',input([row('g1f3',2)],{multiPV:2})],
 ['duplicate-rank',input([row(),row('g1f3',1)],{multiPV:2})],
 ['duplicate-root-move',input([row(),row('d2d4 g8f6',2)],{multiPV:2})],
 ['separate-frames',input([],{multiPV:2,frames:[{id:'first',lines:[row()]},{id:'second',lines:[row('g1f3',2)]}]})],
 ['missing-fields',input(['info score cp 12 pv g1f3','info depth 5 multipv 1 pv c2c4','info'])],
 ['mate-endpoint',input(['info depth 1 multipv 1 score mate 1 pv g6g7'],{fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1'})],
 ['ep',input(['info depth 2 multipv 1 score cp 17 pv e5d6'],{fen:'4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2'})],
 ['promotion',input(['info depth 1 multipv 1 score cp 3 pv a7a8n'],{fen:'7k/P7/8/8/8/8/8/4K3 w - - 0 1'})],
 ['castle',input(['info depth 1 multipv 1 score cp 2 pv e1c1'],{fen:'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'})],
 ['large-counters',input(['info nodes 9007199254740991 nps 9007199254740991 time 1 tbhits 0 hashfull 1000'])],
 ['empty',input([])]
].map(([id,input])=>({id,input,options:{enabled:true,player:id==='black-history'?'w':id==='upper'?'b':undefined}}));
export const invalids=[
 'info depth -1','info nodes 01','info score cp 1.5','info score cp NaN','info score banana 1',
 'info score cp 1 score cp 2','info depth 3 depth 4','info lowerbound','info score cp 1 lowerbound upperbound',
 'info wdl 2 3 4','info wdl 1001 0 0','info hashfull 1001','info multipv 0','info multipv 2 pv d2d4',
 'info score cp 9007199254740992','info pv','info pv 0000','info pv d2d5','info pv d2d4 d7d5 d4d6'
];
