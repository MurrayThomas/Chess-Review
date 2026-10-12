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
const directory = 'research/experiments/E270-combined-validation';
const attempt = process.argv[2];
assert.match(attempt || '', /^[a-z0-9][a-z0-9-]{0,63}$/, 'Supply a unique attempt slug');
const admission = await admitTerminalRegression();
const self = directory + '/preparation/run-e083-controls.mjs';
const testFile = directory + '/preparation/e083-controls.test.mjs';
const inputHashes = await bindings([self, testFile, directory + '/AMENDMENT-semantic-replay-preparation.md', directory + '/AMENDMENT-e083-guarded-session.md',
  'research/experiments/E083-contact-exchange-changes/plan.md', 'package.json', 'package-lock.json']);
const revision = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8', windowsHide: true}).trim();
const out = directory + '/evidence/semantic-e083-controls-' + attempt;
const runRoot = path.resolve('research/runs/E270/semantic-e083-controls-' + attempt);
const preload = pathToFileURL(path.resolve(directory + '/code/output-preload.mjs')).href;
// Direct execution lets node:test emit its TAP in this one process. There is no
// test-runner worker tree left behind if the whole-process cap expires.
const args = ['--import', preload, testFile];
const started = {schema: 'E270-semantic-e083-controls-v1', revision, admission: {
  receipt: admission.receipt, freezeSha256: admission.freezeSha256, terminalSha256: admission.terminalSha256,
  regressionRevision: admission.revision}, inputHashes, command: [process.execPath, ...args],
  startedAt: new Date().toISOString(), hardLimitSeconds: 120, runRoot,
  environment: {node: process.version, platform: process.platform, arch: process.arch},
  acceptedCredit: 0, parentSemanticReplayRequired: true};
await mkdir(out, {recursive: true});
await writeFile(out + '/started.json', JSON.stringify(started, null, 2) + '\n', {flag: 'wx'});
await mkdir(runRoot, {recursive: true});
const stdout = createWriteStream(out + '/stdout.tap', {flags: 'wx'});
const stderr = createWriteStream(out + '/stderr.txt', {flags: 'wx'});
const begin = performance.now();
const child = spawn(process.execPath, args, {cwd: process.cwd(), env: {...process.env, CHESS_COMBINED_OUTPUT: runRoot},
  windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
await writeFile(out + '/process.json', JSON.stringify({pid: child.pid, runnerPid: process.pid, startedAt: started.startedAt}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({pid: child.pid, runnerPid: process.pid, out, capSeconds: 120}));
child.stdout.pipe(stdout); child.stderr.pipe(stderr);
let hardTimeout = false, error = null;
const timer = setTimeout(() => {hardTimeout = true; child.kill();}, 120000);
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
const passed = end.code === 0 && end.signal === null && !error && !hardTimeout && !sourceChanges.length && !canonicalChanges.length && !generated.length &&
  !/^not ok /m.test(tap) && /^# fail 0\r?$/m.test(tap) && /^# cancelled 0\r?$/m.test(tap) && /^# tests [1-9][0-9]*\r?$/m.test(tap);
const final = {...started, pid: child.pid, exitCode: end.code, signal: end.signal, error, hardTimeout,
  seconds: (performance.now() - begin) / 1000, sourceChanges, canonicalChanges, generated,
  stdoutSha256: sha256(tapRaw), stderrSha256: sha256(stderrRaw), tapSummary: tap.slice(-1800),
  controlStagePassed: passed, savedEvidenceReplays: 0, semanticAcceptance: false};
await writeFile(out + '/final.json', JSON.stringify(final, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed, exitCode: end.code, hardTimeout, error, sourceChanges, canonicalChanges, generated,
  seconds: final.seconds, tapSummary: final.tapSummary}));
if (!passed) process.exitCode = 1;
