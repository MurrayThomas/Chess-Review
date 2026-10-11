import {Chess} from '../../../../lib/chess.js';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {Exhausted,suffixNag} from './contract.mjs';
import {lex} from './lex.mjs';
export const standardFen=new Chess().fen();
const positionKey=c=>c.fen().split(' ').slice(0,4).join(' ');
const roster=['Event','Site','Date','Round','White','Black','Result'];
export function parse(pgn,limits){
 if(pgn.length>limits.maxChars)throw new Exhausted('characters');
 const tokens=lex(pgn),tags=[];let at=0,usedMoves=0;
 while(tokens[at]?.type==='tag'){const t=tokens[at++];if(tags.some(x=>x.name===t.name))throw Error('Duplicate tag');tags.push({name:t.name,value:t.value});}
 const get=name=>tags.find(t=>t.name===name)?.value;
 if(get('SetUp')!==undefined&&!['0','1'].includes(get('SetUp')))throw Error('Invalid SetUp');
 if((get('SetUp')==='1')!==(get('FEN')!==undefined))throw Error('SetUp/FEN pairing required');
 const start=legalPosition(get('FEN')??standardFen).fen();
 function line(fen,counts,depth){
  if(depth>limits.maxDepth)throw new Exhausted('depth');
  const c=legalPosition(fen),out={startFen:fen,comments:[],moves:[]};let last=null,pendingNumber=false;
  while(at<tokens.length){
   const t=tokens[at];
   if(t.type===')'||t.type==='result')break;
   at++;
   if(t.type==='comment'){(last?last.annotations:out.comments).push(last?{type:'comment',value:t.value}:t.value);continue;}
   if(t.type==='nag'){if(!last||pendingNumber)throw Error('Annotation without move');last.annotations.push({type:'nag',value:t.value});continue;}
   if(t.type==='('){if(!last||pendingNumber)throw Error('Variation without preceding move');const child=line(last.before,new Map(last.countsBefore),depth+1);if(!child.moves.length||tokens[at]?.type!==')')throw Error('Malformed variation');at++;last.annotations.push({type:'variation',line:child});continue;}
   if(t.type==='number'){if(pendingNumber||t.value!==+c.fen().split(' ')[5]||t.side!==c.turn())throw Error('Wrong move number/side');pendingNumber=true;continue;}
   if(t.type!=='move')throw Error('Unexpected token');
   if(usedMoves>=limits.maxMoves)throw new Exhausted('moves');
   const half=+c.fen().split(' ')[4];if(c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial()||half>=150||(counts.get(positionKey(c))??0)>=5)throw Error('Continuation after automatic terminal');
   const match=/^(.*?)(!!|\?\?|!\?|\?!|!|\?)?$/.exec(t.value),san=match[1],m=c.moves({verbose:true}).find(m=>m.san===san);
   if(!m)throw Error('Illegal or noncanonical SAN: '+t.value);
   const before=c.fen(),countsBefore=[...counts],number=+before.split(' ')[5],side=c.turn();if(side==='b'&&number===Number.MAX_SAFE_INTEGER)throw Error('Fullmove counter overflow');c.move({from:m.from,to:m.to,promotion:m.promotion});counts.set(positionKey(c),(counts.get(positionKey(c))??0)+1);usedMoves++;
   last={san,uci:uci(m),before,after:c.fen(),number,side,annotations:match[2]?[{type:'nag',value:suffixNag[match[2]]}]:[],countsBefore};out.moves.push(last);pendingNumber=false;
  }
  if(pendingNumber)throw Error('Move number without move');return out;
 }
 const root=legalPosition(start),tree=line(start,new Map([[positionKey(root),1]]),0);
 if(tokens[at]?.type!=='result')throw Error('Missing game result');const result=tokens[at++].value;
 if(at!==tokens.length)throw Error('Trailing tokens or multiple games');
 if(get('Result')!==undefined&&get('Result')!==result)throw Error('Result mismatch');
 const canonicalTags=roster.map(name=>({name,value:get(name)??(name==='Result'?result:name==='Date'?'????.??.??':'?')}));
 canonicalTags.push(...tags.filter(t=>!roster.includes(t.name)).sort((a,b)=>a.name.localeCompare(b.name,'en')));
 // Internal history inventories are only needed while attaching RAVs.
 const clean=l=>{for(const m of l.moves){delete m.countsBefore;for(const a of m.annotations)if(a.type==='variation')clean(a.line);}};clean(tree);
 return{tags:canonicalTags,line:tree,result,usedMoves};
}
