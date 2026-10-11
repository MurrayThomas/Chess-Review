import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate} from './contract.mjs';
// Separate scanner, no imports from parser, lexer, serializer, reference or classifier.
function scan(raw){
 const s=raw.replace(/\r\n?/g,'\n'),out=[];let pos=0;
 const re=/\s+|\{[^}]*\}|;[^\n]*|\[([A-Za-z0-9_]+)\s+"((?:[^"\\\n]|\\["\\])*)"\s*\]|\$([0-9]+)|(1\/2-1\/2|1-0|0-1|\*)|([1-9][0-9]*)(\.{1,3})|[()]|[A-Za-z0-9+#=!?-]+/y;
 while(pos<s.length){if(s[pos]==='%'&&(pos===0||s[pos-1]==='\n')){const end=s.indexOf('\n',pos);pos=end<0?s.length:end;continue;}re.lastIndex=pos;const m=re.exec(s);assert(m,'Independent unsupported token');pos=re.lastIndex;const x=m[0];if(/^\s/.test(x))continue;
  if(x[0]==='{'||x[0]===';')out.push({type:'comment',value:x[0]==='{'?x.slice(1,-1):x.slice(1)});
  else if(m[1])out.push({type:'tag',name:m[1],value:m[2].replace(/\\([\\"])/g,'$1')});
  else if(m[3]!==undefined){assert(+m[3]<=255);out.push({type:'nag',value:+m[3]});}
  else if(m[4])out.push({type:'result',value:m[4]});
  else if(m[5]){assert([1,3].includes(m[6].length));out.push({type:'number',value:+m[5],side:m[6].length===1?'w':'b'});}
  else if(['(',')'].includes(x))out.push({type:x});
  else{const suffix=/[!?]+$/.exec(x),n={'!':1,'?':2,'!!':3,'??':4,'!?':5,'?!':6};if(suffix){assert(Object.hasOwn(n,suffix[0]));out.push({type:'move',value:x.slice(0,-suffix[0].length)},{type:'nag',value:n[suffix[0]]});}else out.push({type:'move',value:x});}
 }return out;
}
const keys=(x,expected)=>assert.deepEqual(Object.keys(x).sort(),[...expected].sort());
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
export function checkNotationSupport(input,options,result){
 const limits=validate(input,options);plain(result);keys(result,['schema','coverageCredit','qualityClaim','limits','status','document','pgn','references','routes']);assert.equal(result.schema,'E222-notation-support');assert.equal(result.coverageCredit,false);assert.equal(result.qualityClaim,false);assert.deepEqual(result.limits,limits);
 if(!options.enabled||result.status==='budget-unavailable'){
  assert.equal(result.status,!options.enabled?'disabled':'budget-unavailable');assert.equal(result.document,null);assert.equal(result.pgn,null);assert.deepEqual(result.references,[]);assert.deepEqual(result.routes,[]);
  if(options.enabled&&input.pgn.length<=limits.maxChars){const ts=scan(input.pgn);let depth=0,max=0;for(const t of ts){if(t.type==='(')max=Math.max(max,++depth);if(t.type===')')depth--;}assert(ts.filter(t=>t.type==='move').length>limits.maxMoves||max>limits.maxDepth,'Unsupported budget abstention');}return true;
 }
 assert.equal(result.status,'support-observations');assert(input.pgn.length<=limits.maxChars);
 const ts=scan(input.pgn);let pos=0,count=0;const tags=[];while(ts[pos]?.type==='tag'){const t=ts[pos++];assert(!tags.some(x=>x.name===t.name));tags.push({name:t.name,value:t.value});}
 const find=name=>tags.find(t=>t.name===name)?.value,roster=['Event','Site','Date','Round','White','Black','Result'];
 const doc=result.document;keys(doc,['source','eventId','tags','line','result','usedMoves']);assert.equal(doc.source,input.source);assert.equal(doc.eventId,input.eventId);
 assert((find('SetUp')==='1')===(find('FEN')!==undefined));assert(find('SetUp')===undefined||['0','1'].includes(find('SetUp')));
 const start=legalPosition(find('FEN')??new Chess().fen()).fen();
 function walk(line,fen,history,depth){
  assert(depth<=limits.maxDepth);keys(line,['startFen','comments','moves']);assert.equal(line.startFen,fen);assert(Array.isArray(line.comments)&&Array.isArray(line.moves));
  const c=legalPosition(fen);let pendingNumber=false;
  const number=()=>{if(ts[pos]?.type==='number'){assert(!pendingNumber);assert.deepEqual(ts[pos++],{type:'number',value:+c.fen().split(' ')[5],side:c.turn()});pendingNumber=true;}};
  for(const value of line.comments){number();assert.deepEqual(ts[pos++],{type:'comment',value});}
  for(const m of line.moves){keys(m,['san','uci','before','after','number','side','annotations']);assert.equal(m.before,c.fen());assert.equal(m.side,c.turn());assert.equal(m.number,+c.fen().split(' ')[5]);
   number();assert.deepEqual(ts[pos++],{type:'move',value:m.san});pendingNumber=false;assert(count++<limits.maxMoves);
   assert(!c.isCheckmate()&&!c.isStalemate()&&!c.isInsufficientMaterial()&&+c.fen().split(' ')[4]<150&&(history.get(key(c))??0)<5);
   const beforeHistory=new Map(history),played=c.move(m.san,{strict:true});assert.equal(played.san,m.san);assert.equal(m.uci,played.from+played.to+(played.promotion??''));assert.equal(m.after,c.fen());history.set(key(c),(history.get(key(c))??0)+1);
   for(const a of m.annotations){if(a.type==='variation'){assert(!pendingNumber);keys(a,['type','line']);assert.deepEqual(ts[pos++],{type:'('});assert(a.line.moves.length>0);walk(a.line,m.before,new Map(beforeHistory),depth+1);assert.deepEqual(ts[pos++],{type:')'});}else{keys(a,['type','value']);assert(['comment','nag'].includes(a.type));if(a.type==='comment')number();else assert(!pendingNumber);assert.deepEqual(ts[pos++],a);}}
  }assert(!pendingNumber);
 }
 const initial=legalPosition(start);walk(doc.line,start,new Map([[key(initial),1]]),0);assert.deepEqual(ts[pos++],{type:'result',value:doc.result});assert.equal(pos,ts.length);assert.equal(count,doc.usedMoves);
 assert(find('Result')===undefined||find('Result')===doc.result);
 const expected=roster.map(name=>({name,value:find(name)??(name==='Result'?doc.result:name==='Date'?'????.??.??':'?')}));expected.push(...tags.filter(t=>!roster.includes(t.name)).sort((a,b)=>a.name.localeCompare(b.name,'en')));assert.deepEqual(doc.tags,expected);
 const exportTokens=scan(result.pgn),expectedTokens=[...doc.tags.map(t=>({type:'tag',...t}))];
 function events(l){for(const value of l.comments)expectedTokens.push({type:'comment',value});for(const m of l.moves){expectedTokens.push({type:'number',value:m.number,side:m.side},{type:'move',value:m.san});for(const a of m.annotations)if(a.type==='variation'){expectedTokens.push({type:'('});events(a.line);expectedTokens.push({type:')'});}else expectedTokens.push(a);}}
 events(doc.line);expectedTokens.push({type:'result',value:doc.result});assert.deepEqual(exportTokens,expectedTokens);
 // Cross-check the main line through the bundled independent PGN import path.
 const c=new Chess();c.loadPgn(result.pgn,{strict:true});assert.deepEqual(c.history(),doc.line.moves.map(m=>m.san));assert.equal(c.fen(),doc.line.moves.at(-1)?.after??start);
 assert.equal(result.references.length,22);assert.equal(result.routes.length,22);const referenceOnly=new Set(['C0986','C1001','C1002','C1003','C1004','C1005','C1006']);
 for(let i=0;i<22;i++){const id='C'+String(985+i).padStart(4,'0'),r=result.references[i],route=result.routes[i];keys(r,['id','label','description','scope','qualityClaim']);assert.equal(r.id,id);assert.equal(r.qualityClaim,false);assert(typeof r.label==='string'&&r.label.length>0&&typeof r.description==='string'&&r.description.length>0);assert.equal(r.scope==='reference-only',referenceOnly.has(id));assert.deepEqual(route,{id,status:referenceOnly.has(id)?'reference-only':'support-contract',evidencePath:referenceOnly.has(id)?'references':'document',qualityClaim:false});}
 return true;
}
