import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E076-pawn-army-inventories/',base=root+'evidence/';
export const frozenE076Revision='94da8a7331b8690f55d0d4c0d26230aea92a5e22';
export const savedE076=Object.freeze([
 {file:base+'clean-run.json',bytes:49018,sha256:'7cd7ae081c9bc63232256e2f8c40280fa2b799c0450461a6b2cb26c6edbc8945'},
 {file:base+'concept-status.md',bytes:117205,sha256:'19252314062697c5494b81b8ade9b2d86dc155a824b756aec17746a3bc3aa689'},
 {file:base+'demo.html',bytes:571031,sha256:'8a82d2bab2d67f4a863c2ed81357e6a2d2a3b09a5e3f53d154e31abbdcaccfc9'},
 {file:base+'repeat-run.json',bytes:49079,sha256:'4dc1c13e6fe09d3bf2308f896fca5fc067528acfaa5e9366a234f706dd5077b2'},
 {file:base+'results.json',bytes:4252924,sha256:'361a0ead4dcf2158e24c45564d8416250e82dc3816ba00be1d7f0f8d54f2c685'},
 {file:base+'run.json',bytes:48987,sha256:'cf732c944c8d3283a607db0f2f450413a2e40a99e10695d62cce8fe22ac19353'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE076Bytes(file,raw){const spec=savedE076.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE076Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E076-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,4680);assert.equal(report.newFixtureCases,126);assert.equal(report.baselineCases,4554);
 assert.equal(report.results.length,126);assert.equal(fixtures.length,126);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,4554);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,4554);
 const ownIds=['pawn-skeleton','paired-bishop-armies','rook-minor-armies','passed-count-imbalance','flank-count-imbalance'],states={},byKind={},summary={rows:126,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&(!row.fixture.expectedError||row.error.includes(row.fixture.expectedError)));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.inventoryAnalysis?.status||'disabled';if(row.fixture.expectedStatus)assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  for(const e of row.result.events.filter(e=>ownIds.includes(e.id))){summary.certificates++;byKind[e.id]=(byKind[e.id]||0)+1;}
 }
 assert.equal(summary.results,118);assert.equal(summary.errors,8);assert.equal(summary.certificates,140);assert.deepEqual(states,{proven:88,'no-new-fact':10,'not-live':8,disabled:2,exhausted:2,'not-applicable':8});assert.deepEqual(byKind,{'pawn-skeleton':66,'passed-count-imbalance':22,'flank-count-imbalance':28,'paired-bishop-armies':10,'rook-minor-armies':14});
 const ownRecords=report.replays.filter(r=>ownIds.includes(r.kind)),expected=report.results.flatMap(r=>r.result?r.result.events.filter(e=>ownIds.includes(e.id)).map(e=>[r.fixture.id,e.id]):[]);assert.equal(ownRecords.length,140);assert.deepEqual(ownRecords.map(r=>[r.fixture,r.kind]),expected);assert.equal(manifest.metrics.newFixtureCases,126);summary.byKind=byKind;summary.ownEventReplays=140;return summary;
}
export async function e076SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e076.mjs',d+'preparation/e076-replay.test.mjs',d+'AMENDMENT-e076-complete-result-replay.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE076Smoke(attempt,admission){return admitE076Controls(attempt,'smoke',admission);}
export async function admitE076Pilot(attempt,admission){return admitE076Controls(attempt,'pilot',admission);}
async function admitE076Controls(attempt,phase,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e076-'+phase+'-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E076-semantic-v1');assert.equal(f.phase,phase);assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,phase==='pilot'?120:126);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e076SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',phase==='pilot'?7:183],['pass',phase==='pilot'?7:183],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE076Saved(){
 const admission=await admitTerminalRegression();await admitE076Smoke(process.env.CHESS_E076_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE076){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE076Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E076-pawn-army-inventories/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E076');assert.equal(m.codeRevision,frozenE076Revision);assert.equal(Object.keys(m.inputHashes).length,245);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs','research/experiments/E075-board-material/code/foundations.mjs']);assert.equal(Object.keys(semantic).length,64);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE076Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {fixtures,reflect}=await import('../../E076-pawn-army-inventories/code/fixtures.mjs');
 const report=JSON.parse(bytes.get(base+'results.json')),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E075-board-material/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=JSON.parse(priorBytes['results.json']);
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE076Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E076-saved-admission-v1',historicalSourceRevision:frozenE076Revision,historicalInputsVerified:245,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:64,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE076,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE076,semanticClosure:semantic,currentDifferences,historicalInputsVerified:245};
}
