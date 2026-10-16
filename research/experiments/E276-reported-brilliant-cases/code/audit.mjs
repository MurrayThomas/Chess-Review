import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {Chess} from '../../../../lib/chess.js';
import {prefix,hash,loadCases} from './cases.mjs';
import {currentClassifier} from './classifier.mjs';
const out=process.argv[2];assert.ok(out?.startsWith('research/runs/E276/'));
await mkdir(out,{recursive:true});
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
const access=await loadCases(),bytes=await readFile(prefix+'evidence/observations.json.gz');
const receipt=JSON.parse(await readFile(prefix+'evidence/collection-run.json'));assert.equal(hash(bytes),receipt.outputHash);
for(const [p,h] of Object.entries(receipt.sources))assert.equal(hash(await readFile(p)),h,p);
const data=JSON.parse(gunzipSync(bytes));assert.equal(data.complete,true);
const {api}=await currentClassifier();let pvLines=0,pvMoves=0,scores=0,exchangeComparisons=0;
const exchangeRows=[];
const value={p:1,n:3,b:3,r:5,q:9,k:0};
// A separate exhaustive legal recursion; no production memoization, attacker shortcut or cap.
function independentGain(fen,target){
  const board=new Chess(fen);if(!board.get(target))return 0;
  const legal=board.moves({verbose:true}),captures=legal.filter(m=>m.captured&&m.to===target);
  if(!captures.length)return 0;
  const options=captures.map(m=>value[m.captured]+(m.promotion?value[m.promotion]-1:0)-independentGain(m.after,target));
  if(legal.some(m=>!m.captured||m.to!==target))options.push(0);return Math.max(...options);
}
for(const observation of data.observations){
  const c=access.input.cases.find(c=>c.id===observation.query.case);assert.ok(c);
  assert.equal(observation.query.fen,observation.query.role==='after'?c.after:c.before);
  const legal=new Chess(observation.query.fen).moves({verbose:true}).map(m=>m.lan);assert.ok(legal.includes(observation.bestmove));
  const raw=observation.raw;assert.ok(raw.includes('bestmove '+observation.bestmove)||raw.some(l=>l.startsWith('bestmove '+observation.bestmove+' ')));
  let matched=null;
  for(const line of raw){
    if(!line.startsWith('info ')||!line.includes(' pv '))continue;
    const pv=line.slice(line.indexOf(' pv ')+4).trim().split(/\s+/),board=new Chess(observation.query.fen);
    for(const move of pv){board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});pvMoves++;}pvLines++;
    const s=/\bscore (cp|mate) (-?\d+)/.exec(line),rank=/\bmultipv (\d+)/.exec(line);
    if(s&&(!rank||Number(rank[1])===1)&&pv[0]===observation.bestmove&&!/\b(?:lowerbound|upperbound)\b/.test(line)&&Number(/\bdepth (\d+)/.exec(line)?.[1])===observation.depth){
      matched={kind:s[1],value:Number(s[2]),wdl:/\bwdl (\d+) (\d+) (\d+)/.exec(line)};
    }
  }
  assert.ok(matched);assert.equal(matched.value,observation.score[matched.kind]);
  if(matched.wdl){assert.deepEqual(matched.wdl.slice(1).map(Number),observation.score.wdl);assert.equal(matched.wdl.slice(1).map(Number).reduce((a,b)=>a+b),1000);}scores++;
}
for(const c of access.input.cases){
  const after=new Chess(c.after),before=new Chess(c.before),fields=c.before.split(' ');fields[1]='w';fields[3]='-';
  const beforeOpponent=new Chess(fields.join(' '));
  const legalCaptures=after.moves({verbose:true}).filter(m=>m.captured);
  for(const piece of after.board().flat().filter(p=>p&&p.color==='b'&&['n','b','r','q'].includes(p.type))){
    if(!legalCaptures.some(m=>m.to===piece.square))continue;
    const row={case:c.id,target:piece.square,type:piece.type};
    for(const [name,board] of [['after',after],['beforeOpponent',beforeOpponent],...(c.visiblePrior?[['visiblePrior',new Chess(c.visiblePrior)]]:[])]){
      const independent=independentGain(board.fen(),piece.square),production=api.exchangeGain(board,piece.square,{nodes:0,maxNodes:128});
      assert.equal(independent,production);row[name]=independent;exchangeComparisons++;
    }
    exchangeRows.push(row);
  }
}
const result={schema:'E276-independent-audit-v1',passed:true,caseEligibility:access.receipt,observations:scores,legalPvLines:pvLines,legalPvMoves:pvMoves,
  codeSha256:hash(await readFile(prefix+'code/audit.mjs')),inputSha256:hash(bytes),command:process.argv.slice(1),completedUtc:new Date().toISOString(),
  independentExchangeComparisons:exchangeComparisons,exchangeRows,
  captures:access.input.cases.map(c=>({case:c.id,legal:new Chess(c.after).moves({verbose:true}).filter(m=>m.captured).map(m=>({san:m.san,uci:m.lan,captured:m.captured}))})),
  limitations:'Independent transcript/legality/local-exchange replay, not independent engine truth, original-version reproduction or human aesthetic agreement.'};
await writeFile(out+'/verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack,completedUtc:new Date().toISOString()},null,2)+'\n',{flag:'wx'});throw error;}
