import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures,comparisons} from './fixtures.mjs';
import {checkProof} from './check-proof.mjs';
const dir='research/experiments/E256-wing-and-pawn-blockage',tokens=new WeakMap();
export function readAdmission(token){assert(tokens.has(token),'Private comparison capability required');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 const guard=await openResearchData(['D001'],{purpose:'test'}),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8'));
 assert.equal(lock.file,dir+'/evidence/collection.json.gz');const bytes=await readFile(lock.file);assert.equal(sha256(bytes),lock.sha256);
 const report=JSON.parse(gunzipSync(bytes));assert.equal(report.schema,'E256-joint-collection-v1');assert.equal(report.error,null);assert.deepEqual(report.receipt,guard.receipt);
 assert.deepEqual(report.inputHashes,await bindings(Object.keys(report.inputHashes)));assert.equal(report.rows.length,12);assert(report.seconds<=20);assert.equal(report.ticks,report.rows.reduce((n,r)=>n+r.query.ticks,0));assert(report.ticks<=49152);
 for(const [i,r] of report.rows.entries()){assert.deepEqual(Object.fromEntries(Object.keys(fixtures[i]).map(k=>[k,r[k]])),fixtures[i]);assert.deepEqual(r.query.input,r.input);assert.deepEqual(checkProof(r.query),r.audit);}
 return comparisons.map((f,i)=>{const token={};tokens.set(token,{input:f.input,rows:report.rows.slice(i*6,i*6+6),source:{revision:report.revision,archiveSha256:lock.sha256,artifact:lock.file}});return {...structuredClone(f),token};});
}
