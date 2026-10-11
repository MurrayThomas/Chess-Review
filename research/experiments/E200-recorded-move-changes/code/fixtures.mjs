import {Chess} from '../../../../lib/chess.js';
export function history(fen,moves){const c=fen?new Chess(fen):new Chess();const start=c.fen();for(const code of moves)c.move(code);return {fen:c.fen(),history:{fen:start,moves:[...moves]}};}
const castles='r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
export const cases=[
  {id:'quiet',input:history(null,['g1f3'])},
  {id:'capture',input:history(null,['e2e4','d7d5','e4d5'])},
  {id:'ep',input:history(null,['e2e4','a7a6','e4e5','d7d5','e5d6'])},
  {id:'white-short-castle',input:history(castles,['e1g1'])},
  {id:'black-long-castle',input:history(castles,['e1g1','e8c8'])},
  {id:'white-long-castle',input:history(castles,['e1c1'])},
  {id:'black-short-castle',input:history(castles,['e1c1','e8g8'])},
  ...['q','r','b','n'].map(t=>({id:'promote-'+t,input:history('7k/P7/8/8/8/8/8/7K w - - 0 1',['a7a8'+t])})),
  {id:'capture-promotion',input:history('1r5k/P7/8/8/8/8/8/7K w - - 0 1',['a7b8q'])},
  {id:'black-promotion',input:history('7k/8/8/8/8/8/p7/7K b - - 0 1',['a2a1q'])},
  {id:'mate',input:history(null,['f2f3','e7e5','g2g4','d8h4'])},
  {id:'threefold',input:history(null,['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1','f6g8'])},
  {id:'fifty-claim',input:history('7k/8/8/8/8/8/R7/K7 w - - 99 1',['a2b2'])},
  {id:'pinned-defense',input:history('k3r3/8/8/8/3R4/8/4N3/4K3 b - - 0 1',['a8b8'])},
  {id:'rook-right-loss',input:history(castles,['h1h2'])},
  {id:'captured-original-unit',input:history('7k/8/8/8/8/8/r7/R6K w - - 0 1',['a1a2','h8g8','a2b2'])}
];
