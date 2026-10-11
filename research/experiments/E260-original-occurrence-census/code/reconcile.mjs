import assert from 'node:assert/strict';import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';import {execFileSync,spawnSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fingerprintDiff} from './census.mjs';
const dir='research/experiments/E260-original-occurrence-census',out=dir+'/evidence/final',e227='research/experiments/E227-evaluation-review-support';
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),guard=await openResearchData(['D001'],{purpose:'inspect'}),start=performance.now();
await mkdir(out,{recursive:true});await writeFile(out+'/started.json',JSON.stringify({revision,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
try{
 const raw=await readFile(dir+'/evidence/corrected/census.json.gz'),summary=JSON.parse(await readFile(dir+'/evidence/corrected/summary.json','utf8'));assert.equal(sha256(raw),summary.sha256);
 const report=JSON.parse(gunzipSync(raw));assert.deepEqual(await bindings(Object.keys(report.sourceHashes)),report.sourceHashes);
 assert.equal(sha256((await readFile(report.accepted.trackerPath,'utf8')).replaceAll('\r\n','\n')),report.trackerHash);
 const s=report.supportContracts.find(x=>x.experiment==='E227');assert(s);assert(s.sourceIssues.some(x=>x.reason==='closure-error'&&x.message.includes('...')));
 for(const other of report.supportContracts.filter(x=>x!==s))assert.deepEqual(other.sourceIssues,[]);
 const leaf='analysis.js',seeds=Object.keys(s.inputHashes).filter(x=>x!==leaf),actual=await bindings(seeds);actual[leaf]=digest(normalized(leaf,await readFile(leaf)));
 const issues=fingerprintDiff(s.inputHashes,actual);assert.deepEqual(issues,[]);s.sourceIssues=[];s.metadataLeaves=[leaf];
 for(const row of report.rows)if(row.support?.experiment==='E227')row.support.sourceIssues=[];
 const inputHashes=await bindings([dir+'/plan.md',dir+'/AMENDMENT.md',dir+'/AMENDMENT-2.md',dir+'/code/reconcile.mjs',dir+'/code/census.test.mjs',e227+'/code/record-support.mjs',e227+'/record-notes.md']);
 const testStart=performance.now(),checks=spawnSync(process.execPath,['--test',dir+'/code/census.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000});
 const focused={revision,command:'node --test '+dir+'/code/census.test.mjs',exitCode:checks.status,signal:checks.signal,error:checks.error?.message??null,stdout:checks.stdout,stderr:checks.stderr,seconds:(performance.now()-testStart)/1000,inputHashes};
 await writeFile(out+'/focused.json',JSON.stringify(focused,null,2)+'\n',{flag:'wx'});assert.equal(checks.status,0);assert.match(checks.stdout,/pass 9/);assert.match(checks.stdout,/fail 0/);
 const bytes=gzipSync(Buffer.from(JSON.stringify({...report,reconciliation:{revision,inputHashes,receipt:guard.receipt,originalReportSha256:sha256(raw),metadataLeafRule:e227+'/record-notes.md'}})+'\n'),{level:9});
 await writeFile(out+'/census.json.gz',bytes,{flag:'wx'});
 const final={revision,originalRevision:report.revision,counts:report.counts,occurrences:report.rows.length,workingGroups:summary.workingGroups,duplicateGroups:summary.duplicateGroups,supports:report.supportContracts.map(s=>({experiment:s.experiment,occurrences:s.supportedOccurrences.length,sourceIssues:s.sourceIssues,metadataLeaves:s.metadataLeaves??[]})),buildSummary:report.buildSummary,censusSeconds:report.seconds,reconciliationSeconds:(performance.now()-start)/1000,focusedTests:9,focusedSeconds:focused.seconds,inputHashes,originalReportSha256:sha256(raw),censusSha256:sha256(bytes),focusedSha256:sha256(await readFile(out+'/focused.json')),bytes:bytes.length,queries:0,readinessCredit:false,semanticReplay:false};
 await writeFile(out+'/provenance.json',JSON.stringify(final,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({counts:final.counts,sourceIssues:final.supports.flatMap(s=>s.sourceIssues),reconciliationSeconds:final.reconciliationSeconds,focusedSeconds:final.focusedSeconds,bytes:final.bytes,queries:0}));
}catch(e){await writeFile(out+'/failed.json',JSON.stringify({revision,error:e.stack,seconds:(performance.now()-start)/1000},null,2)+'\n',{flag:'wx'});throw e;}
