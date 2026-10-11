import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {saved} from './saved.mjs';
import {fixtures} from './fixtures.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E195-second-weakness-promotion-control',a=await saved(),inputHashes=await bindings([dir+'/code/second.test.mjs',dir+'/code/run-focused.mjs']),revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),start=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/second.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/focused-checks.json',JSON.stringify({command:'node --test '+dir+'/code/second.test.mjs',preregisteredRevision:revision,exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,inputHashes,archives:a.hashes,refs:fixtures.map(f=>({id:f.id,expected:f.expected,...a.find(f.input,f.options.plies??2).ref})),claimRef:a.find((await import('./fixtures.mjs')).claimControl.input,0).ref,freshContexts:a.rows.filter(r=>r.fresh).length,freshNodes:a.rows.filter(r=>r.fresh).reduce((n,r)=>n+r.panel.nodes,0),stdout:run.stdout,stderr:run.stderr},null,2)+'\n');console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,sourceBindings:Object.keys(inputHashes).length}));
