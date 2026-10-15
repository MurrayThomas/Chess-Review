import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {captureSourceHashes} from '../../../replay-hashes.mjs';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {prefix,PARENTS,SPEC,select,mergeCaches} from './protocol.mjs';
import {assess} from './method.mjs';
import {independentAudit} from './audit.mjs';
const [mode,...args]=process.argv.slice(2);if(!['freeze','evaluate','verify'].includes(mode)||args.length!==2||args[0]!=='--out')throw Error('Use freeze|evaluate|verify --out research/runs/E274/unique-run');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);if(!out.startsWith(path.join(root,'research','runs','E274')+path.sep))throw Error('Unsafe output');
const started=performance.now(),access=await openResearchData(['D001','D002'],{purpose:'reuse'}),dataset=await access.readJson(PARENTS[0]),cache=await access.readJson(PARENTS[1]),historical=await access.readJson(PARENTS[2]);
const config=await engineConfig(path.join(root,'engine/stockfish-19-lite-single.js'),{kind:'nodes',value:SPEC.nodes}),extra=await access.readJson(PARENTS[3]),cached=mergeCaches(cache,extra,config);
const selection=select(dataset,config,new Set(cached.keys())),deps=await captureSourceHashes(root,prefix+'code',['protocol.mjs','collect.mjs','method.mjs','run.mjs','audit.mjs'],['tools/calibration/engine-host.cjs']);
const receipt={schema:'research-run-v1',experiment:'E274',date:'2026-10-15',mode,sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim(),
  command:'node '+prefix+'code/run.mjs '+[mode,...args].join(' '),...deps,dataEligibility:access.receipt,environment:{node:process.version,platform:process.platform,arch:process.arch},
  selectionHash:sha256(JSON.stringify(selection)),seed:SPEC.gameSeed,modelFits:0,humanLabels:0};
await mkdir(out,{recursive:true});
async function write(name,value,gz=false){const b=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(b):b;await writeFile(path.join(out,name),bytes,{flag:'wx'});return sha256(bytes);}
if(mode==='freeze'){
  const outputs={'selection-v2.json.gz':await write('selection-v2.json.gz',selection,true)};
  await write('freeze-v2-run.json',{...receipt,engineSearches:0,outputs,elapsedMs:performance.now()-started});
  console.log(JSON.stringify({frozen:true,games:2,vectors:selection.positions.length,uniqueQueries:selection.queries.length,newQueries:selection.newQueries,reusedQueries:selection.reusedQueries,engineSearches:0}));
}else{
  assert.deepEqual(selection,await access.readJson(prefix+'evidence/selection-v2.json.gz'));
  const frozen=await access.readJson(prefix+'evidence/freeze-v2-run.json'),collected=await access.readJson(prefix+'evidence/collection-run.json');
  for(const record of [frozen,collected])for(const k of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(record[k],deps[k]);
  const raw=await access.readJson(prefix+'evidence/observations.json.gz');assert.equal(raw.selectionHash,receipt.selectionHash);
  const calcStart=performance.now(),result=assess(selection,raw,cached,historical);
  if(performance.now()-calcStart>120000)throw Error('Offline calculation limit exceeded');
  if(mode==='evaluate'){
    const outputs={'results.json':await write('results.json',result)};await write('run.json',{...receipt,outputs,engineSearches:0,elapsedMs:performance.now()-started});
    const {vectors,...brief}=result;console.log(JSON.stringify(brief));
  }else{
    const saved=await access.readJson(prefix+'evidence/results.json'),main=await access.readJson(prefix+'evidence/run.json');assert.deepEqual(saved,result);
    const repeat=await readFile(path.join(root,'research/runs/E274/repeat/results.json'));assert.equal(sha256(repeat),main.outputs['results.json']);
    const independent=independentAudit(dataset,selection,raw,cached,saved);
    await write('verification.json',{...receipt,passed:true,exactReport:true,exactOfflineRepeat:true,exactSelectionReconstruction:true,independent,engineSearches:0,
      cleanCheckoutReplay:false,scientificConfirmation:false,elapsedMs:performance.now()-started});console.log(JSON.stringify({passed:true,exactReport:true,independent}));
  }
}
