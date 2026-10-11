import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {savedRoutes} from './routes-saved.mjs';
const dir='research/experiments/E216-outside-passer-fortress-setup';
export const fortressHashes={'quiet-setup':'f797b3ad2cafcfbbc3f486771b4f390c08a8d3f5a57b6eedc179ff6aa7755395','quiet-setup-black':'9ef97111c1d076d20bb8c32f004cdf198a03b7d9e778adae5fc9622c0df057e1'};
export async function saved(){const old=await savedRoutes(),fortresses=[];for(const [id,hash]of Object.entries(fortressHashes)){const bytes=await readFile(dir+'/evidence/'+id+'.json');assert.equal(sha256(bytes),hash);const r=JSON.parse(bytes);assert.deepEqual(r.receipt,old.receipt);assert.deepEqual(r.inputHashes,await bindings(Object.keys(r.inputHashes)));assert.equal(r.status,'proven');assert.equal(r.costPass,true);assert.ok(r.nodes<=2000&&r.seconds<=2);fortresses.push({id,input:r.input,proof:r.proof,searchTicks:r.nodes,seconds:r.seconds,source:{artifact:dir+'/evidence/'+id+'.json',sha256:hash}});}return{outside:old.rows,fortresses,receipt:old.receipt,parentInputHashes:old.parentInputHashes};}
