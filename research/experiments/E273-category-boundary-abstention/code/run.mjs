import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {captureSourceHashes} from '../../../replay-hashes.mjs';
import {prefix,loadParents,loadFrozen} from './inputs.mjs';
import {evaluate,SPEC} from './method.mjs';
import {audit} from './audit.mjs';
const [mode,...args]=process.argv.slice(2);
if(!['freeze','evaluate','verify'].includes(mode)||args.length!==2||args[0]!=='--out')throw Error('Use freeze|evaluate|verify --out research/runs/E273/unique-run');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);
if(!out.startsWith(path.join(root,'research','runs','E273')+path.sep))throw Error('Output outside E273 runs');
const started=performance.now(),access=await openResearchData(['D001','D002'],{purpose:mode==='evaluate'?'validate':'reuse'});
const deps=await captureSourceHashes(root,prefix+'code',['run.mjs','inputs.mjs','method.mjs','audit.mjs']);
const receipt={schema:'research-run-v1',experiment:'E273',date:'2026-10-15',mode,
  sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim(),
  command:'node '+prefix+'code/run.mjs '+[mode,...args].join(' '),dataEligibility:access.receipt,...deps,seed:SPEC.seed,
  environment:{node:process.version,platform:process.platform,arch:process.arch},engineSearches:0,modelFits:0,humanLabels:0};
await mkdir(out,{recursive:true});
async function write(name,value,compressed=false){const plain=Buffer.from(JSON.stringify(value,null,compressed?0:2)+'\n'),bytes=compressed?gzipSync(plain):plain;
  await writeFile(path.join(out,name),bytes,{flag:'wx'});return sha256(bytes);}
if(mode==='freeze'){
  const input=await loadParents(access,root),outputs={};outputs['inputs.json.gz']=await write('inputs.json.gz',input.rows,true);outputs['freeze.json']=await write('freeze.json',input.freeze);
  await write('freeze-run.json',{...receipt,bandEvaluations:0,elapsedMs:performance.now()-started,outputs});
  console.log(JSON.stringify({frozen:true,rows:input.rows.length,bandEvaluations:0,outputs}));
}else{
  const input=await loadFrozen(access),freezeRun=await access.readJson(prefix+'evidence/freeze-run.json');
  for(const key of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(freezeRun[key],deps[key]);
  const calcStart=performance.now(),replay=evaluate(input.rows);if(performance.now()-calcStart>120000)throw Error('Calculation budget exceeded');
  if(mode==='evaluate'){
    const outputs={};outputs['results.json']=await write('results.json',replay.result);outputs['decisions.json.gz']=await write('decisions.json.gz',replay.records,true);
    await write('run.json',{...receipt,evaluationRole:replay.result.role,configurations:input.freeze.configurations,elapsedMs:performance.now()-started,outputs});
    console.log(JSON.stringify({passed:replay.result.passed,summary:replay.result.summary,interval:replay.result.interval,gates:replay.result.gates,diagnostics:replay.result.diagnostics}));
  }else{
    const saved=await access.readJson(prefix+'evidence/results.json'),records=await access.readJson(prefix+'evidence/decisions.json.gz'),mainRun=await access.readJson(prefix+'evidence/run.json');
    assert.deepEqual(replay.result,saved);assert.deepEqual(replay.records,records);
    for(const key of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(mainRun[key],deps[key]);
    const reconstructed=await loadParents(access,root);assert.deepEqual(input.rows,reconstructed.rows);assert.deepEqual(input.freeze,reconstructed.freeze);
    const independent=audit(input.rows,saved,records);
    const repeated=await readFile(path.join(root,'research/runs/E273/repeat/results.json'));
    assert.equal(sha256(repeated),mainRun.outputs['results.json']);
    await write('verification.json',{...receipt,passed:true,exactReport:true,exactDecisions:true,exactRawInputReconstruction:true,exactRepeatedReportBytes:true,
      independent,cleanCheckoutReplay:false,scientificConfirmation:false,elapsedMs:performance.now()-started});
    console.log(JSON.stringify({passed:true,exactReport:true,exactDecisions:true,exactRawInputReconstruction:true,independent}));
  }
}
