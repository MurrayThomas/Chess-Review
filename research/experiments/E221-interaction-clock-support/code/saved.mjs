import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const dir='research/experiments/E221-interaction-clock-support';
export const pilotSha256='779e4a70b993158cd30445b6ab3c83cfba132d232a2a699d59dc17139e92858e';
export async function saved(){const guard=await openResearchData(['D001'],{purpose:'test'}),bytes=await readFile(dir+'/evidence/pilot.json');assert.equal(sha256(bytes),pilotSha256);const old=JSON.parse(bytes);assert.ok(old.revision.startsWith('3a1dd69'));assert.equal(old.passes,true);assert.equal(old.failure,null);assert.equal(old.results.length,31);assert.deepEqual(old.receipt,guard.receipt);assert.ok(old.results.every(r=>r.error===null));assert.ok(old.results[0].seconds<=2);const current=await bindings(Object.keys(old.inputHashes)),allowed=new Set([dir+'/plan.md',dir+'/code/support.mjs',dir+'/code/check-result.mjs']),amendments=[];for(const [file,hash]of Object.entries(old.inputHashes)){const original=execFileSync('git',['show',old.revision+':'+file],{encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});assert.equal(sha256(original.replaceAll('\r\n','\n')),hash);if(current[file]!==hash){assert.ok(allowed.has(file),'Undeclared source drift: '+file);amendments.push({file,original:hash,current:current[file]});}}return{...old,amendments};}
