import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import path from 'node:path';
import {extensionEntries} from '../scripts/package-inputs.mjs';

test('extension module graph cannot load the retired live concept prototype', async () => {
  const seen = new Set();
  async function visit(file) {
    file = path.posix.normalize(file);
    if (seen.has(file)) return;
    seen.add(file);
    assert.doesNotMatch(file, /(?:^research\/|\/concepts\/|coach-insights|fast-coach)/);
    const source = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g)) {
      if (!/\.(?:js|mjs)$/.test(match[1])) continue;
      await visit(path.posix.join(path.posix.dirname(file), match[1]));
    }
  }
  for (const entry of ['analysis.js', 'popup.js', 'background.js']) await visit(entry);
  assert.ok(seen.has('lib/learning/validation.js'));
  assert.ok(extensionEntries.every(entry => !entry.startsWith('research')));
  await assert.rejects(access(new URL('../lib/concepts/', import.meta.url)));
});
