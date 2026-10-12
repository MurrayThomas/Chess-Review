import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E081-direct-attacks/',base=root+'evidence/';
export const frozenE081Revision='9166ebadbc13776d955548a19e13a4962dc2ff3a';
export const savedE081=Object.freeze([
 {file:base+'clean-run.json',bytes:55914,sha256:'da1efc7b5692da01b762b3bed6c89308fd23150a26f89fa245c280ba4bbd6ad7'},
 {file:base+'concept-status.md',bytes:121228,sha256:'231b7e839b65481acfcb9896f16c3b58b5d0b22caf8493f3933f1feb54fc23b7'},
 {file:base+'demo.html',bytes:642676,sha256:'c56f199d731217430e41c800bdf0ff276f1aecbb5fb16c9a9b29feca692e5593'},
 {file:base+'repeat-run.json',bytes:55915,sha256:'8f5f0e13c4a28215fe6a73887303938aecc9626478ee180d8bffd47f6237762d'},
 {file:base+'results.json',bytes:4263717,sha256:'ed4e53cf2471fe8a028229946ced13f434bab776d5857bf83739406e06cb7c97'},
 {file:base+'run.json',bytes:55883,sha256:'97fddc6facb15853c26e3a4fdceeeb281f65fdcb5741fa581100e9f0455775d4'}
]);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE081Bytes(file,raw){const spec=savedE081.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE081Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','directAttackReplays','pawnShieldReplays','kingCenterReplays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E081-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,5456);assert.equal(report.newFixtureCases,144);assert.equal(report.baselineCases,5312);
 assert.equal(report.results.length,144);assert.equal(fixtures.length,144);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,5312);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,5312);
 const states={},summary={rows:144,results:0,errors:0,certificates:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&row.error.includes(row.fixture.expectedError));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.directAttackAnalysis?.status||'disabled';assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  const w=row.result.directAttackAnalysis?.witness;if(w){summary.certificates++;}
 }
 assert.equal(summary.results,108);assert.equal(summary.errors,36);assert.equal(summary.certificates,50);assert.deepEqual(states,{proven:50,disabled:4,exhausted:4,'no-new-fact':28,'not-applicable':12,'not-live':10});
 assert.equal(report.directAttackReplays.length,108);assert.deepEqual(report.directAttackReplays.map(x=>x.fixture),report.results.filter(x=>x.result).map(x=>x.fixture.id));assert.equal(manifest.metrics.newFixtureCases,144);assert.equal(manifest.metrics.directAttackWitnesses,summary.certificates);
 return summary;
}
export async function e081SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e081.mjs',d+'preparation/e081-replay.test.mjs',d+'AMENDMENT-e081-accepted-replay-reuse.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE081Smoke(attempt,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e081-smoke-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E081-semantic-v1');assert.equal(f.phase,'smoke');assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,120);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e081SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',183],['pass',183],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE081Saved(){
 const admission=await admitTerminalRegression();await admitE081Smoke(process.env.CHESS_E081_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE081){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE081Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E081');assert.equal(m.codeRevision,frozenE081Revision);assert.equal(m.workingTreeStatus,'');assert.equal(Object.keys(m.inputHashes).length,284);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs']);assert.equal(Object.keys(semantic).length,74);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE081Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 for(const [file,hash]of Object.entries(semantic)){assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);assert.equal(hash,manifest.inputHashes[file],'Semantic input not preserved in original vector: '+file);}
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {unpackReport}=await import('../../E079-central-king-support/code/saved.mjs'),{fixtures,reflect}=await import('../../E081-direct-attacks/code/fixtures.mjs');
 const report=unpackReport(JSON.parse(bytes.get(base+'results.json'))),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E080-pawn-shield-defense/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=unpackReport(JSON.parse(priorBytes['results.json']));
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE081Shape(report,allFixtures,manifest,inherited);
 return {report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE081,semanticClosure:semantic,currentDifferences,historicalInputsVerified:284};
}
