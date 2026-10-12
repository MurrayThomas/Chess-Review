import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE067Pilot} from './e067-pilot-admission.mjs';
const root='research/experiments/E067-waiting-tempi/',base=root+'evidence/';export const frozenE067Revision='c07dd413fa9a7e14a607086515caa6f267e041d6';export const savedE067=Object.freeze([
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/clean-run.json",
    "bytes": 42320,
    "sha256": "5f30c2d5231e2d14050ac9b47317513a69931e1f155ede89a1f205c13673fbc3"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/concept-status.md",
    "bytes": 111659,
    "sha256": "b133faeef82998fef9ca1fb2342c24277361580184f820d5db7085dab1ecc4a1"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/demo.html",
    "bytes": 737427,
    "sha256": "e1e926ca50bb160ab4d7880067bea974927e34fe36f19619d53452dea5d053f2"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/pilot-blockers.json",
    "bytes": 1928,
    "sha256": "b74bd7b596ed98cfc449139e47b641cb354e139256b11d201e01ad9d3727edf3"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/pilot-knight.json",
    "bytes": 54,
    "sha256": "50dfa66d35d413d07a48219ba1a4e1baeacb018173d6230c16defcaaae58929b"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/pilot-queen.json",
    "bytes": 53,
    "sha256": "48b6242ece262efa14004c3e1228e4f22c09200a1278cb6a79b41f5c1c2fd9cf"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/repeat-run.json",
    "bytes": 42321,
    "sha256": "2a901e9ee7af0ba379ad5c084f45668138db28dfba1f4d36fb9de8a9ecb26895"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/results.json",
    "bytes": 2803313,
    "sha256": "e989b0746e0717865fc6feb4833ad02e26f50ebe185d7b394608752022b578e4"
  },
  {
    "file": "research/experiments/E067-waiting-tempi/evidence/run.json",
    "bytes": 42289,
    "sha256": "6d07216ca7655a2e8dafb0223c57746def36035b050e9b69a25215a5e0aa9f42"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE067Bytes(file,raw){const spec=savedE067.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e067SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e067-smoke.mjs',d+'preparation/run-e067-pilot.mjs',d+'preparation/e067-pilot.test.mjs',d+'preparation/e067-smoke.test.mjs',d+'preparation/e067-whole-result.mjs',d+'AMENDMENT-e067-complete-result-smoke.md',d+'AMENDMENT-e067-repetition-control.md',d+'AMENDMENT-e067-complete-result-replay.md',root+'PLAN.md','package.json','package-lock.json']);}
export async function e067SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e067-saved.mjs','research/experiments/E270-combined-validation/preparation/e067-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e067-smoke.mjs','research/experiments/E270-combined-validation/preparation/e067-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e067-pilot.mjs','research/experiments/E270-combined-validation/preparation/e067-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e067-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e067-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e067-repetition-control.md','research/experiments/E270-combined-validation/AMENDMENT-e067-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e067-saved-result-replay.md',root+'PLAN.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE067Smoke(admission){
 const pilot=await admitE067Pilot(admission),d='research/experiments/E270-combined-validation/evidence/';
 async function verify(suffix,hash,passed,revision,inputs){const folder=d+suffix+'/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),hash);const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E067-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.revision,revision);assert.equal(Object.keys(f.inputHashes).length,inputs);assert.equal(f.stagePassed,passed);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,passed?0:1);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,300);assert(f.seconds>0&&f.seconds<300);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});
 if(passed)assert.deepEqual(f.inputHashes,await e067SmokeSourceInputs());else for(const [file,expected]of Object.entries(f.inputHashes))assert.equal(digest(normalized(file,execFileSync('git',['show',revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true}))),expected);
 const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',159],['pass',passed?159:158],['fail',passed?0:1],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));if(passed)assert.doesNotMatch(tap,/^not ok /m);else{assert.equal((tap.match(/^not ok /gm)||[]).length,1);assert.match(tap,/third repetition before actual refuses while fresh FEN qualifies/);assert.match(tap,/Missing expected exception/);}
 const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const n of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+n],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+n));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
 const failed=await verify('semantic-e067-smoke-initial','ac6b8c36da39b4419981323307eb5ea3e09af446f7f59e034a6a88bd46d70132',false,'d97cfea96b5fd04ade6a97a7ae7888cd0f1c0adb',76),corrected=await verify('semantic-e067-smoke-repetition-state-corrected','0789c721d9b77ff39bb27f0407eb6bcfb79816da57379cc82034f6c8cd47b5f6',true,'e32e863548dbdc1835f4f78c5a7e359d84104f57',77);return{...corrected,failed,globalHistoricalTerminalApiRefusalOpen:true};}
export function checkE067Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E067-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3304);assert.equal(report.newFixtureCases,104);assert.equal(report.baselineCases,3200);assert.equal(report.results.length,104);assert.equal(fixtures.length,104);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,3200);assert.equal(inherited.length,3200);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['waiting-move','reserve-pawn-tempo'],states={},byKind={},summary={rows:104,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.waitingTempoAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,100);assert.equal(summary.errors,4);assert.equal(summary.certificates,56);assert.deepEqual(states,{'immediate-mate-available':12,'pass-refuted':20,ineligible:16,disabled:8,exhausted:8,proven:32,'actual-refuted':4});assert.deepEqual(byKind,{'waiting-move':32,'reserve-pawn-tempo':24});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,56);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,104);summary.byKind=byKind;summary.ownEventReplays=56;return summary;}
export async function openE067Saved(){
 const admission=await admitTerminalRegression();await admitE067Smoke(admission);const bytes=new Map();
 for(const spec of savedE067){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE067Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E067');assert.equal(m.codeRevision,frozenE067Revision);assert.equal(Object.keys(m.inputHashes).length,204);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E066-pawn-races/code/race.mjs']);assert.equal(Object.keys(semantic).length,58);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE067Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E067-waiting-tempi/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E066-pawn-races/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE067Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E067-saved-admission-v1',historicalSourceRevision:frozenE067Revision,historicalInputsVerified:204,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:58,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE067,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE067,semanticClosure:semantic,currentDifferences,historicalInputsVerified:204};
}
