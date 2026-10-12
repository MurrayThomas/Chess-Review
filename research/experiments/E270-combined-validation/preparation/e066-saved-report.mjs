import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE066Pilot} from './e066-pilot-admission.mjs';
const root='research/experiments/E066-pawn-races/',base=root+'evidence/';export const frozenE066Revision='1c291bdf0038b8d7ffc362c40e91c3ea10b5ac25';export const savedE066=Object.freeze([
  {
    "file": "research/experiments/E066-pawn-races/evidence/clean-run.json",
    "bytes": 41257,
    "sha256": "c129a4bca2ea65f4a6b1706b3bc9e76fbf2e118d8bfe02e1a54731d277124aca"
  },
  {
    "file": "research/experiments/E066-pawn-races/evidence/concept-status.md",
    "bytes": 110832,
    "sha256": "fc751b8965c4165116e7c6460dd076f210786787a7f281e1dc7f851edd64a956"
  },
  {
    "file": "research/experiments/E066-pawn-races/evidence/demo.html",
    "bytes": 1025468,
    "sha256": "13b7877b6e1262acf5ba39ed0e9a14bae49e96ed00bfec4c4324a2e4033230f8"
  },
  {
    "file": "research/experiments/E066-pawn-races/evidence/repeat-run.json",
    "bytes": 41307,
    "sha256": "540eb3008a0d29c6e36fcd64803ae919ead528b9423f056311a7367720798797"
  },
  {
    "file": "research/experiments/E066-pawn-races/evidence/results.json",
    "bytes": 5741529,
    "sha256": "2b059fc26eb309e23dccf9e06ee35bcc129ca91def7bd2eb69dedc3547b23293"
  },
  {
    "file": "research/experiments/E066-pawn-races/evidence/run.json",
    "bytes": 41226,
    "sha256": "ad68ea4daa8cea48ca029de67f9a03be512248882fd1dae0f0a262df577db496"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE066Bytes(file,raw){const spec=savedE066.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e066SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e066-smoke.mjs',d+'preparation/run-e066-pilot.mjs',d+'preparation/e066-pilot.test.mjs',d+'preparation/e066-smoke.test.mjs',d+'preparation/e066-whole-result.mjs',d+'AMENDMENT-e066-complete-result-smoke.md',d+'AMENDMENT-e066-complete-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','package.json','package-lock.json']);}
export async function e066SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e066-saved.mjs','research/experiments/E270-combined-validation/preparation/e066-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e066-smoke.mjs','research/experiments/E270-combined-validation/preparation/e066-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e066-pilot.mjs','research/experiments/E270-combined-validation/preparation/e066-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e066-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e066-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e066-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e066-saved-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE066Smoke(admission){const pilot=await admitE066Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e066-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'3bf5139e8676a1f73addc6369b24e0a88f27d5d73a082ccab89e65c0dc2dda78');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E066-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,300);assert(f.seconds>0&&f.seconds<300);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e066SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',195],['pass',195],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE066Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E066-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3200);assert.equal(report.newFixtureCases,140);assert.equal(report.baselineCases,3060);assert.equal(report.results.length,140);assert.equal(fixtures.length,140);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,3060);assert.equal(inherited.length,3060);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['pawn-race'],states={},byKind={},summary={rows:140,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.pawnRaceAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,136);assert.equal(summary.errors,4);assert.equal(summary.certificates,44);assert.deepEqual(states,{proven:44,refuted:28,ineligible:44,'short-profile':12,disabled:4,exhausted:4});assert.deepEqual(byKind,{'pawn-race':44});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,44);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,140);summary.byKind=byKind;summary.ownEventReplays=44;return summary;}
export async function openE066Saved(){
 const admission=await admitTerminalRegression();await admitE066Smoke(admission);const bytes=new Map();
 for(const spec of savedE066){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE066Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E066-pawn-races/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E066');assert.equal(m.codeRevision,frozenE066Revision);assert.equal(Object.keys(m.inputHashes).length,197);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E065-king-triangulation/code/triangle.mjs']);assert.equal(Object.keys(semantic).length,56);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE066Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E066-pawn-races/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E065-king-triangulation/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE066Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E066-saved-admission-v1',historicalSourceRevision:frozenE066Revision,historicalInputsVerified:197,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:56,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE066,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE066,semanticClosure:semantic,currentDifferences,historicalInputsVerified:197};
}
