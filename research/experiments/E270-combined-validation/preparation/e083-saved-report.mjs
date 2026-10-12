// Fixed historical ownership; shape helpers alone NEVER admit caller bytes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitTerminalRegression} from './semantic-gate.mjs';
const directory = 'research/experiments/E270-combined-validation';
export const savedE083 = Object.freeze({file: 'research/experiments/E083-contact-exchange-changes/evidence/results.json',
  bytes: 154796, sha256: '4c707a81419070c274c3fae99d2c330da1b4fe645f27d323ccd044cbb0d2fe83'});
const plain = value => JSON.parse(JSON.stringify(value));
function immutable(value) {
  if (value && typeof value === 'object') {for (const child of Object.values(value)) immutable(child); Object.freeze(value);}
  return value;
}

export async function admitE083Controls(attempt, regression) {
  assert.match(attempt || '', /^[a-z0-9][a-z0-9-]{0,63}$/);
  const prefix = directory + '/evidence/semantic-e083-controls-' + attempt + '/';
  const raw = await readFile(prefix + 'final.json'), result = JSON.parse(raw);
  const started = JSON.parse(await readFile(prefix + 'started.json'));
  assert.equal(result.schema, 'E270-semantic-e083-controls-v1');
  for (const key of Object.keys(started)) assert.deepEqual(result[key], started[key], 'Control start identity: ' + key);
  assert.equal(result.admission.freezeSha256, regression.freezeSha256);
  assert.equal(result.admission.terminalSha256, regression.terminalSha256);
  assert.deepEqual(result.admission.receipt, regression.receipt);
  assert.equal(result.exitCode, 0); assert.equal(result.signal, null); assert.equal(result.error, null);
  assert.equal(result.hardTimeout, false); assert.equal(result.hardLimitSeconds, 120);
  assert.equal(result.controlStagePassed, true);
  for (const key of ['sourceChanges', 'canonicalChanges', 'generated']) assert.deepEqual(result[key], []);
  const testFile = directory + '/preparation/e083-controls.test.mjs';
  const expected = await bindings([directory + '/preparation/run-e083-controls.mjs', testFile,
    directory + '/AMENDMENT-semantic-replay-preparation.md', directory + '/AMENDMENT-e083-guarded-session.md',
    'research/experiments/E083-contact-exchange-changes/PLAN.md', 'package.json', 'package-lock.json']);
  assert.deepEqual(result.inputHashes, expected, 'Control-stage source identity differs');
  assert.deepEqual(result.command, [process.execPath, '--import', pathToFileURL(path.resolve(directory + '/code/output-preload.mjs')).href, testFile]);
  const tapRaw = await readFile(prefix + 'stdout.tap'), stderrRaw = await readFile(prefix + 'stderr.txt');
  assert.equal(sha256(tapRaw), result.stdoutSha256); assert.equal(sha256(stderrRaw), result.stderrSha256);
  const tap = tapRaw.toString('utf8');
  assert.equal(result.tapSummary, tap.slice(-1800));
  assert.doesNotMatch(tap, /^not ok /m);
  for (const [name, count] of [['tests', 65], ['pass', 65], ['fail', 0], ['cancelled', 0], ['skipped', 0], ['todo', 0]])
    assert.match(tap, new RegExp('^# ' + name + ' ' + count + '\\r?$', 'm'));
  return immutable({file: prefix + 'final.json', sha256: sha256(raw), revision: result.revision, inputHashes: expected});
}

/** Neutral decoded-shape checker for diagnostic mutations. Does not admit bytes. */
export function checkE083ReportShape(report, expectedFixtures, sourceHashes, receipt) {
  assert.deepEqual(Object.keys(report).sort(), ['schema', 'source', 'revision', 'inputHashes', 'workingTreeStatus', 'eligibilityReceipt', 'rows'].sort());
  assert.equal(report.schema, 'E083-focused-pilot-v1');
  assert.equal(report.source, 'authored synthetic only');
  assert.match(report.revision, /^[0-9a-f]{40}$/);
  assert.equal(typeof report.workingTreeStatus, 'string');
  assert.deepEqual(report.inputHashes, sourceHashes, 'Saved source bindings differ');
  assert.equal(Object.keys(report.inputHashes).length, 83);
  assert.deepEqual(report.eligibilityReceipt, receipt, 'Historical versus current receipt differs');
  assert.equal(report.rows.length, 33); assert.equal(expectedFixtures.length, 33);
  let errors = 0, witnesses = 0;
  for (const [index, row] of report.rows.entries()) {
    const fixture = plain(expectedFixtures[index]);
    assert.deepEqual(row.fixture, fixture, 'Complete fixture/order differs at row ' + index);
    if (fixture.inputError) {
      errors++;
      assert.deepEqual(Object.keys(row).sort(), ['error', 'fixture']);
      assert.equal(typeof row.error, 'string'); assert.ok(row.error.includes(fixture.inputError));
    } else {
      assert.deepEqual(Object.keys(row).sort(), ['fixture', 'result']);
      assert.ok(row.result && typeof row.result === 'object');
      if (row.result.changeAnalysis?.witness) witnesses++;
    }
  }
  assert.equal(errors, 4); assert.equal(witnesses, 21);
  return {rows: 33, errors, successful: 29, witnesses};
}

export function checkE083ReportBytes(bytes) {
  assert.equal(bytes.length, savedE083.bytes, 'Saved raw byte count differs');
  assert.equal(sha256(bytes), savedE083.sha256, 'Saved raw SHA differs');
  return true;
}

export async function openFixedE083Report(controlAttempt) {
  const regression = await admitTerminalRegression();
  const controls = await admitE083Controls(controlAttempt, regression);
  const archive = regression.archives.find(item => item.file === savedE083.file);
  assert.deepEqual(archive, savedE083, 'Wrong frozen canonical E083 membership');
  const raw = await readFile(savedE083.file);
  checkE083ReportBytes(raw); // BEFORE any parse or candidate/fixture import.
  const report = JSON.parse(raw);
  const build = JSON.parse(await readFile('research/experiments/E083-contact-exchange-changes/build.json'));
  assert.equal(build.experiment, 'E083');
  for (const [file, hash] of Object.entries(build.inputHashes)) assert.equal(hash, regression.sourceHashes[file], file);
  const {bothColors} = await import('../../E083-contact-exchange-changes/code/fixtures.mjs');
  const summary = checkE083ReportShape(report, bothColors, build.inputHashes, regression.receipt);
  return immutable({report, summary, receipt: regression.receipt, canonical: savedE083, controls,
    sourceHashes: build.inputHashes, fixtures: plain(bothColors),
    regression: {freezeSha256: regression.freezeSha256, terminalSha256: regression.terminalSha256},
    acceptedCredit: 0, parentSemanticReplayRequired: true});
}
