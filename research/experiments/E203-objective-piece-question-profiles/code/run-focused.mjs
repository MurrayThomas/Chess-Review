import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved,dir} from './saved.mjs';
const a=await saved(),inputHashes=await bindings([dir+'/code/questions.test.mjs',dir+'/code/run-focused.mjs']),revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),start=performance.now(),run=spawnSync(process.execPath,['--test',dir+'/code/questions.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-start)/1000,passed=run.status===0;
await writeFile(dir+'/evidence/focused-'+(passed?'checks':'failure')+'.json',JSON.stringify({command:'node --test '+dir+'/code/questions.test.mjs',preregisteredRevision:revision,exitCode:run.status,seconds,node:process.version,datasetReceipt:a.receipt,inputHashes,archives:a.archives,refs:a.rows.map(f=>({id:f.id,...f.ref})),freshPanels:a.freshPanels,freshNodes:a.freshNodes,freshMateQueries:0,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
if(!passed){const sources={};for(const file of [dir+'/code/questions.test.mjs',dir+'/code/questions.mjs',dir+'/code/check-result.mjs'])sources[file]=await readFile(file,'utf8');await writeFile(dir+'/evidence/initial-sources.json.gz',gzipSync(JSON.stringify(sources)+'\n'));}
console.log(run.stdout);console.error(run.stderr);assert.equal(run.status,0);console.log(JSON.stringify({seconds,roles:a.rows.length,freshNodes:a.freshNodes}));
