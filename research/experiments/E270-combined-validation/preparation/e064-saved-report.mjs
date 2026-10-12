import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE064Pilot} from './e064-pilot-admission.mjs';
const root='research/experiments/E064-blocked-position/',base=root+'evidence/';export const frozenE064Revision='9c9336e508bc355d2f021a3a1a53df46d2a58b3b';export const savedE064=Object.freeze([
  {
    "file": "research/experiments/E064-blocked-position/evidence/clean-run.json",
    "bytes": 39831,
    "sha256": "873fef60943515bfaef01b99e10b08251b222d5068b0de88660d3f0d9e8c19c2"
  },
  {
    "file": "research/experiments/E064-blocked-position/evidence/concept-status.md",
    "bytes": 109400,
    "sha256": "456a6a280a8c25cf151b369c573a9c7c01f6b82c7d23dfd3940e54dfd74f10f5"
  },
  {
    "file": "research/experiments/E064-blocked-position/evidence/demo.html",
    "bytes": 1133327,
    "sha256": "884270a6e4fee8fadd5fd3a3eee3d5f467d90bf7304de35e7da0f6e3f45c83fe"
  },
  {
    "file": "research/experiments/E064-blocked-position/evidence/repeat-run.json",
    "bytes": 39887,
    "sha256": "6860179059a9f7bde021ed6f5e2850f66d8916aa206c5056f7d58df24dc5cc27"
  },
  {
    "file": "research/experiments/E064-blocked-position/evidence/results.json",
    "bytes": 2875017,
    "sha256": "b1853bdabd15caa39249924b584c9a6fa4f60e4bc5704e228a70099dfa412f43"
  },
  {
    "file": "research/experiments/E064-blocked-position/evidence/run.json",
    "bytes": 39800,
    "sha256": "1090ccd252e8ab11570e0a6248137ca12b2c4b845291a7e6c4c1a491bbe86eb6"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE064Bytes(file,raw){const spec=savedE064.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e064SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e064-smoke.mjs',d+'preparation/run-e064-pilot.mjs',d+'preparation/e064-pilot.test.mjs',d+'preparation/e064-smoke.test.mjs',d+'preparation/e064-whole-result.mjs',d+'AMENDMENT-e064-complete-result-smoke.md',d+'AMENDMENT-e064-complete-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','package.json','package-lock.json']);}
export async function e064SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e064-saved.mjs','research/experiments/E270-combined-validation/preparation/e064-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e064-smoke.mjs','research/experiments/E270-combined-validation/preparation/e064-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e064-pilot.mjs','research/experiments/E270-combined-validation/preparation/e064-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e064-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e064-complete-result-smoke.md','research/experiments/E270-combined-validation/AMENDMENT-e064-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e064-saved-result-replay.md',root+'PLAN.md',root+'EXPOSURE.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE064Smoke(admission){const pilot=await admitE064Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e064-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'b16b7bd775ff15e79f5f9af6a95ba289a02b70aeeb03d3b7635fe3207c8a559b');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E064-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,300);assert(f.seconds>0&&f.seconds<300);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e064SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',195],['pass',195],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE064Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E064-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,2940);assert.equal(report.newFixtureCases,140);assert.equal(report.baselineCases,2800);assert.equal(report.results.length,140);assert.equal(fixtures.length,140);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,2800);assert.equal(inherited.length,2800);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['blocked-position'],states={},byKind={},summary={rows:140,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.blockedPositionAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,136);assert.equal(summary.errors,4);assert.equal(summary.certificates,48);assert.deepEqual(states,{complete:128,disabled:4,exhausted:4});assert.deepEqual(byKind,{'blocked-position':48});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,48);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,140);summary.byKind=byKind;summary.ownEventReplays=48;return summary;}
export async function openE064Saved(){
 const admission=await admitTerminalRegression();await admitE064Smoke(admission);const bytes=new Map();
 for(const spec of savedE064){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE064Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E064-blocked-position/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E064');assert.equal(m.codeRevision,frozenE064Revision);assert.equal(Object.keys(m.inputHashes).length,189);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E063-pawn-storm/code/storm.mjs']);assert.equal(Object.keys(semantic).length,54);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE064Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E064-blocked-position/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E063-pawn-storm/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE064Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E064-saved-admission-v1',historicalSourceRevision:frozenE064Revision,historicalInputsVerified:189,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:54,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE064,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE064,semanticClosure:semantic,currentDifferences,historicalInputsVerified:189};
}
