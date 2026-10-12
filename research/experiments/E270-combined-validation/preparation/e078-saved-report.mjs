import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E078-bishop-chains-batteries/',base=root+'evidence/';
export const frozenE078Revision='87ef831a69dd616e6fbc75c772f512284bb05afc';
export const savedE078=Object.freeze([
 {file:base+'clean-run.json',bytes:50669,sha256:'270a3b16ff2578a667261b7a0a3edccd4edfd25797f4d40bcc561fcf6a173d04'},
 {file:base+'concept-status.md',bytes:118878,sha256:'27a6807b7f2665549f1fcc4cd9fd51881eaac6e176a47106303d4c2dc3efb4b6'},
 {file:base+'demo.html',bytes:793488,sha256:'aac0679d260ad875ae7b2d95c5ffd0e659cc555cd47e0516e50b017e233608fc'},
 {file:base+'repeat-run.json',bytes:50663,sha256:'04cba31cbae11cfe9e4644fc89e9922750ed6216c6ade3f8eb87bd4a523ee75b'},
 {file:base+'results.json',bytes:4208449,sha256:'9b743d2010694152f6525f4b62cba4208f5efd3b8e236c474e0f523b1c1f8866'},
 {file:base+'run.json',bytes:50631,sha256:'f865400e746cf13aadcd202d9e069abb7f8ca5d44105e39606ab915a7f3b11ec'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE078Bytes(file,raw){const spec=savedE078.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE078Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E078-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,5052);assert.equal(report.newFixtureCases,192);assert.equal(report.baselineCases,4860);
 assert.equal(report.results.length,192);assert.equal(fixtures.length,192);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,4860);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,4860);
 const ownIds=['outside-chain-proof','behind-chain-proof','slider-battery-proof'],states={},byKind={},summary={rows:192,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&(!row.fixture.expectedError||row.error.includes(row.fixture.expectedError)));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.placementAnalysis?.status||'disabled';if(row.fixture.expectedStatus)assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}
 }
 assert.equal(summary.results,168);assert.equal(summary.errors,24);assert.equal(summary.certificates,88);assert.deepEqual(states,{proven:86,'no-new-fact':56,disabled:2,exhausted:2,'not-applicable':12,'not-live':10});assert.deepEqual(byKind,{'outside-chain-proof':14,'behind-chain-proof':6,'slider-battery-proof':68});
 const ownRecords=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(ownRecords.length,88);assert.deepEqual(ownRecords.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,192);summary.byKind=byKind;summary.ownEventReplays=88;return summary;
}
export async function e078SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e078.mjs',d+'preparation/e078-replay.test.mjs',d+'AMENDMENT-e078-complete-result-replay.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE078Smoke(attempt,admission){return admitE078Controls(attempt,'smoke',admission);}
export async function admitE078Pilot(attempt,admission){return admitE078Controls(attempt,'pilot',admission);}
async function admitE078Controls(attempt,phase,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e078-'+phase+'-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E078-semantic-v1');assert.equal(f.phase,phase);assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,phase==='pilot'?120:180);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e078SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',phase==='pilot'?7:240],['pass',phase==='pilot'?7:240],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE078Saved(){
 const admission=await admitTerminalRegression();await admitE078Smoke(process.env.CHESS_E078_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE078){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE078Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E078');assert.equal(m.codeRevision,frozenE078Revision);assert.equal(Object.keys(m.inputHashes).length,253);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E077-connected-passers-open-lines/code/lines.mjs']);assert.equal(Object.keys(semantic).length,67);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE078Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E078-bishop-chains-batteries/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E077-connected-passers-open-lines/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE078Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E078-saved-admission-v1',historicalSourceRevision:frozenE078Revision,historicalInputsVerified:253,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:67,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE078,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE078,semanticClosure:semantic,currentDifferences,historicalInputsVerified:253};
}
