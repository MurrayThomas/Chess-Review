import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';

// Frozen tests sometimes create their retained examples with exclusive writes.
// In CI an existing tracked example is a golden result: compare it, never replace it.
export function installRetainedOutputCheck(root = fileURLToPath(new URL('../', import.meta.url))) {
  const tracked = new Set(execFileSync('git', ['ls-files', '-z', '--', 'research/experiments'], {
    cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024,
  }).split('\0').filter(name => /^research\/experiments\/[^/]+\/evidence\//.test(name)));
  const original = fs.writeFile;
  fs.writeFile = async (file, data, options) => {
    if (typeof file === 'string' || file instanceof URL || Buffer.isBuffer(file)) {
      const filename = file instanceof URL ? fileURLToPath(file) : file.toString();
      const name = path.relative(root, path.resolve(filename)).split(path.sep).join('/');
      const observedReplay = name === 'research/experiments/E211-rook-tablebase-admission/evidence/observed-process-panel.json';
      if (tracked.has(name) && (options?.flag === 'wx' || observedReplay)) {
        const expected = await fs.readFile(file);
        const encoding = typeof options === 'string' ? options : options?.encoding || 'utf8';
        const actual = typeof data === 'string' ? Buffer.from(data, encoding) : Buffer.from(data);
        if (!actual.equals(expected)) throw Error('Research test output differs from retained evidence: ' + name);
        return;
      }
    }
    return original(file, data, options);
  };
  syncBuiltinESMExports();
  return () => { fs.writeFile = original; syncBuiltinESMExports(); };
}

if (process.env.CHESS_REVIEW_VERIFY_TEST_OUTPUTS === '1') installRetainedOutputCheck();
