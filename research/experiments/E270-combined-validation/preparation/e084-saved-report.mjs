import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {sha256} from '../../../data-policy.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
export const savedE084=Object.freeze({file:'research/experiments/E084-legal-line-clearance/evidence/results.json',bytes:146618,sha256:'a44984135a9cdfdb39e663aa8a11c9c65d6c56f66e5e8ac51431fc70f8a72812'});
const plain=x=>JSON.parse(JSON.stringify(x));
export function checkE084Shape(report,fixtures,hashes,receipt){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','revision','inputHashes','workingTreeStatus','eligibilityReceipt','rows'].sort());
 assert.equal(report.schema,'E084-focused-pilot-v1');assert.equal(report.source,'authored synthetic only');assert.match(report.revision,/^[0-9a-f]{40}$/);assert.equal(typeof report.workingTreeStatus,'string');
 assert.deepEqual(report.inputHashes,hashes);assert.equal(Object.keys(hashes).length,84);assert.deepEqual(report.eligibilityReceipt,receipt);
 assert.equal(report.rows.length,18);assert.equal(fixtures.length,18);let witnessed=0;
 for(const [index,row]of report.rows.entries()){
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.deepEqual(row.fixture,plain(fixtures[index]));assert.ok(row.result&&typeof row.result==='object');
  assert.ok(Array.isArray(row.result.lineAnalysis?.witnesses));if(row.result.lineAnalysis.witnesses.length)witnessed++;
 }
 assert.equal(witnessed,8);return {rows:18,errors:0,witnessed};
}
export function checkE084Bytes(raw){assert.equal(raw.length,savedE084.bytes);assert.equal(sha256(raw),savedE084.sha256);return true;}
export async function e084SourceInputs(){
 const d='research/experiments/E270-combined-validation';
 return bindings([d+'/preparation/run-e084.mjs',d+'/preparation/e084-replay.test.mjs',d+'/AMENDMENT-e084-whole-domain-replay.md',
  'research/experiments/E084-legal-line-clearance/PLAN.md','package.json','package-lock.json']);
}
export async function admitE084Smoke(attempt,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);
 const p='research/experiments/E270-combined-validation/evidence/semantic-e084-smoke-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);
 assert.equal(f.schema,'E270-E084-semantic-v1');assert.equal(f.phase,'smoke');assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,120);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);
 assert.deepEqual(f.inputHashes,await e084SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);
 const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);
 const tap=stdout.toString('utf8');assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);
 for(const [key,n]of [['tests',51],['pass',51],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE084Saved(){
 // The saved-mode driver admits a hash-matched smoke before this child starts.
 const admission=await admitTerminalRegression();await admitE084Smoke(process.env.CHESS_E084_SMOKE_ATTEMPT,admission);assert.deepEqual(admission.archives.find(a=>a.file===savedE084.file),savedE084);
 const raw=await readFile(savedE084.file);checkE084Bytes(raw);const report=JSON.parse(raw);
 const build=JSON.parse(await readFile('research/experiments/E084-legal-line-clearance/build.json'));
 for(const [file,hash]of Object.entries(build.inputHashes))assert.equal(hash,admission.sourceHashes[file]);
 const {bothColors}=await import('../../E084-legal-line-clearance/code/fixtures.mjs');
 const policyEpoch=await proveE083PolicyEpoch(report.eligibilityReceipt,admission.receipt);
 const summary=checkE084Shape(report,bothColors,build.inputHashes,report.eligibilityReceipt);
 return {report,fixtures:plain(bothColors),summary,sourceHashes:build.inputHashes,historicalReceipt:plain(report.eligibilityReceipt),receipt:admission.receipt,policyEpoch,canonical:savedE084};
}
