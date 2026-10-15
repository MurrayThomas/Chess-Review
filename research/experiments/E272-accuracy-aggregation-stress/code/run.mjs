import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {experiment} from './stress.mjs';
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--out')throw Error('Use --out research/runs/E272/unique-run');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);
if(!out.startsWith(path.join(root,'research','runs','E272')+path.sep))throw Error('Output outside E272 runs');
const hash=b=>createHash('sha256').update(b).digest('hex'),started=performance.now();
const files=['research/experiments/E272-accuracy-aggregation-stress/code/run.mjs','research/experiments/E272-accuracy-aggregation-stress/code/stress.mjs','lib/public-scoring.js'];
const codeSha256=Object.fromEntries(await Promise.all(files.map(async f=>[f,hash(await readFile(path.join(root,f)))])));
const result=experiment(),bytes=JSON.stringify(result,null,2)+'\n';
const run={schema:'research-run-v1',experiment:'E272',date:'2026-10-15',sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim(),
  codeSha256,command:'node research/experiments/E272-accuracy-aggregation-stress/code/run.mjs '+args.join(' '),seed:null,
  dataEligibility:{datasets:[],scope:'Wholly authored synthetic fixture; no game-derived inputs or fitted parameters'},
  environment:{node:process.version,platform:process.platform,arch:process.arch},evaluationRole:result.role,outputSha256:hash(bytes),elapsedMs:performance.now()-started};
await mkdir(out,{recursive:true});await writeFile(path.join(out,'results.json'),bytes,{flag:'wx'});await writeFile(path.join(out,'run.json'),JSON.stringify(run,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(Object.fromEntries(Object.entries(result.methods).map(([k,v])=>[k,{base:v.base,gates:v.gates,narrowErrorScore:v.narrowErrorScore,worstReplication:v.worstReplication}]))));
