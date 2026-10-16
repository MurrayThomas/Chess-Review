import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {Chess} from '../../../../lib/chess.js';
import {openTraffic} from '../../E278-coherent-brilliant-validation/code/traffic.mjs';
const p='research/experiments/E279-coherent-multipv-emission/',parent='research/experiments/E278-coherent-brilliant-validation/',out=process.argv[2];assert.ok(out?.startsWith('research/runs/E279/'));await mkdir(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),started=performance.now();await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
  const run=JSON.parse(await readFile(p+'evidence/run.json')),bytes=await readFile(p+'evidence/results.json.gz');assert.equal(hash(bytes),run.outputs['results.json.gz']);for(const [file,h] of Object.entries(run.sourceHashes))assert.equal(hash(await readFile(file)),h,file);
  const r=JSON.parse(gunzipSync(bytes)),pb=await readFile(parent+'evidence/results.json.gz');assert.equal(hash(pb),run.parentResultSha256);const previous=JSON.parse(gunzipSync(pb)),traffic=await openTraffic();assert.deepEqual(traffic.receipt,run.trafficEligibility);
  const inputs=JSON.parse(await readFile(p+'evidence/inputs.json'));const freeze=JSON.parse(await readFile(p+'evidence/freeze.json'));assert.equal(hash(await readFile(p+'evidence/inputs.json')),freeze.outputs['inputs.json']);assert.deepEqual(freeze.sourceHashes,run.sourceHashes);
  // Separate raw grammar and prefix oracle; no producer, method, descriptor or admission imports.
  function parse(text,index){if(!/^info /.test(text)||!text.includes(' score '))return null;
    const rank=+(text.match(/\bmultipv (\S+)/)?.[1]||1),depth=+(text.match(/\bdepth (\S+)/)?.[1]||0),s=text.match(/\bscore (cp|mate) (\S+)/);let score=null;
    if(s&&/^-?\d+$/.test(s[2])&&Number.isSafeInteger(+s[2])&&(s[1]!=='mate'||+s[2]!==0)){score={[s[1]]:+s[2]};const w=text.match(/\bwdl (\d+) (\d+) (\d+)/);if(w)score.wdl=w.slice(1).map(Number);}
    return {multipv:rank,depth,score,pv:text.includes(' pv ')?text.slice(text.indexOf(' pv ')+4).trim():'',bound:/\blowerbound\b/.test(text)?'lowerbound':/\bupperbound\b/.test(text)?'upperbound':'exact',sourceIndex:index};
  }
  function oracle(stream,strict){
    const legal=new Set(new Chess(stream.query.fen).moves({verbose:true}).map(m=>m.lan)),K=Math.min(stream.query.multipv,legal.size),all=stream.raw.map(parse).filter(Boolean),close=stream.raw.findIndex(t=>t.startsWith('bestmove '));
    const emitted=[],stats={scored:0,rank1Groups:0,incompleteOrInvalid:0,duplicates:0,regressions:0};let signature=null,depthFloor=-1,deepest=0,epoch=-1;
    for(const d of all){if(close>=0&&d.sourceIndex>=close)break;stats.scored++;if(d.multipv===1){epoch=d.sourceIndex;stats.rank1Groups++;if(d.bound==='exact'&&d.score&&d.pv&&d.depth>=4)deepest=Math.max(deepest,d.depth);}
      if(!Number.isSafeInteger(d.multipv)||d.multipv<1)continue;
      // Resolve each rank from its eligible prefix, rather than sharing the producer's cache.
      const prefix=all.filter(x=>x.sourceIndex<=d.sourceIndex&&(!strict||x.sourceIndex>=epoch));
      const lines=Array.from({length:K},(_,rank)=>prefix.findLast(x=>x.multipv===rank+1)),top=lines[0];
      const complete=K>0&&lines.every(x=>x?.score&&x.bound==='exact'&&Number.isSafeInteger(x.depth)&&x.depth>=4&&x.depth===top.depth);
      const roots=complete?lines.map(l=>l.pv.split(' ')[0]):[];
      if(!complete||new Set(roots).size!==K||roots.some(m=>!legal.has(m))){stats.incompleteOrInvalid++;continue;}
      if(top.depth<depthFloor){stats.regressions++;continue;}
      const sig=JSON.stringify(lines.map(l=>[l.multipv,l.depth,l.score,l.pv,l.bound]));if(sig===signature){stats.duplicates++;continue;}
      signature=sig;depthFloor=top.depth;emitted.push({streamId:stream.id,eventIndex:d.sourceIndex,epochStart:epoch,K,root:{bestmove:roots[0],score:top.score,pv:top.pv,lines}});
    }
    return {emitted,stats,K,deepest,lastDepth:depthFloor};
  }
  function validateArm(arm){const totals={streams:54,multiStreams:0,coveredMulti:0,multiWithinOneDepth:0,emissions:0,secondaryInspections:0,eligibleSecondary:0,rejectedSecondary:0,causalViolations:0,duplicates:0,regressions:0,byEngine:{}};const lags=[];
    for(const stream of traffic.streams){const row=r[arm].find(x=>x.streamId===stream.id);assert.ok(row);const expected=oracle(stream,arm==='P');assert.equal(row.frames.length,expected.emitted.length);assert.deepEqual(row.stats,expected.stats);assert.equal(row.K,expected.K);assert.equal(row.deepestTop,expected.deepest);assert.equal(row.lastDepth,expected.lastDepth);assert.equal(row.finalDepthLag,expected.lastDepth<0?null:expected.deepest-expected.lastDepth);
      const group=totals.byEngine[row.engine]||(totals.byEngine[row.engine]={streams:0,emissions:0,eligibleSecondary:0});group.streams++;group.emissions+=row.frames.length;
      if(row.K>1){totals.multiStreams++;if(row.frames.length)totals.coveredMulti++;if(row.finalDepthLag!=null&&row.finalDepthLag<=1)totals.multiWithinOneDepth++;}
      totals.emissions+=row.frames.length;totals.duplicates+=row.stats.duplicates;totals.regressions+=row.stats.regressions;let causal=0;
      row.frames.forEach((f,i)=>{const {inspection,...actual}=f;assert.deepEqual(actual,expected.emitted[i]);assert.equal(inspection.topSupported,true);assert.equal(inspection.candidates.length,f.K-1);
        if(f.root.lines.some(l=>l.sourceIndex<f.epochStart))causal++;if(arm==='P')assert.ok(f.root.lines.every(l=>l.sourceIndex>=f.epochStart&&l.sourceIndex<=f.eventIndex));
        for(const candidate of inspection.candidates){assert.equal(candidate.rejection,null);assert.equal(candidate.bound,'exact');assert.equal(candidate.depth,f.root.lines[0].depth);totals.secondaryInspections++;totals.eligibleSecondary++;group.eligibleSecondary++;}
        lags.push(f.eventIndex-f.epochStart);
      });assert.equal(causal,row.causalViolations);totals.causalViolations+=causal;
    }
    lags.sort((a,b)=>a-b);const q=x=>lags.length?lags[Math.floor((lags.length-1)*x)]:null;totals.eventLag={min:q(0),median:q(.5),p95:q(.95),max:q(1)};
    assert.deepEqual(totals,arm==='P'?r.producer:r.depthOnly);return totals;
  }
  const P=validateArm('P'),Q=validateArm('Q');assert.equal(P.multiStreams,24);
  let finalChecks=0;for(const stream of traffic.streams){const cache=new Map();let score=null,pv='',best=null;for(let i=0;i<stream.raw.length;i++){const text=stream.raw[i],d=parse(text,i);if(d){assert.ok(d.score);const {sourceIndex,...line}=d;cache.set(d.multipv,line);if(d.multipv===1){score=d.score;if(d.pv)pv=d.pv;}}if(text.startsWith('bestmove '))best=text.split(/\s+/)[1];}
    const root={bestmove:best==='(none)'?null:best,score:score||{cp:0},pv,lines:[...cache.entries()].sort((a,b)=>a[0]-b[0]).map(x=>x[1])};assert.deepEqual(root,previous.natural.nativeFinals.find(x=>x.streamId===stream.id).root);finalChecks++;}
  const baseline=previous.natural.frames.filter(f=>f.phase==='logical-progress');assert.equal(baseline.length,r.baseline.logicalEmissions);assert.equal(baseline.reduce((n,f)=>n+f.candidates.length,0),r.baseline.secondaryInspections);assert.equal(r.baseline.eligibleSecondary,0);
  let singles=0,singlePreserved=0;for(const row of r.P.filter(x=>x.K===1)){singles++;const a=row.frames.at(-1)?.root.lines[0],b=baseline.filter(x=>x.streamId===row.streamId).at(-1)?.root.lines.find(l=>l.multipv===1);assert.deepEqual(a?[a.score,a.pv,a.depth]:null,b?[b.score,b.pv,b.depth]:null);singlePreserved++;}
  const gates={validSources:P.rejectedSecondary===0,causal:P.causalViolations===0,streamCoverage:P.coveredMulti>=inputs.gates.minCoveredMulti,usableRecovery:P.eligibleSecondary>=inputs.gates.minEligibleSecondary,finalDepth:P.multiWithinOneDepth>=inputs.gates.minWithinOneDepth,singleLatest:singlePreserved===singles,nativeFinals:finalChecks===54};assert.deepEqual(gates,r.gates);assert.equal(r.passed,Object.values(gates).every(Boolean));
  const repeat=await readFile('research/runs/E279/repeat/results.json.gz');assert.equal(hash(repeat),hash(bytes));
  const result={schema:'E279-independent-prefix-audit-v1',passed:true,jointScreen:r.passed,exactCompressedReportRepeat:true,producerFrames:P.emissions,depthOnlyFrames:Q.emissions,prefixOracleStreams:traffic.streams.length,nativeFinalChecks:finalChecks,singleLatest:singlePreserved,allGates:gates,
    independentSourceIndexAndEligibilityChecks:true,codeSha256:hash(await readFile(p+'code/audit.mjs')),inputSha256:hash(bytes),elapsedMs:performance.now()-started,completedUtc:new Date().toISOString(),limits:'Exposed diagnostic traffic; source-event lag is not latency or user-visible annotation recovery.'};assert.ok(result.elapsedMs<=120000);await writeFile(out+'/verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}
