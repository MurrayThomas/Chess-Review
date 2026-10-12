// Bounded smoke driver. It cannot execute controls before full-regression PASS.
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile, readdir} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {spawn, execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {sha256} from '../../../data-policy.mjs';
import {bindings, digest, normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
import {e072SourceInputs,admitE072Smoke,admitE072Pilot} from './e072-saved-report.mjs';
const directory = 'research/experiments/E270-combined-validation';
const phase=process.argv[2],attempt=process.argv[3],smokeAttempt=process.argv[4]; assert.ok(['pilot','smoke','saved'].includes(phase)); const cap=phase==='pilot'?120:phase==='smoke'?180:600;
assert.match(attempt || '', /^[a-z0-9][a-z0-9-]{0,63}$/, 'Supply a unique attempt slug');
const admission = await admitTerminalRegression();
const smoke=phase==='saved'?await admitE072Smoke(smokeAttempt,admission):phase==='smoke'?await admitE072Pilot(smokeAttempt,admission):null;
const testFile='research/experiments/E270-combined-validation/preparation/e072-replay.test.mjs';
const inputHashes=await e072SourceInputs();
const revision = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8', windowsHide: true}).trim();
const out = directory + '/evidence/semantic-e072-'+phase+'-' + attempt;
const runRoot = path.resolve('research/runs/E270/semantic-e072-'+phase+'-' + attempt);
const preload = pathToFileURL(path.resolve(directory + '/code/output-preload.mjs')).href;
// Direct execution lets node:test emit its TAP in this one process. There is no
// test-runner worker tree left behind if the whole-process cap expires.
const args = ['--test-reporter=tap', '--import', preload, testFile];
const started = {schema: 'E270-E072-semantic-v1',phase,smoke, revision, admission: {
  receipt: admission.receipt, freezeSha256: admission.freezeSha256, terminalSha256: admission.terminalSha256,
  regressionRevision: admission.revision}, inputHashes, command: [process.execPath, ...args],
  startedAt: new Date().toISOString(), hardLimitSeconds: cap, runRoot,
  environment: {node: process.version, platform: process.platform, arch: process.arch},
  acceptedCredit: 0, parentSemanticReplayRequired: true};
await mkdir(out, {recursive: true});
await writeFile(out + '/started.json', JSON.stringify(started, null, 2) + '\n', {flag: 'wx'});
await mkdir(runRoot, {recursive: true});
const stdout = createWriteStream(out + '/stdout.tap', {flags: 'wx'});
const stderr = createWriteStream(out + '/stderr.txt', {flags: 'wx'});
const begin = performance.now();
const child = spawn(process.execPath, args, {cwd: process.cwd(), env: {...process.env, CHESS_COMBINED_OUTPUT: runRoot,CHESS_E072_PHASE:phase,CHESS_E072_SMOKE_ATTEMPT:smokeAttempt,CHESS_E072_PILOT_ATTEMPT:smokeAttempt},
  windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
await writeFile(out + '/process.json', JSON.stringify({pid: child.pid, runnerPid: process.pid, startedAt: started.startedAt}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({pid: child.pid, runnerPid: process.pid, out, capSeconds: cap}));
child.stdout.pipe(stdout); child.stderr.pipe(stderr);
let hardTimeout = false, error = null;
const timer = setTimeout(() => {hardTimeout = true; child.kill();}, cap*1000);
const end = await new Promise(resolve => {
  child.on('error', failure => {error = failure.stack; resolve({code: null, signal: null});});
  child.on('close', (code, signal) => resolve({code, signal}));
});
clearTimeout(timer);
await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
const sourceChanges = [], canonicalChanges = [];
for (const [file, hash] of Object.entries({...admission.sourceHashes, ...inputHashes}))
  if (digest(normalized(file, await readFile(file))) !== hash) sourceChanges.push(file);
for (const archive of admission.archives)
  if (sha256(await readFile(archive.file)) !== archive.sha256) canonicalChanges.push(archive.file);
const tapRaw = await readFile(out + '/stdout.tap'), stderrRaw = await readFile(out + '/stderr.txt'), tap = tapRaw.toString('utf8');
// No test writes are expected. Retain any guard outputs as an explicit anomaly.
const generated = [];
async function inspect(folder) {
  for (const entry of await readdir(folder, {withFileTypes: true})) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else generated.push({file: file.split(path.sep).join('/'), bytes: (await readFile(file)).length, sha256: sha256(await readFile(file))});
  }
}
await inspect(runRoot);
const rowAudits=[...tap.matchAll(/^#(?:\s*#)?\s*E072-row-audit\s+(\{.*\})\s*$/gm)].map(m=>JSON.parse(m[1]));
const admissionAudits=[...tap.matchAll(/^#(?:\s*#)?\s*E072-admission-audit\s+(\{.*\})\s*$/gm)].map(m=>JSON.parse(m[1]));
const admissionAuditValid=phase!=='saved'?admissionAudits.length===0:admissionAudits.length===1&&admissionAudits[0].schema==='E270-E072-saved-admission-v1'&&admissionAudits[0].historicalInputsVerified===222&&admissionAudits[0].semanticSourceCount===62&&admissionAudits[0].inheritedFingerprints.count===3860&&admissionAudits[0].receiptSha256===sha256(JSON.stringify(admission.receipt));
const completedRowCounts={oracleEvaluations:rowAudits.reduce((n,r)=>n+r.oracleEvaluations,0),ownProofReplays:rowAudits.reduce((n,r)=>n+r.ownProofReplays,0),ownEventReplayAttempts:rowAudits.reduce((n,r)=>n+r.ownEventReplayAttempts,0),parentEvaluations:rowAudits.reduce((n,r)=>n+r.parentEvaluations,0),savedReplayAttempts:rowAudits.reduce((n,r)=>n+r.savedReplayAttempts,0),candidateErrorEvaluations:rowAudits.reduce((n,r)=>n+r.candidateErrorEvaluations,0),savedErrorComparisons:rowAudits.reduce((n,r)=>n+r.savedErrorComparisons,0)};
const rowsValid=phase!=='saved'||rowAudits.length===168&&rowAudits.every((r,i)=>r.index===i&&r.passed)&&completedRowCounts.parentEvaluations===164&&completedRowCounts.savedReplayAttempts===164&&completedRowCounts.candidateErrorEvaluations===4&&completedRowCounts.savedErrorComparisons===4&&completedRowCounts.ownEventReplayAttempts===42&&completedRowCounts.oracleEvaluations===160&&completedRowCounts.ownProofReplays===42;
const expected=phase==='pilot'?7:phase==='smoke'?221:190;
const countsValid=['tests','pass'].every(k=>new RegExp('^# '+k+' '+expected+'\\r?$','m').test(tap));
const passed = admissionAuditValid && rowsValid && countsValid && end.code === 0 && end.signal === null && !error && !hardTimeout && !sourceChanges.length && !canonicalChanges.length && !generated.length &&
  !/^not ok /m.test(tap) && /^# fail 0\r?$/m.test(tap) && /^# cancelled 0\r?$/m.test(tap) && /^# tests [1-9][0-9]*\r?$/m.test(tap);
const final = {...started, pid: child.pid, exitCode: end.code, signal: end.signal, error, hardTimeout,
  seconds: (performance.now() - begin) / 1000, sourceChanges, canonicalChanges, generated,
  stdoutSha256: sha256(tapRaw), stderrSha256: sha256(stderrRaw), tapSummary: tap.slice(-1800),
  stagePassed: passed,admissionAudits,rowAudits,completedRowCounts,unreportedRunningRowPossible:hardTimeout||Boolean(error),savedEvidenceReplays:phase!=='saved'?0:completedRowCounts.savedReplayAttempts, semanticAcceptance: false};
await writeFile(out + '/final.json', JSON.stringify(final, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed, exitCode: end.code, hardTimeout, error, sourceChanges, canonicalChanges, generated,
  seconds: final.seconds, tapSummary: final.tapSummary}));
if (!passed) process.exitCode = 1;
