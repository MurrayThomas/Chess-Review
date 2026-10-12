import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE070Pilot} from './e070-pilot-admission.mjs';
const root='research/experiments/E070-knight-outposts/',base=root+'evidence/';export const frozenE070Revision='2d561fcbcb192dced4ebc64395f39a0fc74fa093';export const savedE070=Object.freeze([
  {
    "file": "research/experiments/E070-knight-outposts/evidence/clean-run.json",
    "bytes": 43820,
    "sha256": "f5166cd999fd57ec1ea9f574d732600a0f66f2c2a87c1d07492d81f9e724f837"
  },
  {
    "file": "research/experiments/E070-knight-outposts/evidence/concept-status.md",
    "bytes": 113145,
    "sha256": "fe1168db452f952c40cf34eac8c2e8984e45f348e6b25419d010e9253c6e0a41"
  },
  {
    "file": "research/experiments/E070-knight-outposts/evidence/demo.html",
    "bytes": 1068149,
    "sha256": "1a6e3546fd107c61690e1b06809c847a54785e95f50ebe521cc5367c06361bb3"
  },
  {
    "file": "research/experiments/E070-knight-outposts/evidence/repeat-run.json",
    "bytes": 43875,
    "sha256": "3863d5b4ce9be1d79e4c4ed1137d07d69e585f4791aac1d127bc1be6c842a0f6"
  },
  {
    "file": "research/experiments/E070-knight-outposts/evidence/results.json",
    "bytes": 3543443,
    "sha256": "eaa1320fe913e059ea4cd49e2833a345d5031175e095c67d5116abe40e4b909e"
  },
  {
    "file": "research/experiments/E070-knight-outposts/evidence/run.json",
    "bytes": 43782,
    "sha256": "58fafca19b71903cafda56de38822e49d83cab791eed7ca658bd1b5a646ccd6d"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE070Bytes(file,raw){const spec=savedE070.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e070SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e070-smoke.mjs',d+'preparation/run-e070-pilot.mjs',d+'preparation/e070-pilot.test.mjs',d+'AMENDMENT-e070-complete-result-smoke.md',d+'preparation/e070-smoke.test.mjs',d+'preparation/e070-whole-result.mjs',d+'AMENDMENT-e070-complete-result-replay.md',root+'PLAN.md','package.json','package-lock.json']);}
export async function e070SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e070-saved.mjs','research/experiments/E270-combined-validation/preparation/e070-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e070-smoke.mjs','research/experiments/E270-combined-validation/preparation/e070-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e070-pilot.mjs','research/experiments/E270-combined-validation/preparation/e070-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e070-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e070-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e070-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e070-saved-result-replay.md',root+'PLAN.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE070Smoke(admission){const pilot=await admitE070Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e070-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'a184a8e1dcc1aa7086131bbff52ea780dc27750c2c517eddf7156d3ebd17306c');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E070-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,180);assert(f.seconds>0&&f.seconds<180);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e070SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',190],['pass',190],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE070Shape(report,fixtures,manifest,inherited){
assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','refutationReplays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E070-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3752);assert.equal(report.newFixtureCases,148);assert.equal(report.baselineCases,3604);assert.equal(report.results.length,148);assert.equal(fixtures.length,148);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,3604);assert.equal(inherited.length,3604);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);
const ownIds=['knight-outpost-proof','advanced-knight-outpost'],states={},byKind={},summary={rows:148,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.outpostAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}
assert.equal(summary.results,144);assert.equal(summary.errors,4);assert.equal(summary.certificates,100);assert.deepEqual(states,{proven:76,'pawn-challenge-refuted':32,'no-legal-support':8,ineligible:20,disabled:4,exhausted:4});assert.deepEqual(byKind,{'knight-outpost-proof':76,'advanced-knight-outpost':24});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,100);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,148);assert.equal(report.refutationReplays.length,32);assert.deepEqual(report.refutationReplays.map(x=>x.fixture),report.results.filter(x=>x.result?.outpostAnalysis?.status==='pawn-challenge-refuted').map(x=>x.fixture.id));summary.refutationMetadata=32;summary.byKind=byKind;summary.ownEventReplays=100;return summary;}
export async function openE070Saved(){
 const admission=await admitTerminalRegression();await admitE070Smoke(admission);const bytes=new Map();
 for(const spec of savedE070){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE070Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E070-knight-outposts/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E070');assert.equal(m.codeRevision,frozenE070Revision);assert.equal(Object.keys(m.inputHashes).length,213);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E069-checking-invasions/code/invasion.mjs']);assert.equal(Object.keys(semantic).length,60);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE070Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E070-knight-outposts/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E069-checking-invasions/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE070Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E070-saved-admission-v1',historicalSourceRevision:frozenE070Revision,historicalInputsVerified:213,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:60,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE070,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE070,semanticClosure:semantic,currentDifferences,historicalInputsVerified:213};
}
