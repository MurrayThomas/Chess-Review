import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, stat, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {installRetainedOutputCheck} from '../scripts/research-test-outputs.mjs';

test('exclusive retained outputs are compared unchanged; differences and missing evidence fail', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'chess-review-retained-output-'));
  const evidence = path.join(root, 'research/experiments/fixture/evidence');
  const file = path.join(evidence, 'examples.json');
  await mkdir(evidence, {recursive: true});
  await writeFile(file, 'évidence\n');
  const observed = path.join(root, 'research/experiments/E211-rook-tablebase-admission/evidence/observed-process-panel.json');
  await mkdir(path.dirname(observed), {recursive: true});
  await writeFile(observed, 'recorded process output\n');
  const git = args => execFileSync('git', args, {cwd: root, windowsHide: true});
  git(['init', '-q']); git(['add', '.']);
  const before = await stat(file);
  const observedBefore = await stat(observed);
  const restore = installRetainedOutputCheck(root);
  t.after(async () => {
    restore();
    assert.ok(root.startsWith(path.resolve(os.tmpdir()) + path.sep));
    await rm(root, {recursive: true, force: true});
  });
  await writeFile(file, 'évidence\n', {flag: 'wx'});
  assert.equal((await stat(file)).mtimeMs, before.mtimeMs);
  await assert.rejects(writeFile(file, 'changed', {flag: 'wx'}), /differs from retained evidence/);
  assert.equal(await readFile(file, 'utf8'), 'évidence\n');
  // Fresh E211 process replay must also match its retained output on normal writes.
  await writeFile(observed, 'recorded process output\n');
  assert.equal((await stat(observed)).mtimeMs, observedBefore.mtimeMs);
  await assert.rejects(writeFile(observed, 'changed'), /differs from retained evidence/);
  assert.equal(await readFile(observed, 'utf8'), 'recorded process output\n');
  // New output still obeys ordinary exclusive-create semantics.
  const fresh = path.join(evidence, 'new.json');
  await writeFile(fresh, 'new', {flag: 'wx'});
  await assert.rejects(writeFile(fresh, 'new', {flag: 'wx'}), {code: 'EEXIST'});
  await rm(file);
  await assert.rejects(writeFile(file, 'évidence\n', {flag: 'wx'}), {code: 'ENOENT'});
});
