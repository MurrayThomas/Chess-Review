import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {key} from '../../E191-tactical-decision-timing/code/saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved as initial} from './saved.mjs';
export async function saved(){const a=await initial(),dir='research/experiments/E193-forced-second-weakness',file=dir+'/evidence/corrected-context-failure.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes));assert.deepEqual(raw.datasetReceipt,a.receipt);assert.deepEqual(raw.parentArchives,a.hashes);assert.deepEqual(raw.sourceHashes,await bindings([dir+'/code/collect-amended.mjs']));assert.equal(raw.rows.length,2);assert.equal(raw.freshQueries,0);const ff=dir+'/evidence/first-hypothesis-failure.json.gz',fb=await readFile(ff),failure=JSON.parse(gunzipSync(fb));assert.deepEqual(failure.datasetReceipt,a.receipt);assert.deepEqual(failure.archives,a.hashes);for(const [name,h]of Object.entries(failure.sourceHashes))assert.equal(sha256((name===dir+'/code/smoke.mjs'?failure.originalSmoke:await readFile(name,'utf8')).replaceAll('\r\n','\n')),h);return{...a,hashes:{...a.hashes,[file]:sha256(bytes),[ff]:sha256(fb)},failure,contextFailure:raw};}
