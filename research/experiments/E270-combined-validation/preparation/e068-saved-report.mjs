import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE068Pilot} from './e068-pilot-admission.mjs';
const root='research/experiments/E068-rook-swings/',base=root+'evidence/';export const frozenE068Revision='da60cbd3e5178f989c6d67683b4b281b49665457';export const savedE068=Object.freeze([
  {
    "file": "research/experiments/E068-rook-swings/evidence/clean-run.json",
    "bytes": 42496,
    "sha256": "cdca50aba7802643274dcddf1e8f4702280aa7cbacd928b7f933ed3fd0951222"
  },
  {
    "file": "research/experiments/E068-rook-swings/evidence/concept-status.md",
    "bytes": 111849,
    "sha256": "a7b3fbb516131eb1e7500ef7d9bc98550076d775cfb7439ba04856574a316a37"
  },
  {
    "file": "research/experiments/E068-rook-swings/evidence/demo.html",
    "bytes": 782717,
    "sha256": "5aa9221f075a578cc5451f0c112b8d4bb461dae9dbb7b7bbd102e30b8702d74e"
  },
  {
    "file": "research/experiments/E068-rook-swings/evidence/repeat-run.json",
    "bytes": 42498,
    "sha256": "14cc20b0de5b6e4d64f38dbc444dee3baef13b7e0995834cfb3a70bc1f7453bc"
  },
  {
    "file": "research/experiments/E068-rook-swings/evidence/results.json",
    "bytes": 2653514,
    "sha256": "69156c9a1adfd77f0254aaf460e09c0b3351debf2e9e13cc31129122ccfd4eb5"
  },
  {
    "file": "research/experiments/E068-rook-swings/evidence/run.json",
    "bytes": 42473,
    "sha256": "9256c6e7ff11439d09ef0fe40b6979d9645a2a72797e77d3f383a792692345b4"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE068Bytes(file,raw){const spec=savedE068.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e068SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e068-smoke.mjs',d+'preparation/run-e068-pilot.mjs',d+'preparation/e068-pilot.test.mjs',d+'preparation/e068-smoke.test.mjs',d+'preparation/e068-whole-result.mjs',d+'AMENDMENT-e068-complete-result-replay.md',root+'PLAN.md','package.json','package-lock.json']);}
export async function e068SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e068-saved.mjs','research/experiments/E270-combined-validation/preparation/e068-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e068-smoke.mjs','research/experiments/E270-combined-validation/preparation/e068-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e068-pilot.mjs','research/experiments/E270-combined-validation/preparation/e068-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e068-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e068-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e068-saved-result-replay.md',root+'PLAN.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE068Smoke(admission){const pilot=await admitE068Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e068-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'f3a990c4c33a6bafd440138ddefa7759f37265740b3886c95a83522a2741470d');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E068-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,180);assert(f.seconds>0&&f.seconds<180);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e068SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',146],['pass',146],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE068Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E068-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3412);assert.equal(report.newFixtureCases,108);assert.equal(report.baselineCases,3304);assert.equal(report.results.length,108);assert.equal(fixtures.length,108);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,3304);assert.equal(inherited.length,3304);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['rook-swing'],states={},byKind={},summary={rows:108,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.rookSwingAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,104);assert.equal(summary.errors,4);assert.equal(summary.certificates,44);assert.deepEqual(states,{proven:44,ineligible:52,disabled:4,exhausted:4});assert.deepEqual(byKind,{'rook-swing':44});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,44);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,108);summary.byKind=byKind;summary.ownEventReplays=44;return summary;}
export async function openE068Saved(){
 const admission=await admitTerminalRegression();await admitE068Smoke(admission);const bytes=new Map();
 for(const spec of savedE068){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE068Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E068');assert.equal(m.codeRevision,frozenE068Revision);assert.equal(Object.keys(m.inputHashes).length,205);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E067-waiting-tempi/code/tempi.mjs']);assert.equal(Object.keys(semantic).length,58);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE068Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E068-rook-swings/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E067-waiting-tempi/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE068Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E068-saved-admission-v1',historicalSourceRevision:frozenE068Revision,historicalInputsVerified:205,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:58,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE068,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE068,semanticClosure:semantic,currentDifferences,historicalInputsVerified:205};
}
