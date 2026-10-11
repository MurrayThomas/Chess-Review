import assert from 'node:assert/strict';
import {access,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {cases} from './fixtures.mjs';
import {inspectEngineDiagnosticSupport} from './support.mjs';
import {checkEngineDiagnosticSupport} from './check-result.mjs';
const dir='research/experiments/E223-engine-diagnostic-support',guard=await openResearchData(['D001'],{purpose:'test'});try{await access(dir+'/evidence/pilot-started.json');throw Error('Run already started; preserve outputs');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/support.test.mjs','research/concepts/catalog.json']),receipt=guard.receipt;
await writeFile(dir+'/evidence/pilot-started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});const rows=[];let error=null;
try{for(const item of cases){const start=performance.now(),result=inspectEngineDiagnosticSupport(item.input,item.options);checkEngineDiagnosticSupport(item.input,item.options,result);const seconds=(performance.now()-start)/1000;rows.push({...item,result,seconds});await writeFile(dir+'/evidence/pilot-partial.json',JSON.stringify({revision,inputHashes,receipt,rows},null,2)+'\n');if(rows.length===1)assert(seconds<=2,'Representative pilot exceeds two seconds');}}catch(e){error=e.stack;}
await writeFile(dir+'/evidence/'+(error?'pilot-failure':'pilot')+'.json',JSON.stringify({revision,inputHashes,receipt,rows,error,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({cases:rows.length,pilotSeconds:rows.reduce((n,r)=>n+r.seconds,0),error}));assert.equal(error,null);
const start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/support.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-start)/1000;
await writeFile(dir+'/evidence/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt,command:'node --test '+dir+'/code/support.test.mjs',seconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds,freshSearches:0}));
