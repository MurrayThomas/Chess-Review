import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {openTraffic} from './traffic.mjs';
import {currentClassifier,replayLabel} from '../../E276-reported-brilliant-cases/code/classifier.mjs';
import {loadCases,hash} from '../../E276-reported-brilliant-cases/code/cases.mjs';
import {rejection} from '../../E277-brilliant-evidence-admission/code/candidate.mjs';
const p='research/experiments/E278-coherent-brilliant-validation/',old='research/experiments/E276-reported-brilliant-cases/',out=process.argv[2];assert.ok(out?.startsWith('research/runs/E278/'));await mkdir(out,{recursive:true});
await openTraffic();const access=await loadCases(),run=JSON.parse(await readFile(p+'evidence/run.json'));
for(const [file,h] of Object.entries(run.sourceHashes))assert.equal(hash(await readFile(file)),h,file);
const reportBytes=await readFile(old+'evidence/results.json'),reportRun=JSON.parse(await readFile(old+'evidence/report-run.json'));assert.equal(hash(reportBytes),reportRun.outputHash);
const rows=[],report=JSON.parse(reportBytes);
for(const c of access.input.cases)for(const engine of [18,19]){
  const row=report.rows.find(r=>r.case===c.id&&r.engine===engine&&r.budget.kind==='nodes'&&r.budget.value===2000000),{api}=await currentClassifier();
  const baseline=replayLabel(api,c,row.root,row.played,row.after,engine),original=api.annotationPair;
  api.annotationPair=(i,state)=>rejection(i,state)?null:original(i,state);
  const candidate=replayLabel(api,c,row.root,row.played,row.after,engine);assert.deepEqual(candidate,baseline);assert.equal(candidate.category,c.id==='A'?'brilliant':'best');
  rows.push({case:c.id,engine,baseline:baseline.category,candidate:candidate.category,unchanged:true});
}
const traffic=await openTraffic(),multi=traffic.streams.filter(s=>s.query.multipv>1);
const rBytes=await readFile(p+'evidence/results.json.gz');assert.equal(hash(rBytes),run.outputs['results.json.gz']);const {gunzipSync}=await import('node:zlib'),r=JSON.parse(gunzipSync(rBytes));
const phase={};for(const f of r.natural.frames){const s=phase[f.phase]||(phase[f.phase]={frames:0,alternatives:0,topSupportedAlternatives:0,secondaryIssues:0});s.frames++;for(const c of f.candidates){s.alternatives++;if(f.topSupported){s.topSupportedAlternatives++;if(c.ownBounded||c.depthMismatch)s.secondaryIssues++;}}}
const result={schema:'E278-existing-case-preservation-v1',passed:true,rows,sourceAuthorization:access.receipt,codeSha256:hash(await readFile(p+'code/preserve-cases.mjs')),candidateSha256:run.candidateSha256,
  trafficDenominators:{fullStreams:traffic.streams.length,multiPvStreams:multi.length,singlePvStreams:traffic.streams.length-multi.length,streamsWithSecondaryIssues:r.natural.summary.streamsWithSecondaryIssues,phase},
  completedUtc:new Date().toISOString(),limitations:'Four exposed paired-case adapter checks, not new full-app acceptance or human validation; traffic progress timings are missing.'};
await writeFile(out+'/preservation.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:true,rows,trafficDenominators:result.trafficDenominators}));
