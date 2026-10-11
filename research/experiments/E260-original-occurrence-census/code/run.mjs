import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';import {gzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {coachBuildStatus} from '../../../build-workflow.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {census,originalRows,sourcePath,fingerprintDiff} from './census.mjs';
import {prerequisites} from './prerequisites.mjs';
const dir='research/experiments/E260-original-occurrence-census',out=dir+'/evidence/corrected';
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const guard=await openResearchData(['D001'],{purpose:'inspect'});await mkdir(out,{recursive:true});
const start=performance.now(),environment={node:process.version,platform:process.platform,arch:process.arch};
await writeFile(out+'/started.json',JSON.stringify({revision,receipt:guard.receipt,environment},null,2)+'\n',{flag:'wx'});
try{
 const build=await coachBuildStatus();
 const originalFile='research/experiments/E020-coach-concepts/CONCEPTS.md',catalogFile='research/concepts/catalog.json';
 const originalText=await readFile(originalFile,'utf8'),trackerText=await readFile(build.accepted.trackerPath,'utf8');
 const original=originalRows(originalText),catalog=JSON.parse(await readFile(catalogFile,'utf8'));
 const tracker=[...trackerText.matchAll(/^- \[([ x])\] (C\d{4}) \*\*([^*]+)\*\* — (.+)$/gm)].map(m=>({id:m[2],name:m[3],status:m[1]==='x'?'verified':m[4].startsWith('Partial:')?'partial':'unimplemented',scope:m[4]}));
 const supports=[],supportFiles=[];
 for(const folder of (await readdir('research/experiments')).filter(n=>/^E22[1-9]-/.test(n)).sort()){
  const file='research/experiments/'+folder+'/support.json',s=JSON.parse(await readFile(file,'utf8'));supportFiles.push(file);
  assert(s.experiment===folder.slice(0,4));const seeds=Object.keys(s.inputHashes);assert(seeds.length);seeds.forEach(sourcePath);
  let current={};let sourceError=null;try{current=await bindings(seeds);}catch(e){sourceError=e.message;}
  const sourceIssues=fingerprintDiff(s.inputHashes,current);if(sourceError)sourceIssues.push({reason:'closure-error',message:sourceError});supports.push({...s,sourceIssues});
 }
 assert.equal(supports.length,9);
 for(const p of Object.values(prerequisites))for(const ref of p.references)await readFile('research/experiments/'+ref+'/RESULT.md','utf8');
 const result=census({original,catalog,tracker,builds:build.builds,supports,prerequisites});
 assert.equal(result.rows.length,build.accepted.entries);assert.equal(result.counts.accepted,build.accepted.verifiedEntries);assert.equal(result.counts.provisional,build.codeReadyEntries);
 const sourceHashes=await bindings([dir+'/plan.md',dir+'/AMENDMENT.md',dir+'/code/run.mjs',dir+'/code/census.test.mjs',originalFile,catalogFile,...supportFiles]);
 const report={...result,revision,receipt:guard.receipt,environment,accepted:build.accepted,supportContracts:supports,buildSummary:{codeReadyBatches:build.codeReadyBatches,staleBatches:build.staleBatches},sourceHashes,trackerHash:sha256(trackerText.replaceAll('\r\n','\n')),seconds:(performance.now()-start)/1000,queries:0,readinessCredit:false,semanticReplay:false};
 assert(report.seconds<=120,'Registered metadata time cap');
 const bytes=gzipSync(Buffer.from(JSON.stringify(report)+'\n'),{level:9});await writeFile(out+'/census.json.gz',bytes,{flag:'wx'});
 const summary={revision,counts:result.counts,occurrences:result.rows.length,workingGroups:catalog.records.length,duplicateGroups:catalog.records.filter(r=>r.occurrences.length>1).length,supports:supports.map(s=>({experiment:s.experiment,occurrences:s.supportedOccurrences.length,sourceIssues:s.sourceIssues})),...report.buildSummary,seconds:report.seconds,bytes:bytes.length,sourceBindings:Object.keys(sourceHashes).length,sha256:sha256(bytes),queries:0,readinessCredit:false,semanticReplay:false};
 await writeFile(out+'/summary.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(summary,null,2));
}catch(e){await writeFile(out+'/failed.json',JSON.stringify({revision,error:e.stack,seconds:(performance.now()-start)/1000},null,2)+'\n',{flag:'wx'});throw e;}

