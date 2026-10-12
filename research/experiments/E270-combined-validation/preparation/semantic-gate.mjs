// Admission for new semantic work; does not import any candidate or chess module.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData, sha256} from '../../../data-policy.mjs';
import {digest, normalized} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const directory = 'research/experiments/E270-combined-validation';
export async function admitTerminalRegression() {
  const {receipt} = await openResearchData(['D001'], {purpose: 'test'});
  const freezeRaw = await readFile(directory + '/evidence/baseline-repaired/freeze.json.gz');
  const freezeSha256 = sha256(freezeRaw);
  assert.equal(freezeSha256, '2a65293d96e648577b7985b6a6480d3da0431a563541503632c317dad5baf61b');
  const freeze = JSON.parse(gunzipSync(freezeRaw));
  const prefix = directory + '/evidence/full-repaired/';
  // Missing terminal file is a pending gate, never permission to start/restart.
  const finalRaw = await readFile(prefix + 'final.json');
  const final = JSON.parse(finalRaw);
  const started = JSON.parse(await readFile(prefix + 'started.json'));
  assert.equal(final.mode, 'full');
  assert.equal(final.revision, freeze.revision);
  assert.equal(final.freezeSha256, freezeSha256);
  assert.deepEqual(final.files, freeze.tests);
  assert.equal(final.files.length, 259);
  for (const field of Object.keys(started)) assert.deepEqual(final[field], started[field], 'Terminal start identity differs: ' + field);
  assert.equal(final.exitCode, 0);
  assert.equal(final.signal, null);
  assert.equal(final.error, null);
  assert.equal(final.hardTimeout, false);
  assert.deepEqual(final.canonicalChanges, []);
  assert.deepEqual(final.sourceChanges, []);
  const tapRaw = await readFile(prefix + 'stdout.tap'), stderrRaw = await readFile(prefix + 'stderr.txt');
  assert.equal(sha256(tapRaw), final.stdoutSha256);
  assert.equal(sha256(stderrRaw), final.stderrSha256);
  const tap = tapRaw.toString('utf8');
  assert.doesNotMatch(tap, /^not ok /m);
  assert.match(tap, /^# fail 0\r?$/m);
  assert.match(tap, /^# cancelled 0\r?$/m);
  assert.match(tap, /^# tests [1-9][0-9]*\r?$/m);
  assert.equal(final.tapSummary, tap.slice(-1800));
  for (const [file, hash] of Object.entries(freeze.sourceHashes))
    assert.equal(digest(normalized(file, await readFile(file))), hash, 'Frozen source changed: ' + file);
  for (const archive of freeze.archives)
    assert.equal(sha256(await readFile(archive.file)), archive.sha256, 'Canonical input changed: ' + archive.file);
  return {receipt, freezeSha256, terminalSha256: sha256(finalRaw), revision: freeze.revision,
    sourceHashes: freeze.sourceHashes, archives: freeze.archives, acceptedCredit: 0};
}
