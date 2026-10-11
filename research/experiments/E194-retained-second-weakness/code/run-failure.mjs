import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {failure} from './failure-saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E194-retained-second-weakness',a=await failure(),inputHashes=await bindings([dir+'/code/failure.test.mjs',dir+'/code/run-failure.mjs']),start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/failure.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;await writeFile(dir+'/evidence/failure-checks.json',JSON.stringify({command:'node --test '+dir+'/code/failure.test.mjs',exitCode:r.status,seconds,inputHashes,datasetReceipt:a.receipt,archives:a.hashes,stdout:r.stdout,stderr:r.stderr,newReadyIds:[]},null,2)+'\n');console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);
