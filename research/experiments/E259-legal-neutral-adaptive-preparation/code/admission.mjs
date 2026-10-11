import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {checkProof} from '../../E258-adaptive-attack-preparation/code/check-proof.mjs';
import {fixtures as originalFixtures} from '../../E258-adaptive-attack-preparation/code/fixtures.mjs';
import {fixtures} from './fixtures.mjs';
const dir='research/experiments/E259-legal-neutral-adaptive-preparation',tokens=new WeakMap();
export function readAdmission(token){assert(tokens.has(token),'Private adaptive proof capability required');return structuredClone(tokens.get(token));}
export async function admitSaved(){const guard=await openResearchData(['D001'],{purpose:'test'}),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8'));assert.equal(lock.file,dir+'/evidence/collection.json.gz');const bytes=await readFile(lock.file);assert.equal(sha256(bytes),lock.sha256);const r=JSON.parse(gunzipSync(bytes));assert.equal(r.schema,'E259-collection-v1');assert.equal(r.error,null);assert.equal(r.incomplete,null);assert.equal(r.rows.length,8);assert(r.seconds<=30);assert.deepEqual(r.receipt,guard.receipt);assert.deepEqual(r.inputHashes,await bindings(Object.keys(r.inputHashes)));assert.equal(r.ticks,r.rows.reduce((n,x)=>n+x.query.ticks,0));assert(r.ticks<=49152);
 return r.rows.map((x,i)=>{assert.deepEqual(Object.fromEntries(Object.keys(fixtures[i]).map(k=>[k,x[k]])),fixtures[i]);assert.deepEqual(x.query.input,x.input);assert.deepEqual(checkProof(x.query),x.audit);if(x.role!=='neutral')assert.deepEqual(x.input,originalFixtures[i].input);const token={};tokens.set(token,{...x,source:{revision:r.revision,archiveSha256:lock.sha256,artifact:lock.file}});return {id:x.id,role:x.role,input:structuredClone(x.input),token};});}
