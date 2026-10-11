import assert from 'node:assert/strict';
import {access,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {openResearchData} from '../../../data-policy.mjs';
const dir='research/experiments/E221-interaction-clock-support',guard=await openResearchData(['D001'],{purpose:'test'});try{await access(dir+'/evidence/focused-checks.json');throw Error('Refusing to overwrite focused checks');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/SOURCES.md',dir+'/code/run-focused.mjs',dir+'/code/support.test.mjs','research/concepts/catalog.json']),start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/support.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,command:'node --test '+dir+'/code/support.test.mjs',seconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds,freshSearches:0}));
