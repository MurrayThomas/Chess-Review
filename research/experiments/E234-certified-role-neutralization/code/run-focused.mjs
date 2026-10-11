import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {openResearchData} from '../../../data-policy.mjs';
import {cases,on} from './fixtures.mjs';
import {inspectRoleNeutralization} from './neutralize.mjs';
import {checkRoleNeutralization} from './check-result.mjs';
const dir='research/experiments/E234-certified-role-neutralization',guard=await openResearchData(['D001'],{purpose:'test'});await mkdir(dir+'/evidence/revised',{recursive:true});try{await access(dir+'/evidence/revised/started.json');throw Error('Preserve existing evidence');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/amendment.md',dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/neutralize.test.mjs','research/concepts/catalog.json']),receipt=guard.receipt;await writeFile(dir+'/evidence/revised/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});const rows=[];let error=null;
try{for(const c of cases){const row={...c,result:null,seconds:null};rows.push(row);const start=performance.now();row.result=inspectRoleNeutralization(c.input,on);checkRoleNeutralization(c.input,on,row.result);row.seconds=(performance.now()-start)/1000;assert.equal(row.result.status,c.expected,c.id);if(rows.length===1)assert(row.seconds<=1,'Representative exceeds one second');}}catch(e){error=e.stack;}
await writeFile(dir+'/evidence/revised/'+(error?'pilot-failure':'pilot')+'.json',JSON.stringify({revision,inputHashes,receipt,rows,error,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({cases:rows.length,seconds:rows.reduce((n,r)=>n+(r.seconds??0),0),first:rows[0]?.seconds,error}));assert.equal(error,null);
const start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/neutralize.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-start)/1000;await writeFile(dir+'/evidence/revised/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt,command:'node --test '+dir+'/code/neutralize.test.mjs',seconds,exitCode:r.status,signal:r.signal,error:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds}));
