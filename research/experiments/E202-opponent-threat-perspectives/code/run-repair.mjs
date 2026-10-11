import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved,dir} from './saved.mjs';
const a=await saved(),inputHashes=await bindings([dir+'/code/opponent.test.mjs',dir+'/code/run-repair.mjs']),revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),args=['--test','--test-name-pattern=recorded-current|genuine history',dir+'/code/opponent.test.mjs'],start=performance.now();
const run=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/repair-checks.json',JSON.stringify({command:'node --test --test-name-pattern="recorded-current|genuine history" '+dir+'/code/opponent.test.mjs',preregisteredRevision:revision,exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,inputHashes,archives:a.hashes,refs:a.rows.map(q=>({id:q.id,mode:q.mode,...q.ref})),freshQueries:0,freshPanels:0,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,selectedChecks:5,totalPerspectives:a.rows.length}));
