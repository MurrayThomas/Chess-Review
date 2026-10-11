import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {saved} from './saved.mjs';
import {fixtures} from './fixtures.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E198-functional-multiple-fronts',a=await saved(),inputHashes=await bindings([dir+'/code/fronts.test.mjs',dir+'/code/run-focused.mjs']),revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),start=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/fronts.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await mkdir(dir+'/evidence',{recursive:true});await writeFile(dir+'/evidence/focused-checks.json',JSON.stringify({command:'node --test '+dir+'/code/fronts.test.mjs',preregisteredRevision:revision,exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,inputHashes,archives:a.hashes,refs:fixtures.map(f=>({id:f.id,expected:f.expected,burden:f.burden,...a.find(f.input).ref})),freshContexts:0,freshNodes:0,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,sourceBindings:Object.keys(inputHashes).length}));
