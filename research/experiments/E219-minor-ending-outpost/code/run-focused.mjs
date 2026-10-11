import assert from 'node:assert/strict';
import {access,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {openResearchData} from '../../../data-policy.mjs';
const dir='research/experiments/E219-minor-ending-outpost',guard=await openResearchData(['D001'],{purpose:'test'});try{await access(dir+'/evidence/focused-checks.json');throw Error('Refusing to overwrite checks');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/outpost.test.mjs']),start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/outpost.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,command:'node --test '+dir+'/code/outpost.test.mjs',seconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshPanels:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds,freshPanels:0}));
