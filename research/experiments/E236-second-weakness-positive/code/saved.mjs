import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from './fixtures.mjs';
const dir='research/experiments/E236-second-weakness-positive';
export async function saved(){const guard=await openResearchData(['D001'],{purpose:'test'}),sourceHashes=await bindings([dir+'/code/collect.mjs']),rows=[],hashes={};for(const [i,f]of fixtures.entries()){const path=dir+'/evidence/source-'+i+'.json.gz',bytes=await readFile(path),raw=JSON.parse(gunzipSync(bytes));hashes[path]=sha256(bytes);assert.deepEqual(raw.sourceHashes,sourceHashes);assert.deepEqual(raw.receipt,guard.receipt);assert.deepEqual(raw.row.input,f.input);assert.equal(raw.row.H,2);assert.equal(raw.row.limit,50000);for(const [p,h]of Object.entries(raw.parentArchives))assert.equal(sha256(await readFile(p)),h);rows.push(raw.row);}return{receipt:guard.receipt,rows,hashes};}
