import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from './fixtures.mjs';
import {checkProof} from './check-proof.mjs';
const dir='research/experiments/E254-joint-bishop-pawn-defense',tokens=new WeakMap();
export function readAdmission(token){if(!tokens.has(token))throw Error('Private joint proof capability required');return structuredClone(tokens.get(token));}
export async function admitSaved(){const guard=await openResearchData(['D001'],{purpose:'test'}),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8'));assert.equal(lock.file,dir+'/evidence/collection.json.gz');const bytes=await readFile(lock.file);assert.equal(sha256(bytes),lock.sha256);const report=JSON.parse(gunzipSync(bytes));assert.equal(report.error,null);assert.deepEqual(report.receipt,guard.receipt);assert.deepEqual(report.inputHashes,await bindings(Object.keys(report.inputHashes)));assert.equal(report.rows.length,14);assert.ok(report.seconds<=12);assert.equal(report.ticks,report.rows.reduce((n,r)=>n+r.query.ticks,0));assert.ok(report.ticks<=7168);let positives=0;const out=[];for(const [i,r]of report.rows.entries()){const f=fixtures[i];assert.equal(r.id,f.id);assert.equal(r.role,f.role);assert.deepEqual(r.input,f.input);assert.deepEqual(r.query.input,f.input);assert.deepEqual(checkProof(r.query),r.audit);if(r.query.win)positives++;const token={};tokens.set(token,{...r,source:{revision:report.revision,archiveSha256:lock.sha256,artifact:lock.file}});out.push({id:r.id,role:r.role,input:structuredClone(r.input),token});}assert.equal(positives,4);assert(out.filter(r=>r.role==='positive').every(r=>readAdmission(r.token).query.win));return out;}
