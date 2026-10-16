import assert from 'node:assert/strict';
import {Producer,descriptor} from './producer.mjs';
import {inspectFrame} from '../../E278-coherent-brilliant-validation/code/traffic.mjs';
export function replay(stream,strict){
  const p=new Producer(stream,strict);let deepestTop=0;
  for(let i=0;i<stream.raw.length;i++){const d=descriptor(stream.raw[i],i);if(d?.multipv===1&&d.bound==='exact'&&d.score&&d.pv&&d.depth>=4)deepestTop=Math.max(deepestTop,d.depth);p.observe(stream.raw[i],i);}
  const inspected=p.frames.map(f=>({...f,inspection:inspectFrame(stream,'coherent-progress',f.eventIndex,f.root)}));
  return {streamId:stream.id,engine:stream.query.engine,requested:stream.query.multipv,K:p.K,frames:inspected,stats:p.stats,deepestTop,lastDepth:p.lastDepth,
    finalDepthLag:p.lastDepth<0?null:deepestTop-p.lastDepth,causalViolations:inspected.filter(f=>f.root.lines.some(l=>l.sourceIndex<f.epochStart)).length};
}
export function summarize(rows){
  const s={streams:rows.length,multiStreams:0,coveredMulti:0,multiWithinOneDepth:0,emissions:0,secondaryInspections:0,eligibleSecondary:0,rejectedSecondary:0,causalViolations:0,duplicates:0,regressions:0,eventLags:[],byEngine:{}};
  for(const row of rows){const g=s.byEngine[row.engine]||(s.byEngine[row.engine]={streams:0,emissions:0,eligibleSecondary:0});g.streams++;g.emissions+=row.frames.length;
    if(row.K>1){s.multiStreams++;if(row.frames.length)s.coveredMulti++;if(row.finalDepthLag!=null&&row.finalDepthLag<=1)s.multiWithinOneDepth++;}
    s.emissions+=row.frames.length;s.causalViolations+=row.causalViolations;s.duplicates+=row.stats.duplicates;s.regressions+=row.stats.regressions;
    for(const f of row.frames){s.eventLags.push(f.eventIndex-f.epochStart);for(const c of f.inspection.candidates){s.secondaryInspections++;if(c.rejection)s.rejectedSecondary++;else{s.eligibleSecondary++;g.eligibleSecondary++;}}}
  }
  s.eventLags.sort((a,b)=>a-b);const q=p=>s.eventLags.length?s.eventLags[Math.floor((s.eventLags.length-1)*p)]:null;
  s.eventLag={min:q(0),median:q(.5),p95:q(.95),max:q(1)};delete s.eventLags;return s;
}
export function assess(streams,parent){
  const P=streams.map(s=>replay(s,true)),Q=streams.map(s=>replay(s,false)),p=summarize(P),q=summarize(Q);
  const baseline=parent.natural.frames.filter(f=>f.phase==='logical-progress');const reference=baseline.reduce((n,f)=>n+f.candidates.length,0);assert.equal(reference,616);
  let singleLatestPreserved=0,singleStreams=0;
  for(const row of P.filter(r=>r.K===1)){singleStreams++;const b=baseline.filter(f=>f.streamId===row.streamId).at(-1),last=row.frames.at(-1);
    if(!b&&!last){singleLatestPreserved++;continue;}if(b&&last){const a=last.root.lines[0],z=b.root.lines.find(l=>l.multipv===1);if(JSON.stringify([a.score,a.pv,a.depth])===JSON.stringify([z.score,z.pv,z.depth]))singleLatestPreserved++;}}
  const gates={validSources:p.rejectedSecondary===0&&P.every(r=>r.frames.every(f=>f.inspection.topSupported)),causal:p.causalViolations===0,
    streamCoverage:p.coveredMulti>=Math.ceil(.9*p.multiStreams),usableRecovery:p.eligibleSecondary>=Math.ceil(.8*reference),
    finalDepth:p.multiWithinOneDepth>=Math.ceil(.8*p.multiStreams),singleLatest:singleLatestPreserved===singleStreams};
  return {P,Q,producer:p,depthOnly:q,baseline:{logicalEmissions:baseline.length,secondaryInspections:reference,eligibleSecondary:baseline.reduce((n,f)=>n+f.candidates.filter(c=>!c.rejection).length,0)},singleLatestPreserved,singleStreams,gates,passed:Object.values(gates).every(Boolean)};
}
