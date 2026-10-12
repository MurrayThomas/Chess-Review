import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {readFile} from 'node:fs/promises';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {sha256} from '../../../data-policy.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {proveE083PolicyEpoch} from './e083-policy-epoch.mjs';
export const savedE085=Object.freeze({file:'research/experiments/E085-immediate-mate-review/evidence/results.json.gz',bytes:84246,sha256:'b63bdc0f43c20a6a27e4e99561297d20cda430320487c0c9ad83195e4affecae'});
const plain=x=>JSON.parse(JSON.stringify(x));
export function checkE085Shape(report,fixtures,hashes,receipt){
 assert.deepEqual(Object.keys(report).sort(),['schema','source','revision','inputHashes','workingTreeStatus','eligibilityReceipt','rows'].sort());
 assert.equal(report.schema,'E085-focused-pilot-v1');assert.equal(report.source,'authored synthetic only');assert.match(report.revision,/^[0-9a-f]{40}$/);assert.equal(typeof report.workingTreeStatus,'string');
 assert.deepEqual(report.inputHashes,hashes);assert.equal(Object.keys(hashes).length,85);assert.deepEqual(report.eligibilityReceipt,receipt);
 assert.equal(report.rows.length,19);assert.equal(fixtures.length,19);let witnessed=0;
 for(const [index,row]of report.rows.entries()){
  assert.deepEqual(Object.keys(row).sort(),['fixture','result']);assert.deepEqual(row.fixture,plain(fixtures[index]));assert.ok(row.result&&typeof row.result==='object');
  assert.ok(row.result.reviewAnalysis?.witness);witnessed++;
 }
 assert.equal(witnessed,19);return {rows:19,errors:0,witnessed};
}
export function checkE085Bytes(raw){assert.equal(raw.length,savedE085.bytes);assert.equal(sha256(raw),savedE085.sha256);return true;}
export async function e085SourceInputs(){
 const d='research/experiments/E270-combined-validation';
 return bindings([d+'/preparation/run-e085.mjs',d+'/preparation/e085-replay.test.mjs',d+'/AMENDMENT-e085-whole-domain-replay.md',d+'/AMENDMENT-e085-foundation-control.md',d+'/AMENDMENT-e085-history-envelope.md',
  'research/experiments/E085-immediate-mate-review/PLAN.md','package.json','package-lock.json']);
}
export async function admitE085Smoke(attempt,admission){
 assert.match(attempt||'',/^[a-z0-9][a-z0-9-]{0,63}$/);
 const p='research/experiments/E270-combined-validation/evidence/semantic-e085-smoke-'+attempt+'/',raw=await readFile(p+'final.json'),f=JSON.parse(raw);
 assert.equal(f.schema,'E270-E085-semantic-v1');assert.equal(f.phase,'smoke');assert.equal(f.stagePassed,true);assert.equal(f.exitCode,0);assert.equal(f.signal,null);assert.equal(f.error,null);assert.equal(f.hardTimeout,false);assert.equal(f.hardLimitSeconds,120);
 assert.equal(f.admission.terminalSha256,admission.terminalSha256);assert.equal(f.admission.freezeSha256,admission.freezeSha256);assert.deepEqual(f.admission.receipt,admission.receipt);
 assert.deepEqual(f.inputHashes,await e085SourceInputs());for(const key of ['sourceChanges','canonicalChanges','generated'])assert.deepEqual(f[key],[]);
 const started=JSON.parse(await readFile(p+'started.json'));for(const key of Object.keys(started))assert.deepEqual(f[key],started[key]);
 const stdout=await readFile(p+'stdout.tap'),stderr=await readFile(p+'stderr.txt');assert.equal(sha256(stdout),f.stdoutSha256);assert.equal(sha256(stderr),f.stderrSha256);
 const tap=stdout.toString('utf8');assert.equal(f.tapSummary,tap.slice(-1800));assert.doesNotMatch(tap,/^not ok /m);
 for(const [key,n]of [['tests',64],['pass',64],['fail',0],['cancelled',0],['skipped',0],['todo',0]])assert.match(tap,new RegExp('^# '+key+' '+n+'\\r?$','m'));
 return {file:p+'final.json',sha256:sha256(raw),revision:f.revision};
}
export async function openE085Saved(){
 // The saved-mode driver admits a hash-matched smoke before this child starts.
 const admission=await admitTerminalRegression();await admitE085Smoke(process.env.CHESS_E085_SMOKE_ATTEMPT,admission);assert.deepEqual(admission.archives.find(a=>a.file===savedE085.file),savedE085);
 const raw=await readFile(savedE085.file);checkE085Bytes(raw);const decoded=gunzipSync(raw);assert.equal(decoded.length,2075892);assert.equal(sha256(decoded),'b71576c79cc727f6b206e4f5aeca192f7a6f0534a520a596d0da11e2a2498096');const report=JSON.parse(decoded);
 const manifestFile='research/experiments/E085-immediate-mate-review/evidence/run.json',manifestRaw=await readFile(manifestFile),manifestIdentity={file:manifestFile,bytes:11843,sha256:'d486a18d409fff492ab23e6c7f344fe2fc64535a060ea03d0499dd119b611867'};
 assert.deepEqual(admission.archives.find(a=>a.file===manifestFile),manifestIdentity);assert.equal(manifestRaw.length,manifestIdentity.bytes);assert.equal(sha256(manifestRaw),manifestIdentity.sha256);const manifest=JSON.parse(manifestRaw);
 assert.equal(manifest.schema,'E085-focused-retention-v1');assert.equal(manifest.cases,19);assert.equal(manifest.compressedBytes,raw.length);assert.equal(manifest.uncompressedBytes,decoded.length);assert.equal(manifest.uncompressedSha256,sha256(decoded));assert.deepEqual(manifest.outputHashes,{'results.json.gz':sha256(raw)});assert.equal(manifest.sourceRevision,report.revision);assert.deepEqual(manifest.inputHashes,report.inputHashes);
 const build=JSON.parse(await readFile('research/experiments/E085-immediate-mate-review/build.json'));
 for(const [file,hash]of Object.entries(build.inputHashes))assert.equal(hash,admission.sourceHashes[file]);
 const {bothColors}=await import('../../E085-immediate-mate-review/code/fixtures.mjs');
 const policyEpoch=await proveE083PolicyEpoch(report.eligibilityReceipt,admission.receipt);
 const summary=checkE085Shape(report,bothColors,build.inputHashes,report.eligibilityReceipt);
 return {report,fixtures:plain(bothColors),summary,sourceHashes:build.inputHashes,historicalReceipt:plain(report.eligibilityReceipt),receipt:admission.receipt,policyEpoch,canonical:savedE085};
}
