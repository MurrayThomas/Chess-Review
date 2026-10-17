import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extensionEntries} from './package-inputs.mjs';

export async function lintInputs(root, entries = extensionEntries) {
  const files = new Set();
  const oversizedJson = new Set();
  let jsonFiles = 0;
  async function visit(name) {
    const target = path.join(root, name);
    const info = await stat(target);
    files.add(name);
    if (info.isDirectory()) {
      for (const entry of await readdir(target)) await visit(name + '/' + entry);
    } else if (name.endsWith('.json')) {
      try { JSON.parse(await readFile(target, 'utf8')); }
      catch (error) { throw Error('Invalid JSON in ' + name + ': ' + error.message, {cause: error}); }
      jsonFiles++;
      if (info.size >= 5 * 1024 * 1024) oversizedJson.add(name);
    }
  }
  for (const entry of entries) {
    await visit(entry);
    let parent = path.posix.dirname(entry);
    while (parent !== '.') { files.add(parent); parent = path.posix.dirname(parent); }
  }
  return {files, oversizedJson, jsonFiles};
}

export function lintFilter(root, inputs) {
  return {wantFile(name) {
    const relative = (path.isAbsolute(name) ? path.relative(root, name) : name).split(path.sep).join('/');
    return relative === '' || relative === '.' || inputs.files.has(relative) && !inputs.oversizedJson.has(relative);
  }};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const inputs = await lintInputs(root);
  console.log(`Validated ${inputs.jsonFiles} shipped JSON files with JSON.parse.`);
  for (const name of inputs.oversizedJson) console.log(`${name}: validated directly; exceeds web-ext's 5 MiB parser limit.`);
  const {cmd} = await import('web-ext');
  await cmd.lint({sourceDir: root, artifactsDir: path.join(root, 'web-ext-artifacts'), output: 'text', boring: true},
    {createFileFilter: () => lintFilter(root, inputs)});
}
