import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE065Pilot} from './e065-pilot-admission.mjs';
const root='research/experiments/E065-king-triangulation/',base=root+'evidence/';export const frozenE065Revision='32b38a1a34514175f08d6536a1c0f6de8ccade25';export const savedE065=Object.freeze([
  {
    "file": "research/experiments/E065-king-triangulation/evidence/clean-run.json",
    "bytes": 40496,
    "sha256": "2d7b05a30a03bb1162501b20384e3c13a84e8f8a0473e2cc74ddc46985488b8c"
  },
  {
    "file": "research/experiments/E065-king-triangulation/evidence/concept-status.md",
    "bytes": 110190,
    "sha256": "bb6258272dc1932d7bfed5918d5e13aa97099ffc2a1a7ab1d689e96b55efef57"
  },
  {
    "file": "research/experiments/E065-king-triangulation/evidence/demo.html",
    "bytes": 817841,
    "sha256": "6034c01da10290a4d4ea9a38e4ce8dd645270dcb519ffe6a27d1415f9c17e4e6"
  },
  {
    "file": "research/experiments/E065-king-triangulation/evidence/repeat-run.json",
    "bytes": 40554,
    "sha256": "14110c480a4fe51702c428785a6b5be1ee1ad3a1f151985ca9dfdcf4c37eac35"
  },
  {
    "file": "research/experiments/E065-king-triangulation/evidence/results.json",
    "bytes": 2560245,
    "sha256": "d57d27dbb981b01c923935ee058c8d7e26048da01bcdbe5d6fed305ccca52602"
  },
  {
    "file": "research/experiments/E065-king-triangulation/evidence/run.json",
    "bytes": 40465,
    "sha256": "c9a8410e5dfada16650c2cedba8b6fc1a4faae9684296946f9f263f58d88aab2"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE065Bytes(file,raw){const spec=savedE065.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e065SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e065-smoke.mjs',d+'preparation/run-e065-pilot.mjs',d+'preparation/e065-pilot.test.mjs',d+'preparation/e065-smoke.test.mjs',d+'preparation/e065-whole-result.mjs',d+'AMENDMENT-e065-complete-result-smoke.md',d+'AMENDMENT-e065-complete-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','package.json','package-lock.json']);}
export async function e065SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e065-saved.mjs','research/experiments/E270-combined-validation/preparation/e065-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e065-smoke.mjs','research/experiments/E270-combined-validation/preparation/e065-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e065-pilot.mjs','research/experiments/E270-combined-validation/preparation/e065-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e065-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e065-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e065-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e065-saved-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE065Smoke(admission){const pilot=await admitE065Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e065-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'000c36c9fe502b6a423e27a8a87cce7865e10ec31844359fb15ecc2b85c2fa2d');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E065-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,300);assert(f.seconds>0&&f.seconds<300);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e065SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',175],['pass',175],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE065Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E065-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3060);assert.equal(report.newFixtureCases,120);assert.equal(report.baselineCases,2940);assert.equal(report.results.length,120);assert.equal(fixtures.length,120);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,2940);assert.equal(inherited.length,2940);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['king-triangulation'],states={},byKind={},summary={rows:120,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.triangulationAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,116);assert.equal(summary.errors,4);assert.equal(summary.certificates,40);assert.deepEqual(states,{complete:108,disabled:4,exhausted:4});assert.deepEqual(byKind,{'king-triangulation':40});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,40);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,120);summary.byKind=byKind;summary.ownEventReplays=40;return summary;}
export async function openE065Saved(){
 const admission=await admitTerminalRegression();await admitE065Smoke(admission);const bytes=new Map();
 for(const spec of savedE065){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE065Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E065-king-triangulation/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E065');assert.equal(m.codeRevision,frozenE065Revision);assert.equal(Object.keys(m.inputHashes).length,193);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E064-blocked-position/code/blocked.mjs']);assert.equal(Object.keys(semantic).length,55);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE065Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E065-king-triangulation/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E064-blocked-position/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE065Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E065-saved-admission-v1',historicalSourceRevision:frozenE065Revision,historicalInputsVerified:193,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:55,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE065,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE065,semanticClosure:semantic,currentDifferences,historicalInputsVerified:193};
}
