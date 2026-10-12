import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E080-pawn-shield-defense/',base=root+'evidence/';
export const frozenE080Revision='fe78fcf871cc485fb6078fc78a2d3e3addcdda31';
export const savedE080=Object.freeze([
 {file:base+'clean-run.json',bytes:53976,sha256:'bae46b2e1a52a29a07901b9915cd31e34ddc3e3ff60da35506b35be6f6703b14'},
 {file:base+'concept-status.md',bytes:120106,sha256:'65820789717e96aa37f31c05933e17db4cfb9b6ab510dbde9eabaab9ff6ed579'},
 {file:base+'demo.html',bytes:490532,sha256:'11e1afef5c033ea2ec159dc06453c14481b323261ad303b47c8be99b3e5c28c9'},
 {file:base+'repeat-run.json',bytes:54035,sha256:'56fb0a6eb15eccc2465821db72b036fa33ed933b9c2c699cbe6619eea554f4b3'},
 {file:base+'results.json',bytes:4134060,sha256:'c08d7f7fe023d98f481d5b7f23eb0b0fa2130fda3deca78ac5598663a68530b3'},
 {file:base+'run.json',bytes:53945,sha256:'157a0577fcb452f0286de619763de41d616440648fb6881442e555a1c9e884da'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE080Bytes(file,raw){const spec=savedE080.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE080Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','pawnShieldReplays','kingCenterReplays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E080-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,5312);assert.equal(report.newFixtureCases,122);assert.equal(report.baselineCases,5190);
 assert.equal(report.results.length,122);assert.equal(fixtures.length,122);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,5190);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,5190);
 const states={},summary={rows:122,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&row.error.includes(row.fixture.expectedError));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.pawnShieldAnalysis?.status||'disabled';assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  const w=row.result.pawnShieldAnalysis?.witness;if(w){summary.certificates++;}
 }
 assert.equal(summary.results,84);assert.equal(summary.errors,38);assert.equal(summary.certificates,16);assert.deepEqual(states,{proven:16,'no-new-fact':40,disabled:2,exhausted:4,'not-applicable':12,'not-live':10});
 assert.equal(report.pawnShieldReplays.length,84);assert.deepEqual(report.pawnShieldReplays.map(x=>x.fixture),report.results.filter(x=>x.result).map(x=>x.fixture.id));assert.equal(manifest.metrics.newFixtureCases,122);assert.equal(manifest.metrics.pawnShieldWitnesses,summary.certificates);
 summary.replies=report.pawnShieldReplays.reduce((n,r)=>n+r.replies,0);summary.leaves=report.pawnShieldReplays.reduce((n,r)=>n+r.leaves,0);assert.equal(summary.replies,444);assert.equal(summary.leaves,444);return summary;
}
export async function e080SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e080.mjs',d+'preparation/e080-replay.test.mjs',d+'AMENDMENT-e080-accepted-replay-reuse.md',d+'AMENDMENT-e080-repeat-tree.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE080Smoke(attempt,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e080-smoke-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E080-semantic-v1');assert.equal(f.phase,'smoke');assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,120);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e080SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',166],['pass',166],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE080Saved(){
 const admission=await admitTerminalRegression();await admitE080Smoke(process.env.CHESS_E080_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE080){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE080Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 assert.deepEqual([manifest,repeat,clean].map(m=>m.workingTreeStatus),['','?? research/experiments/E080-pawn-shield-defense/evidence/','']);
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E080');assert.equal(m.codeRevision,frozenE080Revision);assert.equal(Object.keys(m.inputHashes).length,272);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs']);assert.equal(Object.keys(semantic).length,73);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE080Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {unpackReport}=await import('../../E079-central-king-support/code/saved.mjs'),{fixtures,reflect}=await import('../../E080-pawn-shield-defense/code/fixtures.mjs');
 const report=unpackReport(JSON.parse(bytes.get(base+'results.json'))),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E079-central-king-support/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=unpackReport(JSON.parse(priorBytes['results.json']));
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE080Shape(report,allFixtures,manifest,inherited);
 const admissionAudit={schema:'E270-E080-saved-admission-v1',historicalSourceRevision:frozenE080Revision,historicalInputsVerified:272,historicalInputVectorSha256:sha256(JSON.stringify(manifest.inputHashes)),semanticSourceCount:73,semanticClosureSha256:sha256(JSON.stringify(semantic)),canonical:savedE080,currentMetadataDifferences:currentDifferences,inheritedFingerprints:{count:inherited.length,orderedSha256:sha256(JSON.stringify(inherited))},teachingListSha256:manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],policyEpochSha256:sha256(JSON.stringify(policyEpoch)),receiptSha256:sha256(JSON.stringify(admission.receipt)),summary};
 return {admissionAudit,report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE080,semanticClosure:semantic,currentDifferences,historicalInputsVerified:272};
}
