import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from './context.mjs';
import {dir} from './exports.mjs';
const ctx=await context(),previous=JSON.parse(await readFile(dir+'/evidence/focused-checks.json','utf8'));assert.deepEqual(previous.inputHashes,await bindings(Object.keys(previous.inputHashes)));const inputHashes=await bindings([dir+'/code/run-execution.mjs',dir+'/code/execution.test.mjs']),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/execution.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/execution-'+(r.status===0?'checks':'failure')+'.json',JSON.stringify({command:'node --test '+dir+'/code/execution.test.mjs',preregisteredRevision:revision,inputHashes,datasetReceipt:ctx.data.receipt.gameGuardReceipt,tablebaseReceipt:ctx.data.receipt,probeSource:ctx.probeSource,existing14CheckSourcesUnchanged:true,freshPanels:1,positionProbes:17,seconds,exitCode:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds,freshPanels:1,positionProbes:17}));
