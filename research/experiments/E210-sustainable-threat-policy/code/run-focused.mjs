import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {spawnSync,execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixture,dir} from './fixtures.mjs';
import {inspectPerpetualAttack} from './policy.mjs';
const data=await openResearchData(['D001'],{purpose:'test'}),pilot=JSON.parse(await readFile(dir+'/evidence/revised-admission-pilot.json'));assert.equal(pilot.proceed,true);
try{await readFile(dir+'/evidence/policies.json.gz');throw Error('Preserve existing policies; no repeated collection');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),sourceHashes=await bindings([dir+'/code/policy.mjs',dir+'/code/fixtures.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']),rows=[],start=performance.now();
for(const black of [false,true])for(const [priorCycles,clock]of [[0,0],[1,0],[0,99]]){const f=fixture(black,priorCycles,clock);rows.push({id:f.id,black,priorCycles,clock,fixture:f,result:inspectPerpetualAttack(f.input,f.options,f.certificate)});await writeFile(dir+'/evidence/policies.json.gz',gzipSync(JSON.stringify({preregisteredRevision:revision,datasetReceipt:data.receipt,sourceHashes,rows,freshStrategySearches:0})+'\n'));}
const collectionSeconds=(performance.now()-start)/1000,inputHashes=await bindings([dir+'/code/run-focused.mjs',dir+'/code/policy.test.mjs']),begin=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/policy.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-begin)/1000;
await writeFile(dir+'/evidence/focused-'+(run.status===0?'checks':'failure')+'.json',JSON.stringify({command:'node --test '+dir+'/code/policy.test.mjs',preregisteredRevision:revision,datasetReceipt:data.receipt,inputHashes,collectionSeconds,policies:rows.length,seconds,exitCode:run.status,node:process.version,freshStrategySearches:0,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
if(run.status!==0){const source={};for(const file of ['rules.mjs','policy.mjs','fixtures.mjs','check-result.mjs','policy.test.mjs','run-focused.mjs'])source[file]=await readFile(dir+'/code/'+file,'utf8');await writeFile(dir+'/evidence/focused-failure-sources.json.gz',gzipSync(JSON.stringify(source)+'\n'));}
console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({policies:rows.length,collectionSeconds,seconds,freshStrategySearches:0}));
