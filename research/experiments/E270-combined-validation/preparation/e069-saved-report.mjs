import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {sha256} from '../../../data-policy.mjs';import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';import {admitTerminalRegression} from './semantic-gate.mjs';import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';import {admitE069Pilot} from './e069-pilot-admission.mjs';
const root='research/experiments/E069-checking-invasions/',base=root+'evidence/';export const frozenE069Revision='32068c472dbfd8c4662b5aaf881ec2fb4bebc668';export const savedE069=Object.freeze([
  {
    "file": "research/experiments/E069-checking-invasions/evidence/clean-run.json",
    "bytes": 43179,
    "sha256": "f0f7380ffce3ae9ca9fed8b5a99c97c1d29781ad3ae48121d4a6f6749eecf894"
  },
  {
    "file": "research/experiments/E069-checking-invasions/evidence/concept-status.md",
    "bytes": 112603,
    "sha256": "4a7ec5e591919634d576b8c1d806ea599c962265dcc8ce765deef7f987348401"
  },
  {
    "file": "research/experiments/E069-checking-invasions/evidence/demo.html",
    "bytes": 1366415,
    "sha256": "24386f637d29d23d9c9f1185680b34cc167ad338590e943da0d8d74078fe434b"
  },
  {
    "file": "research/experiments/E069-checking-invasions/evidence/repeat-run.json",
    "bytes": 43187,
    "sha256": "5260b9aa22956231cf48d906308c75f9ae736adae4111ba45ae5fad4b5b22952"
  },
  {
    "file": "research/experiments/E069-checking-invasions/evidence/results.json",
    "bytes": 2891768,
    "sha256": "66a5d69986143bff0ea7534e6694dd80373d0a3233cc0d0ee45ab1fd3f334513"
  },
  {
    "file": "research/experiments/E069-checking-invasions/evidence/run.json",
    "bytes": 43155,
    "sha256": "e516ba582a8eee818fc2e0f8b479926903d6b78ea2e0662a9722d14e1db1a0f4"
  }
]);const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE069Bytes(file,raw){const spec=savedE069.find(x=>x.file===file);assert(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export async function e069SmokeSourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e069-smoke.mjs',d+'preparation/run-e069-pilot.mjs',d+'preparation/e069-pilot.test.mjs',d+'preparation/e069-smoke.test.mjs',d+'preparation/e069-whole-result.mjs',d+'AMENDMENT-e069-complete-result-replay.md',root+'PLAN.md','package.json','package-lock.json']);}
export async function e069SourceInputs(){return bindings(['research/experiments/E270-combined-validation/preparation/run-e069-saved.mjs','research/experiments/E270-combined-validation/preparation/e069-saved.test.mjs','research/experiments/E270-combined-validation/preparation/run-e069-smoke.mjs','research/experiments/E270-combined-validation/preparation/e069-smoke.test.mjs','research/experiments/E270-combined-validation/preparation/run-e069-pilot.mjs','research/experiments/E270-combined-validation/preparation/e069-pilot.test.mjs','research/experiments/E270-combined-validation/preparation/e069-whole-result.mjs','research/experiments/E270-combined-validation/AMENDMENT-e069-complete-result-replay.md','research/experiments/E270-combined-validation/AMENDMENT-e069-saved-result-replay.md',root+'PLAN.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE069Smoke(admission){const pilot=await admitE069Pilot(admission),folder='research/experiments/E270-combined-validation/evidence/semantic-e069-smoke-initial/',raw=await readFile(folder+'final.json');assert.equal(sha256(raw),'8343a68ddd028d36e7cfa2a08ac7b31509206aa6fee40633c5079cb5ae45af10');const f=JSON.parse(raw),started=JSON.parse(await readFile(folder+'started.json'));for(const [k,v]of Object.entries(started))assert.deepEqual(f[k],v);assert.equal(f.schema,'E270-E069-smoke-v1');assert.deepEqual(f.pilot,pilot);assert.equal(f.stagePassed,true);assert.equal(f.semanticAcceptance,false);assert.equal(f.historicalQualification,false);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.unreportedRunningRowPossible,false);assert.equal(f.hardLimitSeconds,180);assert(f.seconds>0&&f.seconds<180);for(const k of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[k],[]);assert.deepEqual(f.admission,{receipt:admission.receipt,freezeSha256:admission.freezeSha256,terminalSha256:admission.terminalSha256,regressionRevision:admission.revision});assert.deepEqual(f.inputHashes,await e069SmokeSourceInputs());const stdout=await readFile(folder+'stdout.tap'),stderr=await readFile(folder+'stderr.txt'),tap=stdout.toString();assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);assert.equal(f.tapSummary,tap.slice(-1800));assert.equal(stderr.length,0);for(const [k,n]of [['tests',230],['pass',230],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+k+' '+n+'\\r?$','m'));assert.doesNotMatch(tap,/^not ok /m);const process=JSON.parse(await readFile(folder+'process.json'));assert.equal(process.pid,f.pid);assert.equal(process.startedAt,f.startedAt);for(const name of ['started.json','process.json','stdout.tap','stderr.txt','final.json'])assert.deepEqual(execFileSync('git',['show','HEAD:'+folder+name],{maxBuffer:4*1024*1024,windowsHide:true}),await readFile(folder+name));return{file:folder+'final.json',sha256:sha256(raw),revision:f.revision,pilot};}
export function checkE069Shape(report,fixtures,manifest,inherited){assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','queryReplays','results','baselineResults'].sort());assert.equal(report.schema,'E069-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,3604);assert.equal(report.newFixtureCases,192);assert.equal(report.baselineCases,3412);assert.equal(report.results.length,192);assert.equal(fixtures.length,192);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));assert.equal(report.baselineResults.length,3412);assert.equal(inherited.length,3412);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);const ownIds=['rook-invasion','queen-invasion'],states={},byKind={},summary={rows:192,results:0,errors:0,certificates:0,states};for(const row of report.results){if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(row.fixture.invalid,true);assert.equal(row.error,'Illegal move; explanation refused.');summary.errors++;continue;}assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert(row.result&&typeof row.result==='object');summary.results++;const state=row.result.invasionAnalysis?.status||'disabled';states[state]=(states[state]||0)+1;for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}}assert.equal(summary.results,184);assert.equal(summary.errors,8);assert.equal(summary.certificates,88);assert.deepEqual(states,{proven:88,ineligible:80,disabled:8,exhausted:8});assert.deepEqual(byKind,{'rook-invasion':44,'queen-invasion':44});const records=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(records.length,88);assert.deepEqual(records.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,192);summary.byKind=byKind;summary.ownEventReplays=88;return summary;}
export async function openE069Saved(){
 const admission=await admitTerminalRegression();await admitE069Smoke(admission);const bytes=new Map();
 for(const spec of savedE069){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE069Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E069');assert.equal(m.codeRevision,frozenE069Revision);assert.equal(Object.keys(m.inputHashes).length,209);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E068-rook-swings/code/swing.mjs']);assert.equal(Object.keys(semantic).length,59);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE069Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E069-checking-invasions/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E068-rook-swings/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE069Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E069-saved-admission-v1',historicalSourceRevision:frozenE069Revision,historicalInputsVerified:209,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:59,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE069,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE069,semanticClosure:semantic,currentDifferences,historicalInputsVerified:209};
}
