import assert from 'node:assert/strict';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate,occurrenceIds} from './contract.mjs';
// Independent field reconstruction and legal replay. No own parser/classifier helpers.
function rawFields(raw){
 const s=raw.trim();if(!/^info(?:\s|$)/.test(s))return{status:'unsupported',fields:null};let at=4;const f={};
 const re=/\s+(?:(depth|seldepth|nodes|nps|time|hashfull|tbhits|multipv)\s+([^\s]+)|score\s+(cp|mate)\s+([^\s]+)|wdl\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)|(lowerbound|upperbound)(?=\s|$)|pv\s+(.+)|string(?:\s.*|$))/y;
 const number=(x,signed=false)=>{assert((signed?/^-?(0|[1-9]\d*)$/:/^(0|[1-9]\d*)$/).test(x));const n=Number(x);assert(Number.isSafeInteger(n));return n||0;};
 while(at<s.length){re.lastIndex=at;const m=re.exec(s);if(!m)return{status:'unsupported',fields:null};at=re.lastIndex;
  if(m[1]){assert(!Object.hasOwn(f,m[1]));f[m[1]]=number(m[2]);assert(m[1]!=='hashfull'||f[m[1]]<=1000);assert(m[1]!=='multipv'||f[m[1]]>=1);}
  else if(m[3]){assert(!f.score);f.score={unit:m[3],value:number(m[4],true),bound:'exact'};}
  else if(m[5]!==undefined){assert(!f.wdl);f.wdl=[number(m[5]),number(m[6]),number(m[7])];assert.equal(f.wdl.reduce((a,b)=>a+b),1000);assert(f.wdl.every(n=>n<=1000));}
  else if(m[8]){assert(f.score&&f.score.bound==='exact');f.score.bound=m[8]==='lowerbound'?'lower':'upper';}
  else if(m[9]){f.pv=m[9].trim().split(/\s+/);assert(f.pv.length>=1&&f.pv.length<=64&&f.pv.every(x=>/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(x)));}
  else return{status:'opaque-string',fields:null};
 }return{status:'parsed',fields:f};
}
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
function flags(c){const h=c.history({verbose:true}),all=[h[0]?.before??c.fen(),...h.map(m=>m.after)],n=all.filter(f=>f.split(' ').slice(0,4).join(' ')===key(c)).length;return{mate:c.isCheckmate(),stalemate:c.isStalemate(),insufficient:c.isInsufficientMaterial(),fifty:c.isDrawByFiftyMoves(),threefold:c.isThreefoldRepetition(),automatic75:+c.fen().split(' ')[4]>=150,automatic5:n>=5};}
function root(input){const c=legalPosition(input.history?.fen??input.fen);for(const code of input.history?.moves??[]){const f=flags(c);assert(!f.mate&&!f.stalemate&&!f.insufficient&&!f.automatic75&&!f.automatic5);const m=c.moves({verbose:true}).find(m=>uci(m)===code);assert(m);c.move({from:m.from,to:m.to,promotion:m.promotion});}assert.equal(c.fen(),legalPosition(input.fen).fen());return c;}
export function checkEngineDiagnosticSupport(input,options,result){
 const limits=validate(input,options);plain(result);assert.deepEqual(Object.keys(result).sort(),['schema','coverageCredit','qualityClaim','authentication','limits','status','view','references','routes'].sort());assert.equal(result.schema,'E223-engine-diagnostic-support');assert.equal(result.coverageCredit,false);assert.equal(result.qualityClaim,false);assert.equal(result.authentication,'caller-report-only');assert.deepEqual(result.limits,limits);
 const empty=status=>{assert.equal(result.status,status);assert.equal(result.view,null);assert.deepEqual(result.references,[]);assert.deepEqual(result.routes,[]);};if(!options.enabled){empty('disabled');return true;}
 const c=root(input),actor=c.turn(),player=options.player??actor,flip=actor!==player,n=input.frames.reduce((n,f)=>n+f.lines.length,0);if(n>limits.maxRecords){empty('budget-unavailable');return true;}
 const frames=input.frames.map(f=>({id:f.id,rows:f.lines.map(raw=>({raw,...rawFields(raw)}))})),total=frames.reduce((n,f)=>n+f.rows.reduce((n,r)=>n+(r.fields?.pv?.length??0),0),0);if(total>limits.maxPvPlies){empty('budget-unavailable');return true;}
 const k=Math.min(input.multiPV,c.moves().length),expectedFrames=[];
 for(const f of frames){const rows=[];for(const r of f.rows){if(r.fields===null){rows.push({raw:r.raw,status:r.status,diagnostics:null,score:null,wdl:null,pv:null});continue;}const p=r.fields;assert(p.multipv===undefined||p.multipv<=input.multiPV);const diagnostics={};for(const name of ['depth','seldepth','nodes','nps','time','hashfull','tbhits','multipv'])diagnostics[name]=p[name]===undefined?null:p[name];let score=null,wdl=null,pv=null;
   if(p.score){let bound=p.score.bound;if(flip&&bound!=='exact')bound=bound==='upper'?'lower':'upper';score={unit:p.score.unit,value:flip&&p.score.value!==0?-p.score.value:p.score.value,bound,player,rawPerspective:actor,meaning:'reported-search-score'};}
   if(p.wdl)wdl={values:flip?[p.wdl[2],p.wdl[1],p.wdl[0]]:[...p.wdl],player,model:input.wdlModel??'unspecified-reported-model',meaning:'reported-model-output'};
   if(p.pv){const board=root(input),states=[];for(const code of p.pv){const f=flags(board);assert(!f.mate&&!f.stalemate&&!f.insufficient&&!f.automatic75&&!f.automatic5);const m=board.moves({verbose:true}).find(m=>uci(m)===code);assert(m);board.move({from:m.from,to:m.to,promotion:m.promotion});states.push({move:code,san:m.san,fen:board.fen(),turn:board.turn(),flags:flags(board)});}pv={moves:[...p.pv],states,meaning:'legal-reported-continuation'};}
   rows.push({raw:r.raw,status:r.status,diagnostics,score,wdl,pv});
  }
  const seenRanks=new Set(),seenMoves=new Set();let conflict=false,full=k>0&&rows.length===k;const depths=new Set();for(const r of rows){const rank=r.diagnostics?.multipv,first=r.pv?.moves[0];if(rank!==null&&rank!==undefined){if(seenRanks.has(rank))conflict=true;seenRanks.add(rank);}if(first){if(seenMoves.has(first))conflict=true;seenMoves.add(first);}if(!r.score||!r.pv||rank===null||rank===undefined||r.diagnostics.depth===null)full=false;else depths.add(r.diagnostics.depth);}for(let i=1;i<=k;i++)if(!seenRanks.has(i))full=false;if(depths.size!==1)full=false;
  expectedFrames.push({id:f.id,rows,menu:{status:conflict?'conflicting-reports':full?'reported-menu':'incomplete',expectedRanks:k,reportedOrder:full&&!conflict?[...rows].sort((a,b)=>a.diagnostics.multipv-b.diagnostics.multipv).map(r=>r.pv.moves[0]):[],optimalityClaim:false,frameAuthentication:'caller-framed'}});
 }
 assert.equal(result.status,'support-observations');assert.deepEqual(result.view,{source:input.source,eventId:input.eventId,engine:input.engine,root:c.fen(),actor,player,multiPV:input.multiPV,historyCoverage:input.history?'supplied-segment':'root-only',records:n,pvPlies:total,frames:expectedFrames});
 const all=expectedFrames.flatMap(f=>f.rows),conditions={'C1011':all.some(r=>r.pv),'C1012':true,'C1014':all.some(r=>r.score?.unit==='cp'),'C1015':all.some(r=>r.diagnostics?.depth!==null&&r.diagnostics?.depth!==undefined),'C1016':all.some(r=>r.diagnostics?.nodes!==null&&r.diagnostics?.nodes!==undefined),'C1017':all.some(r=>r.diagnostics?.nps!==null&&r.diagnostics?.nps!==undefined),'C1018':all.some(r=>r.pv),'C1019':all.some(r=>r.pv),'C1020':expectedFrames.some(f=>f.menu.status==='reported-menu')};
 assert.deepEqual(result.routes,occurrenceIds.map(id=>({id,status:id==='C1013'?'reference-only':conditions[id]?'reported-support':'unavailable',evidencePath:id==='C1013'?'references':conditions[id]?'view':null,qualityClaim:false})));assert.equal(result.references.length,10);for(const [i,r]of result.references.entries()){assert.deepEqual(Object.keys(r).sort(),['id','label','description','qualityClaim'].sort());assert.equal(r.id,occurrenceIds[i]);assert.equal(r.qualityClaim,false);assert(typeof r.label==='string'&&r.label.length>0&&typeof r.description==='string'&&r.description.length>0);}return true;
}
