import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {saved} from './saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E199-board-question-evidence',a=await saved(),inputHashes=await bindings([dir+'/code/questions.test.mjs',dir+'/code/run-focused.mjs']),revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),start=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/questions.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/focused-checks.json',JSON.stringify({command:'node --test '+dir+'/code/questions.test.mjs',preregisteredRevision:revision,exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,receiptAudits:a.receiptAudits,inputHashes,archives:a.hashes,refs:a.rows.map(f=>({id:f.id,question:f.question,expected:f.expected,...f.ref})),freshQueries:0,freshSourcePanels:0,authoredSnapshots:4,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,sourceBindings:Object.keys(inputHashes).length}));
