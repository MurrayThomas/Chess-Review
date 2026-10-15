// Export only hash-bound pure scoring sources, without games, node_modules or Git.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--out')throw Error('Use --out research/runs/E272/unique-export');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]),source=path.join(out,'source');
if(!out.startsWith(path.join(root,'research','runs','E272')+path.sep))throw Error('Output outside E272 runs');
const hash=b=>createHash('sha256').update(b).digest('hex');
const run=JSON.parse(await readFile(path.join(root,'research/runs/E272/main/run.json')));
const saved=await readFile(path.join(root,'research/runs/E272/main/results.json'));
assert.equal(hash(saved),run.outputSha256);
await mkdir(out,{recursive:true});await mkdir(source); // Existing export is refused.
const dependencies=['research/experiments/E272-accuracy-aggregation-stress/code/stress.mjs','lib/public-scoring.js'];
const sourceHashes={};
for(const f of dependencies){const bytes=await readFile(path.join(root,f));assert.equal(hash(bytes),run.codeSha256[f]);
  const dest=path.join(source,f);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes,{flag:'wx'});sourceHashes[f]=hash(bytes);}
const packageBytes=Buffer.from('{"type":"module"}\n');await writeFile(path.join(source,'package.json'),packageBytes,{flag:'wx'});
sourceHashes['package.json']=hash(packageBytes);
const script='const {experiment}=await import("./research/experiments/E272-accuracy-aggregation-stress/code/stress.mjs"); process.stdout.write(JSON.stringify(experiment(),null,2)+"\\n");';
const actual=execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:source,windowsHide:true});
assert.deepEqual(actual,saved);await writeFile(path.join(out,'results.json'),actual,{flag:'wx'});
const receipt={schema:'E272-portable-verification-v1',passed:true,exactResultBytes:true,
  sourceRevision:run.sourceRevision,sourceHashes,outputSha256:hash(actual),
  command:'node research/experiments/E272-accuracy-aggregation-stress/code/portable.mjs '+args.join(' '),
  environment:{node:process.version,platform:process.platform,arch:process.arch},
  scope:'Initially empty export containing two frozen modules and package metadata; no Git, games, engine, fitted model or dependencies required. Not a clean repository checkout or scientific confirmation.'};
await writeFile(path.join(out,'verification.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(receipt));
