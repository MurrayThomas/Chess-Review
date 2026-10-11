import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {saved} from './saved.mjs';
import {control} from './control.mjs';
import {fixtures} from './fixtures.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E191-tactical-decision-timing',a=await saved(),cc=await control(),inputHashes=await bindings([dir+'/code/timing.test.mjs',dir+'/code/run-focused.mjs']),start=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/timing.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/focused-checks.json',JSON.stringify({command:'node --test '+dir+'/code/timing.test.mjs',exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,inputHashes,archives:{...a.hashes,[cc.file]:cc.hash},refs:fixtures.map(f=>({id:f.id,expected:f.expected,...a.find(f.source,f.input,f.options).ref})),freshContexts:1,freshNodes:cc.panel.nodes,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,sourceBindings:Object.keys(inputHashes).length}));
