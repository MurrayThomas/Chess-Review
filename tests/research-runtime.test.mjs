import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {authenticateArchive} from '../research/experiments/E211-rook-tablebase-admission/code/saved.mjs';

test('CI Python identity matches the authenticated historical research runtime', async () => {
  const root = new URL('../', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('tools/research-python/runtime.json', root), 'utf8'));
  const launcher = await readFile(new URL('tools/research-python/python.exe', root));
  // Inspect only authenticated runtime metadata, without reusing any observations.
  const archive = authenticateArchive(await readFile(new URL(
    'research/experiments/E211-rook-tablebase-admission/evidence/panels.json.gz', root)));
  assert.equal(createHash('sha256').update(launcher).digest('hex'), archive.probeSource.executableSha256);
  assert.equal(manifest.executableSha256, archive.probeSource.executableSha256);
  for (const row of archive.rows) assert.equal(manifest.version, row.bundle.panel.metadata.python.version);
});
