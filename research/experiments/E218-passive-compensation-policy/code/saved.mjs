import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E218-passive-compensation-policy';
export const artifactHashes=Object.freeze({
 'white-prior0-clock0':'6888140bda6dfc316f3e6862934a915378d8a0045cf155526dc5a6fb01b748ba',
 'black-prior0-clock0':'1a75e8f55fa4b542613669eecefffab7b5e21a8f504e9987a69385b0e991061d',
 'white-prior1-clock0':'e3af9cb2c1134a83214c1175a2107f68df957935afae5edf2dde74929c566bda',
 'black-prior1-clock0':'70f00055131b6ff47e5174ad2b0aa5bd925330315a6409fa4fd0b50a379212d0',
 'white-prior0-clock99':'ccb5457c987a31aa4babf10611094cc5425e691e9070561ddfdf442f2c40531b',
 'black-prior0-clock99':'8a41e54a48a7869d76dd868b92d68c6f4674e2745843e4af0ff6304b47c7cfb4',
});
export async function saved(){
 const guard=await openResearchData(['D001'],{purpose:'test'}),rows=[];let oldHashes=null;
 for(const [id,hash]of Object.entries(artifactHashes)){const bytes=await readFile(dir+'/evidence/'+id+'.json');assert.equal(sha256(bytes),hash);const r=JSON.parse(bytes);assert.ok(r.revision.startsWith('2ad89a6'));assert.equal(r.error,null);assert.ok(r.seconds<=2);assert.deepEqual(r.receipt,guard.receipt);if(oldHashes)assert.deepEqual(r.inputHashes,oldHashes);else oldHashes=r.inputHashes;rows.push(r);}
 const current=await bindings(Object.keys(oldHashes)),amended=new Set([dir+'/plan.md',dir+'/code/policy.mjs',dir+'/code/check-result.mjs']),changes=[];
 for(const [file,expected]of Object.entries(oldHashes)){const original=execFileSync('git',['show',rows[0].revision+':'+file],{encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});assert.equal(sha256(original.replaceAll('\r\n','\n')),expected);if(current[file]!==expected){assert.ok(amended.has(file),'Unregistered dependency drift: '+file);changes.push({file,original:expected,current:current[file]});}}
 return{rows,receipt:guard.receipt,sourceAmendments:changes};
}
