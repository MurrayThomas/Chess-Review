import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E071-octopus-knights/',base=root+'evidence/';
export const frozenE071Revision='c687a1ca949b0acf511be284c3f82535c1efbcc7';
export const savedE071=Object.freeze([
 {file:base+'clean-run.json',bytes:44668,sha256:'3d49a372e6da971af95fe8f9b24d19d6375639f475869808e9432eda6d20ed56'},
 {file:base+'concept-status.md',bytes:113454,sha256:'a33d80ce6d7343293a31e4e311bc659447650299b4771b74bf323709356497ab'},
 {file:base+'demo.html',bytes:898179,sha256:'52c5896faae1dc054503b87cb68ae375a7ec06e8fc5905d148334324f228769b'},
 {file:base+'repeat-run.json',bytes:44723,sha256:'805e76e043d9bc90eae22779a1bcdcfcf72fda28feb806ec95b5dd463b03386c'},
 {file:base+'results.json',bytes:5250797,sha256:'4349b6fe4f8b955cfa25eb514e95dc2ac1ba06f49b7b4a76c0d9590a273ff612'},
 {file:base+'run.json',bytes:44685,sha256:'a6ff4dfb89b99387b2b30f03a0d2a41c9e87b31459526cb0e89ef446dc697f12'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE071Bytes(file,raw){const spec=savedE071.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE071Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E071-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3860);assert.equal(report.newFixtureCases,108);assert.equal(report.baselineCases,3752);
 assert.equal(report.results.length,108);assert.equal(fixtures.length,108);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,3752);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,3752);
 const ownIds=['octopus-knight'],states={},byKind={},summary={rows:108,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.octopusAnalysis?.status||'disabled';if(row.fixture.expectedStatus)assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}
 }
 assert.equal(summary.results,104);assert.equal(summary.errors,4);assert.equal(summary.certificates,40);assert.deepEqual(states,{proven:40,ineligible:36,'queen-gain-refuted':20,disabled:4,exhausted:4});assert.deepEqual(byKind,{'octopus-knight':40});
 const ownRecords=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(ownRecords.length,40);assert.deepEqual(ownRecords.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,108);assert.equal(report.guardReplays.length,100);assert.deepEqual(report.guardReplays.map(x=>x.fixture),report.results.filter(x=>x.result?.octopusAnalysis).map(x=>x.fixture.id));assert.equal(report.octopusRefutationReplays.length,20);assert.deepEqual(report.octopusRefutationReplays.map(x=>x.fixture),report.results.filter(x=>x.result?.octopusAnalysis?.status==='queen-gain-refuted').map(x=>x.fixture.id));summary.guardMetadata=100;summary.refutationMetadata=20;summary.byKind=byKind;summary.ownEventReplays=40;return summary;
}
export async function e071SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e071.mjs',d+'preparation/e071-replay.test.mjs',d+'AMENDMENT-e071-complete-result-replay.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE071Smoke(attempt,admission){return admitE071Controls(attempt,'smoke',admission);}
export async function admitE071Pilot(attempt,admission){return admitE071Controls(attempt,'pilot',admission);}
async function admitE071Controls(attempt,phase,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e071-'+phase+'-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E071-semantic-v1');assert.equal(f.phase,phase);assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,phase==='pilot'?120:180);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e071SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',phase==='pilot'?7:166],['pass',phase==='pilot'?7:166],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE071Saved(){
 const admission=await admitTerminalRegression();await admitE071Smoke(process.env.CHESS_E071_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE071){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE071Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['?? research/experiments/E071-octopus-knights/evidence/','?? research/experiments/E071-octopus-knights/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E071');assert.equal(m.codeRevision,frozenE071Revision);assert.equal(Object.keys(m.inputHashes).length,218);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E070-knight-outposts/code/outpost.mjs']);assert.equal(Object.keys(semantic).length,62);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE071Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E071-octopus-knights/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E070-knight-outposts/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE071Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E071-saved-admission-v1',historicalSourceRevision:frozenE071Revision,historicalInputsVerified:218,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:62,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE071,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE071,semanticClosure:semantic,currentDifferences,historicalInputsVerified:218};
}
