import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {Chess} from '../../../../lib/chess.js';
import {openTraffic} from './traffic.mjs';
const p='research/experiments/E278-coherent-brilliant-validation/',old='research/experiments/E277-brilliant-evidence-admission/',out=process.argv[2];assert.ok(out?.startsWith('research/runs/E278/'));await mkdir(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),started=performance.now();
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
  const bytes=await readFile(p+'evidence/results.json.gz'),run=JSON.parse(await readFile(p+'evidence/run.json')),freeze=JSON.parse(await readFile(p+'evidence/freeze.json'));
  assert.equal(hash(bytes),run.outputs['results.json.gz']);assert.deepEqual(run.sourceHashes,freeze.sourceHashes);
  for(const [file,h] of Object.entries(run.sourceHashes))assert.equal(hash(await readFile(file)),h,file);
  const parentBytes=await readFile(old+'evidence/results.json.gz');assert.equal(hash(parentBytes),run.parentResultSha256);const parent=JSON.parse(gunzipSync(parentBytes));assert.equal(parent.passed,false);assert.equal(parent.totals.candidatePositiveLost,8);
  const r=JSON.parse(gunzipSync(bytes)),inputs=JSON.parse(await readFile(p+'evidence/inputs.json'));assert.equal(inputs.candidateSha256,run.candidateSha256);assert.equal(hash(await readFile(old+'code/candidate.mjs')),run.candidateSha256);
  const keys=new Set(),counts={rows:0,positive:0,invalidUsed:0,negative:0,baselineInvalidBrilliant:0,candidateInvalidAdmitted:0,candidatePositiveLost:0,candidateNegativeChanged:0,bluntPositiveLost:0,unchangedNumerics:true};
  let nonOverlay=0,changed=0,overlayCoherence=0;
  for(const row of r.rows){counts.rows++;const key=[row.id,row.color,row.build,row.path].join(':');assert.ok(!keys.has(key));keys.add(key);assert.ok(inputs.scenarios.some(s=>s.id===row.id&&s.expectation===row.expectation));assert.ok(inputs.colors.includes(row.color)&&inputs.builds.includes(row.build)&&inputs.paths.includes(row.path));
    const {B,C,U}=row.arms;assert.equal(B.numericSnapshot,C.numericSnapshot);assert.equal(B.numericSnapshot,U.numericSnapshot);
    if(row.expectation==='retain'){counts.positive++;assert.equal(B.category,'brilliant');assert.equal(C.category,'brilliant');if(U.category!=='brilliant')counts.bluntPositiveLost++;}
    else if(row.expectation==='withhold'){counts.invalidUsed++;assert.equal(B.category,'brilliant');counts.baselineInvalidBrilliant++;assert.equal(C.category,null);}
    else{counts.negative++;assert.notEqual(C.category,'brilliant');assert.equal(C.category,B.category);assert.equal(C.grade,B.grade);}
    const previous=parent.rows.find(x=>[x.id,x.color,x.build,x.path].join(':')===key);assert.ok(previous);
    if(row.path!=='overlay'){assert.deepEqual(row,previous);nonOverlay++;}
    else{const expectedChange=['valid-no-candidate','valid-no-lines'].includes(row.id);if(expectedChange)changed++;
      for(const arm of ['B','C','U']){const a=row.arms[arm],e=a.overlayEvidence;assert.ok(e);const board=new Chess(e.afterFen),first=e.childPreview.pv.split(' ')[0];assert.ok(board.moves({verbose:true}).some(m=>m.lan===first));
        assert.equal(e.childPreview.lines[0].bound,'exact');assert.equal(e.childPreview.lines[0].depth,16);assert.ok(e.childPreview.score.cp===-e.declaredMoverCp);
        const whiteSign=board.turn()==='w'?1:-1;assert.equal(e.completedChild.score.cp*whiteSign,e.completedWhiteEval.cp);assert.equal(e.completedChild.score.cp,600);
        const numeric=JSON.parse(a.numericSnapshot);assert.deepEqual(numeric.bests[1],e.completedChild);assert.deepEqual(numeric.evals[1],e.completedWhiteEval);overlayCoherence++;
        if(expectedChange&&arm!=='U'){assert.equal(previous.arms[arm].category,'blunder');assert.equal(a.category,'brilliant');}
        else{assert.equal(a.category,previous.arms[arm].category);assert.equal(a.grade,previous.arms[arm].grade);}
      }
    }
  }
  assert.deepEqual(counts,r.totals);assert.equal(keys.size,252);assert.equal(nonOverlay,168);assert.equal(changed,8);assert.equal(overlayCoherence,252);assert.equal(r.passed,true);
  assert.deepEqual(r.witnesses,parent.witnesses);assert.deepEqual(r.cache,parent.cache);
  const traffic=await openTraffic();assert.deepEqual(traffic.receipt,run.trafficEligibility);assert.equal(traffic.streams.length,54);assert.equal(traffic.receipt.excluded.length,4);
  const framesById=new Map(r.natural.frames.map(f=>[[f.streamId,f.phase,f.eventIndex].join('|'),f])),native=new Map(r.natural.nativeFinals.map(f=>[f.streamId,f.root]));let reconstructedFrames=0,inspections=0,rootSupported=0,secondaryIssues=0,bounded=0,depthMismatch=0,rejected=0,duplicates=0,empty=0,illegal=0,progress=0,final=0;
  const issueStreams=new Set(),byContext={};
  // Reconstruct the native cache from raw messages with a separate parser, no UCI Engine import.
  function check(stream,phase,eventIndex,root){
    const id=[stream.id,phase,eventIndex].join('|'),frame=framesById.get(id);assert.ok(frame,id);framesById.delete(id);assert.deepEqual(frame.root,root);reconstructedFrames++;if(phase==='final')final++;else progress++;
    const legal=new Set(new Chess(stream.query.fen).moves({verbose:true}).map(m=>m.lan)),top=root.lines.find(l=>l.multipv===1)||root.lines[0],first=top?.pv?.split(' ')[0];
    const supported=!!top&&top.bound==='exact'&&top.multipv===1&&Number.isSafeInteger(top.depth)&&top.depth>0&&first===root.bestmove&&legal.has(first);assert.equal(frame.topSupported,supported);
    const groupKey=stream.query.engine+':'+phase,group=byContext[groupKey]||(byContext[groupKey]={frames:0,inspections:0,topSupportedSecondaryIssues:0});group.frames++;
    const seen=new Set(),expected=[];let dup=0,missing=0,bad=0;
    for(const line of root.lines){if(line.multipv<2)continue;const move=line.pv.split(' ')[0];if(!move){missing++;continue;}if(move===root.bestmove||seen.has(move)){dup++;continue;}seen.add(move);if(!legal.has(move)){bad++;continue;}
      const used=root.lines.find(l=>l.pv.split(' ')[0]===move);let reason=null;
      if(top.bound!=='exact'||used.bound!=='exact')reason='used-bound-not-exact';
      else if(!Number.isSafeInteger(top.depth)||top.depth<=0||used.depth!==top.depth)reason='used-depth-not-current';
      else if(top.multipv!==1||!root.bestmove||first!==root.bestmove)reason='top-identity-mismatch';
      else if(!Number.isSafeInteger(used.multipv)||(move===first?used.multipv!==1:used.multipv<2))reason='used-rank-invalid';
      else if(!legal.has(first)||!legal.has(move))reason='used-move-illegal';
      expected.push({move,rank:line.multipv,depth:line.depth,bound:line.bound,ownBounded:line.bound!=='exact',depthMismatch:line.depth!==top.depth,rejection:reason});
      inspections++;group.inspections++;if(reason)rejected++;if(supported){rootSupported++;if(line.bound!=='exact')bounded++;if(line.depth!==top.depth)depthMismatch++;
        if(line.bound!=='exact'||line.depth!==top.depth){secondaryIssues++;group.topSupportedSecondaryIssues++;issueStreams.add(stream.id);}}
    }
    assert.deepEqual(frame.candidates,expected);assert.equal(frame.duplicate,dup);assert.equal(frame.empty,missing);assert.equal(frame.illegal,bad);duplicates+=dup;empty+=missing;illegal+=bad;
  }
  for(const stream of traffic.streams){const cache=new Map();let lastScore=null,lastPv='',best=null;
    for(let i=0;i<stream.raw.length;i++){const text=stream.raw[i];
      if(text.startsWith('bestmove ')){best=text.split(/\s+/)[1];continue;}
      const s=/\bscore (cp|mate) (-?\d+)/.exec(text);if(!text.startsWith('info ')||!s)continue;
      const rank=Number(/\bmultipv (\d+)/.exec(text)?.[1]||1),depth=Number(/\bdepth (\d+)/.exec(text)?.[1]||0),pv=text.split(' pv ')[1]?.trim()||'',w=/\bwdl (\d+) (\d+) (\d+)/.exec(text);
      const score={[s[1]]:Number(s[2]),...(w?{wdl:w.slice(1).map(Number)}:{})},bound=text.includes(' lowerbound')?'lowerbound':text.includes(' upperbound')?'upperbound':'exact';
      cache.set(rank,{score,pv,depth,bound,multipv:rank});if(rank===1){lastScore=score;if(pv)lastPv=pv;}
      if(rank===1&&pv&&bound==='exact'&&depth>=4)check(stream,'logical-progress',i,{bestmove:lastPv.split(' ')[0],score:lastScore,pv:lastPv,lines:[...cache.entries()].sort((a,b)=>a[0]-b[0]).map(x=>x[1])});
    }
    const root={bestmove:best==='(none)'?null:best,score:lastScore||{cp:0},pv:lastPv,lines:[...cache.entries()].sort((a,b)=>a[0]-b[0]).map(x=>x[1])};assert.deepEqual(root,native.get(stream.id));check(stream,'final',stream.raw.length-1,root);
  }
  assert.equal(framesById.size,0);const summary={frames:reconstructedFrames,logicalProgress:progress,final,streamsWithSecondaryIssues:issueStreams.size,candidateInspections:inspections,rejected,topSupportedInspections:rootSupported,topSupportedSecondaryIssues:secondaryIssues,boundedInTopSupported:bounded,depthMismatchInTopSupported:depthMismatch,duplicates,empty,illegal,byContext};assert.deepEqual(summary,r.natural.summary);
  const repeatBytes=await readFile('research/runs/E278/repeat/results.json.gz'),repeat=JSON.parse(gunzipSync(repeatBytes));
  const scientific=x=>{const copy=structuredClone(x);delete copy.natural.elapsedMs;return copy;};assert.deepEqual(scientific(r),scientific(repeat));
  assert.ok(performance.now()-started<=180000);
  const result={schema:'E278-independent-audit-v1',passed:true,contractScreen:true,originalFailurePreserved:true,unchangedCandidateSha256:run.candidateSha256,nonOverlayRowsUnchanged:nonOverlay,changedOverlayRows:changed,overlayCoherenceChecks:overlayCoherence,
    reconstructedTrafficFrames:reconstructedFrames,alternativeInspections:inspections,nativeFinals:54,excludedHistoryRecords:4,trafficSummary:summary,
    scientificRepeatSha256:hash(JSON.stringify(scientific(r))),onlyIgnoredRepeatField:'natural.elapsedMs',wallClockTimingsRetained:[r.natural.elapsedMs,repeat.natural.elapsedMs],wholeReportByteEquality:hash(bytes)===hash(repeatBytes),
    codeSha256:hash(await readFile(p+'code/audit.mjs')),inputSha256:hash(bytes),elapsedMs:performance.now()-started,completedUtc:new Date().toISOString(),
    limitations:'Contract pass and real metadata emission, not real Brilliant error prevalence or human utility; progress timestamps are absent.'};
  await writeFile(out+'/verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}
