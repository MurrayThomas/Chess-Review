import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E079-central-king-support/',base=root+'evidence/';
export const frozenE079Revision='98523f67924e515cda124d9d15b015824b7a41e3';
export const savedE079=Object.freeze([
 {file:base+'clean-run.json',bytes:52092,sha256:'44270d5c6adff971c894a14413ae4731b0ffb2496cbd854f748ae6a1f1ee8b76'},
 {file:base+'concept-status.md',bytes:119459,sha256:'7f19d5c5ec4bb1ed777cf0fdfd379e31503c7053ca3dba15b243437dd466d165'},
 {file:base+'demo.html',bytes:485197,sha256:'a5746522cfd9a8f2e71df8adf1b70be68179b8d305acccdcf7ac3c293a75825c'},
 {file:base+'repeat-run.json',bytes:52087,sha256:'201643e7590ff36817e0b05d913f22f8746e056b0bdb14afe98ea2c98791a790'},
 {file:base+'results.json',bytes:6111692,sha256:'0ef76918397f4a5aa406659574ed759f0a0ef346c0aad7e01708613ebf6790c8'},
 {file:base+'run.json',bytes:52061,sha256:'a2d560f7d47a0bd5466e3a7318a1f33d567cb772ad130bdcab679a98bddbd83e'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE079Bytes(file,raw){const spec=savedE079.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE079Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','kingCenterReplays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E079-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,5190);assert.equal(report.newFixtureCases,138);assert.equal(report.baselineCases,5052);
 assert.equal(report.results.length,138);assert.equal(fixtures.length,138);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,5052);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,5052);
 const states={},summary={rows:138,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&(!row.fixture.expectedError||row.error.includes(row.fixture.expectedError)));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.kingCenterAnalysis?.status||'disabled';assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  const w=row.result.kingCenterAnalysis?.witness;if(w){summary.certificates++;}
 }
 assert.equal(summary.results,84);assert.equal(summary.errors,54);assert.equal(summary.certificates,22);assert.deepEqual(states,{'no-new-fact':30,proven:22,disabled:2,unavailable:2,exhausted:6,'not-applicable':12,'not-live':10});
 assert.equal(report.kingCenterReplays.length,84);assert.deepEqual(report.kingCenterReplays.map(x=>x.fixture),report.results.filter(x=>x.result).map(x=>x.fixture.id));assert.equal(manifest.metrics.newFixtureCases,138);assert.equal(manifest.metrics.kingCenterWitnesses,summary.certificates);
 summary.replies=report.kingCenterReplays.reduce((n,r)=>n+(r.replies||0),0);summary.leaves=report.kingCenterReplays.reduce((n,r)=>n+(r.leaves||0),0);assert.equal(summary.replies,40372);assert.equal(summary.leaves,164744);return summary;
}
export async function e079SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e079.mjs',d+'preparation/e079-replay.test.mjs',d+'AMENDMENT-e079-accepted-replay-reuse.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE079Smoke(attempt,admission){return admitE079Controls(attempt,'smoke',admission);}
export async function admitE079Pilot(attempt,admission){return admitE079Controls(attempt,'pilot',admission);}
async function admitE079Controls(attempt,phase,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e079-'+phase+'-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E079-semantic-v1');assert.equal(f.phase,phase);assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,phase==='pilot'?120:900);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e079SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',phase==='pilot'?7:174],['pass',phase==='pilot'?7:174],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE079Saved(){
 const admission=await admitTerminalRegression();await admitE079Smoke(process.env.CHESS_E079_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE079){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE079Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E079');assert.equal(m.codeRevision,frozenE079Revision);assert.equal(Object.keys(m.inputHashes).length,261);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs']);assert.equal(Object.keys(semantic).length,72);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE079Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {unpackReport}=await import('../../E079-central-king-support/code/saved.mjs'),{fixtures,reflect}=await import('../../E079-central-king-support/code/fixtures.mjs');
 const report=unpackReport(JSON.parse(bytes.get(base+'results.json'))),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E078-bishop-chains-batteries/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE079Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E079-saved-admission-v1',historicalSourceRevision:frozenE079Revision,historicalInputsVerified:261,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:72,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE079,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE079,semanticClosure:semantic,currentDifferences,historicalInputsVerified:261};
}
