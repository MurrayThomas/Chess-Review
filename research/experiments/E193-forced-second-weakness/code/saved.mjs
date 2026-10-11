import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {saved as inherited,key} from '../../E191-tactical-decision-timing/code/saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export async function saved(){const a=await inherited(),file='research/experiments/E193-forced-second-weakness/evidence/fresh.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes));assert.deepEqual(raw.datasetReceipt,a.receipt);assert.deepEqual(raw.parentArchives,a.hashes);assert.deepEqual(raw.sourceHashes,await bindings(['research/experiments/E193-forced-second-weakness/code/collect.mjs']));assert.equal(raw.rows.length,3);for(const r of raw.rows){assert.equal(r.reuseMatches,0);assert.equal(r.key,key('structure',r.input,{ownPlies:r.options.plies??2}));}return{receipt:a.receipt,hashes:{...a.hashes,[file]:sha256(bytes)},find(input,H){const k=key('structure',input,{ownPlies:H}),index=raw.rows.findIndex(r=>r.key===k);if(index>=0)return{panel:raw.rows[index].panel,ref:{file,index}};return a.find('structure',input,{ownPlies:H});},freshRows:raw.rows};}
