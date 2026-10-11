import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixture} from './fixtures.mjs';
import {inspectPassiveCompensation} from './policy.mjs';
import {checkPassiveCompensation} from './check-result.mjs';
const dir='research/experiments/E218-passive-compensation-policy',guard=await openResearchData(['D001'],{purpose:'test'}),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart registered pilot');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs']);await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
const results=[];let failure=null;
try{for(const [black,prior,clock]of [[false,0,0],[true,0,0],[false,1,0],[true,1,0],[false,0,99],[true,0,99]]){
 const f=fixture(black,prior,clock),start=performance.now();let result=null,error=null;try{result=inspectPassiveCompensation(f.input,f.options,f.certificate);assert.equal(result.available,true);checkPassiveCompensation(f.input,f.options,f.certificate,result);}catch(e){error=e.message;}
 const seconds=(performance.now()-start)/1000,row={...f,result,error,seconds};await writeFile(dir+'/evidence/'+f.id+'.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,...row},null,2)+'\n',{flag:'wx'});results.push({id:f.id,seconds,status:result?.status,error,nodes:result?.nodes});console.log(JSON.stringify(results.at(-1)));assert.equal(error,null);assert.ok(seconds<=2,'Registered cost limit exceeded');
}}catch(e){failure=e.message;}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,inputHashes,results,failure,passes:!failure},null,2)+'\n',{flag:'wx'});if(failure)console.log(JSON.stringify({stopped:true,failure}));
