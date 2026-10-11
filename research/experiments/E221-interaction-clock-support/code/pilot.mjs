import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {cases} from './fixtures.mjs';
import {inspectInteractionClockSupport} from './support.mjs';
import {checkInteractionClockSupport} from './check-result.mjs';
const dir='research/experiments/E221-interaction-clock-support',guard=await openResearchData(['D001'],{purpose:'test'});await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/pilot-started.json');throw Error('Refusing to restart pilot');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/SOURCES.md',dir+'/code/pilot.mjs']);await writeFile(dir+'/evidence/pilot-started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
let failure=null;const results=[];for(const f of cases){const start=performance.now();let result=null,error=null;try{result=inspectInteractionClockSupport(f.input,f.options);checkInteractionClockSupport(f.input,f.options,result);}catch(e){error=e.message;}const seconds=(performance.now()-start)/1000;results.push({...f,result,error,seconds});await writeFile(dir+'/evidence/pilot-partial.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,results},null,2)+'\n');if(error){failure=error;break;}if(results.length===1&&seconds>2){failure='Registered2second representative pilot limit';break;}}
await writeFile(dir+'/evidence/pilot.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,results,failure,passes:!failure},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({cases:results.length,passes:!failure,failure,seconds:results.reduce((n,r)=>n+r.seconds,0),maxSeconds:Math.max(...results.map(r=>r.seconds)),freshSearches:0}));
