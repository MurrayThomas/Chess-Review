import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {lintInputs, lintFilter} from '../scripts/lint.mjs';
import {extensionEntries, directories, files, pieceSets} from '../scripts/package-inputs.mjs';

test('lint uses the packaging inputs and excludes development and retired piece sets', () => {
  for (const name of files) assert.ok(extensionEntries.includes(name));
  for (const name of directories.filter(name => name !== 'pieces-img')) assert.ok(extensionEntries.includes(name));
  assert.ok(extensionEntries.includes('manifest.json'));
  assert.deepEqual(extensionEntries.filter(name => name.startsWith('pieces-img/')), pieceSets.map(name => 'pieces-img/' + name));
  for (const name of ['research', 'marketing', 'tools', 'tests', 'scripts', 'scratch', 'node_modules', 'pieces-img'])
    assert.ok(!extensionEntries.includes(name));
});

test('large shipped JSON is validated before skipping the web-ext parser; large scripts remain scanned', async context => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'chess-review-lint-'));
  context.after(() => rm(root, {recursive: true, force: true}));
  await mkdir(path.join(root, 'data/learning'), {recursive: true});
  const json = 'data/learning/puzzles.json';
  await writeFile(path.join(root, json), JSON.stringify({payload: 'x'.repeat(5 * 1024 * 1024)}));
  await writeFile(path.join(root, 'data/learning/small.json'), '{}');
  await writeFile(path.join(root, 'analysis.js'), ' '.repeat(5 * 1024 * 1024));
  const entries = ['data', 'analysis.js'];
  const inputs = await lintInputs(root, entries);
  const filter = lintFilter(root, inputs);
  assert.equal(filter.wantFile(root), true);
  assert.equal(filter.wantFile('.'), true);
  assert.equal(inputs.jsonFiles, 2);
  assert.deepEqual([...inputs.oversizedJson], [json]);
  assert.equal(filter.wantFile('data'), true);
  assert.equal(filter.wantFile('data/learning'), true);
  assert.equal(filter.wantFile(json), false);
  assert.equal(filter.wantFile('data/learning/small.json'), true);
  assert.equal(filter.wantFile(path.join(root, 'analysis.js')), true);
  assert.equal(filter.wantFile('research/experiments/E270/evidence/invalid.json'), false);
  assert.equal(filter.wantFile('../analysis.js'), false);
  await writeFile(path.join(root, json), 'x'.repeat(5 * 1024 * 1024));
  await assert.rejects(lintInputs(root, entries), /Invalid JSON in data\/learning\/puzzles.json/);
  await writeFile(path.join(root, json), '{}');
  await writeFile(path.join(root, 'data/learning/small.json'), '{');
  await assert.rejects(lintInputs(root, entries), /Invalid JSON in data\/learning\/small.json/);
});
