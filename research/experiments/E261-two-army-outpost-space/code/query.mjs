import {Chess} from '../../../../lib/chess.js';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const other=c=>c==='w'?'b':'w';
export function prepare(input){plain(input);if(!input||Object.keys(input).sort().join(',')!=='actor,fen,knight,plies'||!['w','b'].includes(input.actor)||![2,4].includes(input.plies)||!/^[a-h][1-8]$/.test(input.knight))throw Error('Invalid space input');
 const c=legalPosition(input.fen),fields=c.fen().split(' '),rows=c.board().flat().filter(Boolean);if(c.fen()!==input.fen||fields[1]!==input.actor||fields[2]!=='-'||fields[3]!=='-'||fields[4]!=='0'||rows.length>10||rows.some(p=>!['k','n','p'].includes(p.type))||['w','b'].some(color=>rows.filter(p=>p.type==='n'&&p.color===color).length!==1)||c.get(input.knight)?.type!=='n'||c.get(input.knight)?.color!==input.actor||(input.actor==='w'?+input.knight[1]:9-Number(input.knight[1]))>4||c.isCheck()||c.isGameOver())throw Error('Require legal live quiet authored two-army root');return c;
}
function attacks(square,color){return [-1,1].map(d=>String.fromCharCode(square.charCodeAt(0)+d)+(+square[1]+(color==='w'?1:-1))).filter(s=>/^[a-h][1-8]$/.test(s));}
export function goal(c,square,actor,tick){if(!square||c.get(square)?.type!=='n'||c.get(square)?.color!==actor)return false;const rank=actor==='w'?+square[1]:9-Number(square[1]);if(rank<5||rank>6)return false;
 const copy=new Chess(c.fen());copy.remove(square);copy.put({type:'n',color:other(actor)},square);const fields=copy.fen().split(' ');fields[1]=actor;fields[3]='-';let support;try{support=legalPosition(fields.join(' '));}catch{return false;}tick();if(support.isGameOver()||!support.moves({verbose:true}).some(m=>m.piece==='p'&&m.to===square&&m.captured==='n'))return false;
 for(const pawn of c.board().flat().filter(p=>p?.type==='p'&&p.color!==actor)){
  const seen=new Set(),pending=[pawn.square],step=pawn.color==='w'?1:-1,last=pawn.color==='w'?8:1,start=pawn.color==='w'?2:7;
  while(pending.length){const at=pending.pop();if(seen.has(at))continue;seen.add(at);tick();if(attacks(at,pawn.color).includes(square))return false;
   for(const [df,dr]of [[0,1],[-1,1],[1,1],...(+at[1]===start?[[0,2]]:[])]){const to=String.fromCharCode(at.charCodeAt(0)+df)+(+at[1]+dr*step);if(/^[a-h][1-8]$/.test(to)&&+to[1]!==last&&!seen.has(to))pending.push(to);}
  }
 }return true;
}
export function query(input){const start=performance.now(),c=prepare(input),journal=[];let ticks=0,attemptedPath=[];const actor=input.actor;
 const tick=()=>{if(++ticks>100000||performance.now()-start>10000)throw Error('Space hard cost cap');};
 function solve(square,left,path){attemptedPath=path;tick();const n={fen:c.fen(),square,left,path,win:false};journal.push(n);
  if(c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial()){n.kind='terminal';return n;}if(!square){n.kind='knight-lost';return n;}
  if(!c.board().flat().some(p=>p?.color===actor&&p.type==='p')){n.kind='no-support-pawns';return n;}
  if(c.isThreefoldRepetition()||+c.fen().split(' ')[4]>=100){n.kind='claim-sensitive';return n;}
  if(!left){n.kind='goal';n.win=goal(c,square,actor,tick);return n;}
  const legal=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b))),own=c.turn()===actor,choices=[];
  n.moves=legal.map(uci);for(const m of legal){if(!own){choices.push(m);continue;}if(m.captured||m.promotion||!['k','n'].includes(m.piece))continue;c.move(m);const quiet=!c.isCheck();c.undo();if(quiet)choices.push(m);}
  n.choices=choices.map(uci);n.branches=[];const ordered=own?[...choices].sort((a,b)=>Number(b.from===square)-Number(a.from===square)||uci(a).localeCompare(uci(b))):choices;
  for(const m of ordered){const next=m.color===actor&&m.from===square?m.to:m.color!==actor&&m.captured&&m.to===square?null:square;c.move(m);const edge={move:uci(m),child:null};n.branches.push(edge);try{edge.child=solve(next,left-1,[...path,edge.move]);}finally{c.undo();}if(edge.child.win===own){n.kind=own?'choice':'counterchoice';n.win=own;return n;}}
  n.kind=own?'all-fail':'all';n.win=!own;return n;
 }
 try{const tree=solve(input.knight,input.plies,[]);return {schema:'E261-query-v1',input:structuredClone(input),win:tree.win,tree,ticks,seconds:(performance.now()-start)/1000};}
 catch(e){e.partial={schema:'E261-incomplete-v1',input:structuredClone(input),ticks,seconds:(performance.now()-start)/1000,attemptedPath,journal:journal.map(n=>({...n,branches:n.branches?.map(b=>({move:b.move,childPath:b.child?.path??null}))})),error:e.message,status:'unavailable'};throw e;}
}
