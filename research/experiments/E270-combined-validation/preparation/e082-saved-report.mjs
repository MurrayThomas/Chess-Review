import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {bindings,digest,normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
const root='research/experiments/E082-rook-ending-facts/',base=root+'evidence/';
export const frozenE082Revision='2859af1c33dc359237119f936778514764356190';
export const savedE082=Object.freeze([
 {file:base+'clean-run.json',bytes:59740,sha256:'8e2714cf82068d4295d8a7717f619db7702dafd460c1ac6aa0b093f0b18c18fb'},
 {file:base+'concept-status.md',bytes:122020,sha256:'dc6897e8bf47c113c6265a94ac7bbbad5d6e4d8bafad820f9dfa08f0ce6b600a'},
 {file:base+'demo.html',bytes:1392763,sha256:'f379bbfe98d2ff8e9bfb9a90a8cee9ad8b635d375157361e9c99b9c78c6e7ad0'},
 {file:base+'repeat-run.json',bytes:59734,sha256:'33196254a427d3deedcf079e2149cc6745d810d33f3dfd0877427bffa5efa95f'},
 {file:base+'results.json',bytes:5145797,sha256:'6c5f82b0847d3ef2d73b36d64acd43eaaf9f02ef8c0ec2ffb59a281da02d01fd'},
 {file:base+'run.json',bytes:59703,sha256:'0d353bd28963d14789141867357a51d9e4591c280b533a6f740fc00519b86b45'}
]);
export const historicalE082Supplements=Object.freeze([
 {file:'research/d001-format.mjs',sha256:'5dffe4a50655536950d2bb8c475fef31f493cfb9b47cfcaad808b0fb087ea24d'},
 {file:'research/fresh-format.mjs',sha256:'6537d177ad21cbe16c89471040e63d0f42ad43a69e4f189787b8dcf2624e5b21'},
 {file:'tools/calibration/core.mjs',sha256:'c9f38c42f4937fcfdcb3bd44fdaf1d4eea6323c69533a24ca16779cfc4178ace'}
]);
export function checkE082Supplements(list){assert.deepEqual(list,historicalE082Supplements);return true;}
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkE082Bytes(file,raw){const spec=savedE082.find(x=>x.file===file);assert.ok(spec);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);return true;}
export function checkE082Shape(report,fixtures,manifest,inherited){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','fixtures','newFixtureCases','baselineCases','accepted','abstained','invalid','maxCommentWords','eventCounts','replays','rookEndingReplays','directAttackReplays','pawnShieldReplays','kingCenterReplays','guardReplays','octopusRefutationReplays','refutationReplays','queryReplays','results','baselineResults'].sort());
 assert.equal(report.schema,'E082-synthetic-mechanics-v1');assert.equal(report.source,'authored synthetic development fixtures; no real games');assert.equal(report.fixtures,5702);assert.equal(report.newFixtureCases,246);assert.equal(report.baselineCases,5456);
 assert.equal(report.results.length,246);assert.equal(fixtures.length,246);assert.deepEqual(report.results.map(r=>r.fixture),clone(fixtures));
 assert.equal(report.baselineResults.length,5456);assert.deepEqual(report.baselineResults.map(r=>[r.fixture,r.fullResultHash]),inherited);assert.equal(inherited.length,5456);
 const states={},summary={rows:246,results:0,errors:0,certificates:0,replies:0,states};
 for(const row of report.results){
  if(Object.hasOwn(row,'error')){assert.deepEqual(Object.keys(row).sort(),['error','fixture']);assert.equal(typeof row.error,'string');assert.ok(row.fixture.inputError&&row.error.includes(row.fixture.inputError));summary.errors++;continue;}
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.ok(row.result&&typeof row.result==='object');summary.results++;
  const state=row.result.rookEndingAnalysis?.status||'disabled';assert.equal(state,row.fixture.expectedStatus);states[state]=(states[state]||0)+1;
  const w=row.result.rookEndingAnalysis?.witness;if(w){summary.certificates+=w.categories.length;summary.replies+=w.side?.replies.length||0;}
 }
 assert.equal(summary.results,198);assert.equal(summary.errors,48);assert.equal(summary.certificates,136);assert.equal(summary.replies,278);assert.deepEqual(states,{proven:130,disabled:4,exhausted:12,'no-new-fact':28,'not-live':12,'not-applicable':12});
 assert.equal(report.rookEndingReplays.length,198);assert.deepEqual(report.rookEndingReplays.map(x=>x.fixture),report.results.filter(x=>x.result).map(x=>x.fixture.id));assert.equal(manifest.metrics.newFixtureCases,246);assert.equal(manifest.metrics.rookEndingCertificates,summary.certificates);assert.equal(manifest.metrics.rookEndingReplies,summary.replies);
 return summary;
}
export async function e082SourceInputs(){const d='research/experiments/E270-combined-validation/';return bindings([d+'preparation/run-e082.mjs',d+'preparation/e082-replay.test.mjs',d+'AMENDMENT-e082-accepted-replay-reuse.md',d+'AMENDMENT-e082-transitive-supplements.md',root+'PLAN.md',root+'AMENDMENT.md','research/concepts/ACTIVE-QUEUE.md','package.json','package-lock.json']);}
export async function admitE082Smoke(attempt,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);const p='research/experiments/E270-combined-validation/evidence/semantic-e082-smoke-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);assert.equal(f.schema,'E270-E082-semantic-v1');assert.equal(f.phase,'smoke');assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,120);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);assert.deepEqual(f.inputHashes,await e082SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);const tap=stdout.toString();assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);for(const [key,n]of [['tests',55],['pass',55],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE082Saved(){
 const admission=await admitTerminalRegression();await admitE082Smoke(process.env.CHESS_E082_SMOKE_ATTEMPT,admission);const bytes=new Map();
 for(const spec of savedE082){assert.deepEqual(admission.archives.find(x=>x.file===spec.file),spec);const raw=await readFile(spec.file);checkE082Bytes(spec.file,raw);bytes.set(spec.file,raw);}
 const manifest=JSON.parse(bytes.get(base+'run.json')),repeat=JSON.parse(bytes.get(base+'repeat-run.json')),clean=JSON.parse(bytes.get(base+'clean-run.json'));
 for(const m of [manifest,repeat,clean]){assert.equal(m.schema,'research-synthetic-run-v1');assert.equal(m.experiment,'E082');assert.equal(m.codeRevision,frozenE082Revision);assert.equal(m.workingTreeStatus,'');assert.equal(Object.keys(m.inputHashes).length,309);for(const k of ['inputHashes','outputHashes','config','environment','eligibilityReceipt','metrics'])assert.deepEqual(m[k],manifest[k]);}
 for(const [name,hash]of Object.entries(manifest.outputHashes))assert.equal(sha256(bytes.get(base+name)),hash);
 const semantic=await bindings([root+'code/replay.mjs',root+'code/fixtures.mjs']);assert.equal(Object.keys(semantic).length,86);const currentDifferences=[];
 for(const [file,hash]of Object.entries(manifest.inputHashes)){
  const historical=execFileSync('git',['show',frozenE082Revision+':'+file],{maxBuffer:64*1024*1024,windowsHide:true});assert.equal(sha256(file.endsWith('.gz')?historical:historical.toString().replaceAll('\r\n','\n')),hash,'Historical Git input differs: '+file);
  const raw=await readFile(file),current=sha256(file.endsWith('.gz')?raw:raw.toString().replaceAll('\r\n','\n'));if(current!==hash)currentDifferences.push({file,historical:hash,current,inSemanticClosure:Object.hasOwn(semantic,file)});
 }
 assert.deepEqual(currentDifferences,[{file:'research/concepts/ACTIVE-QUEUE.md',historical:'a9b2728280be600efec56fa011476bc153dfd19bac00ff6aa550a0aa73f6d784',current:'695a265e10dc5d9ac585becdf47e7ebc4ba4428646345b98425d75af549db2b1',inSemanticClosure:false}]);
 const supplements=[];
 for(const [file,hash]of Object.entries(semantic)){
  assert.equal(hash,admission.sourceHashes[file]);assert.equal(digest(normalized(file,await readFile(file))),hash);
  if(Object.hasOwn(manifest.inputHashes,file))assert.equal(hash,manifest.inputHashes[file],'Semantic input differs from historical vector: '+file);
  else {const historical=execFileSync('git',['show',frozenE082Revision+':'+file],{maxBuffer:8*1024*1024,windowsHide:true});assert.equal(digest(normalized(file,historical)),hash);supplements.push({file,sha256:hash});}
 }
 checkE082Supplements(supplements);
 const policyEpoch=await proveE083PolicyEpoch(manifest.eligibilityReceipt,admission.receipt);
 const {unpackReport}=await import('../../E079-central-king-support/code/saved.mjs'),{fixtures,reflect}=await import('../../E082-rook-ending-facts/code/fixtures.mjs');
 const report=unpackReport(JSON.parse(bytes.get(base+'results.json'))),allFixtures=fixtures.flatMap(f=>[f,reflect(f)]),priorBase='research/experiments/E081-direct-attacks/evidence/';
 const priorBytes={};for(const name of ['run.json','results.json']){const file=priorBase+name,spec=admission.archives.find(x=>x.file===file);assert.ok(spec);const raw=await readFile(file);assert.equal(raw.length,spec.bytes);assert.equal(sha256(raw),spec.sha256);priorBytes[name]=raw;}
 const priorManifest=JSON.parse(priorBytes['run.json']);assert.equal(sha256(priorBytes['results.json']),priorManifest.outputHashes['results.json']);assert.equal(manifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md'],priorManifest.inputHashes['research/experiments/E020-coach-concepts/CONCEPTS.md']);const prior=unpackReport(JSON.parse(priorBytes['results.json']));
 const inherited=[...prior.results.map(row=>[row.fixture.id,sha256(JSON.stringify(row.result||{error:row.error}))]),...prior.baselineResults.map(row=>[row.fixture,row.fullResultHash])];
 const summary=checkE082Shape(report,allFixtures,manifest,inherited);
 return {report,fixtures:clone(allFixtures),manifest,summary,inherited,receipt:admission.receipt,historicalReceipt:clone(manifest.eligibilityReceipt),policyEpoch,canonical:savedE082,semanticClosure:semantic,currentDifferences,historicalInputsVerified:309,supplementaryHistoricalSources:supplements};
}
