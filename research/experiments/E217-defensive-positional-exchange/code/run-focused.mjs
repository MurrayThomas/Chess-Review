import assert from 'node:assert/strict';
import {access,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E217-defensive-positional-exchange';
try{await access(dir+'/evidence/focused-checks.json');throw Error('Refusing to overwrite focused checks');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/resources.test.mjs']),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),start=performance.now();
const r=spawnSync(process.execPath,['--test',dir+'/code/resources.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,command:'node --test '+dir+'/code/resources.test.mjs',seconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshProbes:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds,freshProbes:0}));
