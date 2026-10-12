import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE063Pilot} from './e063-pilot-admission.mjs';
const root='research/experiments/E063-pawn-storm/',base=root+'evidence/';export const frozenE063Revision='76c149431a67d951f71f5e8e621f9b2f0ec82a68';export const savedE063=Object.freeze([
  {
    "file": "research/experiments/E063-pawn-storm/evidence/clean-run.json",
    "bytes": 39144,
    "sha256": "04c2f4424546ce1aa98c6e8b6468d7b136f7399a030d4007ed8369aebc8e785d"
  },
  {
    "file": "research/experiments/E063-pawn-storm/evidence/concept-status.md",
    "bytes": 109137,
    "sha256": "8474a1894b5641e540edbaed97c896dbb36fea55b20715f57824f2250b88bc78"
  },
  {
    "file": "research/experiments/E063-pawn-storm/evidence/demo.html",
    "bytes": 728126,
    "sha256": "b2aed7b726906c4961850503f22d18ec45bba5fde08950c89ebebf64f6ead7ca"
  },
  {
    "file": "research/experiments/E063-pawn-storm/evidence/repeat-run.json",
    "bytes": 39194,
    "sha256": "a30fe0d2759011b3419b121aea479fd0bb1faa6fef5eff3256cdbd7a68c50965"
  },
  {
    "file": "research/experiments/E063-pawn-storm/evidence/results.json",
    "bytes": 2428155,
    "sha256": "23fe87eae916f85f8235f78e2554842ac588a0fea13681c52d5b8d880071b129"
  },
  {
    "file": "research/experiments/E063-pawn-storm/evidence/run.json",
    "bytes": 39113,
    "sha256": "55198648b185f842db89c27ca778b73230aa321ac0472b41350df6da8bb60d94"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE063Bytes(file,raw){const spec=savedE063.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e063SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e063-smoke.mjs',d+'preparation/run-e063-pilot.mjs',d+'preparation/e063-pilot.test.mjs',d+'preparation/e063-smoke.test.mjs',d+'preparation/e063-whole-result.mjs',d+'AMENDMENT-e063-complete-result-smoke.md',d+'AMENDMENT-e063-complete-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','package.json','package-lock.json']);}
export async function e063SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e063-saved.mjs','research/experiments/E270-combined-validation/preparation/e063-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e063-smoke.mjs','research/experiments/E270-combined-validation/preparation/e063-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e063-pilot.mjs','research/experiments/E270-combined-validation/preparation/e063-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e063-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e063-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e063-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e063-saved-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE063Smoke(admission){const pilot=await admitE063Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e063-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'1c23c47f2786852346d2aa844d743dea4da11bac9419b112efd6acd226650d98');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E063-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,300);assert(f.seconds>0&&f.seconds<300);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e063SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',155],['pass',155],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE063Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E063-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,2800);assert.equal(report.newFixtureCases,100);assert.equal(report.baselineCases,2700);assert.equal(report.results.length,100);assert.equal(fixtures.length,100);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,2700);assert.equal(inherited.length,2700);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['pawn-storm'],states={},byKind={},summary={rows:100,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.pawnStormAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,96);assert.equal(summary.errors,4);assert.equal(summary.certificates,32);assert.deepEqual(states,{complete:88,disabled:4,exhausted:4});assert.deepEqual(byKind,{'pawn-storm':32});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,32);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,100);summary.byKind=byKind;summary.ownEventReplays=32;return summary;}
export async function openE063Saved(){
 const admission=await admitTerminalRegression();await admitE063Smoke(admission);const bytes=new Map();
 for(const spec of savedE063){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE063Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E063-pawn-storm/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E063');assert.equal(m.codeRevision,frozenE063Revision);assert.equal(Object.keys(m.inputHashes).length,185);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E062-pawn-space/code/space.mjs']);assert.equal(Object.keys(semantic).length,51);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE063Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E063-pawn-storm/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E062-pawn-space/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE063Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E063-saved-admission-v1',historicalSourceRevision:frozenE063Revision,historicalInputsVerified:185,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:51,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE063,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE063,semanticClosure:semantic,currentDifferences,historicalInputsVerified:185};
}
