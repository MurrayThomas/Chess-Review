import assert from 'node:assert/strict';
import {writeFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {cases} from './fixtures.mjs';
import {inspectNotationSupport} from './support.mjs';
import {checkNotationSupport} from './check-result.mjs';
const dir='research/experiments/E222-notation-variation-support',guard=await openResearchData(['D001'],{purpose:'test'});
try{await access(dir+'/evidence/pilot-started.json');throw Error('Pilot already started; preserve evidence');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/SOURCES.md',dir+'/code/pilot.mjs']);
await writeFile(dir+'/evidence/pilot-started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
const rows=[];let error=null;
try{for(const item of cases){const start=performance.now(),result=inspectNotationSupport(item.input,item.options);checkNotationSupport(item.input,item.options,result);const seconds=(performance.now()-start)/1000;rows.push({...item,result,seconds});await writeFile(dir+'/evidence/pilot-partial.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,rows},null,2)+'\n');if(rows.length===1)assert(seconds<=2,'Representative pilot exceeds two seconds');}}catch(e){error=e.stack;}
await writeFile(dir+'/evidence/'+(error?'pilot-failure':'pilot')+'.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,rows,error,freshSearches:0},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({rows:rows.length,seconds:rows.reduce((n,r)=>n+r.seconds,0),error}));assert.equal(error,null);
