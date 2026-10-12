import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E073-carlsbad-hedgehog/',base=root+'evidence/';
export const frozenE073Revision='093dacb4ee1b2e919d03b7603949624dd2c19ba9';
export const savedE073=Object.freeze([
 {file:base+'clean-run.json',bytes:46097,sha256:'a066ace0cdcf2ea37fa9ed8052e282f8e00bcaa7cefa81641bb0137c3a207b67'},
 {file:base+'concept-status.md',bytes:114518,sha256:'f07d2a6612b363f26c9cd12c9ac66936b1684324900920f51f91920e8be5e6c3'},
 {file:base+'demo.html',bytes:1521423,sha256:'fa03ece3eb36e06f8c71f82a02da9ffe4eb08aaa4555d9d8d9e00e2611f184ef'},
 {file:base+'repeat-run.json',bytes:46154,sha256:'f240768922f043b589b58bfdac6159450bbf568a6bb2206cd99c0a571ce82023'},
 {file:base+'results.json',bytes:3748297,sha256:'8725f92c6bb4159f23c628578c96768b0727cd54a3f72bb0c86da37519d81f6f'},
 {file:base+'run.json',bytes:46066,sha256:'4647a9ca94500eda629e7b50085817d110add3bf63264debadf0f385b40be754'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE073Bytes(file,raw){const spec=savedE073.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE073Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E073-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,4232);assert.equal(report.newFixtureCases,204);assert.equal(report.baselineCases,4028);
 assert.equal(report.results.length,204);assert.equal(fixtures.length,204);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,4028);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,4028);
 const ownIds=['carlsbad-structure','hedgehog-structure'],states={},byKind={},summary={rows:204,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.structureAnalysis?.status||'disabled';if(row.fixture.expectedStatus)assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}
 }
 assert.equal(summary.results,196);assert.equal(summary.errors,8);assert.equal(summary.certificates,42);assert.deepEqual(states,{proven:42,ineligible:130,'no-legal-support-control':8,disabled:8,exhausted:8});assert.deepEqual(byKind,{'carlsbad-structure':20,'hedgehog-structure':22});
 const ownRecords=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(ownRecords.length,42);assert.deepEqual(ownRecords.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,204);summary.byKind=byKind;summary.ownEventReplays=42;return summary;
}
export async function e073SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e073.mjs',d+'preparation/e073-replay.test.mjs',d+'AMENDMENT-e073-complete-result-replay.md',root+'PLAN.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE073Smoke(attempt,admission){return admitE073Controls(attempt,'smoke',admission);}
export async function admitE073Pilot(attempt,admission){return admitE073Controls(attempt,'pilot',admission);}
async function admitE073Controls(attempt,phase,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e073-'+phase+'-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E073-semantic-v1');assert.equal(f.phase,phase);assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,phase==='pilot'?120:180);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e073SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',phase==='pilot'?7:257],['pass',phase==='pilot'?7:257],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE073Saved(){
 const admission=await admitTerminalRegression();await admitE073Smoke(process.env.CHESS_E073_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE073){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE073Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E073-carlsbad-hedgehog/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E073');assert.equal(m.codeRevision,frozenE073Revision);assert.equal(Object.keys(m.inputHashes).length,227);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E072-named-pawn-formations/code/formations.mjs']);assert.equal(Object.keys(semantic).length,63);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE073Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E073-carlsbad-hedgehog/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E072-named-pawn-formations/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE073Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E073-saved-admission-v1',historicalSourceRevision:frozenE073Revision,historicalInputsVerified:227,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:63,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE073,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE073,semanticClosure:semantic,currentDifferences,historicalInputsVerified:227};
}
