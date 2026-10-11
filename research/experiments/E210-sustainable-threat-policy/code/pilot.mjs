import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixture,dir} from './fixtures.mjs';
import {inspectPerpetualAttack} from './policy.mjs';
import {checkPerpetualAttack} from './check-result.mjs';
const data=await openResearchData(['D001'],{purpose:'test'});await mkdir(dir+'/evidence',{recursive:true});
try{await readFile(dir+'/evidence/revised-admission-pilot.json');throw Error('Pilot already retained; do not repeat');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/code/pilot.mjs',dir+'/plan.md',dir+'/SOURCES.md',dir+'/AMENDMENT-2026-10-11.md']),start=performance.now();let result,error=null;
try{const f=fixture();result=inspectPerpetualAttack(f.input,f.options,f.certificate);checkPerpetualAttack(f.input,f.options,f.certificate,result);assert.equal(result.status,'proven');assert.equal(result.witness.states.length,4);assert.equal(result.witness.sample.goal,'actor-threefold-claim');assert.equal(result.witness.sample.moves.length,8);}catch(e){error=e.stack;}
const seconds=(performance.now()-start)/1000,proceed=!error&&seconds<=2;
await writeFile(dir+'/evidence/revised-admission-pilot.json',JSON.stringify({preregisteredRevision:revision,datasetReceipt:data.receipt,inputHashes,seconds,proceed,result,error,freshStrategySearches:0,authoredPolicyStates:4},null,2)+'\n');console.log(JSON.stringify({proceed,seconds,nodes:result?.nodes,status:result?.status,error}));assert.ok(proceed,'Retained pilot failed or exceeded prospective2second cap');
